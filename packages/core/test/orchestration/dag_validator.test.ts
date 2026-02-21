/**
 * packages/core/test/orchestration/dag_validator.test.ts
 *
 * Unit tests for DAGValidator (cycle detection) and RefinementFlowValidator
 * (phase-order enforcement) — requirements [9_ROADMAP-REQ-031], [TAS-083].
 */

import { describe, it, expect } from "vitest";
import {
  DAGValidator,
  DAGCycleError,
  RefinementFlowValidator,
  RefinementFlowViolationError,
  type TaskNode,
  type PhaseTaskNode,
  type RefinementPhase,
} from "../../src/orchestration/DAGValidator.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function task(taskId: string, dependsOn: string[] = []): TaskNode {
  return { taskId, dependsOn };
}

function phaseTask(
  taskId: string,
  phase: RefinementPhase,
  dependsOn: string[] = [],
): PhaseTaskNode {
  return { taskId, phase, dependsOn };
}

// ── DAGValidator — detectCycles ───────────────────────────────────────────────

describe("DAGValidator.detectCycles", () => {
  // Simple acyclic graph
  it("returns hasCycle=false for a simple acyclic graph", () => {
    const tasks = [task("A"), task("B", ["A"]), task("C", ["B"])];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(false);
    expect(result.cycle).toBeUndefined();
  });

  // Diamond-shaped acyclic graph
  it("returns hasCycle=false for a diamond-shaped acyclic graph", () => {
    const tasks = [
      task("A"),
      task("B", ["A"]),
      task("C", ["A"]),
      task("D", ["B", "C"]),
    ];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(false);
  });

  // Direct cycle: A → B → A
  it("returns hasCycle=true for a direct cycle (A → B → A)", () => {
    const tasks = [task("A", ["B"]), task("B", ["A"])];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toBeDefined();
    expect(result.cycle!.length).toBeGreaterThanOrEqual(2);
    // Both A and B should be in the cycle
    expect(result.cycle!).toContain("A");
    expect(result.cycle!).toContain("B");
  });

  // Complex cycle: A → B → C → A
  it("returns hasCycle=true for a complex cycle (A → B → C → A)", () => {
    const tasks = [task("A", ["B"]), task("B", ["C"]), task("C", ["A"])];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle).toBeDefined();
    expect(result.cycle!.length).toBeGreaterThanOrEqual(3);
    expect(result.cycle!).toContain("A");
    expect(result.cycle!).toContain("B");
    expect(result.cycle!).toContain("C");
  });

  // Disconnected but acyclic graph
  it("returns hasCycle=false for a disconnected but acyclic graph", () => {
    const tasks = [
      task("A"),
      task("B", ["A"]),
      // Disconnected component
      task("X"),
      task("Y", ["X"]),
      task("Z", ["Y"]),
    ];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(false);
  });

  // Cycle in one component, acyclic in another
  it("detects cycle in one component even when another is acyclic", () => {
    const tasks = [
      task("A"),
      task("B", ["A"]),
      // Separate cyclic component
      task("X", ["Y"]),
      task("Y", ["X"]),
    ];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle!).toContain("X");
    expect(result.cycle!).toContain("Y");
  });

  // Self-loop: A → A
  it("detects a self-loop (A → A)", () => {
    const tasks = [task("A", ["A"]), task("B")];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle!).toContain("A");
  });

  // Empty graph
  it("returns hasCycle=false for an empty graph", () => {
    const result = DAGValidator.detectCycles([]);
    expect(result.hasCycle).toBe(false);
  });

  // Single node
  it("returns hasCycle=false for a single-node graph", () => {
    const result = DAGValidator.detectCycles([task("A")]);
    expect(result.hasCycle).toBe(false);
  });

  // Long chain
  it("returns hasCycle=false for a long linear chain", () => {
    const tasks = Array.from({ length: 20 }, (_, i) =>
      task(`T${i}`, i > 0 ? [`T${i - 1}`] : []),
    );
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(false);
  });

  // 4-node cycle
  it("detects a 4-node cycle (A → B → C → D → A)", () => {
    const tasks = [
      task("A", ["B"]),
      task("B", ["C"]),
      task("C", ["D"]),
      task("D", ["A"]),
    ];
    const result = DAGValidator.detectCycles(tasks);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle!).toContain("A");
  });
});

