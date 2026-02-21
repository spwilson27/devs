/**
 * @devs/core persistence/audit_schema.ts
 *
 * Audit-specific schema additions for the Glass-Box Observability system.
 *
 * Call `initializeAuditSchema(db)` AFTER `initializeSchema(db)` to:
 *   1. Create the `decision_logs` table for recording architectural decisions.
 *   2. Add performance indices to `agent_logs` (task_id, epic_id, timestamp).
 *   3. Add performance indices to `decision_logs` (task_id, timestamp).
 *
 * All statements use `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`
 * so the function is safe to call multiple times (idempotent).
 *
 * Table overview:
 *   decision_logs — records design alternatives considered, reasoning for
 *                   rejection, and the selected option. [TAS-046, TAS-059]
 *
 * Index overview:
 *   idx_agent_logs_task_id   — fast lookup of all logs for a given task
 *   idx_agent_logs_epic_id   — fast lookup of all logs for a given epic
 *   idx_agent_logs_timestamp — fast range queries on historical audit data
 *   idx_decision_logs_task_id   — fast lookup of decisions for a given task
 *   idx_decision_logs_timestamp — fast range queries on decision history
 *
 * Prerequisites: `initializeSchema(db)` must have been called first because
 *   `decision_logs` has an FK to `tasks`, and the agent_logs indices target
 *   the `agent_logs` table — both created by `schema.ts`.
 *
 * Requirements: [TAS-046], [TAS-059], [TAS-001], [3_MCP-MCP-002]
 */

import type Database from "better-sqlite3";

// ── Public constants ──────────────────────────────────────────────────────────

/**
 * Audit-specific table names added by `initializeAuditSchema()`.
 * Does NOT include `agent_logs` (created by `schema.ts`).
 */
export const AUDIT_TABLES = ["decision_logs"] as const;

export type AuditTable = (typeof AUDIT_TABLES)[number];

// ── DDL statements ────────────────────────────────────────────────────────────

const DDL_TABLE_STATEMENTS: ReadonlyArray<string> = [
  // ── decision_logs ──────────────────────────────────────────────────────────
  // Records architectural and implementation decisions made during agent runs.
  // Each row captures the alternative(s) considered, the reasoning for
  // rejecting them, and the option that was ultimately selected.
  // Linked to a task for scoped audit queries. [TAS-046, TAS-059]
  `CREATE TABLE IF NOT EXISTS decision_logs (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id                 INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    timestamp               TEXT    NOT NULL DEFAULT (datetime('now')),
    alternative_considered  TEXT,
    reasoning_for_rejection TEXT,
    selected_option         TEXT
  )`,
];

const DDL_INDEX_STATEMENTS: ReadonlyArray<string> = [
  // ── agent_logs indices ─────────────────────────────────────────────────────
  // These indices cover the three primary query patterns for historical audit
  // data: (1) all logs for a task, (2) all logs for an epic, (3) time-range
  // queries. Without explicit indices SQLite performs full-table scans as the
  // agent_logs table grows to millions of rows.
  "CREATE INDEX IF NOT EXISTS idx_agent_logs_task_id   ON agent_logs(task_id)",
  "CREATE INDEX IF NOT EXISTS idx_agent_logs_epic_id   ON agent_logs(epic_id)",
  "CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp)",

  // ── decision_logs indices ──────────────────────────────────────────────────
  "CREATE INDEX IF NOT EXISTS idx_decision_logs_task_id   ON decision_logs(task_id)",
  "CREATE INDEX IF NOT EXISTS idx_decision_logs_timestamp ON decision_logs(timestamp)",
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initializes the audit-specific schema additions.
 *
 * Creates `decision_logs` and all performance indices for `agent_logs` and
 * `decision_logs`. All DDL uses `IF NOT EXISTS` so this function is safe to
 * call multiple times.
 *
 * IMPORTANT: `initializeSchema(db)` MUST be called before this function
 * because `decision_logs` has an FK to `tasks`, and the agent_logs indices
 * target the `agent_logs` table — both created by `schema.ts`.
 *
 * @param db - An open better-sqlite3 Database instance with WAL mode and
 *   FK enforcement already configured (done by `createDatabase()`).
 */
export function initializeAuditSchema(db: Database.Database): void {
  // Run tables and indices inside a single transaction for atomicity.
  const runAll = db.transaction(() => {
    for (const ddl of DDL_TABLE_STATEMENTS) {
      db.prepare(ddl).run();
    }
    for (const ddl of DDL_INDEX_STATEMENTS) {
      db.prepare(ddl).run();
    }
  });

  runAll();
}
