/**
 * packages/core/test/persistence/audit_schemas.test.ts
 *
 * Schema verification tests for the audit trail tables:
 *   - agent_logs  (enhanced Glass-Box schema)
 *   - decision_logs (new table for recording architectural decisions)
 *
 * Verifies:
 *   - agent_logs has the new audit-focused column set.
 *   - decision_logs exists with all required columns.
 *   - Performance indices exist on both tables.
 *   - Data can be inserted into all fields; constraints are respected.
 *   - NOT NULL constraints are enforced on required columns.
 *   - Foreign key constraints correctly reject orphaned rows.
 *   - WAL mode is active on the database connection.
 *   - initializeAuditSchema() is idempotent.
 *
 * Call order: initializeSchema(db) MUST be called before initializeAuditSchema(db)
 * because audit_schema.ts adds indices to the agent_logs table that is created
 * by schema.ts, and creates decision_logs which has an FK to tasks.
 *
 * Requirements: [TAS-046], [TAS-059], [TAS-001], [3_MCP-MCP-002]
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
  initializeAuditSchema,
  AUDIT_TABLES,
} from "../../src/persistence/audit_schema.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(
    tmpdir(),
    `devs-audit-schema-test-${unique}`,
    ".devs",
    "state.sqlite"
  );
}

/** Returns column definitions via PRAGMA table_info. */
function getColumns(
  db: Database.Database,
  table: string
): Array<{ name: string; type: string; notnull: number; pk: number; dflt_value: string | null }> {
  return db.pragma(`table_info(${table})`) as Array<{
    name: string;
    type: string;
    notnull: number;
    pk: number;
    dflt_value: string | null;
  }>;
}

/** Returns column names for a table. */
function getColumnNames(db: Database.Database, table: string): string[] {
  return getColumns(db, table).map((c) => c.name);
}

/** Returns foreign key definitions for a table. */
function getForeignKeys(
  db: Database.Database,
  table: string
): Array<{ from: string; table: string; to: string }> {
  return db.pragma(`foreign_key_list(${table})`) as Array<{
    from: string;
    table: string;
    to: string;
  }>;
}

/** Returns all explicit index names for a table (origin = 'c' means CREATE INDEX). */
function getExplicitIndexNames(db: Database.Database, table: string): string[] {
  const rows = db.pragma(`index_list(${table})`) as Array<{
    name: string;
    unique: number;
    origin: string;
  }>;
  return rows.filter((r) => r.origin === "c").map((r) => r.name);
}

/** Checks whether a table exists in sqlite_master. */
function tableExists(db: Database.Database, name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name);
  return row !== undefined;
}

// ── Seed helpers ──────────────────────────────────────────────────────────────

/**
 * Seeds a minimal project → epic → task hierarchy and returns the task id.
 * Required for FK-dependent inserts into agent_logs and decision_logs.
 */