// ── DAGValidator — validate ───────────────────────────────────────────────────

describe("DAGValidator.validate", () => {
  it("does not throw for a valid acyclic graph", () => {
    const tasks = [task("A"), task("B", ["A"]), task("C", ["A", "B"])];
    expect(() => DAGValidator.validate(tasks)).not.toThrow();
  });

  it("throws DAGCycleError for a graph with a cycle", () => {
    const tasks = [task("A", ["B"]), task("B", ["C"]), task("C", ["A"])];
    expect(() => DAGValidator.validate(tasks)).toThrow(DAGCycleError);
  });

  it("includes the cycle nodes in the DAGCycleError message", () => {
    const tasks = [task("A", ["B"]), task("B", ["A"])];
    let error: DAGCycleError | undefined;
    try {
      DAGValidator.validate(tasks);
    } catch (e) {
      error = e as DAGCycleError;
    }
    expect(error).toBeInstanceOf(DAGCycleError);
    expect(error!.message).toContain("A");
    expect(error!.message).toContain("B");
    expect(error!.cycleNodes).toContain("A");
    expect(error!.cycleNodes).toContain("B");
  });

  it("throws DAGCycleError with cycle nodes accessible on the error object", () => {
    const tasks = [task("X", ["Y"]), task("Y", ["Z"]), task("Z", ["X"])];
    let error: DAGCycleError | undefined;
    try {
      DAGValidator.validate(tasks);
    } catch (e) {
      error = e as DAGCycleError;
    }
    expect(error).toBeInstanceOf(DAGCycleError);
    expect(Array.isArray(error!.cycleNodes)).toBe(true);
    expect(error!.cycleNodes.length).toBeGreaterThanOrEqual(3);
  });
});

// ── DAGValidator — validateAdjacencyList ─────────────────────────────────────

describe("DAGValidator.validateAdjacencyList", () => {
  it("validates a plain adjacency list (Map<string, string[]>)", () => {
    const graph = new Map<string, string[]>([
      ["A", []],
      ["B", ["A"]],
      ["C", ["B"]],
    ]);
    expect(() => DAGValidator.validateAdjacencyList(graph)).not.toThrow();
  });

  it("throws for a cyclic adjacency list", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B"]],
      ["B", ["C"]],
      ["C", ["A"]],
    ]);
    expect(() => DAGValidator.validateAdjacencyList(graph)).toThrow(
      DAGCycleError,
    );
  });

  it("handles an empty adjacency list", () => {
    const graph = new Map<string, string[]>();
    expect(() => DAGValidator.validateAdjacencyList(graph)).not.toThrow();
  });
});

// ── DAGValidator — detectCycles (via adjacency list) ─────────────────────────

describe("DAGValidator.detectCyclesInAdjacencyList", () => {
  it("returns hasCycle=false for an acyclic adjacency list", () => {
    const graph = new Map<string, string[]>([
      ["A", []],
      ["B", ["A"]],
    ]);
    const result = DAGValidator.detectCyclesInAdjacencyList(graph);
    expect(result.hasCycle).toBe(false);
  });

  it("returns hasCycle=true for a cyclic adjacency list", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B"]],
      ["B", ["A"]],
    ]);
    const result = DAGValidator.detectCyclesInAdjacencyList(graph);
    expect(result.hasCycle).toBe(true);
    expect(result.cycle!).toContain("A");
    expect(result.cycle!).toContain("B");
  });
});

// ── RefinementFlowValidator ───────────────────────────────────────────────────

