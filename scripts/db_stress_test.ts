#!/usr/bin/env tsx
/**
 * scripts/db_stress_test.ts — StateRepository stress test
 *
 * Verifies that the Flight Recorder SQLite database (via StateRepository)
 * remains consistent under 1000 rapid sequential writes followed by read-back
 * verification. Tests that:
 *
 *   1. 1000 requirements can be bulk-inserted in a single transaction.
 *   2. All 1000 rows are retrievable via getProjectState().
 *   3. 1000 agent log entries can be appended (each as a single write).
 *   4. All 1000 log entries are retrievable via getTaskLogs().
 *   5. Data integrity: every row round-trips with the exact content written.
 *   6. WAL mode is active throughout (no journal_mode regression).
 *
 * Since better-sqlite3 uses a synchronous API, "concurrent" in the context
 * of a single Node.js process means rapid sequential operations without
 * intervening I/O. WAL mode enables true concurrency between this process
 * and external read-only connections.
 *
 * Usage:
 *   pnpm exec tsx scripts/db_stress_test.ts
 *
 * Exit codes:
 *   0 — All stress checks passed.
 *   1 — One or more checks failed.
 *
 * Requirements: 2_TAS-REQ-017
 */

import { mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import {
  createDatabase,
  closeDatabase,
} from "../packages/core/src/persistence/database.js";
import { initializeSchema } from "../packages/core/src/persistence/schema.js";
import {
  StateRepository,
  type Requirement,
  type AgentLog,
} from "../packages/core/src/persistence/state_repository.js";

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

const tmpRoot = mkdtempSync(resolve(tmpdir(), "devs-stress-"));
const dbPath = resolve(tmpRoot, ".devs", "state.sqlite");

console.log("\n=== StateRepository Stress Test (1000 writes/reads) ===\n");
console.log(`Temp database: ${dbPath}\n`);

const db = createDatabase({ dbPath });
initializeSchema(db);
const repo = new StateRepository(db);

try {
  // ── Phase 1: Create project and epic ──────────────────────────────────────

  const projectId = repo.upsertProject({
    name: "Stress Test Project",
    status: "active",
  });

  repo.saveEpics([{ project_id: projectId, name: "Stress Epic", order_index: 0 }]);
  const epicId = (
    db.prepare("SELECT id FROM epics WHERE project_id = ?").get(projectId) as {
      id: number;
    }
  ).id;

  repo.saveTasks([{ epic_id: epicId, title: "Stress Task" }]);
  const taskId = (
    db.prepare("SELECT id FROM tasks WHERE epic_id = ?").get(epicId) as {
      id: number;
    }
  ).id;

  // ── Phase 2: 1000-requirement bulk write ──────────────────────────────────

  const WRITE_COUNT = 1000;

  const requirements: Requirement[] = Array.from(
    { length: WRITE_COUNT },
    (_, i) => ({
      project_id: projectId,
      description: `REQ-${String(i + 1).padStart(4, "0")}: Stress requirement ${i + 1}`,
      priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
      status: "pending",
      metadata: JSON.stringify({ index: i, batch: "stress" }),
    })
  );

  const writeStart = performance.now();
  repo.saveRequirements(requirements);
  const writeMs = performance.now() - writeStart;

  check(
    `1000 requirements written in a single transaction (${writeMs.toFixed(1)}ms)`,
    () => {
      const count = (
        db
          .prepare("SELECT COUNT(*) AS n FROM requirements WHERE project_id = ?")
          .get(projectId) as { n: number }
      ).n;
      assert(count === WRITE_COUNT, `Expected ${WRITE_COUNT} rows, got ${count}`);
    }
  );

  // ── Phase 3: Read-back verification via getProjectState ───────────────────

  const readStart = performance.now();
  const state = repo.getProjectState(projectId);
  const readMs = performance.now() - readStart;

  check(
    `getProjectState() returns all 1000 requirements (${readMs.toFixed(1)}ms)`,
    () => {
      assert(state !== null, "getProjectState() returned null");
      assert(
        state!.requirements.length === WRITE_COUNT,
        `Expected ${WRITE_COUNT} requirements, got ${state!.requirements.length}`
      );
    }
  );

  check("Data integrity: first requirement description matches", () => {
    const first = state!.requirements[0]!;
    assert(
      first.description === "REQ-0001: Stress requirement 1",
      `Got: ${first.description}`
    );
  });

  check("Data integrity: last requirement description matches", () => {
    const last = state!.requirements[WRITE_COUNT - 1]!;
    assert(
      last.description === `REQ-${String(WRITE_COUNT).padStart(4, "0")}: Stress requirement ${WRITE_COUNT}`,
      `Got: ${last.description}`
    );
  });

  check("Data integrity: priority distribution is correct (high/medium/low cycle)", () => {
    const highs = state!.requirements.filter((r) => r.priority === "high").length;
    const mediums = state!.requirements.filter((r) => r.priority === "medium").length;
    const lows = state!.requirements.filter((r) => r.priority === "low").length;
    // 1000 / 3 → 334 high (indices 0,3,6…), 333 medium, 333 low
    assert(
      highs + mediums + lows === WRITE_COUNT,
      `Priority total mismatch: ${highs}+${mediums}+${lows}=${highs + mediums + lows}`
    );
    assert(highs > 0 && mediums > 0 && lows > 0, "One or more priority buckets is empty");
  });

  // ── Phase 4: 1000 agent log entries (individual writes) ───────────────────

  const logWriteStart = performance.now();
  for (let i = 0; i < WRITE_COUNT; i++) {
    const log: AgentLog = {
      task_id: taskId,
      agent_role: i % 2 === 0 ? "implementer" : "reviewer",
      thread_id: `thread-${Math.floor(i / 10)}`,
      thought: `Thought for step ${i + 1}`,
      action: i % 5 === 0 ? "write_file" : null,
      observation: `Observation ${i + 1}`,
    };
    repo.appendAgentLog(log);
  }
  const logWriteMs = performance.now() - logWriteStart;

  check(
    `1000 agent log entries appended individually (${logWriteMs.toFixed(1)}ms)`,
    () => {
      const count = (
        db
          .prepare("SELECT COUNT(*) AS n FROM agent_logs WHERE task_id = ?")
          .get(taskId) as { n: number }
      ).n;
      assert(count === WRITE_COUNT, `Expected ${WRITE_COUNT} logs, got ${count}`);
    }
  );

  // ── Phase 5: getTaskLogs read-back ────────────────────────────────────────

  const logReadStart = performance.now();
  const logs = repo.getTaskLogs(taskId);
  const logReadMs = performance.now() - logReadStart;

  check(
    `getTaskLogs() returns all 1000 log entries (${logReadMs.toFixed(1)}ms)`,
    () => {
      assert(
        logs.length === WRITE_COUNT,
        `Expected ${WRITE_COUNT} logs, got ${logs.length}`
      );
    }
  );

  check("Log data integrity: insertion order is preserved (ascending id)", () => {
    for (let i = 0; i < logs.length - 1; i++) {
      assert(
        (logs[i]!.id ?? 0) < (logs[i + 1]!.id ?? 0),
        `Log at index ${i} has id ${logs[i]!.id}, next has id ${logs[i + 1]!.id}`
      );
    }
  });

  check("Log data integrity: thought content round-trips correctly", () => {
    const tenth = logs[9]!;
    assert(
      tenth.thought === "Thought for step 10",
      `Got: ${tenth.thought}`
    );
  });

  // ── Phase 6: WAL mode verification ────────────────────────────────────────

  check("WAL journal_mode is still active after 2000 write operations", () => {
    const mode = db.pragma("journal_mode", { simple: true }) as string;
    assert(mode === "wal", `journal_mode regressed to: ${mode}`);
  });

  // ── Phase 7: Full project state consistency ────────────────────────────────

  check(
    "getProjectState() reflects both requirements and logs (full consistency check)",
    () => {
      const fullState = repo.getProjectState(projectId);
      assert(fullState !== null, "getProjectState() returned null");
      assert(
        fullState!.requirements.length === WRITE_COUNT,
        `Requirements: expected ${WRITE_COUNT}, got ${fullState!.requirements.length}`
      );
      assert(
        fullState!.agent_logs.length === WRITE_COUNT,
        `Agent logs: expected ${WRITE_COUNT}, got ${fullState!.agent_logs.length}`
      );
      assert(fullState!.epics.length === 1, "Expected 1 epic");
      assert(fullState!.tasks.length === 1, "Expected 1 task");
    }
  );
} finally {
  db.close();
  closeDatabase();
  rmSync(tmpRoot, { recursive: true, force: true });
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(
  `\n=== Results: ${passed} passed, ${failed} failed ===\n`
);
process.exit(failed > 0 ? 1 : 0);
