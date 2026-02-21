#!/usr/bin/env tsx
/**
 * scripts/simulate_crash_during_write.ts — WAL crash-recovery simulation
 *
 * Demonstrates that SQLite WAL mode maintains database integrity when a
 * process is killed mid-transaction. The uncommitted writes are automatically
 * discarded after the process exits without committing.
 *
 * How the simulation works:
 *   1. A committed baseline row ("committed_value") is written to a temp DB.
 *   2. A child Node.js process is spawned. It opens the same DB, begins an
 *      IMMEDIATE transaction, inserts an uncommitted row ("crash_value"), then
 *      calls `process.exit(1)` — simulating an abnormal process death without
 *      COMMIT.
 *   3. After the child exits, the main process reopens the DB and verifies:
 *      - The baseline row is still present (committed data survives).
 *      - The crash row is absent (uncommitted data was discarded).
 *   4. A second verification uses the `StateRepository` to confirm that the
 *      ACID semantics of `transaction()` are equivalent: a thrown exception
 *      during a `db.transaction()` callback causes the same automatic rollback.
 *
 * The SQLite WAL guarantee:
 *   WAL (Write-Ahead Logging) appends changes to a separate WAL file before
 *   modifying the database. A transaction is only durable once a COMMIT record
 *   is appended to the WAL. When a process dies mid-transaction, the COMMIT
 *   record is never written. The next connection to open the database performs
 *   WAL recovery — it replays only fully-committed transactions and ignores
 *   any trailing partial transaction.
 *
 * Usage:
 *   pnpm exec tsx scripts/simulate_crash_during_write.ts
 *
 * Exit codes:
 *   0 — All simulation checks passed.
 *   1 — One or more checks failed.
 *
 * Requirements: [TAS-067], [8_RISKS-REQ-115], [3_MCP-REQ-REL-004]
 */