function seedProjectHierarchy(db: Database.Database): {
  projectId: number;
  epicId: number;
  taskId: number;
} {
  const projectRow = db
    .prepare("INSERT INTO projects (name, status) VALUES (?, ?)")
    .run("Audit Test Project", "active");
  const projectId = Number(projectRow.lastInsertRowid);

  const epicRow = db
    .prepare(
      "INSERT INTO epics (project_id, name, order_index, status) VALUES (?, ?, ?, ?)"
    )
    .run(projectId, "Phase 1", 0, "pending");
  const epicId = Number(epicRow.lastInsertRowid);

  const taskRow = db
    .prepare(
      "INSERT INTO tasks (epic_id, title, status) VALUES (?, ?, ?)"
    )
    .run(epicId, "Audit Task", "pending");
  const taskId = Number(taskRow.lastInsertRowid);

  return { projectId, epicId, taskId };
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("Audit Schema — initializeAuditSchema()", () => {
  let db: Database.Database;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = makeTestDbPath();
    db = createDatabase({ dbPath: testDbPath });
    // Core schema must run first (creates agent_logs, tasks, epics, etc.)
    initializeSchema(db);
    // Audit schema adds decision_logs + indices.
    initializeAuditSchema(db);
  });

  afterEach(() => {
    db.close();
    closeDatabase();
    const testRoot = resolve(dirname(testDbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  // ── AUDIT_TABLES export ───────────────────────────────────────────────────

  describe("AUDIT_TABLES export", () => {
    it("exports AUDIT_TABLES constant containing 'decision_logs'", () => {
      expect(AUDIT_TABLES).toContain("decision_logs");
    });
  });

  // ── WAL mode ─────────────────────────────────────────────────────────────

  describe("WAL mode", () => {
    it("database connection uses WAL journal mode", () => {
      const mode = db.pragma("journal_mode", { simple: true }) as string;
      expect(mode).toBe("wal");
    });
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  describe("Idempotency", () => {
    it("calling initializeAuditSchema() twice does not throw", () => {
      expect(() => initializeAuditSchema(db)).not.toThrow();
    });

    it("decision_logs table still exists after second call", () => {
      initializeAuditSchema(db);
      expect(tableExists(db, "decision_logs")).toBe(true);
    });
  });

  // ── agent_logs table — new schema ─────────────────────────────────────────

  describe("agent_logs table — new Glass-Box schema", () => {
    it("has the new required columns: id, task_id, epic_id, timestamp, role, content_type, content, commit_hash", () => {
      const names = getColumnNames(db, "agent_logs");
      expect(names).toContain("id");
      expect(names).toContain("task_id");
      expect(names).toContain("epic_id");
      expect(names).toContain("timestamp");
      expect(names).toContain("role");
      expect(names).toContain("content_type");
      expect(names).toContain("content");
      expect(names).toContain("commit_hash");
    });

    it("does NOT have the old columns: agent_role, thread_id, thought, action, observation", () => {
      const names = getColumnNames(db, "agent_logs");
      expect(names).not.toContain("agent_role");
      expect(names).not.toContain("thread_id");
      expect(names).not.toContain("thought");
      expect(names).not.toContain("action");
      expect(names).not.toContain("observation");
    });

    it("has id as the primary key", () => {
      const cols = getColumns(db, "agent_logs");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk).toBeDefined();
      expect(pk?.name).toBe("id");
    });

    it("task_id is NOT NULL", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "task_id");
      expect(col?.notnull).toBe(1);
    });

    it("role is NOT NULL", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "role");
      expect(col?.notnull).toBe(1);
    });

    it("content_type is NOT NULL", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "content_type");
      expect(col?.notnull).toBe(1);
    });

    it("content is NOT NULL", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "content");
      expect(col?.notnull).toBe(1);
    });

    it("epic_id is nullable (optional FK)", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "epic_id");
      expect(col?.notnull).toBe(0);
    });

    it("commit_hash is nullable", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "commit_hash");
      expect(col?.notnull).toBe(0);
    });

    it("timestamp has a DEFAULT value", () => {
      const cols = getColumns(db, "agent_logs");
      const col = cols.find((c) => c.name === "timestamp");
      expect(col?.dflt_value).not.toBeNull();
      expect(col?.dflt_value).not.toBe("");
    });

    it("has a foreign key from task_id → tasks(id)", () => {
      const fks = getForeignKeys(db, "agent_logs");
      const fk = fks.find((f) => f.from === "task_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("tasks");
      expect(fk?.to).toBe("id");
    });

    it("has a foreign key from epic_id → epics(id)", () => {
      const fks = getForeignKeys(db, "agent_logs");
      const fk = fks.find((f) => f.from === "epic_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("epics");
      expect(fk?.to).toBe("id");
    });
  });

  // ── decision_logs table ───────────────────────────────────────────────────

  describe("decision_logs table", () => {
    it("exists after initializeAuditSchema()", () => {
      expect(tableExists(db, "decision_logs")).toBe(true);
    });

    it("does NOT exist after initializeSchema() alone (is audit-specific)", () => {
      // Create a fresh DB with only core schema.
      const freshPath = testDbPath + "-fresh";
      const freshDb = createDatabase({ dbPath: freshPath });
      try {
        initializeSchema(freshDb);
        expect(tableExists(freshDb, "decision_logs")).toBe(false);
      } finally {
        freshDb.close();
        rmSync(resolve(dirname(freshPath), ".."), { recursive: true, force: true });
      }
    });

    it("has id as the primary key", () => {
      const cols = getColumns(db, "decision_logs");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk).toBeDefined();
      expect(pk?.name).toBe("id");
    });

    it("has required columns: id, task_id, timestamp, alternative_considered, reasoning_for_rejection, selected_option", () => {
      const names = getColumnNames(db, "decision_logs");
      expect(names).toContain("id");
      expect(names).toContain("task_id");
      expect(names).toContain("timestamp");
      expect(names).toContain("alternative_considered");
      expect(names).toContain("reasoning_for_rejection");
      expect(names).toContain("selected_option");
    });

    it("task_id is NOT NULL", () => {
      const cols = getColumns(db, "decision_logs");
      const col = cols.find((c) => c.name === "task_id");
      expect(col?.notnull).toBe(1);
    });

    it("alternative_considered is nullable", () => {
      const cols = getColumns(db, "decision_logs");
      const col = cols.find((c) => c.name === "alternative_considered");
      expect(col?.notnull).toBe(0);
    });

    it("reasoning_for_rejection is nullable", () => {
      const cols = getColumns(db, "decision_logs");
      const col = cols.find((c) => c.name === "reasoning_for_rejection");
      expect(col?.notnull).toBe(0);
    });

    it("selected_option is nullable", () => {
      const cols = getColumns(db, "decision_logs");
      const col = cols.find((c) => c.name === "selected_option");
      expect(col?.notnull).toBe(0);
    });

    it("timestamp has a DEFAULT value", () => {
      const cols = getColumns(db, "decision_logs");
      const col = cols.find((c) => c.name === "timestamp");
      expect(col?.dflt_value).not.toBeNull();
      expect(col?.dflt_value).not.toBe("");
    });

    it("has a foreign key from task_id → tasks(id)", () => {
      const fks = getForeignKeys(db, "decision_logs");
      const fk = fks.find((f) => f.from === "task_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("tasks");
      expect(fk?.to).toBe("id");
    });
  });

  // ── Performance indices ───────────────────────────────────────────────────

  describe("Performance indices on agent_logs", () => {
    it("has idx_agent_logs_task_id index", () => {
      const indices = getExplicitIndexNames(db, "agent_logs");
      expect(indices).toContain("idx_agent_logs_task_id");
    });

    it("has idx_agent_logs_epic_id index", () => {
      const indices = getExplicitIndexNames(db, "agent_logs");
      expect(indices).toContain("idx_agent_logs_epic_id");
    });

    it("has idx_agent_logs_timestamp index", () => {
      const indices = getExplicitIndexNames(db, "agent_logs");
      expect(indices).toContain("idx_agent_logs_timestamp");
    });
  });

  describe("Performance indices on decision_logs", () => {
    it("has idx_decision_logs_task_id index", () => {
      const indices = getExplicitIndexNames(db, "decision_logs");
      expect(indices).toContain("idx_decision_logs_task_id");
    });

    it("has idx_decision_logs_timestamp index", () => {
      const indices = getExplicitIndexNames(db, "decision_logs");
      expect(indices).toContain("idx_decision_logs_timestamp");
    });
  });

  // ── Data insertion — agent_logs ───────────────────────────────────────────

  describe("agent_logs — data insertion", () => {
    let taskId: number;
    let epicId: number;

    beforeEach(() => {
      ({ taskId, epicId } = seedProjectHierarchy(db));
    });

    it("inserts a full agent_logs row with all fields", () => {
      const payload = JSON.stringify({ thought: "analyzing requirements", files: ["prd.md"] });
      const result = db
        .prepare(
          `INSERT INTO agent_logs
             (task_id, epic_id, role, content_type, content, commit_hash)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(taskId, epicId, "researcher", "THOUGHT", payload, "abc123def456");

      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT * FROM agent_logs WHERE id = ?")
        .get(Number(result.lastInsertRowid)) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["epic_id"]).toBe(epicId);
      expect(row["role"]).toBe("researcher");
      expect(row["content_type"]).toBe("THOUGHT");
      expect(row["content"]).toBe(payload);
      expect(row["commit_hash"]).toBe("abc123def456");
      expect(row["timestamp"]).toBeTruthy();
    });

    it("inserts a minimal agent_logs row (no epic_id, no commit_hash)", () => {
      const result = db
        .prepare(
          `INSERT INTO agent_logs (task_id, role, content_type, content)
           VALUES (?, ?, ?, ?)`
        )
        .run(taskId, "developer", "ACTION", JSON.stringify({ tool: "write_file", path: "src/index.ts" }));

      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT epic_id, commit_hash FROM agent_logs WHERE id = ?")
        .get(Number(result.lastInsertRowid)) as Record<string, unknown>;

      expect(row["epic_id"]).toBeNull();
      expect(row["commit_hash"]).toBeNull();
    });

    it("auto-populates timestamp when not specified", () => {
      db.prepare(
        `INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, ?, ?, ?)`
      ).run(taskId, "reviewer", "OBSERVATION", "{}");

      const row = db
        .prepare("SELECT timestamp FROM agent_logs ORDER BY id DESC LIMIT 1")
        .get() as { timestamp: string };

      expect(row.timestamp).toBeTruthy();
      expect(typeof row.timestamp).toBe("string");
    });

    it("supports THOUGHT, ACTION, OBSERVATION content types", () => {
      for (const contentType of ["THOUGHT", "ACTION", "OBSERVATION"]) {
        db.prepare(
          `INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, ?, ?, ?)`
        ).run(taskId, "developer", contentType, `{"type":"${contentType}"}`);
      }

      const count = (
        db.prepare("SELECT COUNT(*) AS n FROM agent_logs").get() as { n: number }
      ).n;
      expect(count).toBe(3);
    });

    it("rejects INSERT with NULL role (NOT NULL constraint)", () => {
      expect(() => {
        db.prepare(
          "INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, NULL, ?, ?)"
        ).run(taskId, "THOUGHT", "{}");
      }).toThrow();
    });

    it("rejects INSERT with NULL content_type (NOT NULL constraint)", () => {
      expect(() => {
        db.prepare(
          "INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, ?, NULL, ?)"
        ).run(taskId, "developer", "{}");
      }).toThrow();
    });

    it("rejects INSERT with NULL content (NOT NULL constraint)", () => {
      expect(() => {
        db.prepare(
          "INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, ?, ?, NULL)"
        ).run(taskId, "developer", "THOUGHT");
      }).toThrow();
    });

    it("rejects INSERT with a non-existent task_id (FK constraint)", () => {
      expect(() => {
        db.prepare(
          "INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, ?, ?, ?)"
        ).run(99999, "developer", "THOUGHT", "{}");
      }).toThrow();
    });

    it("rejects INSERT with a non-existent epic_id (FK constraint)", () => {
      expect(() => {
        db.prepare(
          "INSERT INTO agent_logs (task_id, epic_id, role, content_type, content) VALUES (?, ?, ?, ?, ?)"
        ).run(taskId, 99999, "developer", "THOUGHT", "{}");
      }).toThrow();
    });
  });

  // ── Data insertion — decision_logs ────────────────────────────────────────

  describe("decision_logs — data insertion", () => {
    let taskId: number;

    beforeEach(() => {
      ({ taskId } = seedProjectHierarchy(db));
    });

    it("inserts a full decision_logs row with all fields", () => {
      const result = db
        .prepare(
          `INSERT INTO decision_logs
             (task_id, alternative_considered, reasoning_for_rejection, selected_option)
           VALUES (?, ?, ?, ?)`
        )
        .run(
          taskId,
          "Use in-memory SQLite for tests",
          "In-memory loses data on crash; file-based enables post-test inspection",
          "File-based SQLite in temp directory"
        );

      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT * FROM decision_logs WHERE id = ?")
        .get(Number(result.lastInsertRowid)) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["alternative_considered"]).toBe("Use in-memory SQLite for tests");
      expect(row["reasoning_for_rejection"]).toContain("In-memory loses data");
      expect(row["selected_option"]).toBe("File-based SQLite in temp directory");
      expect(row["timestamp"]).toBeTruthy();
    });

    it("inserts a minimal decision_logs row (only task_id required)", () => {
      const result = db
        .prepare("INSERT INTO decision_logs (task_id) VALUES (?)")
        .run(taskId);

      expect(Number(result.lastInsertRowid)).toBeGreaterThan(0);

      const row = db
        .prepare("SELECT * FROM decision_logs WHERE id = ?")
        .get(Number(result.lastInsertRowid)) as Record<string, unknown>;

      expect(row["task_id"]).toBe(taskId);
      expect(row["alternative_considered"]).toBeNull();
      expect(row["reasoning_for_rejection"]).toBeNull();
      expect(row["selected_option"]).toBeNull();
      expect(row["timestamp"]).toBeTruthy();
    });

    it("auto-populates timestamp when not specified", () => {
      db.prepare("INSERT INTO decision_logs (task_id) VALUES (?)").run(taskId);

      const row = db
        .prepare("SELECT timestamp FROM decision_logs ORDER BY id DESC LIMIT 1")
        .get() as { timestamp: string };

      expect(typeof row.timestamp).toBe("string");
      expect(row.timestamp.length).toBeGreaterThan(0);
    });

    it("rejects INSERT without task_id (NOT NULL constraint)", () => {
      expect(() => {
        db.prepare(
          "INSERT INTO decision_logs (alternative_considered) VALUES (?)"
        ).run("some alternative");
      }).toThrow();
    });

    it("rejects INSERT with a non-existent task_id (FK constraint)", () => {
      expect(() => {
        db.prepare("INSERT INTO decision_logs (task_id) VALUES (?)").run(99999);
      }).toThrow();
    });

    it("can record multiple decisions for the same task", () => {
      db.prepare(
        "INSERT INTO decision_logs (task_id, selected_option) VALUES (?, ?)"
      ).run(taskId, "Option A");
      db.prepare(
        "INSERT INTO decision_logs (task_id, selected_option) VALUES (?, ?)"
      ).run(taskId, "Option B");

      const count = (
        db
          .prepare("SELECT COUNT(*) AS n FROM decision_logs WHERE task_id = ?")
          .get(taskId) as { n: number }
      ).n;
      expect(count).toBe(2);
    });
  });

  // ── Cascade delete ────────────────────────────────────────────────────────

  describe("Cascade delete", () => {
    it("deleting a task removes its agent_logs via ON DELETE CASCADE", () => {
      const { taskId } = seedProjectHierarchy(db);

      db.prepare(
        "INSERT INTO agent_logs (task_id, role, content_type, content) VALUES (?, ?, ?, ?)"
      ).run(taskId, "developer", "THOUGHT", "{}");

      expect(
        (db.prepare("SELECT COUNT(*) AS n FROM agent_logs").get() as { n: number }).n
      ).toBe(1);

      db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);

      expect(
        (db.prepare("SELECT COUNT(*) AS n FROM agent_logs").get() as { n: number }).n
      ).toBe(0);
    });

    it("deleting a task removes its decision_logs via ON DELETE CASCADE", () => {
      const { taskId } = seedProjectHierarchy(db);

      db.prepare(
        "INSERT INTO decision_logs (task_id, selected_option) VALUES (?, ?)"
      ).run(taskId, "chosen");

      expect(
        (db.prepare("SELECT COUNT(*) AS n FROM decision_logs").get() as { n: number }).n
      ).toBe(1);

      db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);

      expect(
        (db.prepare("SELECT COUNT(*) AS n FROM decision_logs").get() as { n: number }).n
      ).toBe(0);
    });
  });
});
