/**
 * packages/core/test/persistence/state_repository.test.ts
 *
 * Integration tests for the StateRepository class.
 * Verifies:
 *   - Upserting (insert + update) projects.
 *   - Adding documents attached to a project.
 *   - Bulk insertion of requirements and epics within a single transaction.
 *   - Saving tasks within an epic.
 *   - Appending agent log entries.
 *   - Recording entropy events.
 *   - ACID compliance: mid-transaction failure causes full rollback, no
 *     partial data is committed.
 *   - Retrieving full project state (requirements + tasks + logs).
 *   - Retrieving task-specific audit logs.
 *
 * Requirements: 2_TAS-REQ-017
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import type Database from "better-sqlite3";
import {
  createDatabase,
  closeDatabase,
} from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import {
  StateRepository,
  type Project,
  type Document,
  type Requirement,
  type Epic,
  type Task,
  type AgentLog,
  type EntropyEvent,
} from "../../src/persistence/state_repository.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(
    tmpdir(),
    `devs-state-repo-test-${unique}`,
    ".devs",
    "state.sqlite"
  );
}

function rowCount(db: Database.Database, table: string): number {
  return (
    db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }
  ).n;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("StateRepository", () => {
  let db: Database.Database;
  let repo: StateRepository;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = makeTestDbPath();
    db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);
    repo = new StateRepository(db);
  });

  afterEach(() => {
    db.close();
    closeDatabase();
    const testRoot = resolve(dirname(testDbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  // ── upsertProject ─────────────────────────────────────────────────────────

  describe("upsertProject()", () => {
    it("inserts a new project and returns its id", () => {
      const id = repo.upsertProject({ name: "alpha", status: "pending" });
      expect(typeof id).toBe("number");
      expect(id).toBeGreaterThan(0);
    });

    it("stores all fields correctly", () => {
      const project: Project = {
        name: "beta",
        status: "active",
        current_phase: "phase_1",
        metadata: JSON.stringify({ owner: "agent" }),
      };
      const id = repo.upsertProject(project);
      const row = db
        .prepare("SELECT * FROM projects WHERE id = ?")
        .get(id) as Project & { id: number };
      expect(row.name).toBe("beta");
      expect(row.status).toBe("active");
      expect(row.current_phase).toBe("phase_1");
      expect(row.metadata).toBe(JSON.stringify({ owner: "agent" }));
    });

    it("updates an existing project when the same id is provided", () => {
      const id = repo.upsertProject({ name: "gamma", status: "pending" });
      repo.upsertProject({ id, name: "gamma-updated", status: "active" });

      const rows = db.prepare("SELECT * FROM projects").all() as Project[];
      expect(rows).toHaveLength(1);
      const row = rows[0] as Project & { id: number };
      expect(row.name).toBe("gamma-updated");
      expect(row.status).toBe("active");
    });

    it("preserves child rows (cascade safety) when updating a project", () => {
      const id = repo.upsertProject({ name: "delta", status: "pending" });
      repo.addDocument({
        project_id: id,
        name: "prd.md",
        content: "content",
        status: "draft",
      });

      // Update project — should NOT cascade-delete the document.
      repo.upsertProject({ id, name: "delta-updated", status: "active" });

      expect(rowCount(db, "documents")).toBe(1);
    });

    it("uses 'pending' as default status when omitted", () => {
      const id = repo.upsertProject({ name: "epsilon" });
      const row = db
        .prepare("SELECT status FROM projects WHERE id = ?")
        .get(id) as { status: string };
      expect(row.status).toBe("pending");
    });
  });

  // ── addDocument ───────────────────────────────────────────────────────────

  describe("addDocument()", () => {
    let projectId: number;

    beforeEach(() => {
      projectId = repo.upsertProject({ name: "doc-test-project" });
    });

    it("inserts a document and returns its id", () => {
      const id = repo.addDocument({
        project_id: projectId,
        name: "prd.md",
        content: "# PRD",
        status: "draft",
      });
      expect(id).toBeGreaterThan(0);
    });

    it("stores all document fields correctly", () => {
      const doc: Document = {
        project_id: projectId,
        name: "tas.md",
        content: "# TAS",
        version: 2,
        status: "approved",
      };
      const id = repo.addDocument(doc);
      const row = db
        .prepare("SELECT * FROM documents WHERE id = ?")
        .get(id) as Document & { id: number };
      expect(row.project_id).toBe(projectId);
      expect(row.name).toBe("tas.md");
      expect(row.content).toBe("# TAS");
      expect(row.version).toBe(2);
      expect(row.status).toBe("approved");
    });

    it("rejects a document with a non-existent project_id (FK constraint)", () => {
      expect(() =>
        repo.addDocument({ project_id: 99999, name: "orphan.md" })
      ).toThrow();
    });
  });

  // ── saveRequirements ──────────────────────────────────────────────────────

  describe("saveRequirements()", () => {
    let projectId: number;

    beforeEach(() => {
      projectId = repo.upsertProject({ name: "req-test-project" });
    });

    it("bulk-inserts all requirements", () => {
      const reqs: Requirement[] = [
        {
          project_id: projectId,
          description: "REQ-001: System must have auth",
          priority: "high",
        },
        {
          project_id: projectId,
          description: "REQ-002: System must have logging",
          priority: "medium",
        },
        {
          project_id: projectId,
          description: "REQ-003: System must be fast",
          priority: "low",
        },
      ];
      repo.saveRequirements(reqs);
      expect(rowCount(db, "requirements")).toBe(3);
    });

    it("stores priority and status fields correctly", () => {
      repo.saveRequirements([
        {
          project_id: projectId,
          description: "explicit fields",
          priority: "critical",
          status: "approved",
          metadata: '{"source":"prd"}',
        },
      ]);
      const row = db
        .prepare("SELECT * FROM requirements WHERE description = ?")
        .get("explicit fields") as Requirement;
      expect(row.priority).toBe("critical");
      expect(row.status).toBe("approved");
      expect(row.metadata).toBe('{"source":"prd"}');
    });

    it("is a no-op when called with an empty array", () => {
      repo.saveRequirements([]);
      expect(rowCount(db, "requirements")).toBe(0);
    });

    it("uses 'medium' priority and 'pending' status as defaults", () => {
      repo.saveRequirements([
        { project_id: projectId, description: "default-fields req" },
      ]);
      const row = db
        .prepare("SELECT priority, status FROM requirements WHERE description = ?")
        .get("default-fields req") as { priority: string; status: string };
      expect(row.priority).toBe("medium");
      expect(row.status).toBe("pending");
    });

    it("rolls back the entire batch if one requirement violates a FK constraint (ACID)", () => {
      const validReq: Requirement = {
        project_id: projectId,
        description: "valid requirement",
      };
      const invalidReq: Requirement = {
        project_id: 99999, // non-existent project → FK violation
        description: "invalid requirement",
      };

      expect(() =>
        repo.saveRequirements([validReq, invalidReq])
      ).toThrow();

      // No partial data: even the valid requirement was rolled back.
      expect(rowCount(db, "requirements")).toBe(0);
    });
  });

  // ── saveEpics ─────────────────────────────────────────────────────────────

  describe("saveEpics()", () => {
    let projectId: number;

    beforeEach(() => {
      projectId = repo.upsertProject({ name: "epic-test-project" });
    });

    it("bulk-inserts all epics", () => {
      const epics: Epic[] = [
        { project_id: projectId, name: "Phase 1: Setup", order_index: 0 },
        { project_id: projectId, name: "Phase 2: Core", order_index: 1 },
      ];
      repo.saveEpics(epics);
      expect(rowCount(db, "epics")).toBe(2);
    });

    it("stores order_index and status correctly", () => {
      repo.saveEpics([
        {
          project_id: projectId,
          name: "Active Phase",
          order_index: 5,
          status: "active",
        },
      ]);
      const row = db
        .prepare("SELECT * FROM epics WHERE name = ?")
        .get("Active Phase") as Epic;
      expect(row.order_index).toBe(5);
      expect(row.status).toBe("active");
    });

    it("is a no-op when called with an empty array", () => {
      repo.saveEpics([]);
      expect(rowCount(db, "epics")).toBe(0);
    });

    it("rolls back the entire batch if one epic violates a FK constraint (ACID)", () => {
      const validEpic: Epic = {
        project_id: projectId,
        name: "valid epic",
        order_index: 0,
      };
      const invalidEpic: Epic = {
        project_id: 99999, // non-existent → FK violation
        name: "invalid epic",
        order_index: 1,
      };

      expect(() => repo.saveEpics([validEpic, invalidEpic])).toThrow();

      // The valid epic was also rolled back.
      expect(rowCount(db, "epics")).toBe(0);
    });
  });

  // ── saveTasks ─────────────────────────────────────────────────────────────

  describe("saveTasks()", () => {
    let epicId: number;

    beforeEach(() => {
      const projectId = repo.upsertProject({ name: "task-test-project" });
      const epics: Epic[] = [
        { project_id: projectId, name: "Phase 1", order_index: 0 },
      ];
      repo.saveEpics(epics);
      epicId = (
        db.prepare("SELECT id FROM epics LIMIT 1").get() as { id: number }
      ).id;
    });

    it("bulk-inserts all tasks", () => {
      const tasks: Task[] = [
        { epic_id: epicId, title: "Task A", status: "pending" },
        { epic_id: epicId, title: "Task B", status: "in_progress" },
      ];
      repo.saveTasks(tasks);
      expect(rowCount(db, "tasks")).toBe(2);
    });

    it("stores git_commit_hash correctly", () => {
      repo.saveTasks([
        {
          epic_id: epicId,
          title: "Committed Task",
          status: "completed",
          git_commit_hash: "abc123def456",
        },
      ]);
      const row = db
        .prepare("SELECT git_commit_hash FROM tasks WHERE title = ?")
        .get("Committed Task") as { git_commit_hash: string };
      expect(row.git_commit_hash).toBe("abc123def456");
    });

    it("rolls back the entire batch if one task violates a FK constraint (ACID)", () => {
      const validTask: Task = { epic_id: epicId, title: "valid task" };
      const invalidTask: Task = {
        epic_id: 99999, // non-existent epic → FK violation
        title: "invalid task",
      };

      expect(() => repo.saveTasks([validTask, invalidTask])).toThrow();

      expect(rowCount(db, "tasks")).toBe(0);
    });
  });

  // ── appendAgentLog ────────────────────────────────────────────────────────

  describe("appendAgentLog()", () => {
    let taskId: number;

    beforeEach(() => {
      const projectId = repo.upsertProject({ name: "log-test-project" });
      repo.saveEpics([{ project_id: projectId, name: "Phase 1", order_index: 0 }]);
      const epicId = (
        db.prepare("SELECT id FROM epics LIMIT 1").get() as { id: number }
      ).id;
      repo.saveTasks([{ epic_id: epicId, title: "Log Task" }]);
      taskId = (
        db.prepare("SELECT id FROM tasks LIMIT 1").get() as { id: number }
      ).id;
    });

    it("inserts an agent log and returns its id", () => {
      const id = repo.appendAgentLog({
        task_id: taskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: JSON.stringify({ thought: "I need to write the function" }),
      });
      expect(id).toBeGreaterThan(0);
    });

    it("stores all log fields correctly", () => {
      const payload = JSON.stringify({ thought: "Reviewing code", action: "read_file", observation: "Code looks good" });
      const log: AgentLog = {
        task_id: taskId,
        role: "reviewer",
        content_type: "OBSERVATION",
        content: payload,
        commit_hash: "abc123",
      };
      const id = repo.appendAgentLog(log);
      const row = db
        .prepare("SELECT * FROM agent_logs WHERE id = ?")
        .get(id) as AgentLog & { id: number };
      expect(row.task_id).toBe(taskId);
      expect(row.role).toBe("reviewer");
      expect(row.content_type).toBe("OBSERVATION");
      expect(row.content).toBe(payload);
      expect(row.commit_hash).toBe("abc123");
    });

    it("auto-populates a timestamp when none is provided", () => {
      const id = repo.appendAgentLog({
        task_id: taskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: "{}",
      });
      const row = db
        .prepare("SELECT timestamp FROM agent_logs WHERE id = ?")
        .get(id) as { timestamp: string };
      expect(row.timestamp).toBeTruthy();
      expect(typeof row.timestamp).toBe("string");
    });

    it("can append multiple log entries for the same task", () => {
      repo.appendAgentLog({ task_id: taskId, role: "implementer", content_type: "THOUGHT", content: '{"step":1}' });
      repo.appendAgentLog({ task_id: taskId, role: "implementer", content_type: "ACTION", content: '{"step":2}' });
      repo.appendAgentLog({ task_id: taskId, role: "reviewer", content_type: "OBSERVATION", content: '{"step":3}' });
      expect(rowCount(db, "agent_logs")).toBe(3);
    });

    it("rejects a log with a non-existent task_id (FK constraint)", () => {
      expect(() =>
        repo.appendAgentLog({ task_id: 99999, role: "implementer", content_type: "THOUGHT", content: "{}" })
      ).toThrow();
    });
  });

  // ── recordEntropyEvent ────────────────────────────────────────────────────

  describe("recordEntropyEvent()", () => {
    let taskId: number;

    beforeEach(() => {
      const projectId = repo.upsertProject({ name: "entropy-test-project" });
      repo.saveEpics([
        { project_id: projectId, name: "Phase 1", order_index: 0 },
      ]);
      const epicId = (
        db.prepare("SELECT id FROM epics LIMIT 1").get() as { id: number }
      ).id;
      repo.saveTasks([{ epic_id: epicId, title: "Entropy Task" }]);
      taskId = (
        db.prepare("SELECT id FROM tasks LIMIT 1").get() as { id: number }
      ).id;
    });

    it("inserts an entropy event and returns its id", () => {
      const id = repo.recordEntropyEvent({
        task_id: taskId,
        hash_chain: "sha256:abc123",
        error_output: "Error: command failed",
      });
      expect(id).toBeGreaterThan(0);
    });

    it("stores all entropy event fields correctly", () => {
      const event: EntropyEvent = {
        task_id: taskId,
        hash_chain: "sha256:deadbeef",
        error_output: "repeated failure",
      };
      const id = repo.recordEntropyEvent(event);
      const row = db
        .prepare("SELECT * FROM entropy_events WHERE id = ?")
        .get(id) as EntropyEvent & { id: number };
      expect(row.task_id).toBe(taskId);
      expect(row.hash_chain).toBe("sha256:deadbeef");
      expect(row.error_output).toBe("repeated failure");
      expect(row.timestamp).toBeTruthy();
    });

    it("rejects an event with a non-existent task_id (FK constraint)", () => {
      expect(() =>
        repo.recordEntropyEvent({ task_id: 99999, hash_chain: "sha256:xyz" })
      ).toThrow();
    });
  });

  // ── getProjectState ───────────────────────────────────────────────────────

  describe("getProjectState()", () => {
    it("returns null for a non-existent project id", () => {
      const state = repo.getProjectState(99999);
      expect(state).toBeNull();
    });

    it("returns the full project state with all related entities", () => {
      // Setup: project with requirements, epics, tasks, and logs.
      const projectId = repo.upsertProject({
        name: "full-state-project",
        status: "active",
        current_phase: "phase_1",
      });

      repo.saveRequirements([
        { project_id: projectId, description: "REQ-001", priority: "high" },
        { project_id: projectId, description: "REQ-002", priority: "low" },
      ]);

      repo.saveEpics([
        { project_id: projectId, name: "Epic 1", order_index: 0 },
        { project_id: projectId, name: "Epic 2", order_index: 1 },
      ]);

      const epics = db
        .prepare("SELECT id FROM epics WHERE project_id = ?")
        .all(projectId) as Array<{ id: number }>;
      const firstEpicId = epics[0]!.id;

      repo.saveTasks([
        { epic_id: firstEpicId, title: "Task 1", status: "completed" },
        { epic_id: firstEpicId, title: "Task 2", status: "pending" },
      ]);

      const tasks = db
        .prepare(
          "SELECT t.id FROM tasks t JOIN epics e ON t.epic_id = e.id WHERE e.project_id = ?"
        )
        .all(projectId) as Array<{ id: number }>;
      const firstTaskId = tasks[0]!.id;

      repo.appendAgentLog({
        task_id: firstTaskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: JSON.stringify({ thought: "Implementing task 1" }),
      });

      // Retrieve state.
      const state = repo.getProjectState(projectId);

      expect(state).not.toBeNull();
      expect(state!.project.name).toBe("full-state-project");
      expect(state!.requirements).toHaveLength(2);
      expect(state!.epics).toHaveLength(2);
      expect(state!.tasks).toHaveLength(2);
      expect(state!.agent_logs).toHaveLength(1);
    });

    it("returns empty arrays for a project with no children", () => {
      const projectId = repo.upsertProject({ name: "empty-project" });
      const state = repo.getProjectState(projectId);

      expect(state).not.toBeNull();
      expect(state!.requirements).toHaveLength(0);
      expect(state!.epics).toHaveLength(0);
      expect(state!.tasks).toHaveLength(0);
      expect(state!.agent_logs).toHaveLength(0);
    });
  });

  // ── getTaskLogs ───────────────────────────────────────────────────────────

  describe("getTaskLogs()", () => {
    let taskId: number;

    beforeEach(() => {
      const projectId = repo.upsertProject({ name: "log-query-project" });
      repo.saveEpics([
        { project_id: projectId, name: "Phase 1", order_index: 0 },
      ]);
      const epicId = (
        db.prepare("SELECT id FROM epics LIMIT 1").get() as { id: number }
      ).id;
      repo.saveTasks([{ epic_id: epicId, title: "Queried Task" }]);
      taskId = (
        db.prepare("SELECT id FROM tasks LIMIT 1").get() as { id: number }
      ).id;
    });

    it("returns an empty array for a task with no logs", () => {
      const logs = repo.getTaskLogs(taskId);
      expect(logs).toEqual([]);
    });

    it("returns all logs for a task in insertion order", () => {
      repo.appendAgentLog({
        task_id: taskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: JSON.stringify({ thought: "First thought" }),
      });
      repo.appendAgentLog({
        task_id: taskId,
        role: "reviewer",
        content_type: "OBSERVATION",
        content: JSON.stringify({ thought: "Review thought" }),
      });
      repo.appendAgentLog({
        task_id: taskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: JSON.stringify({ thought: "Fix thought" }),
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(3);
      // Verify ordering via role (insertion order)
      expect(logs[0]!.role).toBe("implementer");
      expect(logs[1]!.role).toBe("reviewer");
      expect(logs[2]!.role).toBe("implementer");
      expect(JSON.parse(logs[0]!.content).thought).toBe("First thought");
      expect(JSON.parse(logs[1]!.content).thought).toBe("Review thought");
      expect(JSON.parse(logs[2]!.content).thought).toBe("Fix thought");
    });

    it("only returns logs for the requested task, not other tasks", () => {
      // Create a second task in the same epic.
      const epicId = (
        db.prepare("SELECT id FROM epics LIMIT 1").get() as { id: number }
      ).id;
      repo.saveTasks([{ epic_id: epicId, title: "Other Task" }]);
      const otherTaskId = (
        db
          .prepare("SELECT id FROM tasks WHERE title = ?")
          .get("Other Task") as { id: number }
      ).id;

      repo.appendAgentLog({
        task_id: taskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: JSON.stringify({ thought: "My task log" }),
      });
      repo.appendAgentLog({
        task_id: otherTaskId,
        role: "implementer",
        content_type: "THOUGHT",
        content: JSON.stringify({ thought: "Other task log" }),
      });

      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(JSON.parse(logs[0]!.content).thought).toBe("My task log");
    });
  });

  // ── Full workflow integration ──────────────────────────────────────────────

  describe("Full workflow integration", () => {
    it("supports a complete project lifecycle: create → populate → query", () => {
      // 1. Create project.
      const projectId = repo.upsertProject({
        name: "Lifecycle Test",
        status: "active",
        current_phase: "phase_1",
      });

      // 2. Add a document.
      const docId = repo.addDocument({
        project_id: projectId,
        name: "prd.md",
        content: "# PRD",
        status: "approved",
      });
      expect(docId).toBeGreaterThan(0);

      // 3. Save requirements.
      repo.saveRequirements([
        {
          project_id: projectId,
          description: "Auth required",
          priority: "high",
          status: "approved",
        },
      ]);

      // 4. Save epics.
      repo.saveEpics([
        {
          project_id: projectId,
          name: "Setup Phase",
          order_index: 0,
          status: "active",
        },
      ]);

      // 5. Save tasks.
      const epicId = (
        db.prepare("SELECT id FROM epics WHERE project_id = ?").get(projectId) as {
          id: number;
        }
      ).id;
      repo.saveTasks([
        { epic_id: epicId, title: "Init repo", status: "completed", git_commit_hash: "abc123" },
      ]);

      // 6. Append log.
      const taskId = (
        db.prepare("SELECT id FROM tasks WHERE epic_id = ?").get(epicId) as {
          id: number;
        }
      ).id;
      repo.appendAgentLog({
        task_id: taskId,
        role: "implementer",
        content_type: "ACTION",
        content: JSON.stringify({ action: "commit", observation: "Committed abc123" }),
        commit_hash: "abc123",
      });

      // 7. Record entropy event (simulate a run with loop detection).
      repo.recordEntropyEvent({
        task_id: taskId,
        hash_chain: "sha256:00001",
        error_output: null,
      });

      // 8. Retrieve full state.
      const state = repo.getProjectState(projectId);
      expect(state).not.toBeNull();
      expect(state!.project.name).toBe("Lifecycle Test");
      expect(state!.requirements).toHaveLength(1);
      expect(state!.epics).toHaveLength(1);
      expect(state!.tasks).toHaveLength(1);
      expect(state!.agent_logs).toHaveLength(1);

      // 9. Retrieve task logs.
      const logs = repo.getTaskLogs(taskId);
      expect(logs).toHaveLength(1);
      expect(logs[0]!.role).toBe("implementer");
      expect(logs[0]!.content_type).toBe("ACTION");
      expect(logs[0]!.commit_hash).toBe("abc123");
    });

    it("verifies cascade delete: deleting a project removes all child rows", () => {
      const projectId = repo.upsertProject({ name: "CascadeTest" });
      repo.saveRequirements([
        { project_id: projectId, description: "REQ-001" },
      ]);
      repo.saveEpics([{ project_id: projectId, name: "E1", order_index: 0 }]);
      const epicId = (
        db.prepare("SELECT id FROM epics WHERE project_id = ?").get(projectId) as {
          id: number;
        }
      ).id;
      repo.saveTasks([{ epic_id: epicId, title: "T1" }]);
      const taskId = (
        db.prepare("SELECT id FROM tasks WHERE epic_id = ?").get(epicId) as {
          id: number;
        }
      ).id;
      repo.appendAgentLog({ task_id: taskId, role: "implementer", content_type: "THOUGHT", content: "{}" });

      expect(rowCount(db, "requirements")).toBe(1);
      expect(rowCount(db, "epics")).toBe(1);
      expect(rowCount(db, "tasks")).toBe(1);
      expect(rowCount(db, "agent_logs")).toBe(1);

      // Delete the project.
      db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);

      // All descendants should be gone via ON DELETE CASCADE.
      expect(rowCount(db, "requirements")).toBe(0);
      expect(rowCount(db, "epics")).toBe(0);
      expect(rowCount(db, "tasks")).toBe(0);
      expect(rowCount(db, "agent_logs")).toBe(0);
    });
  });
});
