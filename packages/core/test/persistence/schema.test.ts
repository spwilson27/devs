/**
 * packages/core/test/persistence/schema.test.ts
 *
 * Schema verification tests for the 7 core Flight Recorder tables.
 * Verifies:
 *   - All 7 tables exist in sqlite_master after initializeSchema().
 *   - Mandatory columns and types are present in each table.
 *   - Primary keys are correctly defined.
 *   - Foreign key constraints reference the correct parent tables.
 *   - The foreign_keys pragma is enabled on the connection.
 *   - ACID transaction rollback works across multiple tables.
 *
 * Requirements: TAS-105, TAS-106, TAS-107, TAS-108, TAS-109, TAS-110, TAS-111,
 *               9_ROADMAP-TAS-102, 9_ROADMAP-REQ-017
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
import {
  initializeSchema,
  CORE_TABLES,
} from "../../src/persistence/schema.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-schema-test-${unique}`, ".devs", "state.sqlite");
}

/** Returns column names for a given table via PRAGMA table_info. */
function getColumnNames(db: Database.Database, table: string): string[] {
  const rows = db.pragma(`table_info(${table})`) as Array<{ name: string }>;
  return rows.map((r) => r.name);
}

/** Returns column definitions (name + type) via PRAGMA table_info. */
function getColumns(
  db: Database.Database,
  table: string
): Array<{ name: string; type: string; notnull: number; pk: number }> {
  return db.pragma(`table_info(${table})`) as Array<{
    name: string;
    type: string;
    notnull: number;
    pk: number;
  }>;
}

