/**
 * packages/core/test/audit/trace_interceptor.test.ts
 *
 * Integration tests for the TraceInterceptor (Flight Recorder).
 *
 * Verifies that agent turns (thought → action → observation) are automatically
 * captured and persisted to the `agent_logs` table with full fidelity.
 *
 * Requirements: [TAS-001], [3_MCP-MCP-002], [TAS-046], [TAS-056], [1_PRD-REQ-PIL-004]
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import Database from "better-sqlite3";
import { createDatabase } from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { initializeAuditSchema } from "../../src/persistence/audit_schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import {
  TraceInterceptor,
  type TraceEvent,
} from "../../src/audit/TraceInterceptor.js";
import { SharedEventBus } from "../../src/events/SharedEventBus.js";

// ── Test helpers ───────────────────────────────────────────────────────────────

/** Last dbPath created by makeTestDb — used by ACID-durable test. */
let _lastDbPath = "";

function makeTestDb(): Database.Database {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-trace-"));
  const dbPath = path.join(tmpDir, "state.sqlite");
  _lastDbPath = dbPath;
  const db = createDatabase({ dbPath });
  initializeSchema(db);
  initializeAuditSchema(db);
  return db;
}

/**
 * Seeds minimal FK chain: project → epic → task.
 * Returns { projectId, epicId, taskId }.
 */
function seedTask(
  repo: StateRepository
): { projectId: number; epicId: number; taskId: number } {
  const projectId = repo.upsertProject({ name: "test-project" });
  repo.saveEpics([{ project_id: projectId, name: "test-epic" }]);
  const epics = (
    repo.getProjectState(projectId) as NonNullable<ReturnType<StateRepository["getProjectState"]>>
  ).epics;
  const epicId = epics[0]!.id as number;
  repo.saveTasks([{ epic_id: epicId, title: "test-task" }]);
  const tasks = (
    repo.getProjectState(projectId) as NonNullable<ReturnType<StateRepository["getProjectState"]>>
  ).tasks;
  const taskId = tasks[0]!.id as number;
  return { projectId, epicId, taskId };
}

