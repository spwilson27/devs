/**
 * packages/core/src/orchestration/DAGValidator.ts
 *
 * DAG cycle detection and refinement flow validation for the devs orchestration
 * engine.
 *
 * ## DAGValidator
 *
 * Implements Depth-First Search (DFS) cycle detection in O(V+E) time. Uses the
 * classic three-color node marking:
 * - WHITE (0) — unvisited.
 * - GRAY  (1) — currently on the DFS stack (being explored).
 * - BLACK (2) — fully explored (no cycle reachable from here).
 *
 * A GRAY → GRAY back-edge indicates a cycle. The algorithm traces the exact
 * nodes forming the cycle and reports them in `DAGCycleError.cycleNodes`.
 *
 * `DAGValidator.validate()` throws `DAGCycleError` if any cycle is detected.
 * This method is called by the `distillNode` integration point (see below) to
 * guarantee that every generated task graph is valid before being persisted
 * to SQLite.
 *
 * ## RefinementFlowValidator
 *
 * Validates that the generated task DAG respects the mandatory forward-only
 * phase ordering:
 *
 *   expansion → compression → decomposition → execution → verification
 *
 * A task in phase N must not depend on a task in phase M where M > N
 * (backward / retrograde dependency). Such violations would cause the
 * orchestrator to attempt implementing a later-phase task before an
 * earlier-phase task that it depends on, breaking the pipeline invariant.
 *
 * Cross-phase backward dependencies surfaced by `RefinementFlowValidator` are
 * distinct from intra-graph cyclical loops (e.g., verify → implement retry
 * loop) which are explicitly allowed in the LangGraph topology.
 *
 * `RefinementFlowValidator.validate()` throws `RefinementFlowViolationError`
 * with the complete list of violations. `check()` returns the violations
 * without throwing, for non-fatal inspection.
 *
 * ## Integration
 *
 * Both validators should be invoked inside the `distillNode` (or the
 * DistillerAgent that produces the task graph) before the tasks are written
 * to SQLite. Validation errors are logged to the `agent_logs` table via the
 * calling node's error-routing contract (see `robustness.ts`).
 *
 * Requirements: [9_ROADMAP-REQ-031], [TAS-083]
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Minimal representation of a task node in the DAG.
 * Matches the subset of `TaskRecord` required for cycle detection.
 */
export interface TaskNode {
  /** Unique task identifier. */
  taskId: string;
  /** IDs of tasks that must complete before this one (directed edges). */
  dependsOn: readonly string[];
}

/**
 * The ordered refinement phases (milestones) in the devs pipeline.
 *
 * - `expansion`     — Research / discovery (researchNode)
 * - `compression`   — Design / specification (designNode)
 * - `decomposition` — Planning / distillation (distillNode)
 * - `execution`     — TDD implementation (implementNode)
 * - `verification`  — Testing / validation (verifyNode)
 */
export type RefinementPhase =
  | "expansion"
  | "compression"
  | "decomposition"
  | "execution"
  | "verification";

/**
 * Canonical ordering of refinement phases.
 * Index 0 is earliest; index 4 is latest.
 * Dependencies must only flow from equal or lower index to equal or higher index.
 */
export const PHASE_ORDER: readonly RefinementPhase[] = [
  "expansion",
  "compression",
  "decomposition",
  "execution",
  "verification",
] as const;

/**
 * A task node that also carries its refinement phase membership.
 * Used by `RefinementFlowValidator`.
 */
export interface PhaseTaskNode extends TaskNode {
  /** The refinement phase this task belongs to. */
  phase: RefinementPhase;
}

/**
 * Result of a cycle-detection pass.
 */
export interface CycleDetectionResult {
  /** `true` if at least one cycle was found. */
  hasCycle: boolean;
  /**
   * The task IDs that form the cycle path, in order.
   * Only present when `hasCycle` is `true`.
   * The last element is the node whose back-edge closes the cycle (repeated at
   * the end to make the cycle explicit, e.g. ["A", "B", "C", "A"]).
   */
  cycle?: string[];
}

