import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import Database from "better-sqlite3";
import { createDatabase, closeDatabase } from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { initializeAuditSchema } from "../../src/persistence/audit_schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import { StateTransitionGuard } from "../../src/orchestration/StateTransitionGuard.js";

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return path.resolve(os.tmpdir(), `devs-acid-guard-${unique}`, ".devs", "state.sqlite");
}

function seedProjectHierarchy(repo: StateRepository): { projectId: number; epicId: number; taskId: number } {
  const projectId = repo.upsertProject({ name: "acid-guard-project" });
  repo.saveEpics([{ project_id: projectId, name: "phase-1" }]);
  const state = repo.getProjectState(projectId)!;
  const epicId = state.epics[0]!.id as number;
  repo.saveTasks([{ epic_id: epicId, title: "test-task" }]);
  const taskId = repo.getProjectState(projectId)!.tasks[0]!.id as number;
  return { projectId, epicId, taskId };
}

describe("StateTransitionGuard", () => {
  let db: Database.Database;
  let dbPath: string;
  let repo: StateRepository;
  let taskId: number;
  let guard: StateTransitionGuard;

  beforeEach(() => {
    dbPath = makeTestDbPath();
    db = createDatabase({ dbPath });
    initializeSchema(db);
    initializeAuditSchema(db);
    repo = new StateRepository(db);
    const seed = seedProjectHierarchy(repo);
    taskId = seed.taskId;
    guard = new StateTransitionGuard(repo);
  });

  afterEach(() => {
    try {
      db.close();
    } catch {}
    try {
      closeDatabase();
    } catch {}
    const root = path.resolve(path.dirname(dbPath), "..");
    if (fs.existsSync(root)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("persists DB write before invoking the tool", async () => {
    const calls: string[] = [];

    // Spy on appendAgentLog to record the moment the DB write happens.
    const originalAppend = repo.appendAgentLog.bind(repo);
    const spy = vi.spyOn(repo, "appendAgentLog").mockImplementation((log: any) => {
      calls.push("db");
      return originalAppend(log);
    });

    const tool = vi.fn(async () => {
      // Open a second connection to verify the PRE_TOOL_EXECUTION entry is visible
      // on disk before the tool runs.
      const db2 = new Database(dbPath, { readonly: true });
      const row = db2.prepare("SELECT COUNT(*) AS n FROM agent_logs WHERE task_id = ? AND content_type = ?").get(taskId, "PRE_TOOL_EXECUTION") as { n: number };
      db2.close();
      expect(row.n).toBe(1);
      calls.push("tool");
      return "ok";
    });

    const res = await guard.runWithGuard(tool, [], taskId);
    expect(res).toBe("ok");
    expect(calls).toEqual(["db", "tool"]);

    spy.mockRestore();
  });

  it("does not execute the tool if the DB write fails", async () => {
    const tool = vi.fn();
    const spy = vi.spyOn(repo, "appendAgentLog").mockImplementation(() => {
      throw new Error("SQLITE_FAIL");
    });

    await expect(guard.runWithGuard(tool, [], taskId)).rejects.toThrow("SQLITE_FAIL");
    expect(tool).not.toHaveBeenCalled();

    spy.mockRestore();
  });
});
