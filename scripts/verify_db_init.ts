#!/usr/bin/env tsx
/**
 * scripts/verify_db_init.ts
 *
 * Automated verification script that confirms the persistence layer is
 * correctly initialised at the project root:
 *
 *   1. `.devs/state.sqlite` exists.
 *   2. `PRAGMA journal_mode` returns "wal" (Write-Ahead Logging is active).
 *
 * Usage:
 *   pnpm exec tsx scripts/verify_db_init.ts
 *
 * Exit codes:
 *   0 — All checks passed.
 *   1 — One or more checks failed.
 *
 * Note: This script opens the database in read-only mode so it never modifies
 * state.  Run the application (or a test that calls createDatabase) first to
 * ensure the file exists before invoking this script.
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

// ── Resolve project root from script location ─────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// scripts/ lives directly under the project root.
const PROJECT_ROOT = resolve(__dirname, "..");
const DB_PATH = resolve(PROJECT_ROOT, ".devs", "state.sqlite");

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

// ── Verification checks ───────────────────────────────────────────────────────

console.log("\n=== DB Init Verification ===\n");
console.log(`Checking: ${DB_PATH}\n`);

// Check 1: .devs/state.sqlite must exist.
if (existsSync(DB_PATH)) {
  pass(".devs/state.sqlite exists");
} else {
  fail(
    `.devs/state.sqlite not found at: ${DB_PATH}\n` +
      "  Run the application or the test suite to initialise the database first."
  );
}

// Check 2: WAL mode must be active.
if (existsSync(DB_PATH)) {
  const db = new Database(DB_PATH, { readonly: true });
  const journalMode = db.pragma("journal_mode", { simple: true }) as string;
  db.close();

  if (journalMode === "wal") {
    pass(`journal_mode = "${journalMode}" (WAL is active)`);
  } else {
    fail(`journal_mode = "${journalMode}" — expected "wal"`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
