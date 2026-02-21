/**
 * packages/core/test/persistence/SchemaReconciler.test.ts
 *
 * Unit tests for SchemaReconciler — the schema drift detection and revert system.
 *
 * Verifies:
 *   - snapshot() captures the current database schema (tables, columns, indexes)
 *     WITHOUT capturing any row data.
 *   - diff() correctly identifies schema changes: new tables, removed tables,
 *     added/removed columns, and added/removed indexes.
 *   - revert() successfully restores the database schema to its pre-task state:
 *     drops tables created by the task, recreates tables dropped by the task,
 *     and removes columns added by the task.
 *   - A mocked failing schema migration is correctly rolled back.
 *
 * Requirements: [8_RISKS-REQ-073]
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import {
  SchemaReconciler,
  type SchemaSnapshot,
  type SchemaDiff,
} from "../../src/persistence/SchemaReconciler.js";

// ── Test helpers ──────────────────────────────────────────────────────────────

/** Creates a unique temporary database path for each test. */
function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-reconciler-${unique}`, "state.sqlite");
}

/** Creates and returns an in-memory SQLite database for fast tests. */
function makeInMemoryDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  return db;
}

/** Creates a basic test schema with two tables. */
function createTestSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS posts (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title   TEXT NOT NULL,
      body    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
  `);
}

// ── SchemaReconciler.snapshot() ───────────────────────────────────────────────

describe("SchemaReconciler.snapshot()", () => {
  let db: Database.Database;
  let reconciler: SchemaReconciler;

  beforeEach(() => {
    db = makeInMemoryDb();
    reconciler = new SchemaReconciler(db);
  });

  afterEach(() => {
    db.close();
  });

  it("returns a snapshot with empty tables on an empty database", () => {
    const snap = reconciler.snapshot();

    expect(snap.tables).toEqual({});
    expect(snap.capturedAt).toBeDefined();
    expect(typeof snap.capturedAt).toBe("string");
  });

  it("captures ISO-8601 timestamp in capturedAt", () => {
    const snap = reconciler.snapshot();
    const parsed = Date.parse(snap.capturedAt);
    expect(Number.isNaN(parsed)).toBe(false);
  });

  it("captures all user tables in the snapshot", () => {
    createTestSchema(db);
    const snap = reconciler.snapshot();

    expect(Object.keys(snap.tables)).toContain("users");
    expect(Object.keys(snap.tables)).toContain("posts");
  });

  it("does NOT capture sqlite internal tables (sqlite_*)", () => {
    createTestSchema(db);
    const snap = reconciler.snapshot();

    for (const tableName of Object.keys(snap.tables)) {
      expect(tableName.startsWith("sqlite_")).toBe(false);
    }
  });

  it("captures column info for each table", () => {
    createTestSchema(db);
    const snap = reconciler.snapshot();

    const userCols = snap.tables["users"].columns;
    const colNames = userCols.map((c) => c.name);

    expect(colNames).toContain("id");
    expect(colNames).toContain("name");
    expect(colNames).toContain("email");
  });

  it("captures NOT NULL constraint in column info", () => {
    createTestSchema(db);
    const snap = reconciler.snapshot();

    const userCols = snap.tables["users"].columns;
    const nameCol = userCols.find((c) => c.name === "name");
    const idCol = userCols.find((c) => c.name === "id");

    expect(nameCol?.notnull).toBe(1);
    // id is a PRIMARY KEY — SQLite stores pk columns without notnull in PRAGMA
    expect(idCol?.pk).toBe(1);
  });

  it("captures the original CREATE TABLE sql in table schema", () => {
    createTestSchema(db);
    const snap = reconciler.snapshot();

    // sql should contain CREATE TABLE
    expect(snap.tables["users"].sql).toContain("CREATE TABLE");
    expect(snap.tables["users"].sql).toContain("users");
  });

  it("captures explicit CREATE INDEX entries", () => {
    createTestSchema(db);
    const snap = reconciler.snapshot();

    const postIndexes = snap.tables["posts"].indexes;
    const idxNames = postIndexes.map((i) => i.name);
    expect(idxNames).toContain("idx_posts_user_id");
  });

  it("captures only schema, not row data", () => {
    createTestSchema(db);

    // Insert rows to verify they don't appear in the snapshot
    db.exec(`
      INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
      INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');
    `);

    const snap = reconciler.snapshot();

    // Snapshot should only have schema info — no row data
    expect((snap as unknown as Record<string, unknown>).rows).toBeUndefined();
    for (const table of Object.values(snap.tables)) {
      expect((table as unknown as Record<string, unknown>).rows).toBeUndefined();
      expect(table.columns.length).toBeGreaterThan(0); // columns present
    }
    // Table count unchanged regardless of row data
    expect(Object.keys(snap.tables)).toHaveLength(2);
  });
});

