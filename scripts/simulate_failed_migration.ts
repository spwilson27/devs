#!/usr/bin/env tsx
/**
 * scripts/simulate_failed_migration.ts
 *
 * End-to-end simulation of a failing schema migration task and schema drift
 * reconciliation.
 *
 * Demonstrates the full SchemaReconciler lifecycle:
 *   1. Create a test database with the core Flight Recorder schema.
 *   2. Take a pre-task schema snapshot (baseline).
 *   3. Simulate a task that performs schema migrations (CREATE TABLE, ALTER TABLE).
 *   4. Simulate task failure.
 *   5. Call `revert(baseline)` to restore the pre-task schema.
 *   6. Verify the schema is unchanged using `diff(baseline)`.
 *
 * Exit codes:
 *   0 — All checks passed.
 *   1 — One or more checks failed.
 *
 * Usage:
 *   pnpm exec tsx scripts/simulate_failed_migration.ts
 *
 * Requirements: [8_RISKS-REQ-073]
 */

import Database from "better-sqlite3";
import { SchemaReconciler } from "../packages/core/src/persistence/SchemaReconciler.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passCount++;
  } else {
    console.error(`  ✗ ${label}`);
    failCount++;
  }
}

// ── Simulation ────────────────────────────────────────────────────────────────

console.log("\n=== Schema Drift Reconciliation Simulation ===\n");

// Use an in-memory database for the simulation (no temp files to clean up).
const db = new Database(":memory:");
db.pragma("foreign_keys = ON");

// ── Phase 1: Establish baseline schema ────────────────────────────────────────

console.log("Phase 1: Establish baseline schema");

db.exec(`
  CREATE TABLE projects (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
  );
  CREATE TABLE tasks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending'
  );
  CREATE INDEX idx_tasks_project ON tasks(project_id);
`);

// Insert some rows to verify data is preserved through reconciliation.
db.exec(`
  INSERT INTO projects (name) VALUES ('Test Project');
  INSERT INTO tasks (project_id, title) VALUES (1, 'Task A');
  INSERT INTO tasks (project_id, title) VALUES (1, 'Task B');
`);

const reconciler = new SchemaReconciler(db);
const baseline = reconciler.snapshot();

check("baseline snapshot has 2 tables", Object.keys(baseline.tables).length === 2);
check("baseline has 'projects' table", "projects" in baseline.tables);
check("baseline has 'tasks' table", "tasks" in baseline.tables);
check("baseline 'tasks' has idx_tasks_project index", baseline.tables["tasks"].indexes.some(i => i.name === "idx_tasks_project"));
check("capturedAt is an ISO-8601 string", !Number.isNaN(Date.parse(baseline.capturedAt)));

console.log();

// ── Phase 2: Simulate task schema migration ────────────────────────────────────

console.log("Phase 2: Simulate task schema migration (CREATE TABLE + ALTER TABLE)");

db.exec(`
  CREATE TABLE migration_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    message    TEXT,
    timestamp  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  ALTER TABLE projects ADD COLUMN owner TEXT;
  ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium';
  CREATE INDEX idx_tasks_priority ON tasks(priority);
`);

// Verify migration was applied.
const preMigrationDiff = reconciler.diff(baseline);
check("migration added 1 new table (migration_log)", preMigrationDiff.addedTables.includes("migration_log"));
check("migration modified 'projects' (added owner col)", preMigrationDiff.modifiedTables.some(t => t.name === "projects" && t.addedColumns.some(c => c.name === "owner")));
check("migration modified 'tasks' (added priority col)", preMigrationDiff.modifiedTables.some(t => t.name === "tasks" && t.addedColumns.some(c => c.name === "priority")));
check("migration added idx_tasks_priority index", preMigrationDiff.modifiedTables.some(t => t.name === "tasks" && t.addedIndexes.some(i => i.name === "idx_tasks_priority")));
check("hasChanges is true after migration", preMigrationDiff.hasChanges);

console.log();

// ── Phase 3: Simulate task failure and revert ──────────────────────────────────

console.log("Phase 3: Simulate task failure → invoke revert()");

let taskFailed = false;
try {
  // Simulate task execution that fails partway through.
  throw new Error("Simulated task failure: assertion error during implementation");
} catch (_err) {
  taskFailed = true;
  // Schema reconciliation: restore to pre-task schema.
  reconciler.revert(baseline);
}

check("task failure was detected", taskFailed);

console.log();

// ── Phase 4: Verify schema was restored ──────────────────────────────────────

console.log("Phase 4: Verify schema restored to baseline");

const postRevertDiff = reconciler.diff(baseline);

check("diff.hasChanges is false after revert", !postRevertDiff.hasChanges);
check("no tables added", postRevertDiff.addedTables.length === 0);
check("no tables removed", postRevertDiff.removedTables.length === 0);
check("no tables modified", postRevertDiff.modifiedTables.length === 0);

// Verify migration_log is gone.
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
const tableNames = tables.map(t => t.name).sort();
check("migration_log table was dropped", !tableNames.includes("migration_log"));
check("projects table still exists", tableNames.includes("projects"));
check("tasks table still exists", tableNames.includes("tasks"));

// Verify original columns are present and task-added columns are gone.
const projectCols = db.prepare("PRAGMA table_info(projects)").all() as { name: string }[];
check("'owner' column removed from projects", !projectCols.map(c => c.name).includes("owner"));
check("original projects columns intact", projectCols.map(c => c.name).includes("name") && projectCols.map(c => c.name).includes("status"));

const taskCols = db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[];
check("'priority' column removed from tasks", !taskCols.map(c => c.name).includes("priority"));

// Verify existing rows were preserved.
const projectRows = db.prepare("SELECT COUNT(*) as cnt FROM projects").get() as { cnt: number };
check("existing project rows preserved (1 row)", projectRows.cnt === 1);

const taskRows = db.prepare("SELECT COUNT(*) as cnt FROM tasks").get() as { cnt: number };
check("existing task rows preserved (2 rows)", taskRows.cnt === 2);

// Verify the explicit index is still present (it was in the baseline).
const indexes = db.prepare("PRAGMA index_list(tasks)").all() as { name: string; origin: string }[];
const explicitIndexes = indexes.filter(i => i.origin === "c").map(i => i.name);
check("baseline index idx_tasks_project still present", explicitIndexes.includes("idx_tasks_project"));

// Verify the task-added index was removed.
check("task-added index idx_tasks_priority removed", !explicitIndexes.includes("idx_tasks_priority"));

console.log();

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`=== Results: ${passCount} passed, ${failCount} failed ===\n`);

db.close();

if (failCount > 0) {
  process.exit(1);
}