import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import BetterSqlite3 from "better-sqlite3";
import { ensureDirSync } from "fs-extra";
import {
  createDatabase,
  closeDatabase,
} from "../packages/core/src/persistence/database.js";
import { initializeSchema } from "../packages/core/src/persistence/schema.js";
import { StateRepository } from "../packages/core/src/persistence/state_repository.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function check(description: string, assertion: () => void): void {
  try {
    assertion();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// ── Setup ─────────────────────────────────────────────────────────────────────

const tmpRoot = mkdtempSync(resolve(tmpdir(), "devs-crash-sim-"));
const dbPath = resolve(tmpRoot, "crash_test.sqlite");

console.log("\n=== SQLite WAL Crash-Recovery Simulation ===\n");
console.log(`Temp database: ${dbPath}\n`);

try {
  // ── Phase 1: Establish committed baseline state ────────────────────────────
  //
  // Create a simple table and insert one committed row that must survive the
  // crash scenario unchanged.

  console.log("--- Phase 1: Establishing committed baseline state ---\n");

  const setupDb = new BetterSqlite3(dbPath);
  setupDb.pragma("journal_mode = WAL");
  setupDb.pragma("foreign_keys = ON");

  setupDb.exec(
    "CREATE TABLE IF NOT EXISTS test_data (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT NOT NULL)"
  );
  setupDb.prepare("INSERT INTO test_data (value) VALUES (?)").run("committed_value");

  const baselineCount = (
    setupDb.prepare("SELECT COUNT(*) AS n FROM test_data").get() as { n: number }
  ).n;

  check(
    `Baseline: 1 committed row present before crash (got ${baselineCount})`,
    () => assert(baselineCount === 1, `Expected 1, got ${baselineCount}`)
  );

  setupDb.close();

  // ── Phase 2: Spawn a child process that crashes mid-transaction ────────────
  //
  // The crash script:
  //   1. Opens the same SQLite DB.
  //   2. Begins an IMMEDIATE transaction (explicit BEGIN IMMEDIATE).
  //   3. Inserts "crash_value" (uncommitted).
  //   4. Calls process.exit(1) WITHOUT committing — simulating a crash.

  console.log("\n--- Phase 2: Spawning child process that crashes mid-transaction ---\n");

  // Write the crash worker to a temp file using CommonJS require (portable).
  const crashWorkerPath = resolve(tmpRoot, "crash_worker.cjs");
  const crashWorkerContent = `
const Database = require('better-sqlite3');
const db = new Database(process.argv[2]);
db.pragma('journal_mode = WAL');

// Begin an explicit IMMEDIATE transaction (prevents any other writer).
db.exec('BEGIN IMMEDIATE');

// Insert uncommitted data.
db.prepare("INSERT INTO test_data (value) VALUES (?)").run('crash_value');

console.error('crash_worker: mid-transaction, exiting without COMMIT...');

// Simulate process death — transaction is NOT committed.
process.exit(1);
`;
  writeFileSync(crashWorkerPath, crashWorkerContent);

  const crashResult = spawnSync(
    process.execPath, // node binary used to run this script
    [crashWorkerPath, dbPath],
    { encoding: "utf8", timeout: 10_000 }
  );

  check(
    "Child process exited with code 1 (crash simulated)",
    () =>
      assert(
        crashResult.status === 1,
        `Expected exit code 1, got ${String(crashResult.status)}`
      )
  );

  // ── Phase 3: Verify DB integrity after the crash ───────────────────────────
  //
  // The next connection performs WAL recovery. It should replay only the
  // committed transaction (baseline row) and discard the uncommitted one.

  console.log("\n--- Phase 3: Verifying database integrity after crash ---\n");

  const verifyDb = new BetterSqlite3(dbPath);
  verifyDb.pragma("journal_mode = WAL");

  const rowsAfterCrash = verifyDb
    .prepare("SELECT value FROM test_data ORDER BY id")
    .all() as Array<{ value: string }>;

  check(
    `Post-crash: still exactly 1 row (uncommitted data discarded) (got ${rowsAfterCrash.length})`,
    () =>
      assert(
        rowsAfterCrash.length === 1,
        `Expected 1 row, got ${rowsAfterCrash.length}`
      )
  );

  check(
    `Post-crash: surviving row contains 'committed_value' (got '${rowsAfterCrash[0]?.value}')`,
    () =>
      assert(
        rowsAfterCrash[0]?.value === "committed_value",
        `Expected 'committed_value', got '${rowsAfterCrash[0]?.value}'`
      )
  );

  check(
    "Post-crash: 'crash_value' (uncommitted) is NOT present in the database",
    () => {
      const crashRow = verifyDb
        .prepare("SELECT value FROM test_data WHERE value = ?")
        .get("crash_value") as { value: string } | undefined;
      assert(
        crashRow === undefined,
        `Expected undefined, found row with value '${crashRow?.value}'`
      );
    }
  );

  check(
    "Post-crash: WAL journal_mode is still active (no regression)",
    () => {
      const mode = verifyDb.pragma("journal_mode", { simple: true }) as string;
      assert(mode === "wal", `journal_mode is '${mode}', expected 'wal'`);
    }
  );

  verifyDb.close();

  // ── Phase 4: StateRepository ACID equivalence ──────────────────────────────
  //
  // Verify that the StateRepository's `transaction()` method provides the same
  // ACID guarantee as the raw SQLite crash: a thrown exception inside
  // `transaction()` triggers a ROLLBACK — no partial data is committed.

  console.log("\n--- Phase 4: StateRepository transaction() ACID equivalence ---\n");

  const repoDbPath = resolve(tmpRoot, ".devs", "state.sqlite");
  ensureDirSync(resolve(tmpRoot, ".devs"));

  const repoDb = createDatabase({ dbPath: repoDbPath });
  initializeSchema(repoDb);
  const repo = new StateRepository(repoDb);

  // Commit a baseline project.
  const projectId = repo.upsertProject({
    name: "Pre-crash Project",
    status: "pending",
  });

  check(
    "StateRepository: baseline project committed (id > 0)",
    () => assert(projectId > 0, `Expected id > 0, got ${projectId}`)
  );

  // Attempt a transaction that fails mid-way — the epic insert should roll back.
  let caughtError: unknown;
  try {
    repo.transaction(() => {
      repo.saveEpics([
        { project_id: projectId, name: "Crash Epic", order_index: 0 },
      ]);
      throw new Error("simulated crash during transaction");
    });
  } catch (err) {
    caughtError = err;
  }

  check(
    "StateRepository: transaction() re-threw the simulated crash error",
    () =>
      assert(
        caughtError instanceof Error &&
          caughtError.message === "simulated crash during transaction",
        `Expected simulated crash error, got: ${String(caughtError)}`
      )
  );

  const epicCount = (
    repoDb
      .prepare("SELECT COUNT(*) AS n FROM epics WHERE project_id = ?")
      .get(projectId) as { n: number }
  ).n;

  check(
    `StateRepository: epic insert rolled back (0 epics after crash, got ${epicCount})`,
    () => assert(epicCount === 0, `Expected 0 epics, got ${epicCount}`)
  );

  check(
    "StateRepository: baseline project is unaffected by the rolled-back transaction",
    () => {
      const state = repo.getProjectState(projectId);
      assert(state !== null, "getProjectState() returned null");
      assert(
        state!.project.name === "Pre-crash Project",
        `Project name changed to '${state!.project.name}'`
      );
      assert(
        state!.epics.length === 0,
        `Expected 0 epics, found ${state!.epics.length}`
      );
    }
  );

  repoDb.close();
  closeDatabase();
} finally {
  // Clean up temp directory regardless of test outcome.
  if (existsSync(tmpRoot)) {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(
  `\n=== Results: ${passed} passed, ${failed} failed ===\n`
);

if (failed === 0) {
  console.log("✓ SQLite WAL mode correctly discards uncommitted writes on");
  console.log("  process death. StateRepository.transaction() provides the");
  console.log("  same ACID guarantee via automatic ROLLBACK on exception.\n");
}

process.exit(failed > 0 ? 1 : 0);