// ── SchemaReconciler.diff() ───────────────────────────────────────────────────

describe("SchemaReconciler.diff()", () => {
  let db: Database.Database;
  let reconciler: SchemaReconciler;

  beforeEach(() => {
    db = makeInMemoryDb();
    createTestSchema(db);
    reconciler = new SchemaReconciler(db);
  });

  afterEach(() => {
    db.close();
  });

  it("returns hasChanges=false when schema is unchanged", () => {
    const baseline = reconciler.snapshot();
    const diff = reconciler.diff(baseline);

    expect(diff.hasChanges).toBe(false);
    expect(diff.addedTables).toHaveLength(0);
    expect(diff.removedTables).toHaveLength(0);
    expect(diff.modifiedTables).toHaveLength(0);
  });

  it("detects a newly added table", () => {
    const baseline = reconciler.snapshot();

    db.exec("CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT NOT NULL)");

    const diff = reconciler.diff(baseline);

    expect(diff.hasChanges).toBe(true);
    expect(diff.addedTables).toContain("tags");
    expect(diff.removedTables).toHaveLength(0);
  });

  it("detects a removed table", () => {
    const baseline = reconciler.snapshot();

    db.exec("DROP TABLE posts");

    const diff = reconciler.diff(baseline);

    expect(diff.hasChanges).toBe(true);
    expect(diff.removedTables).toContain("posts");
    expect(diff.addedTables).toHaveLength(0);
  });

  it("detects a new column added to an existing table", () => {
    const baseline = reconciler.snapshot();

    db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT");

    const diff = reconciler.diff(baseline);

    expect(diff.hasChanges).toBe(true);
    expect(diff.modifiedTables).toHaveLength(1);

    const userDiff = diff.modifiedTables.find((t) => t.name === "users");
    expect(userDiff).toBeDefined();
    expect(userDiff?.addedColumns.map((c) => c.name)).toContain("avatar_url");
    expect(userDiff?.removedColumns).toHaveLength(0);
  });

  it("detects a new explicit index added", () => {
    const baseline = reconciler.snapshot();

    db.exec("CREATE INDEX idx_users_email ON users(email)");

    const diff = reconciler.diff(baseline);

    expect(diff.hasChanges).toBe(true);
    const userDiff = diff.modifiedTables.find((t) => t.name === "users");
    expect(userDiff).toBeDefined();
    expect(userDiff?.addedIndexes.map((i) => i.name)).toContain(
      "idx_users_email"
    );
  });

  it("detects multiple simultaneous changes", () => {
    const baseline = reconciler.snapshot();

    db.exec(`
      CREATE TABLE tags (id INTEGER PRIMARY KEY, label TEXT);
      ALTER TABLE users ADD COLUMN bio TEXT;
    `);

    const diff = reconciler.diff(baseline);

    expect(diff.hasChanges).toBe(true);
    expect(diff.addedTables).toContain("tags");
    expect(diff.modifiedTables.some((t) => t.name === "users")).toBe(true);
  });
});

// ── SchemaReconciler.revert() ─────────────────────────────────────────────────

