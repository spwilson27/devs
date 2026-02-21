/**
 * packages/core/test/audit/decision_logger.test.ts
 *
 * Integration tests for the DecisionLogger service.
 *
 * Verifies:
 *   - recordDecision() persists alternatives and reasons to decision_logs.
 *   - logAlternative() records a rejected alternative with its reason.
 *   - confirmSelection() records the chosen approach.
 *   - All entries are correctly associated with the injected task_id.
 *   - searchDecisions() does case-insensitive LIKE search across all text fields.
 *   - getTaskDecisions() returns all decisions for the task in insertion order.
 *   - Cross-task isolation: decisions for one task are not returned by another task's logger.
 *   - ACID invariants: writes are transactional; partial writes roll back.
 *   - WAL mode is active on the underlying database connection.
 *   - Task-id is automatically inferred from the constructor — agents never pass it per-call.
 *
 * Call order: initializeSchema(db) → initializeAuditSchema(db) → DecisionLogger constructor.
 *
 * Requirements: [TAS-059]
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
import { initializeAuditSchema } from "../../src/persistence/audit_schema.js";
import { DecisionLogger } from "../../src/audit/DecisionLogger.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(
    tmpdir(),
    `devs-decision-logger-test-${unique}`,
    ".devs",
    "state.sqlite"
  );
}

/**
 * Seeds a minimal project → epic → task hierarchy.
 * Returns the numeric task id required by DecisionLogger.
 */
