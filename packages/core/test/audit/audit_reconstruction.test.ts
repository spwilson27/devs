/**
 * packages/core/test/audit/audit_reconstruction.test.ts
 *
 * Integration tests for AuditTrailReconstructor.
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import Database from "better-sqlite3";
import { createDatabase } from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { initializeAuditSchema } from "../../src/persistence/audit_schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import { TraceInterceptor } from "../../src/audit/TraceInterceptor.js";
import { DecisionLogger } from "../../src/audit/DecisionLogger.js";
import { AuditTrailReconstructor } from "../../src/audit/AuditTrailReconstructor.js";

let _lastDbPath = "";

function makeTestDb(): Database.Database {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-audit-"));
  const dbPath = path.join(tmpDir, "state.sqlite");
  _lastDbPath = dbPath;
  const db = createDatabase({ dbPath });
  initializeSchema(db);
  initializeAuditSchema(db);
  return db;
}

function seedTask(repo: StateRepository): { projectId: number; epicId: number; taskId: number } {
  const projectId = repo.upsertProject({ name: "test-project" });
  repo.saveEpics([{ project_id: projectId, name: "test-epic" }]);
  const epics = (repo.getProjectState(projectId) as NonNullable<ReturnType<StateRepository["getProjectState"]>>).epics;
  const epicId = epics[0]!.id as number;
  repo.saveTasks([{ epic_id: epicId, title: "test-task" }]);
  const tasks = (repo.getProjectState(projectId) as NonNullable<ReturnType<StateRepository["getProjectState"]>>).tasks;
  const taskId = tasks[0]!.id as number;
  return { projectId, epicId, taskId };
}

describe("AuditTrailReconstructor", () => {
  let db: Database.Database;
  let repo: StateRepository;
  let interceptor: TraceInterceptor;
  let taskId: number;

  beforeEach(() => {
    db = makeTestDb();
    repo = new StateRepository(db);
    interceptor = new TraceInterceptor(repo);
    const seed = seedTask(repo);
    taskId = seed.taskId;
  });

  afterEach(() => {
    db.close();
  });

  it("generates a markdown report containing thoughts, actions, decisions and commit info", () => {
    interceptor.persistTrace({
      task_id: taskId,
      turn_index: 0,
      agent_role: "developer",
      content_type: "THOUGHT",
      content: { thought: "Consider using Redis for caching" },
    });

    interceptor.persistTrace({
      task_id: taskId,
      turn_index: 0,
      agent_role: "developer",
      content_type: "ACTION",
      content: { tool_name: "http_request", tool_input: { url: "https://example.com" } },
    });

    interceptor.persistTrace({
      task_id: taskId,
      turn_index: 0,
      agent_role: "developer",
      content_type: "OBSERVATION",
      content: { tool_result: "200 OK" },
    });

    const decLogger = new DecisionLogger(db, taskId);
    decLogger.logAlternative("Use Redis", "Overkill for small scale");
    decLogger.confirmSelection("In-memory Map with LRU eviction");

    // update git commit hash for the task
    repo.updateTaskGitCommitHash(taskId, "deadbeef1234567890deadbeef1234567890deadb");

    const report = AuditTrailReconstructor.generateReport(db, { taskId });

    expect(typeof report).toBe("string");
    expect(report).toContain("Thoughts");
    expect(report).toContain("Actions");
    expect(report).toContain("Decisions");
    expect(report).toContain("In-memory Map with LRU eviction");
    expect(report).toContain("deadbeef1234567890deadbeef1234567890deadb");
  });

  it("handles missing logs by producing a partial coherent history containing decisions", () => {
    // create a second project/task with decisions but no agent logs
    const projectId2 = repo.upsertProject({ name: "silent-project" });
    repo.saveEpics([{ project_id: projectId2, name: "silent-epic" }]);
    const epicId2 = repo.getProjectState(projectId2)!.epics[0]!.id as number;
    repo.saveTasks([{ epic_id: epicId2, title: "silent-task" }]);
    const taskId2 = repo.getProjectState(projectId2)!.tasks[0]!.id as number;

    const decLogger2 = new DecisionLogger(db, taskId2);
    decLogger2.logAlternative("Use Postgres", "Too heavy for prototype");
    decLogger2.confirmSelection("SQLite in-process");

    const report = AuditTrailReconstructor.generateReport(db, { taskId: taskId2 });

    expect(typeof report).toBe("string");
    // Even with no agent logs, decisions should appear
    expect(report).toContain("Decisions");
    expect(report).toContain("SQLite in-process");
  });
});
