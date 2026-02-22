import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { Checkpoint, CheckpointMetadata } from "@langchain/langgraph";

import { createDatabase, closeDatabase } from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { SqliteSaver } from "../../src/orchestration/SqliteSaver.js";
import { RelationalRollback } from "../../src/persistence/RelationalRollback.js";

function makeTestDbPath(): string {
  return join(tmpdir(), `relrollback-${randomUUID()}.sqlite`);
}

function makeCheckpoint(overrides: Partial<Checkpoint> = {}): Checkpoint {
  return {
    v: 1,
    id: randomUUID(),
    ts: new Date().toISOString(),
    channel_values: { messages: ["hello"] },
    channel_versions: { messages: 1 },
    versions_seen: {},
    ...overrides,
  };
}

function makeMetadata(overrides: Partial<CheckpointMetadata> = {}): CheckpointMetadata {
  return {
    source: "test",
    step: 1,
    parents: {},
    ...overrides,
  };
}

function makeConfig(threadId: string, checkpointNs = "", checkpointId?: string): RunnableConfig {
  return {
    configurable: {
      thread_id: threadId,
      checkpoint_ns: checkpointNs,
      ...(checkpointId !== undefined ? { checkpoint_id: checkpointId } : {}),
    },
  };
}

describe("RelationalRollback", () => {
  let db: any;
  let saver: SqliteSaver;
  let dbPath: string;

  beforeEach(() => {
    dbPath = makeTestDbPath();
    db = createDatabase({ dbPath });
    // Create core schema (projects, epics, tasks, agent_logs, requirements...)
    initializeSchema(db);
    saver = new SqliteSaver(db);
  });

  afterEach(() => {
    try {
      saver.close();
    } catch {}
    closeDatabase();
  });

  it("deletes agent_logs, tasks, and requirements created after the snapshot", async () => {
    // Create a project + epic
    const p = db.prepare("INSERT INTO projects (name) VALUES (?)").run("proj-a");
    const projectId = Number(p.lastInsertRowid);

    const e = db
      .prepare("INSERT INTO epics (project_id, name, order_index, status) VALUES (?,?,?,?)")
      .run(projectId, "epic-1", 0, "pending");
    const epicId = Number(e.lastInsertRowid);

    // Extend schema for timestamps used by the rollback logic (tests only)
    db.prepare("ALTER TABLE tasks ADD COLUMN updated_at TEXT").run();
    db.prepare("ALTER TABLE requirements ADD COLUMN created_at TEXT").run();

    const oldTime = new Date(1000).toISOString();

    // Insert a task, requirement and agent_log BEFORE the checkpoint.
    const t1 = db
      .prepare("INSERT INTO tasks (epic_id, title, description, status, git_commit_hash, updated_at) VALUES (?,?,?,?,?,?)")
      .run(epicId, "task-old", "d", "pending", null, oldTime);
    const t1Id = Number(t1.lastInsertRowid);

    db.prepare(
      "INSERT INTO requirements (project_id, description, priority, status, metadata, created_at) VALUES (?,?,?,?,?,?)"
    ).run(projectId, "req-old", "medium", "pending", null, oldTime);

    db.prepare(
      "INSERT INTO agent_logs (task_id, epic_id, timestamp, role, content_type, content, commit_hash) VALUES (?,?,?,?,?,?,?)"
    ).run(t1Id, epicId, oldTime, "dev", "THOUGHT", "{}", null);

    // Persist a checkpoint (this will be our snapshot)
    const cp = makeCheckpoint();
    await saver.put(makeConfig(String(projectId)), cp, makeMetadata(), {});
    const snapshotId = cp.id;

    const snapshotRow = db
      .prepare("SELECT created_at FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ?")
      .get(String(projectId), snapshotId) as { created_at: string } | undefined;

    expect(snapshotRow).toBeDefined();
    const snapshotTs = snapshotRow!.created_at;

    // Insert new rows AFTER the checkpoint (timestamps later than snapshot)
    const laterTs = new Date(Date.parse(snapshotTs) + 1000).toISOString();

    const t2 = db
      .prepare("INSERT INTO tasks (epic_id, title, description, status, git_commit_hash, updated_at) VALUES (?,?,?,?,?,?)")
      .run(epicId, "task-new", "d2", "pending", null, laterTs);
    const t2Id = Number(t2.lastInsertRowid);

    db.prepare(
      "INSERT INTO requirements (project_id, description, priority, status, metadata, created_at) VALUES (?,?,?,?,?,?)"
    ).run(projectId, "req-new", "high", "pending", null, laterTs);

    db.prepare(
      "INSERT INTO agent_logs (task_id, epic_id, timestamp, role, content_type, content, commit_hash) VALUES (?,?,?,?,?,?,?)"
    ).run(t2Id, epicId, laterTs, "dev", "THOUGHT", "{}", null);

    // Sanity: ensure we have both old and new rows
    const preAgentLogs = db.prepare("SELECT COUNT(*) as cnt FROM agent_logs").get().cnt;
    expect(preAgentLogs).toBeGreaterThanOrEqual(2);

    const rr = new RelationalRollback(db);

    // Perform rollback
    rr.rollbackToSnapshot(projectId, snapshotId);

    // After rollback only the old rows should remain.
    const agentLogs = db
      .prepare("SELECT al.* FROM agent_logs al JOIN tasks t ON al.task_id = t.id JOIN epics e ON t.epic_id = e.id WHERE e.project_id = ?")
      .all(projectId) as Array<any>;
    expect(agentLogs.length).toBe(1);
    expect(agentLogs[0].task_id).toBe(t1Id);

    const tasks = db
      .prepare("SELECT t.* FROM tasks t JOIN epics e ON t.epic_id = e.id WHERE e.project_id = ? ORDER BY t.id")
      .all(projectId) as Array<any>;
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(t1Id);

    const reqs = db.prepare("SELECT * FROM requirements WHERE project_id = ?").all(projectId) as Array<any>;
    expect(reqs.length).toBe(1);
  });

  it("is atomic: a mid-rollback failure leaves the DB unchanged", async () => {
    // Setup similar to previous test
    const p = db.prepare("INSERT INTO projects (name) VALUES (?)").run("proj-b");
    const projectId = Number(p.lastInsertRowid);

    const e = db
      .prepare("INSERT INTO epics (project_id, name, order_index, status) VALUES (?,?,?,?)")
      .run(projectId, "epic-1", 0, "pending");
    const epicId = Number(e.lastInsertRowid);

    db.prepare("ALTER TABLE tasks ADD COLUMN updated_at TEXT").run();
    db.prepare("ALTER TABLE requirements ADD COLUMN created_at TEXT").run();

    const oldTime = new Date(1000).toISOString();

    const t1 = db
      .prepare("INSERT INTO tasks (epic_id, title, description, status, git_commit_hash, updated_at) VALUES (?,?,?,?,?,?)")
      .run(epicId, "task-old", "d", "pending", null, oldTime);
    const t1Id = Number(t1.lastInsertRowid);

    db.prepare(
      "INSERT INTO requirements (project_id, description, priority, status, metadata, created_at) VALUES (?,?,?,?,?,?)"
    ).run(projectId, "req-old", "medium", "pending", null, oldTime);

    db.prepare(
      "INSERT INTO agent_logs (task_id, epic_id, timestamp, role, content_type, content, commit_hash) VALUES (?,?,?,?,?,?,?)"
    ).run(t1Id, epicId, oldTime, "dev", "THOUGHT", "{}", null);

    // Snapshot
    const cp = makeCheckpoint();
    await saver.put(makeConfig(String(projectId)), cp, makeMetadata(), {});
    const snapshotId = cp.id;
    const snapshotTs = db
      .prepare("SELECT created_at FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ?")
      .get(String(projectId), snapshotId).created_at as string;

    // New rows (post-snapshot)
    const laterTs = new Date(Date.parse(snapshotTs) + 1000).toISOString();

    const t2 = db
      .prepare("INSERT INTO tasks (epic_id, title, description, status, git_commit_hash, updated_at) VALUES (?,?,?,?,?,?)")
      .run(epicId, "task-new", "d2", "pending", null, laterTs);
    const t2Id = Number(t2.lastInsertRowid);

    db.prepare(
      "INSERT INTO requirements (project_id, description, priority, status, metadata, created_at) VALUES (?,?,?,?,?,?)"
    ).run(projectId, "req-new", "high", "pending", null, laterTs);

    db.prepare(
      "INSERT INTO agent_logs (task_id, epic_id, timestamp, role, content_type, content, commit_hash) VALUES (?,?,?,?,?,?,?)"
    ).run(t2Id, epicId, laterTs, "dev", "THOUGHT", "{}", null);

    const rr = new RelationalRollback(db);

    // Spy on the tasks-delete statement to simulate a failure mid-transaction.
    const stmt: any = (rr as any)["_stmtDeleteTasksByUpdatedAt"];
    const originalRun = stmt.run.bind(stmt);
    let called = false;
    vi.spyOn(stmt, "run").mockImplementation((...args: any[]) => {
      if (!called) {
        called = true;
        throw new Error("Simulated failure during delete");
      }
      return originalRun(...args);
    });

    // Attempt rollback — should throw and leave DB unchanged.
    await expect(async () => rr.rollbackToSnapshot(projectId, snapshotId)).rejects.toThrow(
      /Simulated failure during delete/
    );

    // DB must still contain the post-snapshot rows (rollback was atomic and rolled back the partial work)
    const agentLogs = db.prepare("SELECT COUNT(*) as cnt FROM agent_logs").get().cnt;
    expect(agentLogs).toBeGreaterThanOrEqual(2);

    const tasks = db.prepare("SELECT COUNT(*) as cnt FROM tasks WHERE epic_id = ?").get(epicId).cnt;
    expect(tasks).toBeGreaterThanOrEqual(2);

    const reqs = db.prepare("SELECT COUNT(*) as cnt FROM requirements WHERE project_id = ?").get(projectId).cnt;
    expect(reqs).toBeGreaterThanOrEqual(2);

    vi.restoreAllMocks();
  });
});