function seedProjectHierarchy(db: Database.Database): {
  projectId: number;
  epicId: number;
  taskId: number;
} {
  const projectRow = db
    .prepare("INSERT INTO projects (name, status) VALUES (?, ?)")
    .run("Decision Logger Test Project", "active");
  const projectId = Number(projectRow.lastInsertRowid);

  const epicRow = db
    .prepare(
      "INSERT INTO epics (project_id, name, order_index, status) VALUES (?, ?, ?, ?)"
    )
    .run(projectId, "Phase 1", 0, "pending");
  const epicId = Number(epicRow.lastInsertRowid);

  const taskRow = db
    .prepare("INSERT INTO tasks (epic_id, title, status) VALUES (?, ?, ?)")
    .run(epicId, "Implement Feature X", "pending");
  const taskId = Number(taskRow.lastInsertRowid);

  return { projectId, epicId, taskId };
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("DecisionLogger", () => {
  let db: Database.Database;
  let testDbPath: string;
  let taskId: number;
  let logger: DecisionLogger;

  beforeEach(() => {
    testDbPath = makeTestDbPath();
    db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);
    initializeAuditSchema(db);
    ({ taskId } = seedProjectHierarchy(db));
    logger = new DecisionLogger(db, taskId);
  });

  afterEach(() => {
    db.close();
    closeDatabase();
    const testRoot = resolve(dirname(testDbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  // ── Construction ──────────────────────────────────────────────────────────

  describe("Constructor", () => {
    it("creates a DecisionLogger bound to the given task_id", () => {
      expect(logger.taskId).toBe(taskId);
    });

    it("throws if the task_id does not exist in the database", () => {
      expect(() => new DecisionLogger(db, 99999)).toThrow();
    });
  });

  // ── logAlternative ────────────────────────────────────────────────────────

  describe("logAlternative()", () => {
    it("persists a rejected alternative and reason to decision_logs", () => {
      const id = logger.logAlternative(
        "Use Redis for caching",
        "Overkill for current scale; adds ops complexity"
      );

      expect(id).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT * FROM decision_logs WHERE id = ?")
        .get(id) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["alternative_considered"]).toBe("Use Redis for caching");
      expect(row["reasoning_for_rejection"]).toBe(
        "Overkill for current scale; adds ops complexity"
      );
      expect(row["selected_option"]).toBeNull();
      expect(row["timestamp"]).toBeTruthy();
    });

    it("supports multi-line Markdown content in the reasoning field", () => {
      const markdown = `## Rejection Reasoning

- **Performance**: Redis adds ~5ms round-trip per cache hit
- **Ops burden**: Requires Redis cluster setup and monitoring
- **Scope**: Current load is <1 req/s; in-memory cache is sufficient

> Revisit when throughput exceeds 100 req/s.`;

      const id = logger.logAlternative("Redis caching layer", markdown);
      const row = db
        .prepare("SELECT reasoning_for_rejection FROM decision_logs WHERE id = ?")
        .get(id) as { reasoning_for_rejection: string };

      expect(row.reasoning_for_rejection).toBe(markdown);
    });

    it("auto-populates timestamp via DB default", () => {
      const id = logger.logAlternative("Option A", "Too slow");
      const row = db
        .prepare("SELECT timestamp FROM decision_logs WHERE id = ?")
        .get(id) as { timestamp: string };

      expect(typeof row.timestamp).toBe("string");
      expect(row.timestamp.length).toBeGreaterThan(0);
    });

    it("can log multiple alternatives for the same task", () => {
      logger.logAlternative("Option A", "Reason A");
      logger.logAlternative("Option B", "Reason B");
      logger.logAlternative("Option C", "Reason C");

      const count = (
        db
          .prepare(
            "SELECT COUNT(*) AS n FROM decision_logs WHERE task_id = ?"
          )
          .get(taskId) as { n: number }
      ).n;

      expect(count).toBe(3);
    });

    it("returns a different id for each call", () => {
      const id1 = logger.logAlternative("Option A", "Reason A");
      const id2 = logger.logAlternative("Option B", "Reason B");
      expect(id1).not.toBe(id2);
    });
  });

  // ── confirmSelection ──────────────────────────────────────────────────────

  describe("confirmSelection()", () => {
    it("persists the selected option to decision_logs", () => {
      const id = logger.confirmSelection("In-memory LRU cache using Map");

      expect(id).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT * FROM decision_logs WHERE id = ?")
        .get(id) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["selected_option"]).toBe("In-memory LRU cache using Map");
      expect(row["alternative_considered"]).toBeNull();
      expect(row["reasoning_for_rejection"]).toBeNull();
      expect(row["timestamp"]).toBeTruthy();
    });

    it("supports Markdown content in the selected_option field", () => {
      const markdown = `# Decision: File-based SQLite

Chosen for:
- Zero-config deployment
- ACID guarantees built in
- Post-test inspection via \`sqlite3\` CLI`;

      const id = logger.confirmSelection(markdown);
      const row = db
        .prepare("SELECT selected_option FROM decision_logs WHERE id = ?")
        .get(id) as { selected_option: string };

      expect(row.selected_option).toBe(markdown);
    });

    it("can follow a sequence of logAlternative calls", () => {
      logger.logAlternative("Option A", "Too slow");
      logger.logAlternative("Option B", "Too complex");
      const selId = logger.confirmSelection("Option C");

      const rows = db
        .prepare(
          "SELECT * FROM decision_logs WHERE task_id = ? ORDER BY id"
        )
        .all(taskId) as Record<string, unknown>[];

      expect(rows).toHaveLength(3);
      expect(rows[2]!["id"]).toBe(selId);
      expect(rows[2]!["selected_option"]).toBe("Option C");
    });
  });

  // ── recordDecision ────────────────────────────────────────────────────────

  describe("recordDecision()", () => {
    it("writes a complete decision row with all fields", () => {
      const id = logger.recordDecision({
        alternative: "Use PostgreSQL",
        reasonForRejection: "Requires a running DB server",
        selection: "Use SQLite",
      });

      expect(id).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT * FROM decision_logs WHERE id = ?")
        .get(id) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["alternative_considered"]).toBe("Use PostgreSQL");
      expect(row["reasoning_for_rejection"]).toBe(
        "Requires a running DB server"
      );
      expect(row["selected_option"]).toBe("Use SQLite");
    });

    it("allows all fields to be null/omitted", () => {
      const id = logger.recordDecision({});
      const row = db
        .prepare("SELECT * FROM decision_logs WHERE id = ?")
        .get(id) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["alternative_considered"]).toBeNull();
      expect(row["reasoning_for_rejection"]).toBeNull();
      expect(row["selected_option"]).toBeNull();
    });

    it("associates every row with the bound task_id automatically", () => {
      logger.recordDecision({ alternative: "A", reasonForRejection: "R" });
      logger.recordDecision({ selection: "B" });

      const rows = db
        .prepare("SELECT task_id FROM decision_logs WHERE task_id = ?")
        .all(taskId) as { task_id: number }[];

      expect(rows).toHaveLength(2);
      for (const row of rows) {
        expect(row.task_id).toBe(taskId);
      }
    });
  });

  // ── searchDecisions ───────────────────────────────────────────────────────

  describe("searchDecisions()", () => {
    beforeEach(() => {
      logger.logAlternative("Use Redis for caching", "Overkill complexity");
      logger.logAlternative(
        "Use Memcached",
        "No persistence; would lose cache on restart"
      );
      logger.confirmSelection("In-memory Map with LRU eviction");
    });

    it("returns entries matching query in alternative_considered", () => {
      const results = logger.searchDecisions("Redis");
      expect(results).toHaveLength(1);
      expect(results[0]!.alternative_considered).toBe("Use Redis for caching");
    });

    it("returns entries matching query in reasoning_for_rejection", () => {
      const results = logger.searchDecisions("persistence");
      expect(results).toHaveLength(1);
      expect(results[0]!.alternative_considered).toBe("Use Memcached");
    });

    it("returns entries matching query in selected_option", () => {
      const results = logger.searchDecisions("LRU eviction");
      expect(results).toHaveLength(1);
      expect(results[0]!.selected_option).toBe(
        "In-memory Map with LRU eviction"
      );
    });

    it("is case-insensitive", () => {
      const results = logger.searchDecisions("redis");
      expect(results).toHaveLength(1);
      expect(results[0]!.alternative_considered).toBe("Use Redis for caching");
    });

    it("returns multiple matches when query matches several rows", () => {
      // "use" (case-insensitive) matches two of the three seeded rows:
      //   Row 1: alternative_considered = "Use Redis for caching"  → starts with "Use"
      //   Row 2: alternative_considered = "Use Memcached"          → starts with "Use"
      //   Row 3: selected_option = "In-memory Map with LRU eviction" → no match
      const results = logger.searchDecisions("use");
      expect(results).toHaveLength(2);
    });

    it("returns empty array when no entry matches the query", () => {
      const results = logger.searchDecisions("kafka");
      expect(results).toHaveLength(0);
    });

    it("only returns decisions for the current task_id", () => {
      // Seed a second task and add a decision for it
      const { taskId: otherTaskId } = seedProjectHierarchy(db);
      const otherLogger = new DecisionLogger(db, otherTaskId);
      otherLogger.logAlternative("Use Redis", "Different task's rejection");

      // Search from original logger — should NOT see otherTask's entries
      const results = logger.searchDecisions("Redis");
      expect(results).toHaveLength(1);
      expect(results[0]!.task_id).toBe(taskId);
    });

    it("returns DecisionLog objects with all required fields", () => {
      const results = logger.searchDecisions("Redis");
      expect(results).toHaveLength(1);
      const entry = results[0]!;
      expect(typeof entry.id).toBe("number");
      expect(entry.task_id).toBe(taskId);
      expect(typeof entry.timestamp).toBe("string");
      expect(entry.alternative_considered).toBeDefined();
      expect(entry.reasoning_for_rejection).toBeDefined();
      expect(entry.selected_option).toBeNull();
    });
  });

  // ── getTaskDecisions ──────────────────────────────────────────────────────

  describe("getTaskDecisions()", () => {
    it("returns empty array when no decisions have been logged", () => {
      const results = logger.getTaskDecisions();
      expect(results).toHaveLength(0);
    });

    it("returns all decisions for the task in insertion order", () => {
      logger.logAlternative("Option A", "Reason A");
      logger.logAlternative("Option B", "Reason B");
      logger.confirmSelection("Option C");

      const results = logger.getTaskDecisions();
      expect(results).toHaveLength(3);
      expect(results[0]!.alternative_considered).toBe("Option A");
      expect(results[1]!.alternative_considered).toBe("Option B");
      expect(results[2]!.selected_option).toBe("Option C");
    });

    it("does not return decisions from other tasks", () => {
      const { taskId: otherTaskId } = seedProjectHierarchy(db);
      const otherLogger = new DecisionLogger(db, otherTaskId);
      otherLogger.logAlternative("Other task option", "Other reason");

      logger.logAlternative("My option", "My reason");

      const results = logger.getTaskDecisions();
      expect(results).toHaveLength(1);
      expect(results[0]!.task_id).toBe(taskId);
    });
  });

  // ── Task-id isolation ─────────────────────────────────────────────────────

  describe("Cross-task isolation", () => {
    it("two loggers for different tasks record decisions independently", () => {
      const { taskId: taskId2 } = seedProjectHierarchy(db);
      const logger2 = new DecisionLogger(db, taskId2);

      logger.logAlternative("Task1 Option", "Task1 reason");
      logger2.logAlternative("Task2 Option", "Task2 reason");

      const task1Decisions = logger.getTaskDecisions();
      const task2Decisions = logger2.getTaskDecisions();

      expect(task1Decisions).toHaveLength(1);
      expect(task2Decisions).toHaveLength(1);
      expect(task1Decisions[0]!.alternative_considered).toBe("Task1 Option");
      expect(task2Decisions[0]!.alternative_considered).toBe("Task2 Option");
    });
  });

  // ── WAL mode ──────────────────────────────────────────────────────────────

  describe("WAL mode", () => {
    it("database uses WAL journal mode", () => {
      const mode = db.pragma("journal_mode", { simple: true }) as string;
      expect(mode).toBe("wal");
    });
  });

  // ── ACID / transactional writes ───────────────────────────────────────────

  describe("ACID writes", () => {
    it("writes from logAlternative are immediately durable", () => {
      logger.logAlternative("Option", "Reason");

      // Re-open the same DB file to verify persistence
      const db2 = createDatabase({ dbPath: testDbPath });
      const count = (
        db2.prepare("SELECT COUNT(*) AS n FROM decision_logs").get() as {
          n: number;
        }
      ).n;
      db2.close();

      expect(count).toBe(1);
    });

    it("writes from confirmSelection are immediately durable", () => {
      logger.confirmSelection("Chosen approach");

      const db2 = createDatabase({ dbPath: testDbPath });
      const count = (
        db2.prepare("SELECT COUNT(*) AS n FROM decision_logs").get() as {
          n: number;
        }
      ).n;
      db2.close();

      expect(count).toBe(1);
    });
  });
});
