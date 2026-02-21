#!/usr/bin/env tsx
/**
 * scripts/db_audit.ts — devs-internal db-audit
 *
 * Queries `sqlite_master` and `PRAGMA table_info` to verify that all 7 core
 * Flight Recorder tables exist in `.devs/state.sqlite` and prints their
 * column definitions.
 *
 * This script implements the "devs-internal db-audit" verification command
 * described in the task specification (section 6).
 *
 * Usage:
 *   pnpm exec tsx scripts/db_audit.ts
 *
 * Exit codes:
 *   0 — All 7 core tables found and printed.
 *   1 — One or more tables are missing or the database does not exist.
 *
 * Note: Opens the database read-only. The schema must already be initialized
 * (run the application or test suite first to create `.devs/state.sqlite`).
 *
 * Requirements: TAS-105 through TAS-111, 9_ROADMAP-TAS-102
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

// ── Resolve project root ──────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");
const DB_PATH = resolve(PROJECT_ROOT, ".devs", "state.sqlite");

// ── Core table list (mirrors CORE_TABLES from schema.ts) ─────────────────────

const CORE_TABLES = [
  "projects",
  "documents",
  "requirements",
  "epics",
  "tasks",
  "agent_logs",
  "entropy_events",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface TableInfoRow {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

interface SqliteMasterRow {
  name: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(msg: string): void {
  console.log(`  [PASS] ${msg}`);
  passed++;
}

function fail(msg: string): void {
  console.error(`  [FAIL] ${msg}`);
  failed++;
}

function printTableSchema(
  db: Database.Database,
  tableName: string
): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(tableName) as SqliteMasterRow | undefined;

  if (!row) {
    fail(`Table not found: ${tableName}`);
    return false;
  }

  pass(`Table exists: ${tableName}`);

  const columns = db.pragma(`table_info(${tableName})`) as TableInfoRow[];
  console.log(`\n     Columns for '${tableName}':`);
  for (const col of columns) {
    const pkMark = col.pk > 0 ? " [PK]" : "";
    const notNull = col.notnull ? " NOT NULL" : "";
    const dflt = col.dflt_value !== null ? ` DEFAULT ${col.dflt_value}` : "";
    console.log(`       ${col.cid}. ${col.name}  ${col.type}${notNull}${dflt}${pkMark}`);
  }

  return true;
}

// ── Verification ──────────────────────────────────────────────────────────────

console.log("\n=== devs-internal db-audit ===\n");
console.log(`Database: ${DB_PATH}\n`);

if (!existsSync(DB_PATH)) {
  fail(
    `Database not found: ${DB_PATH}\n` +
      "  Run the application or test suite to initialize the schema first."
  );
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });

try {
  // Verify WAL mode is active.
  const journalMode = db.pragma("journal_mode", { simple: true }) as string;
  if (journalMode === "wal") {
    pass(`journal_mode = "${journalMode}" (WAL active)`);
  } else {
    fail(`journal_mode = "${journalMode}" — expected "wal"`);
  }

  // Verify foreign_keys is enabled.
  const fkEnabled = db.pragma("foreign_keys", { simple: true }) as number;
  // Note: readonly connections may not reflect PRAGMA foreign_keys state;
  // we check it here for documentation purposes.
  console.log(`  [INFO] foreign_keys pragma = ${fkEnabled} (runtime connection-level)`);

  console.log();

  // Audit each core table.
  for (const tableName of CORE_TABLES) {
    printTableSchema(db, tableName);
    console.log();
  }
} finally {
  db.close();
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
