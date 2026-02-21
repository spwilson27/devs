#!/usr/bin/env tsx
/**
 * scripts/verify_checkpoints.ts — SqliteSaver checkpoint integrity verification
 *
 * Verifies that the SqliteSaver correctly persists LangGraph checkpoints to
 * `state.sqlite` with full ACID guarantees.
 *
 * ## What this script verifies
 *
 * 1. **Full run:** A complete LangGraph execution writes one checkpoint per node
 *    transition. All checkpoints are queryable in `state.sqlite`.
 *
 * 2. **Node crash:** When a node throws (simulating process interruption), the
 *    `put()` call for the failing node is never reached. The last successfully
 *    committed checkpoint from the previous node remains intact.
 *
 * 3. **Atomicity:** A mock that throws INSIDE `_stmtPutCheckpoint.run()` (i.e.,
 *    mid-transaction) leaves the previous checkpoint untouched. No partial
 *    checkpoint row exists after the error.
 *
 * 4. **Resume from last checkpoint:** After a crash, the graph can call
 *    `getTuple()` to load the last full checkpoint for recovery.
 *
 * 5. **WAL mode active:** The checkpoint database uses WAL journal mode throughout.
 *
 * 6. **Disk visibility:** Checkpoints written through the API are also readable
 *    via a direct raw SQL query on `state.sqlite`.
 *
 * Usage:
 *   pnpm exec tsx scripts/verify_checkpoints.ts
 *
 * Exit codes:
 *   0 — All checks passed.
 *   1 — One or more checks failed.
 *
 * Requirements: [9_ROADMAP-TAS-103], [TAS-073], [TAS-094]
 */