/**
 * A single refinement-flow violation.
 */
export interface FlowViolation {
  /** The task that has an illegal backward dependency. */
  taskId: string;
  /** The phase of the violating task. */
  taskPhase: RefinementPhase;
  /** The dependency that lives in a later phase. */
  dependencyId: string;
  /** The phase of the dependency (later than `taskPhase`). */
  dependencyPhase: RefinementPhase;
}

// ── Custom error classes ──────────────────────────────────────────────────────

/**
 * Thrown by `DAGValidator.validate()` when a cycle is detected in the task DAG.
 *
 * The `cycleNodes` property contains the full cycle path for debugging.
 */
export class DAGCycleError extends Error {
  readonly cycleNodes: readonly string[];

  constructor(cycleNodes: readonly string[]) {
    const path = cycleNodes.join(" → ");
    super(
      `Cycle detected in task DAG: ${path}. ` +
        `All task dependencies must form a directed acyclic graph. ` +
        `Tasks involved: [${cycleNodes.join(", ")}]`,
    );
    this.name = "DAGCycleError";
    this.cycleNodes = cycleNodes;
  }
}

/**
 * Thrown by `RefinementFlowValidator.validate()` when one or more tasks have
 * dependencies that violate the mandatory forward-only phase ordering.
 *
 * The `violations` array contains the full list of violations.
 */
export class RefinementFlowViolationError extends Error {
  readonly violations: readonly FlowViolation[];

  constructor(violations: readonly FlowViolation[]) {
    const summary = violations
      .map(
        (v) =>
          `Task '${v.taskId}' (${v.taskPhase}) → '${v.dependencyId}' (${v.dependencyPhase})`,
      )
      .join("; ");
    super(
      `Refinement flow violations detected: ${violations.length} backward ` +
        `dependencies violate the mandatory phase order ` +
        `(expansion→compression→decomposition→execution→verification). ` +
        `Violations: ${summary}`,
    );
    this.name = "RefinementFlowViolationError";
    this.violations = violations;
  }
}

// ── DAGValidator ──────────────────────────────────────────────────────────────

/**
 * Validates that a task graph is a Directed Acyclic Graph (DAG).
 *
 * All public methods are static — no instantiation is needed.
 *
 * ## Algorithm
 *
 * Uses iterative DFS with a recursion stack (represented as a Set) to avoid
 * stack-overflow on deep graphs. Complexity: O(V+E).
 *
 * ## Integration
 *
 * Call `DAGValidator.validate(tasks)` before persisting a task graph to SQLite.
 * It is the caller's responsibility to catch `DAGCycleError` and route to the
 * error-recovery node (see `robustness.ts`) so the violation is logged to
 * `agent_logs`.
 */
export class DAGValidator {
  // Node colors for DFS
  static readonly WHITE = 0; // unvisited
  static readonly GRAY = 1; // on the current DFS stack
  static readonly BLACK = 2; // fully explored

  /**
   * Detects cycles in a task array using iterative DFS.
   *
   * Builds an adjacency map internally from the `TaskNode[]` input.
   * Complexity: O(V+E).
   *
   * @param tasks - Array of task nodes with their dependency edges.
   * @returns A `CycleDetectionResult` describing whether a cycle was found,
   *   and the cycle path if one exists.
   */
  static detectCycles(tasks: TaskNode[]): CycleDetectionResult {
    const adj = new Map<string, string[]>();
    for (const t of tasks) {
      adj.set(t.taskId, [...t.dependsOn]);
    }
    return DAGValidator._dfs(adj);
  }

  /**
   * Detects cycles in a plain adjacency list.
   *
   * @param graph - Map from node ID to the list of node IDs it depends on
   *   (i.e., directed edges point from dependent → dependency).
   * @returns A `CycleDetectionResult`.
   */
  static detectCyclesInAdjacencyList(
    graph: Map<string, string[]>,
  ): CycleDetectionResult {
    return DAGValidator._dfs(graph);
  }