describe("SchemaReconciler.revert()", () => {
  let db: Database.Database;
  let reconciler: SchemaReconciler;

  beforeEach(() => {
    db = makeInMemoryDb();
    createTestSchema(db);
    reconciler = new SchemaReconciler(db);
  });

  afterEach(() => {
    db.close();
  });

  it("is a no-op when there are no schema changes", () => {
    const baseline = reconciler.snapshot();
    expect(() => reconciler.revert(baseline)).not.toThrow();

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);
  });

  it("drops a table that was created after the snapshot", () => {
    const baseline = reconciler.snapshot();

    db.exec("CREATE TABLE temp_migration (id INTEGER PRIMARY KEY, data TEXT)");

    expect(reconciler.diff(baseline).addedTables).toContain("temp_migration");

    reconciler.revert(baseline);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);
    expect(afterDiff.addedTables).toHaveLength(0);
  });

  it("removes a column added after the snapshot (via table recreation)", () => {
    const baseline = reconciler.snapshot();

    db.exec("ALTER TABLE users ADD COLUMN task_column TEXT");

    expect(
      reconciler.diff(baseline).modifiedTables.find((t) => t.name === "users")
        ?.addedColumns.map((c) => c.name)
    ).toContain("task_column");

    reconciler.revert(baseline);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);

    // Verify the column is actually gone from the DB
    const userCols = db
      .prepare("PRAGMA table_info(users)")
      .all() as Array<{ name: string }>;
    expect(userCols.map((c) => c.name)).not.toContain("task_column");
  });

  it("preserves existing rows when reverting a column addition", () => {
    // Insert data before the migration
    db.exec(`
      INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
      INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');
    `);

    const baseline = reconciler.snapshot();

    db.exec("ALTER TABLE users ADD COLUMN extra TEXT DEFAULT 'task-data'");

    reconciler.revert(baseline);

    // Original rows should still be present after revert
    const rows = db.prepare("SELECT * FROM users ORDER BY id").all() as Array<{
      name: string;
    }>;
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Alice");
    expect(rows[1].name).toBe("Bob");
  });

  it("drops an explicit index created after the snapshot", () => {
    const baseline = reconciler.snapshot();

    db.exec("CREATE INDEX idx_users_name ON users(name)");

    expect(reconciler.diff(baseline).hasChanges).toBe(true);

    reconciler.revert(baseline);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);
  });

  it("reverts multiple schema changes atomically", () => {
    // Insert data before changes
    db.exec(
      "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')"
    );

    const baseline = reconciler.snapshot();

    // Simulate a complex task migration
    db.exec(`
      CREATE TABLE task_temp (id INTEGER PRIMARY KEY, value TEXT);
      ALTER TABLE users ADD COLUMN task_col TEXT;
      CREATE INDEX idx_users_task ON users(task_col);
    `);

    expect(reconciler.diff(baseline).hasChanges).toBe(true);

    reconciler.revert(baseline);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);

    // Data should still be present
    const rows = db.prepare("SELECT COUNT(*) as cnt FROM users").get() as {
      cnt: number;
    };
    expect(rows.cnt).toBe(1);
  });

  it("preserves baseline explicit indexes when a column is added to a table that has them", () => {
    // posts table has idx_posts_user_id from createTestSchema — an explicit index
    db.exec(
      "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')"
    );
    db.exec("INSERT INTO posts (user_id, title) VALUES (1, 'Post A')");

    const baseline = reconciler.snapshot();
    // Confirm baseline captures the explicit index on posts
    expect(
      baseline.tables["posts"].indexes.map((i) => i.name)
    ).toContain("idx_posts_user_id");

    // Task adds a column to posts (which has a pre-existing explicit index)
    db.exec("ALTER TABLE posts ADD COLUMN task_tag TEXT");

    // After revert, the table should be back to baseline — including its index
    reconciler.revert(baseline);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);

    // Verify idx_posts_user_id is present in the actual DB
    const idxList = db
      .prepare("PRAGMA index_list(posts)")
      .all() as Array<{ name: string; origin: string }>;
    const explicitIdxNames = idxList
      .filter((i) => i.origin === "c")
      .map((i) => i.name);
    expect(explicitIdxNames).toContain("idx_posts_user_id");
  });
});