/** Returns foreign key definitions via PRAGMA foreign_key_list. */
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

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("Core Tables Schema – initializeSchema()", () => {
  let db: Database.Database;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = makeTestDbPath();
    db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);
  });

  afterEach(() => {
    db.close();
    closeDatabase();
    const testRoot = resolve(dirname(testDbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  // ── CORE_TABLES export ────────────────────────────────────────────────────

  it("exports CORE_TABLES constant with all 7 table names", () => {
    expect(CORE_TABLES).toHaveLength(7);
    expect(CORE_TABLES).toContain("projects");
    expect(CORE_TABLES).toContain("documents");
    expect(CORE_TABLES).toContain("requirements");
    expect(CORE_TABLES).toContain("epics");
    expect(CORE_TABLES).toContain("tasks");
    expect(CORE_TABLES).toContain("agent_logs");
    expect(CORE_TABLES).toContain("entropy_events");
  });

  // ── Table existence ───────────────────────────────────────────────────────

  describe("Table existence (sqlite_master)", () => {
    it.each(CORE_TABLES)("creates table: %s", (tableName) => {
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(tableName) as { name: string } | undefined;
      expect(row).toBeDefined();
      expect(row?.name).toBe(tableName);
    });
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("is idempotent – calling initializeSchema() twice does not throw", () => {
    expect(() => initializeSchema(db)).not.toThrow();

    // All tables still exist after second call.
    for (const table of CORE_TABLES) {
      const row = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table);
      expect(row).toBeDefined();
    }
  });

  // ── projects columns ──────────────────────────────────────────────────────

  describe("projects table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "projects");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk).toBeDefined();
      expect(pk?.name).toBe("id");
    });

    it("has mandatory columns: id, name, status, current_phase, metadata", () => {
      const names = getColumnNames(db, "projects");
      expect(names).toContain("id");
      expect(names).toContain("name");
      expect(names).toContain("status");
      expect(names).toContain("current_phase");
      expect(names).toContain("metadata");
    });

    it("name column is NOT NULL", () => {
      const cols = getColumns(db, "projects");
      const nameCol = cols.find((c) => c.name === "name");
      expect(nameCol?.notnull).toBe(1);
    });
  });

  // ── documents columns ─────────────────────────────────────────────────────

  describe("documents table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "documents");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk?.name).toBe("id");
    });

    it("has mandatory columns: id, project_id, name, content, version, status", () => {
      const names = getColumnNames(db, "documents");
      expect(names).toContain("id");
      expect(names).toContain("project_id");
      expect(names).toContain("name");
      expect(names).toContain("content");
      expect(names).toContain("version");
      expect(names).toContain("status");
    });

    it("has a foreign key from project_id → projects(id)", () => {
      const fks = getForeignKeys(db, "documents");
      const fk = fks.find((f) => f.from === "project_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("projects");
      expect(fk?.to).toBe("id");
    });
  });

  // ── requirements columns ──────────────────────────────────────────────────

  describe("requirements table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "requirements");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk?.name).toBe("id");
    });

    it("has mandatory columns: id, project_id, description, priority, status, metadata", () => {
      const names = getColumnNames(db, "requirements");
      expect(names).toContain("id");
      expect(names).toContain("project_id");
      expect(names).toContain("description");
      expect(names).toContain("priority");
      expect(names).toContain("status");
      expect(names).toContain("metadata");
    });

    it("has a foreign key from project_id → projects(id)", () => {
      const fks = getForeignKeys(db, "requirements");
      const fk = fks.find((f) => f.from === "project_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("projects");
    });
  });

  // ── epics columns ─────────────────────────────────────────────────────────

  describe("epics table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "epics");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk?.name).toBe("id");
    });

    it("has mandatory columns: id, project_id, name, order_index, status", () => {
      const names = getColumnNames(db, "epics");
      expect(names).toContain("id");
      expect(names).toContain("project_id");
      expect(names).toContain("name");
      expect(names).toContain("order_index");
      expect(names).toContain("status");
    });

    it("has a foreign key from project_id → projects(id)", () => {
      const fks = getForeignKeys(db, "epics");
      const fk = fks.find((f) => f.from === "project_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("projects");
    });
  });

  // ── tasks columns ─────────────────────────────────────────────────────────
  // [TAS-109]: tasks must have git_commit_hash for correlation.

  describe("tasks table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "tasks");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk?.name).toBe("id");
    });

    it("has mandatory columns: id, epic_id, title, description, status, git_commit_hash", () => {
      const names = getColumnNames(db, "tasks");
      expect(names).toContain("id");
      expect(names).toContain("epic_id");
      expect(names).toContain("title");
      expect(names).toContain("description");
      expect(names).toContain("status");
      // [TAS-109] — required for git commit correlation
      expect(names).toContain("git_commit_hash");
    });

    it("has a foreign key from epic_id → epics(id)", () => {
      const fks = getForeignKeys(db, "tasks");
      const fk = fks.find((f) => f.from === "epic_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("epics");
    });
  });

  // ── agent_logs columns ────────────────────────────────────────────────────
  // [TAS-110, TAS-046]: Glass-Box audit log with structured content JSON blob.
  // Schema updated in Phase 7 to support full Glass-Box observability:
  // role, content_type, content (JSON blob), epic_id, commit_hash.

  describe("agent_logs table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "agent_logs");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk?.name).toBe("id");
    });

    it("has the new Glass-Box columns: id, task_id, epic_id, timestamp, role, content_type, content, commit_hash", () => {
      const names = getColumnNames(db, "agent_logs");
      expect(names).toContain("id");
      expect(names).toContain("task_id");
      // epic_id provides a direct FK for efficient epic-scoped audit queries
      expect(names).toContain("epic_id");
      expect(names).toContain("timestamp");
      expect(names).toContain("role");
      expect(names).toContain("content_type");
      expect(names).toContain("content");
      expect(names).toContain("commit_hash");
    });

    it("has a foreign key from task_id → tasks(id)", () => {
      const fks = getForeignKeys(db, "agent_logs");
      const fk = fks.find((f) => f.from === "task_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("tasks");
    });

    it("has a foreign key from epic_id → epics(id)", () => {
      const fks = getForeignKeys(db, "agent_logs");
      const fk = fks.find((f) => f.from === "epic_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("epics");
    });
  });

  // ── entropy_events columns ────────────────────────────────────────────────
  // [TAS-111]: tracking repeating failures for loop prevention.

  describe("entropy_events table", () => {
    it("has id as primary key", () => {
      const cols = getColumns(db, "entropy_events");
      const pk = cols.find((c) => c.pk === 1);
      expect(pk?.name).toBe("id");
    });

    it("has mandatory columns: id, task_id, hash_chain, error_output, timestamp", () => {
      const names = getColumnNames(db, "entropy_events");
      expect(names).toContain("id");
      expect(names).toContain("task_id");
      expect(names).toContain("hash_chain");
      expect(names).toContain("error_output");
      expect(names).toContain("timestamp");
    });

    it("has a foreign key from task_id → tasks(id)", () => {
      const fks = getForeignKeys(db, "entropy_events");
      const fk = fks.find((f) => f.from === "task_id");
      expect(fk).toBeDefined();
      expect(fk?.table).toBe("tasks");
    });
  });

  // ── Foreign key enforcement ───────────────────────────────────────────────

  describe("Foreign key constraint enforcement", () => {
    it("foreign_keys pragma is ON (value 1) on the connection", () => {
      const fkEnabled = db.pragma("foreign_keys", { simple: true }) as number;
      expect(fkEnabled).toBe(1);
    });

    it("rejects an INSERT that violates a foreign key constraint", () => {
      // Insert into documents with a non-existent project_id should throw.
      expect(() => {
        db
          .prepare(
            "INSERT INTO documents (project_id, name, status) VALUES (999, 'orphan.md', 'draft')"
          )
          .run();
      }).toThrow();
    });
  });

  // ── ACID transactions ─────────────────────────────────────────────────────
  // [9_ROADMAP-REQ-017, TAS-104]: multi-table writes must roll back atomically on failure.

  describe("ACID transaction rollback", () => {
    it("rolls back all changes when a transaction throws mid-way", () => {
      const insertProject = db.prepare(
        "INSERT INTO projects (name, status) VALUES (?, ?)"
      );
      const insertEpic = db.prepare(
        "INSERT INTO epics (project_id, name, order_index, status) VALUES (?, ?, ?, ?)"
      );

      // This transaction inserts a project then throws before committing.
      const txn = db.transaction(() => {
        insertProject.run("test-project", "active");
        insertEpic.run(1, "test-epic", 0, "pending");
        throw new Error("simulated mid-transaction failure");
      });

      expect(() => txn()).toThrow("simulated mid-transaction failure");

      // Neither the project nor the epic should exist.
      const projCount = (
        db.prepare("SELECT COUNT(*) AS n FROM projects").get() as { n: number }
      ).n;
      const epicCount = (
        db.prepare("SELECT COUNT(*) AS n FROM epics").get() as { n: number }
      ).n;
      expect(projCount).toBe(0);
      expect(epicCount).toBe(0);
    });

    it("commits all changes when the transaction succeeds", () => {
      const insertProject = db.prepare(
        "INSERT INTO projects (name, status) VALUES (?, ?)"
      );
      const insertEpic = db.prepare(
        "INSERT INTO epics (project_id, name, order_index, status) VALUES (?, ?, ?, ?)"
      );

      db.transaction(() => {
        const info = insertProject.run("committed-project", "active");
        insertEpic.run(info.lastInsertRowid, "committed-epic", 0, "pending");
      })();

      const projCount = (
        db.prepare("SELECT COUNT(*) AS n FROM projects").get() as { n: number }
      ).n;
      const epicCount = (
        db.prepare("SELECT COUNT(*) AS n FROM epics").get() as { n: number }
      ).n;
      expect(projCount).toBe(1);
      expect(epicCount).toBe(1);
    });
  });
});