describe("RefinementFlowValidator", () => {
  // The defined milestone order:
  // expansion → compression → decomposition → execution → verification

  it("passes for tasks with dependencies only in the same phase", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("A", "expansion"),
      phaseTask("B", "expansion", ["A"]),
      phaseTask("C", "compression", ["B"]),
    ];
    expect(() => RefinementFlowValidator.validate(tasks)).not.toThrow();
  });

  it("passes for a full forward-flowing task set", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("research-1", "expansion"),
      phaseTask("research-2", "expansion", ["research-1"]),
      phaseTask("design-1", "compression", ["research-1"]),
      phaseTask("distill-1", "decomposition", ["design-1"]),
      phaseTask("impl-1", "execution", ["distill-1"]),
      phaseTask("verify-1", "verification", ["impl-1"]),
    ];
    expect(() => RefinementFlowValidator.validate(tasks)).not.toThrow();
  });

  it("passes for an empty task list", () => {
    expect(() => RefinementFlowValidator.validate([])).not.toThrow();
  });

  it("fails when a task depends on a task in a LATER phase (backward dependency)", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("research-1", "expansion"),
      phaseTask("design-1", "compression"),
      // Backward: expansion task depends on compression task
      phaseTask("research-2", "expansion", ["design-1"]),
    ];
    expect(() => RefinementFlowValidator.validate(tasks)).toThrow(
      RefinementFlowViolationError,
    );
  });

  it("fails when execution task depends on a verification task (forward jump)", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("verify-1", "verification"),
      // Backward: execution task depends on verification task
      phaseTask("impl-1", "execution", ["verify-1"]),
    ];
    expect(() => RefinementFlowValidator.validate(tasks)).toThrow(
      RefinementFlowViolationError,
    );
  });

  it("fails when compression depends on decomposition (backward violation)", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("distill-1", "decomposition"),
      // Backward: compression task depending on decomposition
      phaseTask("design-1", "compression", ["distill-1"]),
    ];
    expect(() => RefinementFlowValidator.validate(tasks)).toThrow(
      RefinementFlowViolationError,
    );
  });

  it("includes the violating task IDs in the error", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("verify-task", "verification"),
      phaseTask("impl-task", "execution", ["verify-task"]),
    ];
    let error: RefinementFlowViolationError | undefined;
    try {
      RefinementFlowValidator.validate(tasks);
    } catch (e) {
      error = e as RefinementFlowViolationError;
    }
    expect(error).toBeInstanceOf(RefinementFlowViolationError);
    expect(error!.message).toContain("impl-task");
    expect(error!.violations.length).toBeGreaterThan(0);
  });

  it("collects ALL violations rather than stopping at the first one", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("verify-1", "verification"),
      phaseTask("verify-2", "verification"),
      // Two backward violations
      phaseTask("impl-1", "execution", ["verify-1"]),
      phaseTask("impl-2", "execution", ["verify-2"]),
    ];
    let error: RefinementFlowViolationError | undefined;
    try {
      RefinementFlowValidator.validate(tasks);
    } catch (e) {
      error = e as RefinementFlowViolationError;
    }
    expect(error).toBeInstanceOf(RefinementFlowViolationError);
    expect(error!.violations.length).toBeGreaterThanOrEqual(2);
  });

  it("returns an array of violations from check() without throwing", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("verify-1", "verification"),
      phaseTask("impl-1", "execution", ["verify-1"]),
    ];
    const violations = RefinementFlowValidator.check(tasks);
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]!.taskId).toBe("impl-1");
    expect(violations[0]!.dependencyId).toBe("verify-1");
  });

  it("returns an empty array from check() for a valid task set", () => {
    const tasks: PhaseTaskNode[] = [
      phaseTask("A", "expansion"),
      phaseTask("B", "compression", ["A"]),
    ];
    const violations = RefinementFlowValidator.check(tasks);
    expect(violations).toHaveLength(0);
  });
});

// ── PHASE_ORDER constant ──────────────────────────────────────────────────────

describe("PHASE_ORDER", () => {
  it("exports the correct phase order constant", async () => {
    const { PHASE_ORDER } = await import(
      "../../src/orchestration/DAGValidator.js"
    );
    expect(PHASE_ORDER).toEqual([
      "expansion",
      "compression",
      "decomposition",
      "execution",
      "verification",
    ]);
  });
});