function makeTempSocketPath(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-ti-"));
  return path.join(tmpDir, "t.sock");
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe("TraceInterceptor", () => {
  let db: Database.Database;
  let repo: StateRepository;
  let interceptor: TraceInterceptor;
  let taskId: number;
  let epicId: number;

  beforeEach(() => {
    db = makeTestDb();
    repo = new StateRepository(db);
    interceptor = new TraceInterceptor(repo);
    const seed = seedTask(repo);
    taskId = seed.taskId;
    epicId = seed.epicId;
  });

  afterEach(() => {
    db.close();
  });

  // ── persistTrace: THOUGHT ──────────────────────────────────────────────────

  describe("persistTrace — THOUGHT", () => {
    it("persists a THOUGHT entry to agent_logs", () => {
      const event: TraceEvent = {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "I need to refactor this function." },
      };

      const id = interceptor.persistTrace(event);

      expect(id).toBeTypeOf("number");
      expect(id).toBeGreaterThan(0);

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(logs[0]!.content_type).toBe("THOUGHT");
      expect(logs[0]!.role).toBe("developer");
    });

    it("stores thought content accurately in the JSON blob", () => {
      const thoughtText = "Analyzing the dependency graph for circular refs.";
      const event: TraceEvent = {
        task_id: taskId,
        turn_index: 1,
        agent_role: "researcher",
        content_type: "THOUGHT",
        content: { thought: thoughtText },
      };

      interceptor.persistTrace(event);

      const logs = repo.getTaskLogs(taskId);
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["thought"]).toBe(thoughtText);
    });

    it("embeds turn_index in the content blob", () => {
      const event: TraceEvent = {
        task_id: taskId,
        turn_index: 5,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Turn 5 thought." },
      };

      interceptor.persistTrace(event);

      const logs = repo.getTaskLogs(taskId);
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["turn_index"]).toBe(5);
    });

    it("records the agent_role in the role column", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "reviewer",
        content_type: "THOUGHT",
        content: { thought: "Code looks clean." },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.role).toBe("reviewer");
    });
  });

  // ── persistTrace: ACTION ───────────────────────────────────────────────────

  describe("persistTrace — ACTION", () => {
    it("persists an ACTION entry to agent_logs", () => {
      const event: TraceEvent = {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "ACTION",
        content: {
          tool_name: "read_file",
          tool_input: { path: "src/index.ts" },
        },
      };

      const id = interceptor.persistTrace(event);

      expect(id).toBeTypeOf("number");
      expect(id).toBeGreaterThan(0);

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(logs[0]!.content_type).toBe("ACTION");
    });

    it("stores tool_name and tool_input accurately", () => {
      const toolInput = { path: "packages/core/src/index.ts", encoding: "utf8" };
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 2,
        agent_role: "developer",
        content_type: "ACTION",
        content: { tool_name: "read_file", tool_input: toolInput },
      });

      const logs = repo.getTaskLogs(taskId);
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["tool_name"]).toBe("read_file");
      expect(parsed["tool_input"]).toEqual(toolInput);
    });
  });

  // ── persistTrace: OBSERVATION ──────────────────────────────────────────────

  describe("persistTrace — OBSERVATION", () => {
    it("persists an OBSERVATION entry to agent_logs", () => {
      const event: TraceEvent = {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "OBSERVATION",
        content: { tool_result: "File contents: export function foo() {}" },
      };

      const id = interceptor.persistTrace(event);

      expect(id).toBeTypeOf("number");

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.content_type).toBe("OBSERVATION");
    });

    it("stores tool_result accurately", () => {
      const toolResult = { stdout: "Build succeeded", exitCode: 0 };
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 3,
        agent_role: "developer",
        content_type: "OBSERVATION",
        content: { tool_result: toolResult },
      });

      const logs = repo.getTaskLogs(taskId);
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["tool_result"]).toEqual(toolResult);
    });
  });

  // ── Full agent turn sequence ───────────────────────────────────────────────

  describe("full agent turn sequence (THOUGHT → ACTION → OBSERVATION)", () => {
    it("records all three entries with correct content types", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "I should read the file first." },
      });
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "ACTION",
        content: { tool_name: "read_file", tool_input: { path: "index.ts" } },
      });
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "OBSERVATION",
        content: { tool_result: "export default {};" },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(3);
      expect(logs[0]!.content_type).toBe("THOUGHT");
      expect(logs[1]!.content_type).toBe("ACTION");
      expect(logs[2]!.content_type).toBe("OBSERVATION");
    });

    it("assigns the same task_id to all entries", () => {
      for (const ct of ["THOUGHT", "ACTION", "OBSERVATION"] as const) {
        interceptor.persistTrace({
          task_id: taskId,
          turn_index: 0,
          agent_role: "developer",
          content_type: ct,
          content: {},
        });
      }
      const logs = repo.getTaskLogs(taskId);
      for (const log of logs) {
        expect(log.task_id).toBe(taskId);
      }
    });

    it("preserves insertion order across turns", () => {
      for (let i = 0; i < 3; i++) {
        interceptor.persistTrace({
          task_id: taskId,
          turn_index: i,
          agent_role: "developer",
          content_type: "THOUGHT",
          content: { thought: `Turn ${i} thought` },
        });
      }

      const logs = repo.getTaskLogs(taskId);
      for (let i = 0; i < 3; i++) {
        const parsed = JSON.parse(logs[i]!.content) as Record<string, unknown>;
        expect(parsed["turn_index"]).toBe(i);
      }
    });
  });

  // ── Metadata completeness ──────────────────────────────────────────────────

  describe("metadata completeness", () => {
    it("includes task_id in every record", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "test" },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.task_id).toBe(taskId);
    });

    it("includes turn_index in the content blob of every record", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 7,
        agent_role: "developer",
        content_type: "ACTION",
        content: { tool_name: "exec", tool_input: {} },
      });

      const logs = repo.getTaskLogs(taskId);
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["turn_index"]).toBe(7);
    });

    it("includes agent_role in every record", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "orchestrator",
        content_type: "OBSERVATION",
        content: {},
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.role).toBe("orchestrator");
    });

    it("supports optional epic_id association", () => {
      interceptor.persistTrace({
        task_id: taskId,
        epic_id: epicId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Epic-scoped thought." },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.epic_id).toBe(epicId);
    });

    it("stores null epic_id when not provided", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "No epic." },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.epic_id).toBeNull();
    });

    it("supports optional commit_hash", () => {
      const hash = "abc123def456abc123def456abc123def456abc1";
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Post-commit thought." },
        commit_hash: hash,
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.commit_hash).toBe(hash);
    });

    it("stores null commit_hash when not provided", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "No commit." },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.commit_hash).toBeNull();
    });
  });

  // ── Synchronous persistence guarantee ─────────────────────────────────────

  describe("synchronous persistence guarantee", () => {
    it("is immediately readable after persistTrace returns (no await needed)", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Immediate check." },
      });

      // No await, no setTimeout — the log must be immediately visible.
      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
    });

    it("is ACID-durable (visible via a second DB connection)", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Durability check." },
      });

      // Open a second connection to the SAME database file using _lastDbPath
      // (set by makeTestDb). better-sqlite3 does not expose db.filename in
      // all versions, so we track the path via the module-level helper variable.
      const db2 = new Database(_lastDbPath, { readonly: true });
      const rows = db2
        .prepare("SELECT * FROM agent_logs WHERE task_id = ?")
        .all(taskId);
      db2.close();

      expect(rows).toHaveLength(1);
    });
  });

  // ── DB unavailability (graceful handling) ─────────────────────────────────

  describe("DB unavailability — graceful handling", () => {
    it("returns null and does not throw when StateRepository.appendAgentLog throws", () => {
      // Temporarily make the DB error on writes.
      const spy = vi
        .spyOn(repo, "appendAgentLog")
        .mockImplementation(() => {
          throw new Error("SQLITE_BUSY: database is locked");
        });

      let result: number | null | undefined;
      expect(() => {
        result = interceptor.persistTrace({
          task_id: taskId,
          turn_index: 0,
          agent_role: "developer",
          content_type: "THOUGHT",
          content: { thought: "This will fail." },
        });
      }).not.toThrow();

      expect(result).toBeNull();

      spy.mockRestore();
    });

    it("does not crash subsequent persist calls after a DB failure", () => {
      const spy = vi
        .spyOn(repo, "appendAgentLog")
        .mockImplementationOnce(() => {
          throw new Error("SQLITE_BUSY: database is locked");
        });

      // First call fails gracefully.
      const id1 = interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "First — will fail." },
      });
      expect(id1).toBeNull();

      spy.mockRestore();

      // Second call with real DB should succeed.
      const id2 = interceptor.persistTrace({
        task_id: taskId,
        turn_index: 1,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Second — will succeed." },
      });
      expect(id2).toBeTypeOf("number");
      expect(id2).toBeGreaterThan(0);
    });
  });

  // ── Secret masking ─────────────────────────────────────────────────────────

  describe("secret masking", () => {
    it("redacts Bearer tokens before writing to the DB", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: {
          thought: "Using Authorization: Bearer sk-secret-api-key-1234567890",
        },
      });

      const logs = repo.getTaskLogs(taskId);
      const content = logs[0]!.content;
      expect(content).not.toContain("sk-secret-api-key-1234567890");
      expect(content).toContain("[REDACTED]");
    });

    it("redacts API key patterns before writing to the DB", () => {
      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "ACTION",
        content: {
          tool_name: "http_request",
          tool_input: { api_key: "AKIAIOSFODNN7EXAMPLE" },
        },
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs[0]!.content).not.toContain("AKIAIOSFODNN7EXAMPLE");
    });
  });

  // ── EventBus integration ───────────────────────────────────────────────────

  describe("EventBus integration (subscribe / auto-persist)", () => {
    let server: SharedEventBus | null = null;

    afterEach(async () => {
      await server?.close();
      server = null;
    });

    it("auto-persists TRACE_THOUGHT events received from the bus", async () => {
      const socketPath = makeTempSocketPath();
      server = await SharedEventBus.createServer(socketPath);
      const unsub = interceptor.subscribe(server);

      server.publish("TRACE_THOUGHT", {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        thought: "EventBus thought.",
        timestamp: new Date().toISOString(),
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(logs[0]!.content_type).toBe("THOUGHT");
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["thought"]).toBe("EventBus thought.");

      unsub();
    });

    it("auto-persists TRACE_ACTION events received from the bus", async () => {
      const socketPath = makeTempSocketPath();
      server = await SharedEventBus.createServer(socketPath);
      const unsub = interceptor.subscribe(server);

      server.publish("TRACE_ACTION", {
        task_id: taskId,
        turn_index: 1,
        agent_role: "developer",
        tool_name: "write_file",
        tool_input: { path: "out.ts", content: "export {};" },
        timestamp: new Date().toISOString(),
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(logs[0]!.content_type).toBe("ACTION");
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect(parsed["tool_name"]).toBe("write_file");

      unsub();
    });

    it("auto-persists TRACE_OBSERVATION events received from the bus", async () => {
      const socketPath = makeTempSocketPath();
      server = await SharedEventBus.createServer(socketPath);
      const unsub = interceptor.subscribe(server);

      server.publish("TRACE_OBSERVATION", {
        task_id: taskId,
        turn_index: 1,
        agent_role: "developer",
        tool_result: { success: true, lines: 42 },
        timestamp: new Date().toISOString(),
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(logs[0]!.content_type).toBe("OBSERVATION");
      const parsed = JSON.parse(logs[0]!.content) as Record<string, unknown>;
      expect((parsed["tool_result"] as Record<string, unknown>)["success"]).toBe(true);

      unsub();
    });

    it("auto-persists all three event types in a full simulated turn", async () => {
      const socketPath = makeTempSocketPath();
      server = await SharedEventBus.createServer(socketPath);
      const unsub = interceptor.subscribe(server);

      const ts = new Date().toISOString();

      server.publish("TRACE_THOUGHT", {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        thought: "First I'll read the file.",
        timestamp: ts,
      });

      server.publish("TRACE_ACTION", {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        tool_name: "read_file",
        tool_input: { path: "src/index.ts" },
        timestamp: ts,
      });

      server.publish("TRACE_OBSERVATION", {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        tool_result: "export function main() {}",
        timestamp: ts,
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(3);
      expect(logs[0]!.content_type).toBe("THOUGHT");
      expect(logs[1]!.content_type).toBe("ACTION");
      expect(logs[2]!.content_type).toBe("OBSERVATION");

      unsub();
    });

    it("stops persisting after unsubscribe is called", async () => {
      const socketPath = makeTempSocketPath();
      server = await SharedEventBus.createServer(socketPath);
      const unsub = interceptor.subscribe(server);

      server.publish("TRACE_THOUGHT", {
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        thought: "Before unsub.",
        timestamp: new Date().toISOString(),
      });

      unsub(); // Stop listening.

      server.publish("TRACE_THOUGHT", {
        task_id: taskId,
        turn_index: 1,
        agent_role: "developer",
        thought: "After unsub — should NOT be persisted.",
        timestamp: new Date().toISOString(),
      });

      const logs = repo.getTaskLogs(taskId);
      // Only the first publish should have been persisted.
      expect(logs).toHaveLength(1);
    });
  });

  // ── Cross-task isolation ───────────────────────────────────────────────────

  describe("cross-task isolation", () => {
    it("logs for task A are not visible when querying task B", () => {
      const seed2 = seedTask(repo);
      const taskId2 = seed2.taskId;

      interceptor.persistTrace({
        task_id: taskId,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Task A thought." },
      });
      interceptor.persistTrace({
        task_id: taskId2,
        turn_index: 0,
        agent_role: "developer",
        content_type: "THOUGHT",
        content: { thought: "Task B thought." },
      });

      const logsA = repo.getTaskLogs(taskId);
      const logsB = repo.getTaskLogs(taskId2);
      expect(logsA).toHaveLength(1);
      expect(logsB).toHaveLength(1);

      const parsedA = JSON.parse(logsA[0]!.content) as Record<string, unknown>;
      const parsedB = JSON.parse(logsB[0]!.content) as Record<string, unknown>;
      expect(parsedA["thought"]).toBe("Task A thought.");
      expect(parsedB["thought"]).toBe("Task B thought.");
    });
  });
});
