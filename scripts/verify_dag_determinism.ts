/**
 * scripts/verify_dag_determinism.ts
 *
 * Standalone verification script for DAG cycle detection and refinement flow
 * validation (requirements: [9_ROADMAP-REQ-031], [TAS-083]).
 *
 * Attempts to insert a cyclic task dependency into a test SQLite database and
 * verifies that DAGValidator throws a DAGCycleError.
 *
 * Also verifies the RefinementFlowValidator catches backward phase dependencies.
 *
 * Run with:
 *   npx tsx scripts/verify_dag_determinism.ts
 *
 * Exit code 0 = all checks passed.
 * Exit code 1 = one or more checks failed.
 */

import { tmpdir } from "os";
import { join } from "path";
import { mkdtempSync, rmSync } from "fs";
import Database from "better-sqlite3";
import {
  DAGValidator,
  DAGCycleError,
  RefinementFlowValidator,
  RefinementFlowViolationError,
  type TaskNode,
  type PhaseTaskNode,
} from "../packages/core/src/orchestration/DAGValidator.js";
import { initializeSchema } from "../packages/core/src/persistence/schema.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function check(label: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${label}`);
    console.error(`    ${message}`);
    failed++;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// ── Section 1: DAGValidator — acyclic cases ───────────────────────────────────