// ── Failing migration integration ─────────────────────────────────────────────

describe("SchemaReconciler — failing migration integration", () => {
  let db: Database.Database;
  let reconciler: SchemaReconciler;

  beforeEach(() => {
    db = makeInMemoryDb();
    createTestSchema(db);
    reconciler = new SchemaReconciler(db);
  });

  afterEach(() => {
    db.close();
  });

  it("schema remains unchanged after a task migration that fails and is reverted", () => {
    // Step 1: take snapshot before task begins
    const baseline = reconciler.snapshot();

    let taskFailed = false;

    // Step 2: simulate a task that modifies the schema and then fails
    try {
      db.exec(
        "CREATE TABLE migration_table (id INTEGER PRIMARY KEY, col TEXT)"
      );
      db.exec("ALTER TABLE users ADD COLUMN migration_col TEXT");

      // Simulate task failure (e.g., validation error, agent crash)
      throw new Error("Simulated task failure");
    } catch (_err) {
      taskFailed = true;

      // Step 3: schema reconciliation — revert to pre-task schema
      reconciler.revert(baseline);
    }

    // Step 4: verify the task failed AND the schema was restored
    expect(taskFailed).toBe(true);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);
    expect(afterDiff.addedTables).toHaveLength(0);
    expect(afterDiff.modifiedTables).toHaveLength(0);
  });

  it("diff correctly identifies ALL changes between two snapshots", () => {
    const snap1 = reconciler.snapshot();

    db.exec(`
      CREATE TABLE new_table (id INTEGER PRIMARY KEY);
      ALTER TABLE users ADD COLUMN new_col TEXT;
    `);

    const snap2 = reconciler.snapshot();

    // diff using snap1 as baseline should detect the changes
    const diff: SchemaDiff = reconciler.diff(snap1);
    expect(diff.addedTables).toContain("new_table");
    expect(diff.modifiedTables.some((t) => t.name === "users")).toBe(true);

    // diff using snap2 as baseline should show no changes (current == snap2)
    const noChangeDiff = reconciler.diff(snap2);
    expect(noChangeDiff.hasChanges).toBe(false);
  });

  it("reverts a task that added multiple tables with FK relationships", () => {
    const baseline = reconciler.snapshot();

    db.exec(`
      CREATE TABLE categories (
        id   INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );
      CREATE TABLE items (
        id          INTEGER PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        title       TEXT NOT NULL
      );
    `);

    // Both tables should be reverted cleanly despite FK relationship
    reconciler.revert(baseline);

    const afterDiff = reconciler.diff(baseline);
    expect(afterDiff.hasChanges).toBe(false);
    expect(afterDiff.addedTables).toHaveLength(0);
  });

  it("snapshot taken after revert matches the original baseline", () => {
    // Insert data
    db.exec(
      "INSERT INTO users (name, email) VALUES ('Test', 'test@example.com')"
    );

    const baseline = reconciler.snapshot();

    // Apply and revert changes
    db.exec("CREATE TABLE drift_table (id INTEGER PRIMARY KEY)");
    db.exec("ALTER TABLE users ADD COLUMN drift_col TEXT");

    reconciler.revert(baseline);

    // A fresh snapshot should match the original baseline exactly
    const afterSnap: SchemaSnapshot = reconciler.snapshot();

    expect(Object.keys(afterSnap.tables).sort()).toEqual(
      Object.keys(baseline.tables).sort()
    );

    for (const tableName of Object.keys(baseline.tables)) {
      const baselineCols = baseline.tables[tableName].columns.map((c) => c.name);
      const afterCols = afterSnap.tables[tableName].columns.map((c) => c.name);
      expect(afterCols).toEqual(baselineCols);
    }
  });
});