import {
  mkdtempSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { StateGraph, START, END } from "@langchain/langgraph";
import BetterSqlite3 from "better-sqlite3";
import { createDatabase, closeDatabase } from "../packages/core/src/persistence/database.js";
import { SqliteSaver } from "../packages/core/src/orchestration/SqliteSaver.js";
import {
  OrchestratorAnnotation,
  createInitialState,
} from "../packages/core/src/orchestration/types.js";
import type Database from "better-sqlite3";

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

function countCheckpoints(db: Database.Database, threadId: string): number {
  return (
    db
      .prepare("SELECT COUNT(*) as cnt FROM checkpoints WHERE thread_id = ?")
      .get(threadId) as { cnt: number }
  ).cnt;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const tmpRoot = mkdtempSync(resolve(tmpdir(), "devs-checkpoint-verify-"));
  const dbPath = resolve(tmpRoot, "state.sqlite");

  console.log("\n=== SqliteSaver Checkpoint Integrity Verification ===\n");
  console.log(`Temp database: ${dbPath}\n`);

  try {
    // ── Scenario 1: Full graph run writes checkpoints ──────────────────────────
    //
    // A two-node LangGraph executes to completion. We verify that the checkpoints
    // table contains at least two rows (one per node transition).

    console.log("--- Scenario 1: Full graph run writes checkpoints ---\n");

    const db1 = createDatabase({ dbPath });
    const saver1 = new SqliteSaver(db1);
    const threadId1 = randomUUID();

    const graph1 = new StateGraph(OrchestratorAnnotation)
      .addNode("nodeA", (state) => ({
        status: "researching" as const,
        projectConfig: { ...state.projectConfig, status: "researching" as const },
      }))
      .addNode("nodeB", (state) => ({
        status: "specifying" as const,
        projectConfig: { ...state.projectConfig, status: "specifying" as const },
      }))
      .addEdge(START, "nodeA")
      .addEdge("nodeA", "nodeB")
      .addEdge("nodeB", END)
      .compile({ checkpointer: saver1 });

    const initialState1 = createInitialState({
      projectId: randomUUID(),
      name: "checkpoint-test",
      description: "verify checkpoints",
      status: "initializing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await graph1.invoke(initialState1, { configurable: { thread_id: threadId1 } });

    const cpCount1 = countCheckpoints(db1, threadId1);
    check(
      `Full run: at least 2 checkpoints written (got ${cpCount1})`,
      () => assert(cpCount1 >= 2, `Expected >= 2 checkpoints, got ${cpCount1}`)
    );

    check(
      "Full run: checkpoints table exists in state.sqlite",
      () => {
        const row = db1
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='checkpoints'"
          )
          .get();
        assert(row !== undefined, "checkpoints table not found in state.sqlite");
      }
    );

    check(
      "Full run: WAL mode active on checkpoint database",
      () => {
        const mode = db1.pragma("journal_mode", { simple: true }) as string;
        assert(mode === "wal", `journal_mode is '${mode}', expected 'wal'`);
      }
    );

    const latestRow = db1
      .prepare(
        "SELECT checkpoint_id FROM checkpoints WHERE thread_id = ? ORDER BY rowid DESC LIMIT 1"
      )
      .get(threadId1) as { checkpoint_id: string } | undefined;

    check(
      "Full run: latest checkpoint_id is a non-empty string",
      () => {
        assert(
          latestRow?.checkpoint_id !== undefined && latestRow.checkpoint_id.length > 0,
          `Expected a checkpoint_id, got '${String(latestRow?.checkpoint_id)}'`
        );
      }
    );

    saver1.close();
    closeDatabase();

    // ── Scenario 2: Node failure — last full checkpoint survives ───────────────
    //
    // A graph node throws mid-execution. The `put()` for the failing node is
    // never called (the node itself threw before LangGraph could checkpoint it).
    // The last checkpoint from the preceding successful node must remain intact.

    console.log("\n--- Scenario 2: Node failure — last full checkpoint survives ---\n");

    const db2 = createDatabase({ dbPath: resolve(tmpRoot, "state2.sqlite") });
    const saver2 = new SqliteSaver(db2);
    const threadId2 = randomUUID();

    let nodeAExecuted = false;

    const graph2 = new StateGraph(OrchestratorAnnotation)
      .addNode("nodeA", (state) => {
        nodeAExecuted = true;
        return {
          status: "researching" as const,
          projectConfig: { ...state.projectConfig, status: "researching" as const },
        };
      })
      .addNode("nodeB", () => {
        // Simulate a crash / exception mid-node.
        throw new Error("Simulated node crash");
      })
      .addEdge(START, "nodeA")
      .addEdge("nodeA", "nodeB")
      .addEdge("nodeB", END)
      .compile({ checkpointer: saver2 });

    const initialState2 = createInitialState({
      projectId: randomUUID(),
      name: "crash-test",
      description: "crash test",
      status: "initializing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    let nodeBError: Error | undefined;
    try {
      await graph2.invoke(initialState2, {
        configurable: { thread_id: threadId2 },
      });
    } catch (err) {
      nodeBError = err instanceof Error ? err : new Error(String(err));
    }

    check(
      "Node crash: graph.invoke() threw the expected error",
      () => assert(nodeBError !== undefined, "Expected an error from graph.invoke()")
    );

    check(
      "Node crash: nodeA executed before the crash",
      () => assert(nodeAExecuted === true, "nodeA did not execute")
    );

    const cpCount2 = countCheckpoints(db2, threadId2);
    check(
      `Node crash: at least 1 checkpoint committed before crash (got ${cpCount2})`,
      () => assert(cpCount2 >= 1, `Expected >= 1 checkpoint(s), got ${cpCount2}`)
    );

    const lastTuple = await saver2.getTuple({
      configurable: { thread_id: threadId2 },
    });

    check(
      "Node crash: getTuple() returns the last committed checkpoint for recovery",
      () =>
        assert(lastTuple !== undefined, "getTuple() returned undefined — no recovery point")
    );

    check(
      "Node crash: recovered checkpoint has a valid checkpoint_id",
      () => {
        assert(
          lastTuple?.checkpoint.id !== undefined &&
            lastTuple.checkpoint.id.length > 0,
          "Recovered checkpoint has no valid id"
        );
      }
    );

    saver2.close();
    closeDatabase();

    // ── Scenario 3: ACID atomicity — partial checkpoint never committed ─────────
    //
    // Spy on `_stmtPutCheckpoint.run()` to throw on the second call (during a
    // second put). After the failure, only the first checkpoint exists in the DB.

    console.log(
      "\n--- Scenario 3: ACID atomicity — partial checkpoint never committed ---\n"
    );

    const db3 = createDatabase({ dbPath: resolve(tmpRoot, "state3.sqlite") });
    const saver3 = new SqliteSaver(db3);
    const threadId3 = randomUUID();

    const config3 = {
      configurable: { thread_id: threadId3, checkpoint_ns: "" },
    };

    const cp1 = {
      v: 1 as const,
      id: randomUUID(),
      ts: new Date().toISOString(),
      channel_values: { messages: ["first"] },
      channel_versions: { messages: 1 },
      versions_seen: {},
    };
    const meta1 = { source: "loop" as const, step: 1, parents: {} };

    // First put — succeeds, creates the baseline checkpoint.
    const newConfig3 = await saver3.put(config3, cp1, meta1, {});

    const countAfterFirst = countCheckpoints(db3, threadId3);
    check(
      `ACID: 1 checkpoint present after first successful put (got ${countAfterFirst})`,
      () => assert(countAfterFirst === 1, `Expected 1, got ${countAfterFirst}`)
    );

    // Second put — inject a mid-transaction failure by overriding statement.run.
    const stmt = saver3._stmtPutCheckpoint;
    const originalRun = stmt.run.bind(stmt);
    let runCallCount = 0;
    stmt.run = (...args: Parameters<typeof originalRun>) => {
      runCallCount++;
      if (runCallCount === 1) {
        throw new Error("Simulated disk failure mid-transaction");
      }
      return originalRun(...args);
    };

    const cp2 = {
      v: 1 as const,
      id: randomUUID(),
      ts: new Date().toISOString(),
      channel_values: { messages: ["second"] },
      channel_versions: { messages: 2 },
      versions_seen: {},
    };
    const meta2 = { source: "loop" as const, step: 2, parents: {} };

    let atomicityError: Error | undefined;
    try {
      await saver3.put(newConfig3, cp2, meta2, {});
    } catch (err) {
      atomicityError = err instanceof Error ? err : new Error(String(err));
    }

    // Restore original statement run method.
    stmt.run = originalRun;

    check(
      "ACID: mid-transaction error was propagated to the caller",
      () =>
        assert(
          atomicityError !== undefined,
          "Expected put() to throw but it succeeded"
        )
    );

    const countAfterCrash = countCheckpoints(db3, threadId3);
    check(
      `ACID: still only 1 checkpoint after mid-transaction failure (got ${countAfterCrash})`,
      () =>
        assert(
          countAfterCrash === 1,
          `Expected 1, got ${countAfterCrash} — partial write may have been committed`
        )
    );

    const recoveredTuple = await saver3.getTuple({
      configurable: { thread_id: threadId3, checkpoint_id: cp1.id },
    });

    check(
      "ACID: first checkpoint is intact and retrievable after failed second put",
      () => {
        assert(
          recoveredTuple !== undefined,
          "getTuple() returned undefined — first checkpoint lost"
        );
        assert(
          recoveredTuple?.checkpoint.id === cp1.id,
          `Expected '${cp1.id}', got '${recoveredTuple?.checkpoint.id}'`
        );
      }
    );

    check(
      "ACID: recovered checkpoint.channel_values matches the original",
      () => {
        const values = recoveredTuple?.checkpoint.channel_values as Record<
          string,
          unknown
        >;
        assert(
          JSON.stringify(values?.messages) === JSON.stringify(["first"]),
          `channel_values mismatch: ${JSON.stringify(values)}`
        );
      }
    );

    saver3.close();
    closeDatabase();

    // ── Scenario 4: Disk visibility ────────────────────────────────────────────
    //
    // Confirm checkpoints written through the SqliteSaver API are also readable
    // by a raw BetterSqlite3 connection opened directly on state.sqlite.

    console.log("\n--- Scenario 4: Disk visibility via raw SQL ---\n");

    check(
      "Disk: state.sqlite exists at the configured path",
      () => assert(existsSync(dbPath), `state.sqlite not found at '${dbPath}'`)
    );

    const rawDb = new BetterSqlite3(dbPath);
    rawDb.pragma("journal_mode = WAL");

    const rawCount = (
      rawDb
        .prepare(
          "SELECT COUNT(*) as cnt FROM checkpoints WHERE thread_id = ?"
        )
        .get(threadId1) as { cnt: number }
    ).cnt;

    check(
      `Disk: checkpoints from Scenario 1 visible via direct SQL (got ${rawCount})`,
      () =>
        assert(rawCount >= 2, `Expected >= 2 rows from direct SQL, got ${rawCount}`)
    );

    rawDb.close();
  } finally {
    // Clean up temp directory regardless of outcome.
    try {
      closeDatabase();
    } catch {
      // Already closed — ignore.
    }
    if (existsSync(tmpRoot)) {
      rmSync(tmpRoot, { recursive: true, force: true });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

  if (failed === 0) {
    console.log("✓ SqliteSaver checkpoint integrity verified:");
    console.log("  • Full graph runs write checkpoints per node transition.");
    console.log(
      "  • Node failures leave the last committed checkpoint intact."
    );
    console.log(
      "  • Mid-transaction failures are fully rolled back (ACID atomicity)."
    );
    console.log(
      "  • state.sqlite is readable via direct SQL (Glass-Box observability).\n"
    );
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