  /**
   * Validates that the task array forms a DAG. Throws `DAGCycleError` if any
   * cycle is detected, identifying the specific tasks involved.
   *
   * @param tasks - Array of task nodes.
   * @throws DAGCycleError if the graph contains a cycle.
   */
  static validate(tasks: TaskNode[]): void {
    const result = DAGValidator.detectCycles(tasks);
    if (result.hasCycle) {
      throw new DAGCycleError(result.cycle ?? []);
    }
  }

  /**
   * Validates a plain adjacency list. Throws `DAGCycleError` if any cycle is
   * detected.
   *
   * @param graph - Map from node ID to dependent node IDs.
   * @throws DAGCycleError if the graph contains a cycle.
   */
  static validateAdjacencyList(graph: Map<string, string[]>): void {
    const result = DAGValidator.detectCyclesInAdjacencyList(graph);
    if (result.hasCycle) {
      throw new DAGCycleError(result.cycle ?? []);
    }
  }

  // ── Private DFS implementation ─────────────────────────────────────────────

  /**
   * Core iterative DFS cycle-detection implementation.
   *
   * Uses explicit stack-based DFS (rather than true recursion) to handle
   * arbitrarily deep graphs without risking call-stack overflow.
   *
   * The algorithm simulates the "enter node" / "exit node" events using a
   * two-phase stack entry: the first time we see `done=false`, we color the
   * node GRAY (enter event) and flip the flag to `done=true`; the second time
   * we see the same entry with `done=true`, we color it BLACK (exit event).
   *
   * When the same node is reachable from multiple predecessors, it may be
   * pushed onto the stack more than once. Stale entries (where the node is
   * already GRAY or BLACK when re-encountered with `done=false`) are discarded
   * immediately so each node is entered and exited exactly once, preserving the
   * O(V+E) guarantee.
   */
  private static _dfs(graph: Map<string, string[]>): CycleDetectionResult {
    // Collect all node IDs (including dependency-only nodes not in the map keys)
    const allNodes = new Set<string>(graph.keys());
    for (const deps of graph.values()) {
      for (const dep of deps) {
        allNodes.add(dep);
      }
    }

    const color = new Map<string, number>();
    for (const node of allNodes) {
      color.set(node, DAGValidator.WHITE);
    }

    for (const start of allNodes) {
      if (color.get(start) !== DAGValidator.WHITE) continue;

      // DFS stack: each entry is [nodeId, done]
      // "done" = true means we're popping BACK from this node (color → BLACK)
      const stack: Array<[string, boolean]> = [[start, false]];

      while (stack.length > 0) {
        const top = stack[stack.length - 1]!;
        const [node, done] = top;

        if (done) {
          // Exit event: mark fully explored
          color.set(node, DAGValidator.BLACK);
          stack.pop();
          continue;
        }

        if (color.get(node) !== DAGValidator.WHITE) {
          // Stale stack entry: this node was pushed multiple times (diamond or
          // multi-predecessor pattern) and has already been entered (GRAY) or
          // fully explored (BLACK) via an earlier entry. Discard without
          // re-processing so each node is entered exactly once.
          stack.pop();
          continue;
        }

        // Enter event: mark as being explored (on the current DFS path)
        color.set(node, DAGValidator.GRAY);
        // Flip to "done" so the next time we pop this node, we exit it
        top[1] = true;

        for (const dep of graph.get(node) ?? []) {
          if (color.get(dep) === DAGValidator.GRAY) {
            // Back-edge: dep is currently on the DFS path → cycle detected
            return {
              hasCycle: true,
              cycle: DAGValidator._reconstructCycle(stack, dep),
            };
          }
          if (color.get(dep) === DAGValidator.WHITE) {
            stack.push([dep, false]);
          }
          // BLACK: already fully explored — no cycle reachable, skip.
          // undefined: dep not in graph (leaf node already in allNodes as WHITE,
          // handled by the WHITE branch above on next encounter).
        }
      }
    }

    return { hasCycle: false };
  }

