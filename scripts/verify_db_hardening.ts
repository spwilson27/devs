#!/usr/bin/env tsx
/**
 * scripts/verify_db_hardening.ts
 *
 * Automated verification script for SQLite WAL hardening and file security.
 *
 * Opens a temporary database via SqliteManager and verifies:
 *   1. Database file is created at the expected path.
 *   2. File permissions are exactly 0600 (owner read/write only).
 *   3. PRAGMA journal_mode = "wal" (Write-Ahead Logging is active).
 *   4. PRAGMA synchronous is NORMAL (1) or FULL (2).
 *
 * Usage:
 *   pnpm exec tsx scripts/verify_db_hardening.ts
 *
 * Exit codes:
 *   0 — All checks passed.
 *   1 — One or more checks failed.
 *
 * Note: Creates and removes a temporary database under the OS temp directory.
 * It never touches the real project-root .devs/state.sqlite.
 */

import { existsSync, rmSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { SqliteManager } from "../packages/core/src/persistence/SqliteManager.js";

// ── Temp database path ────────────────────────────────────────────────────────

const dbPath = resolve(
  tmpdir(),
  `devs-verify-hardening-${Date.now()}`,
  ".devs",
  "state.sqlite"
);

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

// ── Verification ──────────────────────────────────────────────────────────────

console.log("\n=== DB Hardening Verification ===\n");
console.log(`Temp database: ${dbPath}\n`);

const manager = new SqliteManager({ dbPath });

try {
  const db = manager.open();

  // Check 1: File exists after open().
  if (existsSync(dbPath)) {
    pass("Database file created at expected path");
  } else {
    fail(`Database file not found at: ${dbPath}`);
  }

  // Check 2: File permissions are 0600.
  if (existsSync(dbPath)) {
    const stat = statSync(dbPath);
    const mode = stat.mode & 0o777;
    if (mode === 0o600) {
      pass(`File permissions: 0${mode.toString(8)} (correct — owner r/w only)`);
    } else {
      fail(
        `File permissions: 0${mode.toString(8)} — expected 0600 (owner r/w only)`
      );
    }
  }

  // Check 3: WAL journal mode.
  const journalMode = db.pragma("journal_mode", { simple: true }) as string;
  if (journalMode === "wal") {
    pass(`journal_mode = "${journalMode}" (WAL is active)`);
  } else {
    fail(`journal_mode = "${journalMode}" — expected "wal"`);
  }

  // Check 4: Synchronous is NORMAL (1) or FULL (2).
  const synchronous = db.pragma("synchronous", { simple: true }) as number;
  const syncName: Record<number, string> = { 0: "OFF", 1: "NORMAL", 2: "FULL", 3: "EXTRA" };
  if (synchronous === 1 || synchronous === 2) {
    pass(
      `synchronous = ${synchronous} (${syncName[synchronous] ?? "UNKNOWN"}) — row-level locking active`
    );
  } else {
    fail(
      `synchronous = ${synchronous} (${syncName[synchronous] ?? "UNKNOWN"}) — expected NORMAL (1) or FULL (2)`
    );
  }
} finally {
  manager.close();

  // Clean up the temporary database directory.
  const root = resolve(dirname(dbPath), "..");
  if (existsSync(root)) {
    rmSync(root, { recursive: true, force: true });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
