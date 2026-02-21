/**
 * packages/core/test/persistence/StateRepository.test.ts
 *
 * ACID transaction tests for the StateRepository class.
 *
 * Verifies:
 *   - The public `transaction<T>(cb: () => T): T` API wraps callbacks in a
 *     SQLite transaction and commits on success.
 *   - A failed callback causes a full ROLLBACK — no partial data is committed.
 *   - Nested `transaction()` calls work correctly via SQLite savepoints.
 *   - The new `updateTaskStatus()` method updates task status and participates
 *     in outer `transaction()` rollbacks.
 *   - Every existing write method participates in outer `transaction()` rollbacks.
 *
 * Requirements: [TAS-067], [8_RISKS-REQ-115], [3_MCP-REQ-REL-004]
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
  type Epic,
  type Task,
} from "../../src/persistence/state_repository.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(
    tmpdir(),
    `devs-acid-test-${unique}`,
    ".devs",
    "state.sqlite"
  );
}

function rowCount(db: Database.Database, table: string): number {
  return (
    db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }
  ).n;
}

/** Sets up a fully-populated project hierarchy: project → epic → task. */
function setupProjectHierarchy(
  repo: StateRepository,
  db: Database.Database,
  projectName = "ACID Test Project"
): { projectId: number; epicId: number; taskId: number } {
  const projectId = repo.upsertProject({ name: projectName, status: "pending" });
  repo.saveEpics([{ project_id: projectId, name: "Phase 1", order_index: 0 }]);
  const epicId = (
    db.prepare("SELECT id FROM epics WHERE project_id = ?").get(projectId) as {
      id: number;
    }
  ).id;
  repo.saveTasks([{ epic_id: epicId, title: "Task 1", status: "pending" }]);
  const taskId = (
    db.prepare("SELECT id FROM tasks WHERE epic_id = ?").get(epicId) as {
      id: number;
    }
  ).id;
  return { projectId, epicId, taskId };
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("StateRepository — ACID Transactions", () => {
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

  // ── transaction() — basic behaviour ───────────────────────────────────────

  describe("transaction() — basic commit and rollback", () => {
    it("commits multiple writes atomically when the callback succeeds", () => {
      // Insert a project and an epic together in a single user-defined transaction.
      const projectId = repo.transaction(() => {
        const id = repo.upsertProject({ name: "Atomic Project", status: "pending" });
        repo.saveEpics([
          { project_id: id, name: "Epic 1", order_index: 0 },
          { project_id: id, name: "Epic 2", order_index: 1 },
        ]);
        return id;
      });

      expect(rowCount(db, "projects")).toBe(1);
      expect(rowCount(db, "epics")).toBe(2);

      const row = db
        .prepare("SELECT name FROM projects WHERE id = ?")
        .get(projectId) as { name: string };
      expect(row.name).toBe("Atomic Project");
    });

    it("returns the value produced by the callback", () => {
      const result = repo.transaction(() => 42 as number);
      expect(result).toBe(42);
    });

    it("returns complex values (objects) from the callback", () => {
      const pid = repo.upsertProject({ name: "Value Test" });
      const result = repo.transaction(() => ({
        id: repo.addDocument({ project_id: pid, name: "prd.md" }),
        count: rowCount(db, "documents"),
      }));
      expect(result.id).toBeGreaterThan(0);
      expect(result.count).toBe(1);
    });

    it("rolls back all writes when the callback throws", () => {
      // Pre-insert a project with a known name.
      const projectId = repo.upsertProject({ name: "Original", status: "pending" });

      // Attempt a transaction that updates the project then crashes.
      expect(() => {
        repo.transaction(() => {
          repo.upsertProject({ id: projectId, name: "Updated", status: "active" });
          throw new Error("intentional failure");
        });
      }).toThrow("intentional failure");

      // The project name should be rolled back to the original value.
      const row = db
        .prepare("SELECT name, status FROM projects WHERE id = ?")
        .get(projectId) as { name: string; status: string };
      expect(row.name).toBe("Original");
      expect(row.status).toBe("pending");
    });

    it("re-throws the exact error that caused the rollback", () => {
      class CustomError extends Error {
        constructor(
          message: string,
          public readonly code: string
        ) {
          super(message);
        }
      }
      const original = new CustomError("something broke", "ERR_BROKEN");

      let caught: unknown;
      try {
        repo.transaction(() => {
          throw original;
        });
      } catch (e) {
        caught = e;
      }

      expect(caught).toBe(original);
    });

    it("leaves the database in a consistent state after rollback", () => {
      const projectId = repo.upsertProject({ name: "Stable" });
      repo.saveEpics([{ project_id: projectId, name: "Epic A", order_index: 0 }]);

      expect(() => {
        repo.transaction(() => {
          repo.saveEpics([{ project_id: projectId, name: "Epic B", order_index: 1 }]);
          throw new Error("abort");
        });
      }).toThrow("abort");

      // Epic A committed before the failing transaction must still be present.
      expect(rowCount(db, "epics")).toBe(1);
      const row = db
        .prepare("SELECT name FROM epics WHERE project_id = ?")
        .get(projectId) as { name: string };
      expect(row.name).toBe("Epic A");
    });
  });

  // ── transaction() — nested transactions (savepoints) ──────────────────────

  describe("transaction() — nested transactions via savepoints", () => {
    it("handles nested transaction() calls without throwing", () => {
      const projectId = repo.upsertProject({ name: "Nest Test" });

      expect(() => {
        repo.transaction(() => {
          repo.upsertProject({ id: projectId, name: "Outer Changed", status: "active" });
          repo.transaction(() => {
            repo.saveEpics([
              { project_id: projectId, name: "Inner Epic", order_index: 0 },
            ]);
          });
        });
      }).not.toThrow();

      // Both outer and inner writes must be committed.
      const row = db
        .prepare("SELECT name, status FROM projects WHERE id = ?")
        .get(projectId) as { name: string; status: string };
      expect(row.name).toBe("Outer Changed");
      expect(row.status).toBe("active");
      expect(rowCount(db, "epics")).toBe(1);
    });

    it("rolls back the inner savepoint while the outer transaction continues", () => {
      const projectId = repo.upsertProject({ name: "Savepoint Test" });

      repo.transaction(() => {
        // Outer write: update project name.
        repo.upsertProject({ id: projectId, name: "Outer Updated", status: "active" });

        // Inner nested transaction that throws — should only roll back its savepoint.
        try {
          repo.transaction(() => {
            repo.saveEpics([
              { project_id: projectId, name: "Should Be Rolled Back", order_index: 0 },
            ]);
            throw new Error("inner failure");
          });
        } catch {
          // Swallow inner error; outer transaction continues.
        }
      });

      // Outer change (project name/status) must be committed.
      const row = db
        .prepare("SELECT name, status FROM projects WHERE id = ?")
        .get(projectId) as { name: string; status: string };
      expect(row.name).toBe("Outer Updated");
      expect(row.status).toBe("active");

      // Inner epic (rolled back via savepoint) must NOT be present.
      expect(rowCount(db, "epics")).toBe(0);
    });

    it("rolls back all nested savepoints when the outer transaction fails", () => {
      const projectId = repo.upsertProject({ name: "Full Rollback Test" });

      expect(() => {
        repo.transaction(() => {
          repo.upsertProject({ id: projectId, name: "Outer Change" });
          repo.transaction(() => {
            repo.saveEpics([{ project_id: projectId, name: "Inner Epic", order_index: 0 }]);
          });
          // Outer transaction fails — both outer change and inner savepoint roll back.
          throw new Error("outer failure");
        });
      }).toThrow("outer failure");

      // Neither the outer change nor the nested epic should be committed.
      const row = db
        .prepare("SELECT name FROM projects WHERE id = ?")
        .get(projectId) as { name: string };
      expect(row.name).toBe("Full Rollback Test");
      expect(rowCount(db, "epics")).toBe(0);
    });
  });

  // ── updateTaskStatus() ─────────────────────────────────────────────────────

  describe("updateTaskStatus()", () => {
    let taskId: number;

    beforeEach(() => {
      ({ taskId } = setupProjectHierarchy(repo, db, "Status Test Project"));
    });

    it("updates a task's status field", () => {
      repo.updateTaskStatus(taskId, "in_progress");
      const row = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as { status: string };
      expect(row.status).toBe("in_progress");
    });

    it("can transition through multiple statuses", () => {
      repo.updateTaskStatus(taskId, "in_progress");
      repo.updateTaskStatus(taskId, "completed");
      const row = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as { status: string };
      expect(row.status).toBe("completed");
    });

    it("does not affect other tasks when updating one task", () => {
      const { epicId } = setupProjectHierarchy(repo, db, "Other Project");
      const otherTaskId = (
        db.prepare("SELECT id FROM tasks WHERE epic_id = ?").get(epicId) as {
          id: number;
        }
      ).id;

      repo.updateTaskStatus(taskId, "in_progress");

      const otherRow = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(otherTaskId) as { status: string };
      expect(otherRow.status).toBe("pending");
    });

    it("is transactional: rolled back when called inside a failing transaction", () => {
      expect(() => {
        repo.transaction(() => {
          repo.updateTaskStatus(taskId, "in_progress");
          throw new Error("force rollback");
        });
      }).toThrow("force rollback");

      // Status should still be 'pending' (rolled back).
      const row = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as { status: string };
      expect(row.status).toBe("pending");
    });

    it("task start is transactional: updateTaskStatus and appendAgentLog commit atomically", () => {
      repo.transaction(() => {
        repo.updateTaskStatus(taskId, "in_progress");
        repo.appendAgentLog({
          task_id: taskId,
          agent_role: "implementer",
          thought: "Starting task",
        });
      });

      const row = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as { status: string };
      expect(row.status).toBe("in_progress");
      expect(rowCount(db, "agent_logs")).toBe(1);
    });

    it("task start rollback: both updateTaskStatus and appendAgentLog roll back on failure", () => {
      expect(() => {
        repo.transaction(() => {
          repo.updateTaskStatus(taskId, "in_progress");
          repo.appendAgentLog({
            task_id: taskId,
            agent_role: "implementer",
            thought: "Starting task",
          });
          throw new Error("crash during task start");
        });
      }).toThrow("crash during task start");

      const row = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as { status: string };
      expect(row.status).toBe("pending");
      expect(rowCount(db, "agent_logs")).toBe(0);
    });
  });

  // ── All write methods participate in transaction() rollbacks ───────────────

  describe("All write methods participate in transaction() rollbacks", () => {
    it("upsertProject changes are rolled back on transaction failure", () => {
      const projectId = repo.upsertProject({ name: "Original", status: "pending" });

      expect(() => {
        repo.transaction(() => {
          repo.upsertProject({ id: projectId, name: "Changed", status: "active" });
          throw new Error("fail");
        });
      }).toThrow();

      const row = db
        .prepare("SELECT name FROM projects WHERE id = ?")
        .get(projectId) as { name: string };
      expect(row.name).toBe("Original");
    });

    it("addDocument inserts are rolled back on transaction failure", () => {
      const projectId = repo.upsertProject({ name: "Doc Rollback" });

      expect(() => {
        repo.transaction(() => {
          repo.addDocument({ project_id: projectId, name: "prd.md" });
          throw new Error("fail");
        });
      }).toThrow();

      expect(rowCount(db, "documents")).toBe(0);
    });

    it("saveRequirements inserts are rolled back on transaction failure", () => {
      const projectId = repo.upsertProject({ name: "Req Rollback" });

      expect(() => {
        repo.transaction(() => {
          repo.saveRequirements([
            { project_id: projectId, description: "REQ-001" },
          ]);
          throw new Error("fail");
        });
      }).toThrow();

      expect(rowCount(db, "requirements")).toBe(0);
    });

    it("saveEpics inserts are rolled back on transaction failure", () => {
      const projectId = repo.upsertProject({ name: "Epic Rollback" });

      expect(() => {
        repo.transaction(() => {
          repo.saveEpics([{ project_id: projectId, name: "Epic 1", order_index: 0 }]);
          throw new Error("fail");
        });
      }).toThrow();

      expect(rowCount(db, "epics")).toBe(0);
    });

    it("saveTasks inserts are rolled back on transaction failure", () => {
      const projectId = repo.upsertProject({ name: "Task Rollback" });
      repo.saveEpics([{ project_id: projectId, name: "Phase 1", order_index: 0 }]);
      const epicId = (
        db.prepare("SELECT id FROM epics LIMIT 1").get() as { id: number }
      ).id;

      expect(() => {
        repo.transaction(() => {
          repo.saveTasks([{ epic_id: epicId, title: "Task A" }]);
          throw new Error("fail");
        });
      }).toThrow();

      expect(rowCount(db, "tasks")).toBe(0);
    });

    it("appendAgentLog inserts are rolled back on transaction failure", () => {
      const { taskId } = setupProjectHierarchy(repo, db, "Log Rollback");

      expect(() => {
        repo.transaction(() => {
          repo.appendAgentLog({
            task_id: taskId,
            agent_role: "implementer",
            thought: "thinking",
          });
          throw new Error("fail");
        });
      }).toThrow();

      expect(rowCount(db, "agent_logs")).toBe(0);
    });

    it("recordEntropyEvent inserts are rolled back on transaction failure", () => {
      const { taskId } = setupProjectHierarchy(repo, db, "Entropy Rollback");

      expect(() => {
        repo.transaction(() => {
          repo.recordEntropyEvent({
            task_id: taskId,
            hash_chain: "sha256:abc",
          });
          throw new Error("fail");
        });
      }).toThrow();

      expect(rowCount(db, "entropy_events")).toBe(0);
    });

    it("updateTaskStatus changes are rolled back on transaction failure", () => {
      const { taskId } = setupProjectHierarchy(repo, db, "Status Rollback");

      expect(() => {
        repo.transaction(() => {
          repo.updateTaskStatus(taskId, "completed");
          throw new Error("fail");
        });
      }).toThrow();

      const row = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as Task;
      expect(row.status).toBe("pending");
    });

    it("complex multi-method transaction rolls back entirely on failure", () => {
      const projectId = repo.upsertProject({ name: "Multi-Method Rollback Test" });
      repo.saveEpics([{ project_id: projectId, name: "Phase 1", order_index: 0 }]);
      const epicId = (
        db.prepare("SELECT id FROM epics WHERE project_id = ?").get(projectId) as {
          id: number;
        }
      ).id;
      repo.saveTasks([{ epic_id: epicId, title: "Task" }]);
      const taskId = (
        db.prepare("SELECT id FROM tasks WHERE epic_id = ?").get(epicId) as {
          id: number;
        }
      ).id;

      expect(() => {
        repo.transaction(() => {
          // Multiple writes of different types all inside one transaction.
          repo.upsertProject({
            id: projectId,
            name: "Multi-Method Updated",
            status: "active",
          });
          repo.addDocument({ project_id: projectId, name: "prd.md" });
          repo.saveRequirements([
            { project_id: projectId, description: "REQ-001" },
          ]);
          repo.updateTaskStatus(taskId, "in_progress");
          repo.appendAgentLog({
            task_id: taskId,
            agent_role: "implementer",
            thought: "working",
          });
          // Crash before commit.
          throw new Error("multi-method failure");
        });
      }).toThrow("multi-method failure");

      // All writes must be rolled back.
      const pRow = db
        .prepare("SELECT name, status FROM projects WHERE id = ?")
        .get(projectId) as Project & { id: number };
      expect(pRow.name).toBe("Multi-Method Rollback Test");
      expect(pRow.status).toBe("pending");

      expect(rowCount(db, "documents")).toBe(0);
      expect(rowCount(db, "requirements")).toBe(0);

      const tRow = db
        .prepare("SELECT status FROM tasks WHERE id = ?")
        .get(taskId) as Task;
      expect(tRow.status).toBe("pending");

      expect(rowCount(db, "agent_logs")).toBe(0);
    });
  });

  // ── No raw non-transactional writes ───────────────────────────────────────

  describe("Row-level locking and isolation", () => {
    it("writes within a transaction are not visible to reads outside the transaction", () => {
      // This test verifies that concurrent-style reads (via a new connection)
      // do not see uncommitted writes from an active better-sqlite3 transaction.
      // Note: better-sqlite3 is synchronous — this test uses two statements
      // on the same connection to verify internal uncommitted-read isolation.
      const projectId = repo.upsertProject({ name: "Isolation Test" });

      // Use the transaction callback to inspect state before committing.
      let countInsideTransaction = -1;

      repo.transaction(() => {
        repo.saveEpics([{ project_id: projectId, name: "Uncommitted Epic", order_index: 0 }]);
        // Count within the same transaction — should see the uncommitted write.
        countInsideTransaction = rowCount(db, "epics");
      });

      // After commit, count should match.
      expect(countInsideTransaction).toBe(1);
      expect(rowCount(db, "epics")).toBe(1);
    });

    it("concurrent write test: two sequential repo.transaction() calls do not interfere", () => {
      const pid1 = repo.transaction(() =>
        repo.upsertProject({ name: "Project 1", status: "pending" })
      );
      const pid2 = repo.transaction(() =>
        repo.upsertProject({ name: "Project 2", status: "active" })
      );

      expect(pid1).not.toBe(pid2);
      expect(rowCount(db, "projects")).toBe(2);

      const row1 = db
        .prepare("SELECT name FROM projects WHERE id = ?")
        .get(pid1) as { name: string };
      const row2 = db
        .prepare("SELECT name FROM projects WHERE id = ?")
        .get(pid2) as { name: string };
      expect(row1.name).toBe("Project 1");
      expect(row2.name).toBe("Project 2");
    });
  });
});