async function main(): Promise<void> {
  console.log("\n=== verify_dag_determinism.ts ===\n");

  // ── Section 1: DAGValidator — acyclic graphs (must NOT throw) ──────────────
  console.log("Section 1: DAGValidator — acyclic graphs");

  check("simple 3-node chain is acyclic", () => {
    const tasks: TaskNode[] = [
      { taskId: "A", dependsOn: [] },
      { taskId: "B", dependsOn: ["A"] },
      { taskId: "C", dependsOn: ["B"] },
    ];
    DAGValidator.validate(tasks);
  });

  check("diamond-shaped acyclic graph passes", () => {
    const tasks: TaskNode[] = [
      { taskId: "A", dependsOn: [] },
      { taskId: "B", dependsOn: ["A"] },
      { taskId: "C", dependsOn: ["A"] },
      { taskId: "D", dependsOn: ["B", "C"] },
    ];
    DAGValidator.validate(tasks);
  });

  check("disconnected acyclic graph passes", () => {
    const tasks: TaskNode[] = [
      { taskId: "A", dependsOn: [] },
      { taskId: "B", dependsOn: ["A"] },
      { taskId: "X", dependsOn: [] },
      { taskId: "Y", dependsOn: ["X"] },
    ];
    DAGValidator.validate(tasks);
  });

  check("empty task list passes validation", () => {
    DAGValidator.validate([]);
  });

  // ── Section 2: DAGValidator — cyclic graphs (MUST throw DAGCycleError) ──────
  console.log("\nSection 2: DAGValidator — cyclic graphs");

  check("direct cycle (A → B → A) throws DAGCycleError", () => {
    const tasks: TaskNode[] = [
      { taskId: "A", dependsOn: ["B"] },
      { taskId: "B", dependsOn: ["A"] },
    ];
    let threw = false;
    try {
      DAGValidator.validate(tasks);
    } catch (e) {
      if (e instanceof DAGCycleError) {
        threw = true;
        assert(e.cycleNodes.includes("A"), "cycle should include A");
        assert(e.cycleNodes.includes("B"), "cycle should include B");
      }
    }
    assert(threw, "DAGCycleError was not thrown for direct cycle");
  });

  check("complex cycle (A → B → C → A) throws DAGCycleError", () => {
    const tasks: TaskNode[] = [
      { taskId: "A", dependsOn: ["B"] },
      { taskId: "B", dependsOn: ["C"] },
      { taskId: "C", dependsOn: ["A"] },
    ];
    let threw = false;
    try {
      DAGValidator.validate(tasks);
    } catch (e) {
      if (e instanceof DAGCycleError) {
        threw = true;
        assert(e.cycleNodes.length >= 3, "cycle should have at least 3 nodes");
        assert(e.message.includes("A"), "error message should mention A");
      }
    }
    assert(threw, "DAGCycleError was not thrown for 3-node cycle");
  });

  check("self-loop (A → A) throws DAGCycleError", () => {
    const tasks: TaskNode[] = [{ taskId: "A", dependsOn: ["A"] }];
    let threw = false;
    try {
      DAGValidator.validate(tasks);
    } catch (e) {
      if (e instanceof DAGCycleError) {
        threw = true;
      }
    }
    assert(threw, "DAGCycleError was not thrown for self-loop");
  });

  check("4-node cycle (A→B→C→D→A) throws DAGCycleError", () => {
    const tasks: TaskNode[] = [
      { taskId: "A", dependsOn: ["B"] },
      { taskId: "B", dependsOn: ["C"] },
      { taskId: "C", dependsOn: ["D"] },
      { taskId: "D", dependsOn: ["A"] },
    ];
    let threw = false;
    try {
      DAGValidator.validate(tasks);
    } catch (e) {
      if (e instanceof DAGCycleError) {
        threw = true;
      }
    }
    assert(threw, "DAGCycleError was not thrown for 4-node cycle");
  });

  // ── Section 3: DAGValidator — adjacency list API ──────────────────────────
  console.log("\nSection 3: DAGValidator — adjacency list API");

  check("validateAdjacencyList passes for acyclic graph", () => {
    const graph = new Map<string, string[]>([
      ["A", []],
      ["B", ["A"]],
      ["C", ["B"]],
    ]);
    DAGValidator.validateAdjacencyList(graph);
  });

  check("validateAdjacencyList throws DAGCycleError for cyclic graph", () => {
    const graph = new Map<string, string[]>([
      ["X", ["Y"]],
      ["Y", ["Z"]],
      ["Z", ["X"]],
    ]);
    let threw = false;
    try {
      DAGValidator.validateAdjacencyList(graph);
    } catch (e) {
      if (e instanceof DAGCycleError) {
        threw = true;
      }
    }
    assert(threw, "DAGCycleError was not thrown for cyclic adjacency list");
  });

  // ── Section 4: SQLite Integration — cyclic insert is caught ───────────────
  console.log("\nSection 4: SQLite integration — cyclic task graph caught before persist");

  const tmpDir = mkdtempSync(join(tmpdir(), "devs-dag-verify-"));
  const dbPath = join(tmpDir, "test.sqlite");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initializeSchema(db);

  check("cyclic task graph is caught before any INSERT", () => {
    const cyclicTasks: TaskNode[] = [
      { taskId: "task-alpha", dependsOn: ["task-beta"] },
      { taskId: "task-beta", dependsOn: ["task-gamma"] },
      { taskId: "task-gamma", dependsOn: ["task-alpha"] },
    ];

    let dagError: DAGCycleError | undefined;
    try {
      DAGValidator.validate(cyclicTasks);
    } catch (e) {
      if (e instanceof DAGCycleError) {
        dagError = e;
      }
    }
    assert(dagError !== undefined, "DAGCycleError should have been thrown");
    assert(
      dagError!.cycleNodes.includes("task-alpha"),
      "cycle should include task-alpha",
    );

    // Verify no tasks were inserted
    const count = (
      db.prepare("SELECT COUNT(*) as cnt FROM tasks").get() as { cnt: number }
    ).cnt;
    assert(count === 0, `Expected 0 tasks in DB, found ${count}`);
  });

  check("valid task graph can be inserted after passing validation", () => {
    const validTasks: TaskNode[] = [
      { taskId: "task-1", dependsOn: [] },
      { taskId: "task-2", dependsOn: ["task-1"] },
      { taskId: "task-3", dependsOn: ["task-1", "task-2"] },
    ];

    // Validate first (no throw expected)
    DAGValidator.validate(validTasks);

    // Insert a project and epic to satisfy FK constraints
    db.prepare(
      `INSERT INTO projects (id, name, status)
       VALUES (1, 'test', 'planning')`,
    ).run();
    db.prepare(
      `INSERT INTO epics (id, project_id, name, status)
       VALUES (1, 1, 'epic-1', 'active')`,
    ).run();

    // Insert tasks (title is the NOT NULL column in this schema version)
    const insertTask = db.prepare(
      `INSERT INTO tasks (epic_id, title, description, status)
       VALUES (1, ?, 'desc', 'pending')`,
    );
    const insertAll = db.transaction(() => {
      for (const t of validTasks) {
        insertTask.run(t.taskId);
      }
    });
    insertAll();

    const count = (
      db.prepare("SELECT COUNT(*) as cnt FROM tasks").get() as { cnt: number }
    ).cnt;
    assert(count === 3, `Expected 3 tasks in DB, found ${count}`);
  });

  db.close();
  rmSync(tmpDir, { recursive: true });

  // ── Section 5: RefinementFlowValidator ────────────────────────────────────
  console.log("\nSection 5: RefinementFlowValidator — phase ordering");

  check("forward-only dependencies pass validation", () => {
    const tasks: PhaseTaskNode[] = [
      { taskId: "r1", phase: "expansion", dependsOn: [] },
      { taskId: "d1", phase: "compression", dependsOn: ["r1"] },
      { taskId: "p1", phase: "decomposition", dependsOn: ["d1"] },
      { taskId: "i1", phase: "execution", dependsOn: ["p1"] },
      { taskId: "v1", phase: "verification", dependsOn: ["i1"] },
    ];
    RefinementFlowValidator.validate(tasks);
  });

  check("backward dependency (execution depends on verification) throws RefinementFlowViolationError", () => {
    const tasks: PhaseTaskNode[] = [
      { taskId: "verify-1", phase: "verification", dependsOn: [] },
      { taskId: "impl-1", phase: "execution", dependsOn: ["verify-1"] },
    ];
    let threw = false;
    try {
      RefinementFlowValidator.validate(tasks);
    } catch (e) {
      if (e instanceof RefinementFlowViolationError) {
        threw = true;
        assert(
          e.violations.length >= 1,
          "should have at least 1 violation",
        );
        assert(
          e.violations[0]!.taskId === "impl-1",
          "violation should be for impl-1",
        );
      }
    }
    assert(threw, "RefinementFlowViolationError was not thrown");
  });

  check("check() returns violations without throwing", () => {
    const tasks: PhaseTaskNode[] = [
      { taskId: "v1", phase: "verification", dependsOn: [] },
      { taskId: "i1", phase: "execution", dependsOn: ["v1"] },
    ];
    const violations = RefinementFlowValidator.check(tasks);
    assert(violations.length > 0, "should have violations");
    assert(violations[0]!.dependencyPhase === "verification", "dep phase should be verification");
    assert(violations[0]!.taskPhase === "execution", "task phase should be execution");
  });

  check("check() returns empty array for a valid task set", () => {
    const tasks: PhaseTaskNode[] = [
      { taskId: "r1", phase: "expansion", dependsOn: [] },
      { taskId: "d1", phase: "compression", dependsOn: ["r1"] },
    ];
    const violations = RefinementFlowValidator.check(tasks);
    assert(violations.length === 0, "should have no violations");
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
