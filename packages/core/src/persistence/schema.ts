/**
 * @devs/core persistence/schema.ts
 *
 * DDL initialization for the 7 core Flight Recorder tables.
 * Call `initializeSchema(db)` once per database connection to create all
 * tables with their columns, constraints, and foreign key references.
 *
 * All statements use `CREATE TABLE IF NOT EXISTS` so the function is safe
 * to call multiple times on the same database (idempotent).
 *
 * Table overview:
 *   projects        — project metadata and lifecycle phase [TAS-105]
 *   documents       — versioned document content per project [TAS-106]
 *   requirements    — atomic requirements with priority and trace [TAS-107]
 *   epics           — ordered epics (phases) per project [TAS-108]
 *   tasks           — atomic tasks with git commit correlation [TAS-109]
 *   agent_logs      — Glass-Box audit log: role, content_type, content JSON blob [TAS-110, TAS-046]
 *   entropy_events  — repeating failure records for loop prevention [TAS-111]
 *
 * Requirements: TAS-105, TAS-106, TAS-107, TAS-108, TAS-109, TAS-110, TAS-111,
 *               TAS-046, TAS-059, 9_ROADMAP-TAS-102, 9_ROADMAP-REQ-017
 */

import type Database from "better-sqlite3";

// ── Public constants ──────────────────────────────────────────────────────────

/**
 * Ordered list of all 7 core table names.
 * Used for verification scripts and tests.
 */
export const CORE_TABLES = [
  "projects",
  "documents",
  "requirements",
  "epics",
  "tasks",
  "agent_logs",
  "entropy_events",
] as const;

export type CoreTable = (typeof CORE_TABLES)[number];

// ── DDL statements ────────────────────────────────────────────────────────────

/**
 * DDL for each core table.
 * Order matters: parent tables must appear before their dependents so that
 * FK references are valid (even though SQLite validates FKs lazily, keeping
 * DDL in dependency order is a clear convention).
 */
const DDL_STATEMENTS: ReadonlyArray<string> = [
  // ── projects ──────────────────────────────────────────────────────────────
  // Top-level entity. All other tables reference projects directly or
  // indirectly. [TAS-105]
  `CREATE TABLE IF NOT EXISTS projects (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'pending',
    current_phase TEXT,
    last_milestone TEXT,
    metadata      TEXT
  )`,

  // ── documents ─────────────────────────────────────────────────────────────
  // PRD, TAS, and other high-level spec documents attached to a project.
  // Versioned so approvals and edits can be tracked. [TAS-106]
  `CREATE TABLE IF NOT EXISTS documents (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    content    TEXT,
    version    INTEGER NOT NULL DEFAULT 1,
    status     TEXT    NOT NULL DEFAULT 'draft'
  )`,

  // ── requirements ──────────────────────────────────────────────────────────
  // Atomic requirements distilled from documents. Carries priority, status,
  // and arbitrary trace metadata (e.g., source document ID). [TAS-107]
  `CREATE TABLE IF NOT EXISTS requirements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description TEXT    NOT NULL,
    priority    TEXT    NOT NULL DEFAULT 'medium',
    status      TEXT    NOT NULL DEFAULT 'pending',
    metadata    TEXT
  )`,

  // ── epics ─────────────────────────────────────────────────────────────────
  // Ordered high-level phases (epics) within a project. order_index drives
  // the dependency-ordered roadmap sequence. [TAS-108]
  `CREATE TABLE IF NOT EXISTS epics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        TEXT    NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    status      TEXT    NOT NULL DEFAULT 'pending'
  )`,

  // ── tasks ─────────────────────────────────────────────────────────────────
  // Atomic implementation tasks within an epic. git_commit_hash correlates
  // each completed task with the exact commit that implements it. [TAS-109]
  `CREATE TABLE IF NOT EXISTS tasks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    epic_id         INTEGER NOT NULL REFERENCES epics(id) ON DELETE CASCADE,
    title           TEXT    NOT NULL,
    description     TEXT,
    status          TEXT    NOT NULL DEFAULT 'pending',
    git_commit_hash TEXT
  )`,

  // ── agent_logs ────────────────────────────────────────────────────────────
  // Glass-Box audit log capturing each agent interaction step.
  // Stores structured JSON in `content` to support any interaction type
  // (thoughts, tool calls, observations) without schema changes.
  // `content_type` is the discriminator; `role` identifies the agent persona.
  // `epic_id` provides a direct FK for efficient epic-scoped audit queries.
  // `commit_hash` links the log entry to the git state at the time of logging.
  // [TAS-110, TAS-046, TAS-059]
  `CREATE TABLE IF NOT EXISTS agent_logs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id      INTEGER NOT NULL REFERENCES tasks(id)  ON DELETE CASCADE,
    epic_id      INTEGER          REFERENCES epics(id)  ON DELETE CASCADE,
    timestamp    TEXT    NOT NULL DEFAULT (datetime('now')),
    role         TEXT    NOT NULL,
    content_type TEXT    NOT NULL,
    content      TEXT    NOT NULL,
    commit_hash  TEXT
  )`,

  // ── entropy_events ────────────────────────────────────────────────────────
  // Records repeating failure signatures. hash_chain is a rolling SHA-256
  // hash of the last N error outputs; when it stabilises the system detects
  // an entropy loop and can abort or escalate. [TAS-111]
  `CREATE TABLE IF NOT EXISTS entropy_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id      INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    hash_chain   TEXT    NOT NULL,
    error_output TEXT,
    timestamp    TEXT    NOT NULL DEFAULT (datetime('now'))
  )`,
];

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Creates all 7 core Flight Recorder tables in `db`.
 *
 * Each statement uses `CREATE TABLE IF NOT EXISTS`, so calling this function
 * multiple times on the same database is safe and has no side-effects beyond
 * the first invocation.
 *
 * The caller is responsible for opening the database connection and enabling
 * any required PRAGMAs (e.g., `foreign_keys = ON`) before this call.
 *
 * @param db - An open better-sqlite3 Database instance.
 */
export function initializeSchema(db: Database.Database): void {
  // Run all DDL inside a single transaction so either all tables are created
  // or none are (atomic schema migration).
  const runAll = db.transaction(() => {
    for (const ddl of DDL_STATEMENTS) {
      db.prepare(ddl).run();
    }
  });

  runAll();
}
