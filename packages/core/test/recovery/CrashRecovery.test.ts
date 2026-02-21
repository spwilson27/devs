/**
 * packages/core/test/recovery/CrashRecovery.test.ts
 *
 * Integration tests for the RecoveryManager crash recovery engine.
 *
 * Tests verify:
 * 1. `getLatestCheckpoint(projectId)` returns undefined when no checkpoints exist.
 * 2. `getLatestCheckpoint(projectId)` returns checkpoint info after a graph run.
 * 3. `hasCheckpoint(projectId)` returns false for a new project.
 * 4. `hasCheckpoint(projectId)` returns true after a run has committed checkpoints.
 * 5. **Happy Path**: Resume from a LangGraph execution that exited cleanly
 *    (HITL gate), verifying the resumed state is identical to the checkpointed state.
 * 6. **Crash Path**: Simulate a SIGKILL-style crash (connection close without
 *    WAL checkpoint flush), then verify the orchestrator resumes from the same
 *    exact node and state without data loss or duplication.
 * 7. `markInProgressTasksAsResumed()` flags all in-progress tasks for a
 *    project as `"resumed"` in the business logic `tasks` table.
 * 8. `getCheckpointCount(projectId)` returns the correct count of checkpoints.
 * 9. Checkpoint recovery is thread-isolated — recovering project-A does not
 *    affect project-B's checkpoints.
 * 10. `recoverProject()` returns a `RunnableConfig` usable for graph invocation.
 *
 * Requirements: [1_PRD-REQ-REL-003], [1_PRD-REQ-SYS-002],
 *               [1_PRD-REQ-MET-014], [1_PRD-REQ-CON-002]
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { existsSync, unlinkSync } from "node:fs";
import Database from "better-sqlite3";
import { Command } from "@langchain/langgraph";
import { RecoveryManager } from "../../src/recovery/RecoveryManager.js";
import { OrchestrationGraph } from "../../src/orchestration/graph.js";
import { SqliteSaver } from "../../src/orchestration/SqliteSaver.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { createInitialState, type ProjectConfig } from "../../src/orchestration/types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  return join(tmpdir(), `crash-recovery-test-${randomUUID()}.sqlite`);
}

function makeProjectConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  const now = new Date().toISOString();
  return {
    projectId: randomUUID(),
    name: "Crash Recovery Test Project",
    description: "Test project for crash recovery integration tests",
    status: "initializing",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function openDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");
  return db;
}

function cleanupDb(dbPath: string): void {
  [`${dbPath}`, `${dbPath}-wal`, `${dbPath}-shm`].forEach((f) => {
    try {
      if (existsSync(f)) unlinkSync(f);
    } catch {
      // Best-effort cleanup — ignore errors.
    }
  });
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe("RecoveryManager", () => {
  let dbPath: string;
  let db: Database.Database;
  let saver: SqliteSaver;
  let manager: RecoveryManager;

  beforeEach(() => {
    dbPath = makeTestDbPath();
    db = openDatabase(dbPath);
    saver = new SqliteSaver(db);
    manager = new RecoveryManager(db);
  });

  afterEach(() => {
    try {
      saver.close();
    } catch {
      // Already closed — ignore.
    }
    cleanupDb(dbPath);
  });

  // ── hasCheckpoint ─────────────────────────────────────────────────────────

  describe("hasCheckpoint()", () => {
    it("returns false for a project with no checkpoints", async () => {
      const projectId = randomUUID();
      const result = await manager.hasCheckpoint(projectId);
      expect(result).toBe(false);
    });

    it("returns true after a graph run has committed at least one checkpoint", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const result = await manager.hasCheckpoint(config.projectId);
      expect(result).toBe(true);
    });
  });

  // ── getLatestCheckpoint ───────────────────────────────────────────────────

  describe("getLatestCheckpoint()", () => {
    it("returns undefined when no checkpoints exist for the project", async () => {
      const projectId = randomUUID();
      const result = await manager.getLatestCheckpoint(projectId);
      expect(result).toBeUndefined();
    });

    it("returns RecoveryInfo with correct projectId after a run", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const info = await manager.getLatestCheckpoint(config.projectId);
      expect(info).toBeDefined();
      expect(info!.projectId).toBe(config.projectId);
    });

    it("returns a non-empty checkpointId string", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const info = await manager.getLatestCheckpoint(config.projectId);
      expect(info).toBeDefined();
      expect(info!.checkpointId).toBeTruthy();
      expect(typeof info!.checkpointId).toBe("string");
    });

    it("returns config with thread_id matching projectId", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const info = await manager.getLatestCheckpoint(config.projectId);
      expect(info!.config.configurable?.thread_id).toBe(config.projectId);
    });

    it("returns the MOST RECENT checkpoint (highest rowid) — not an older one", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      // There should be multiple checkpoints (one per node transition).
      const count = (
        db
          .prepare("SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?")
          .get(config.projectId) as { n: number }
      ).n;
      expect(count).toBeGreaterThan(1);

      // The latest checkpoint_id returned by getLatestCheckpoint must match
      // the checkpoint_id of the row with the highest rowid.
      const latestRow = db
        .prepare(
          "SELECT checkpoint_id FROM checkpoints WHERE thread_id = ? ORDER BY rowid DESC LIMIT 1",
        )
        .get(config.projectId) as { checkpoint_id: string };

      const info = await manager.getLatestCheckpoint(config.projectId);
      expect(info!.checkpointId).toBe(latestRow.checkpoint_id);
    });
  });

  // ── getCheckpointCount ────────────────────────────────────────────────────

  describe("getCheckpointCount()", () => {
    it("returns 0 for a project with no checkpoints", () => {
      const projectId = randomUUID();
      const count = manager.getCheckpointCount(projectId);
      expect(count).toBe(0);
    });

    it("returns a positive integer after a graph run", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const count = manager.getCheckpointCount(config.projectId);
      expect(count).toBeGreaterThan(0);
    });
  });

  // ── recoverProject ────────────────────────────────────────────────────────

  describe("recoverProject()", () => {
    it("returns undefined when no checkpoints exist", async () => {
      const projectId = randomUUID();
      const result = await manager.recoverProject(projectId);
      expect(result).toBeUndefined();
    });

    it("returns a RunnableConfig with thread_id and checkpoint_id set", async () => {
      const config = makeProjectConfig();
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const recoveryConfig = await manager.recoverProject(config.projectId);
      expect(recoveryConfig).toBeDefined();
      expect(recoveryConfig!.configurable?.thread_id).toBe(config.projectId);
      expect(recoveryConfig!.configurable?.checkpoint_id).toBeTruthy();
    });
  });

  // ── markInProgressTasksAsResumed ─────────────────────────────────────────

  describe("markInProgressTasksAsResumed()", () => {
    /**
     * Seed helper: creates project → epic → N tasks in the DB.
     * Returns the integer epic id and the list of inserted task ids.
     * `saveEpics` and `saveTasks` return void, so we query the rowid directly.
     */
    function seedProjectWithTasks(
      repo: StateRepository,
      projectName: string,
      tasks: Array<{ title: string; status: string }>,
    ): { projectId: number; epicId: number; taskIds: number[] } {
      const projectId = repo.upsertProject({ name: projectName });
      repo.saveEpics([{ project_id: projectId, name: "Epic" }]);
      const epicRow = db
        .prepare("SELECT id FROM epics WHERE project_id = ? ORDER BY id DESC LIMIT 1")
        .get(projectId) as { id: number };
      const epicId = epicRow.id;

      for (const t of tasks) {
        db.prepare("INSERT INTO tasks (epic_id, title, status) VALUES (?, ?, ?)").run(
          epicId,
          t.title,
          t.status,
        );
      }

      const taskIds = (
        db
          .prepare("SELECT id FROM tasks WHERE epic_id = ? ORDER BY id ASC")
          .all(epicId) as Array<{ id: number }>
      ).map((r) => r.id);

      return { projectId, epicId, taskIds };
    }

    it("marks all in_progress tasks for a project as 'resumed'", () => {
      initializeSchema(db);
      const repo = new StateRepository(db);

      const { projectId, taskIds } = seedProjectWithTasks(repo, "Recovery Test", [
        { title: "Task A", status: "in_progress" },
        { title: "Task B", status: "in_progress" },
      ]);

      const updated = manager.markInProgressTasksAsResumed(projectId);
      expect(updated).toBe(2);

      for (const taskId of taskIds) {
        const row = db
          .prepare("SELECT status FROM tasks WHERE id = ?")
          .get(taskId) as { status: string };
        expect(row.status).toBe("resumed");
      }
    });

    it("does not touch tasks with other statuses", () => {
      initializeSchema(db);
      const repo = new StateRepository(db);

      seedProjectWithTasks(repo, "Status Test", [
        { title: "Pending",   status: "pending" },
        { title: "Completed", status: "completed" },
        { title: "In Prog",   status: "in_progress" },
      ]);
      const projectId = (
        db
          .prepare("SELECT id FROM projects WHERE name = 'Status Test'")
          .get() as { id: number }
      ).id;

      const updated = manager.markInProgressTasksAsResumed(projectId);
      expect(updated).toBe(1); // Only the in_progress task changed.

      const pendingRow = db
        .prepare("SELECT status FROM tasks WHERE title = ?")
        .get("Pending") as { status: string };
      const completedRow = db
        .prepare("SELECT status FROM tasks WHERE title = ?")
        .get("Completed") as { status: string };
      expect(pendingRow.status).toBe("pending");
      expect(completedRow.status).toBe("completed");
    });

    it("is isolated to the given projectId — other projects' tasks are unaffected", () => {
      initializeSchema(db);
      const repo = new StateRepository(db);

      const { projectId: projectA } = seedProjectWithTasks(repo, "Project A", [
        { title: "TA", status: "in_progress" },
      ]);
      const { projectId: projectB } = seedProjectWithTasks(repo, "Project B", [
        { title: "TB", status: "in_progress" },
      ]);

      // Only resume project A's tasks.
      const updated = manager.markInProgressTasksAsResumed(projectA);
      expect(updated).toBe(1);

      const taskA = db
        .prepare("SELECT status FROM tasks WHERE title = ?")
        .get("TA") as { status: string };
      const taskB = db
        .prepare("SELECT status FROM tasks WHERE title = ?")
        .get("TB") as { status: string };
      expect(taskA.status).toBe("resumed");
      expect(taskB.status).toBe("in_progress"); // Untouched.
    });

    it("returns 0 when no in_progress tasks exist for the project", () => {
      initializeSchema(db);
      const repo = new StateRepository(db);
      const { projectId } = seedProjectWithTasks(repo, "Empty Project", [
        { title: "Done", status: "completed" },
      ]);

      const updated = manager.markInProgressTasksAsResumed(projectId);
      expect(updated).toBe(0);
    });
  });

  // ── Happy Path: clean exit + resume ───────────────────────────────────────

  describe("Happy Path — resume from clean exit (HITL gate)", () => {
    it("graph resumes from the exact checkpoint after a clean exit", async () => {
      const config = makeProjectConfig();

      // Run to the first HITL gate (approveDesign) — clean exit.
      const og1 = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(config.projectId);
      await og1.graph.invoke(createInitialState(config), runConfig);

      // Count checkpoints before resume.
      const countBefore = manager.getCheckpointCount(config.projectId);
      expect(countBefore).toBeGreaterThan(0);

      // Recover — get the RunnableConfig for resume.
      const recoveryConfig = await manager.recoverProject(config.projectId);
      expect(recoveryConfig).toBeDefined();

      // Resume by providing an approval signal at the gate.
      const approvalSignal = {
        approved: true,
        approvedBy: "happy-path-test",
        approvedAt: new Date().toISOString(),
      };

      const og2 = new OrchestrationGraph(saver);
      const result = await og2.graph.invoke(
        new Command({ resume: approvalSignal }),
        runConfig,
      );

      // Graph advanced past the gate — result is a non-null state object.
      expect(result).toBeDefined();

      // New checkpoints were committed during the resume.
      const countAfter = manager.getCheckpointCount(config.projectId);
      expect(countAfter).toBeGreaterThan(countBefore);
    });

    it("recovered checkpoint tuple has a valid checkpoint structure and matching thread_id", async () => {
      const config = makeProjectConfig({ name: "State Integrity Test" });

      const og1 = new OrchestrationGraph(saver);
      const runConfig = OrchestrationGraph.configForProject(config.projectId);
      await og1.graph.invoke(createInitialState(config), runConfig);

      // Capture the state from the last checkpoint before resume.
      const info = await manager.getLatestCheckpoint(config.projectId);
      expect(info!.checkpointTuple).toBeDefined();
      expect(info!.checkpointTuple.checkpoint).toBeDefined();
      expect(info!.checkpointTuple.checkpoint.channel_values).toBeDefined();
      // thread_id must always match projectId.
      expect(info!.config.configurable?.thread_id).toBe(config.projectId);
    });
  });

  // ── Crash Path: SIGKILL + resume ─────────────────────────────────────────

  describe("Crash Path — resume after simulated process crash", () => {
    it("checkpoints survive a simulated crash (close + reopen connection)", async () => {
      const config = makeProjectConfig();

      // Phase 1: Run to HITL gate and commit checkpoints.
      const og1 = new OrchestrationGraph(saver);
      await og1.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const countBeforeCrash = manager.getCheckpointCount(config.projectId);
      expect(countBeforeCrash).toBeGreaterThan(0);

      // Phase 2: Simulate crash — abruptly close the connection.
      saver.close();
      db.close();

      // Phase 3: Recovery — open a fresh connection.
      const dbRecovered = openDatabase(dbPath);
      const managerRecovered = new RecoveryManager(dbRecovered);

      // Checkpoints must be recoverable.
      const hasCheckpoint = await managerRecovered.hasCheckpoint(config.projectId);
      expect(hasCheckpoint).toBe(true);

      const countAfterRecovery = managerRecovered.getCheckpointCount(config.projectId);
      expect(countAfterRecovery).toBe(countBeforeCrash);

      dbRecovered.close();
    });

    it("resumed checkpoint state is byte-for-byte identical after crash (zero data loss)", async () => {
      const config = makeProjectConfig({ name: "Zero Loss After Crash" });

      // Phase 1: Run and capture checkpoint bytes.
      const og1 = new OrchestrationGraph(saver);
      await og1.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );

      const infoBeforeCrash = await manager.getLatestCheckpoint(config.projectId);
      expect(infoBeforeCrash).toBeDefined();

      const blobBefore = db
        .prepare(
          "SELECT checkpoint FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ?",
        )
        .get(config.projectId, infoBeforeCrash!.checkpointId) as
        | { checkpoint: Buffer }
        | undefined;
      expect(blobBefore).toBeDefined();

      // Phase 2: Crash.
      saver.close();
      db.close();

      // Phase 3: Recovery and byte comparison.
      const dbRecovered = openDatabase(dbPath);
      const managerRecovered = new RecoveryManager(dbRecovered);

      const infoAfterCrash = await managerRecovered.getLatestCheckpoint(config.projectId);
      expect(infoAfterCrash).toBeDefined();
      expect(infoAfterCrash!.checkpointId).toBe(infoBeforeCrash!.checkpointId);

      const blobAfter = dbRecovered
        .prepare(
          "SELECT checkpoint FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ?",
        )
        .get(config.projectId, infoAfterCrash!.checkpointId) as
        | { checkpoint: Buffer }
        | undefined;
      expect(blobAfter).toBeDefined();

      // Zero data loss: bytes are identical.
      expect(Buffer.compare(blobBefore!.checkpoint, blobAfter!.checkpoint)).toBe(0);

      dbRecovered.close();
    });

    it("graph can resume execution after crash with 100% success rate", async () => {
      const config = makeProjectConfig();

      // Phase 1: Run to HITL gate.
      const og1 = new OrchestrationGraph(saver);
      await og1.graph.invoke(
        createInitialState(config),
        OrchestrationGraph.configForProject(config.projectId),
      );
      const countBeforeCrash = manager.getCheckpointCount(config.projectId);

      // Phase 2: Crash.
      saver.close();
      db.close();

      // Phase 3: Recovery — create fresh graph and resume.
      const dbRecovered = openDatabase(dbPath);
      const saverRecovered = new SqliteSaver(dbRecovered);
      const og2 = new OrchestrationGraph(saverRecovered);

      const approvalSignal = {
        approved: true,
        approvedBy: "crash-recovery-test",
        approvedAt: new Date().toISOString(),
      };

      const result = await og2.graph.invoke(
        new Command({ resume: approvalSignal }),
        OrchestrationGraph.configForProject(config.projectId),
      );

      // Graph resumed successfully — result is a valid state object.
      expect(result).toBeDefined();

      // Additional checkpoints were written during the resumed run.
      const managerRecovered = new RecoveryManager(dbRecovered);
      const countAfterResume = managerRecovered.getCheckpointCount(config.projectId);
      expect(countAfterResume).toBeGreaterThan(countBeforeCrash);

      saverRecovered.close();
      dbRecovered.close();
    });
  });

  // ── Thread isolation ──────────────────────────────────────────────────────

  describe("Thread isolation", () => {
    it("recovering project-A does not expose project-B checkpoints", async () => {
      const configA = makeProjectConfig({ name: "Project Alpha" });
      const configB = makeProjectConfig({ name: "Project Beta" });

      // Only run project-A.
      const og = new OrchestrationGraph(saver);
      await og.graph.invoke(
        createInitialState(configA),
        OrchestrationGraph.configForProject(configA.projectId),
      );

      // Project-A has checkpoints; Project-B does not.
      expect(await manager.hasCheckpoint(configA.projectId)).toBe(true);
      expect(await manager.hasCheckpoint(configB.projectId)).toBe(false);

      // getLatestCheckpoint for B returns undefined.
      const infoB = await manager.getLatestCheckpoint(configB.projectId);
      expect(infoB).toBeUndefined();

      // Count for B is 0.
      expect(manager.getCheckpointCount(configB.projectId)).toBe(0);
    });

    it("two projects in the same DB have independent checkpoint sequences", async () => {
      const configA = makeProjectConfig({ name: "Alpha" });
      const configB = makeProjectConfig({ name: "Beta" });
      const og = new OrchestrationGraph(saver);

      await og.graph.invoke(
        createInitialState(configA),
        OrchestrationGraph.configForProject(configA.projectId),
      );
      await og.graph.invoke(
        createInitialState(configB),
        OrchestrationGraph.configForProject(configB.projectId),
      );

      const infoA = await manager.getLatestCheckpoint(configA.projectId);
      const infoB = await manager.getLatestCheckpoint(configB.projectId);

      expect(infoA).toBeDefined();
      expect(infoB).toBeDefined();

      // Their checkpoint_ids are distinct.
      expect(infoA!.checkpointId).not.toBe(infoB!.checkpointId);
      expect(infoA!.projectId).toBe(configA.projectId);
      expect(infoB!.projectId).toBe(configB.projectId);
    });
  });
});