  /**
   * Reconstructs the cycle path from the current DFS stack.
   *
   * Scans the stack from bottom to top and collects every entry from
   * `cycleHead` onward. The stack at cycle-detection time contains only GRAY
   * nodes (the current DFS path), so all collected entries are on the cycle
   * path. The cycle is closed by appending `cycleHead` again.
   *
   * @param stack     - The current DFS stack (each entry is [nodeId, done]).
   * @param cycleHead - The GRAY node that the back-edge points to (cycle start).
   * @returns The cycle as a list of node IDs, starting and ending at `cycleHead`.
   */
  private static _reconstructCycle(
    stack: Array<[string, boolean]>,
    cycleHead: string,
  ): string[] {
    const path: string[] = [];
    let inCycle = false;
    for (const [node] of stack) {
      if (node === cycleHead) inCycle = true;
      if (inCycle) path.push(node);
    }
    // Close the cycle by appending cycleHead again
    path.push(cycleHead);
    return path;
  }
}

// ── RefinementFlowValidator ───────────────────────────────────────────────────

/**
 * Validates that the task DAG respects the mandatory forward-only phase ordering.
 *
 * The phase order is:
 *   expansion → compression → decomposition → execution → verification
 *
 * A task in phase N must not have a dependency on a task in phase M where M > N.
 * Such backward dependencies violate the pipeline ordering invariant and would
 * cause the orchestrator to attempt tasks in the wrong sequence.
 *
 * Note: intra-graph cyclical loops in LangGraph (e.g., verify → implement
 * retry) are at the graph-topology level and are NOT the same as task-DAG
 * backward dependencies. This validator only concerns the task dependency DAG.
 *
 * All public methods are static — no instantiation is needed.
 */
export class RefinementFlowValidator {
  /**
   * Returns the numeric index of a phase in the canonical `PHASE_ORDER`.
   * Lower index = earlier phase.
   */
  private static _phaseIndex(phase: RefinementPhase): number {
    return PHASE_ORDER.indexOf(phase);
  }

  /**
   * Checks the task list for flow violations without throwing.
   *
   * @param tasks - Phase-annotated task nodes.
   * @returns Array of `FlowViolation` records. Empty array if no violations found.
   */
  static check(tasks: PhaseTaskNode[]): FlowViolation[] {
    // Build a phase lookup map for O(1) dependency phase resolution
    const phaseOf = new Map<string, RefinementPhase>();
    for (const t of tasks) {
      phaseOf.set(t.taskId, t.phase);
    }

    const violations: FlowViolation[] = [];

    for (const task of tasks) {
      const taskIndex = RefinementFlowValidator._phaseIndex(task.phase);
      for (const depId of task.dependsOn) {
        const depPhase = phaseOf.get(depId);
        if (depPhase === undefined) {
          // Dependency references an unknown task — skip (DAGValidator handles
          // reference errors; this validator only checks ordering).
          continue;
        }
        const depIndex = RefinementFlowValidator._phaseIndex(depPhase);
        if (depIndex > taskIndex) {
          // Backward dependency: task depends on a later-phase task
          violations.push({
            taskId: task.taskId,
            taskPhase: task.phase,
            dependencyId: depId,
            dependencyPhase: depPhase,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Validates that no task has a backward dependency (depending on a later phase).
   * Throws `RefinementFlowViolationError` with all violations if any are found.
   *
   * @param tasks - Phase-annotated task nodes.
   * @throws RefinementFlowViolationError if any flow violations are found.
   */
  static validate(tasks: PhaseTaskNode[]): void {
    const violations = RefinementFlowValidator.check(tasks);
    if (violations.length > 0) {
      throw new RefinementFlowViolationError(violations);
    }
  }
}
