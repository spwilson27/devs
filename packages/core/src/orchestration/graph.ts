/**
 * packages/core/src/orchestration/graph.ts
 *
 * Implements the devs OrchestrationGraph — a cyclical LangGraph StateGraph
 * that drives the full pipeline from project discovery through TDD implementation.
 *
 * ## Pipeline topology
 *
 * ```
 * START → researchNode → designNode → approveDesign ──────────────────────────────┐
 *                             ↑               │ approved                           │ rejected
 *                             └───────────────┘                                   │
 *                                             ↓                                   │
 *                                        distillNode → approveTaskDag ────────────┤
 *                                             ↑               │ approved          │ rejected
 *                                             └───────────────┘                   │
 *                                                             ↓                   │
 *                                                        implementNode → verifyNode
 *                                                             ↑               │
 *                                                             └── implement ◄──┤  (task failed — retry)
 *                                                                              │
 *                                                                   distill ◄──┤  (task passed, epics remain)
 *                                                                              │
 *                                                                             END  (all epics complete)
 * ```
 *
 * ## Nodes
 *
 * All node implementations are stubs that perform the minimal state updates
 * needed to advance the pipeline. Full implementations will be added in
 * later phases as the agent system is built out.
 *
 * - `researchNode`    — Discovery and report generation. Sets status → "researching".
 * - `designNode`      — PRD/TAS blueprinting. Sets status → "specifying".
 * - `approveDesign`   — HITL gate: pauses for user review of design documents.
 * - `distillNode`     — Requirement extraction and task DAG generation. Sets status → "planning".
 * - `approveTaskDag`  — HITL gate: pauses for user review of task DAG.
 * - `implementNode`   — TDD implementation loop for a single task. Sets status → "implementing".
 * - `verifyNode`      — Final task verification and regression testing.
 * - `errorNode`       — Global error recovery. Captures exceptions, logs to errorHistory.
 * - `pivotAgentNode`  — Strategy pivot stub. Triggered after 3 consecutive errors or budget exceeded.
 *
 * ## HITL Gates
 *
 * The graph has two mandatory Human-in-the-Loop approval gates:
 *
 * 1. `approveDesign` — after `designNode`, before `distillNode`.
 *    Suspended state: `isInterrupted(result) === true`, `result[INTERRUPT][0].value.gate === "design_approval"`.
 *    Resume: `graph.invoke(new Command({ resume: HitlApprovalSignal }), { configurable: { thread_id } })`
 *
 * 2. `approveTaskDag` — after `distillNode`, before `implementNode`.
 *    Suspended state: `isInterrupted(result) === true`, `result[INTERRUPT][0].value.gate === "dag_approval"`.
 *    Resume: `graph.invoke(new Command({ resume: HitlApprovalSignal }), { configurable: { thread_id } })`
 *
 * ## Checkpointer Requirement
 *
 * The graph is compiled with a `MemorySaver` checkpointer by default. This is
 * required for LangGraph's `interrupt()` resume mechanism to work. Pass a custom
 * `BaseCheckpointSaver` to the constructor to use a different checkpointer
 * (e.g., an SQLite-backed saver in production).
 *
 * When using the default `MemorySaver`, always supply a `thread_id` in the
 * invocation config so the graph can save and retrieve state between interrupts:
 * ```ts
 * await graph.invoke(state, { configurable: { thread_id: "my-project-id" } });
 * ```
 *
 * ## Conditional routing (verifyNode → next)
 *
 * `routeAfterVerify` inspects the post-verify state and returns one of:
 * - `"implement"` — the active task has failed; retry the implementation loop.
 * - `"distill"`   — task passed but epics/tasks remain; advance to next task.
 * - `END`         — all epics are complete or failed; terminate the pipeline.
 *
 * ## State type enforcement
 *
 * The graph is constructed with `OrchestratorAnnotation` (a typed
 * `Annotation.Root`), so TypeScript enforces state types at all node
 * boundaries. Node functions receive `GraphState` and return `Partial<GraphState>`.
 *
 * Requirements: [9_ROADMAP-TAS-101], [TAS-009], [TAS-103],
 *               [TAS-078], [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]
 */

import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import {
  OrchestratorAnnotation,
  type GraphState,
} from "./types.js";
import {
  approveDesignNode,
  approveTaskDagNode,
  routeAfterApproveDesign,
  routeAfterApproveTaskDag,
} from "./hitl.js";
import {
  errorNode,
  pivotAgentNode,
  routeAfterError,
  checkTurnBudget,
  incrementTurnBudget,
  detectEntropy,
  type ErrorRoute,
} from "./robustness.js";

// ── Node implementations (stubs) ─────────────────────────────────────────────

/**
 * researchNode — Discovery and report generation.
 *
 * Stub: advances project status to "researching". Full implementation will
 * invoke research agents to produce market, competitive, technology, and
 * user research reports stored in `state.documents`.
 */
export function researchNode(state: GraphState): Partial<GraphState> {
  return {
    status: "researching",
    projectConfig: { ...state.projectConfig, status: "researching" },
  };
}

/**
 * designNode — PRD/TAS blueprinting.
 *
 * Stub: advances project status to "specifying". Full implementation will
 * invoke the architect agent to produce the nine specification documents
 * (PRD, TAS, MCP Design, Security, UI/UX, etc.).
 */
export function designNode(state: GraphState): Partial<GraphState> {
  return {
    status: "specifying",
    projectConfig: { ...state.projectConfig, status: "specifying" },
  };
}

/**
 * distillNode — Requirement extraction and task DAG generation.
 *
 * Stub: advances project status to "planning". Full implementation will
 * distil all specification documents into an ordered `RequirementRecord[]`
 * list and break them into atomic `TaskRecord[]` entries with DAG edges.
 */
export function distillNode(state: GraphState): Partial<GraphState> {
  return {
    status: "planning",
    projectConfig: { ...state.projectConfig, status: "planning" },
  };
}

/**
 * implementNode — TDD implementation loop for a single task.
 *
 * Stub: advances project status to "implementing". Full implementation will
 * execute the six-step TDD cycle (write tests → implement → review → verify →
 * document → run tests) for the task identified by `state.activeTaskId`.
 *
 * Robustness integration:
 * - Checks the turn budget before starting; if exceeded, routes to pivot.
 * - Checks entropy detection before starting; if loop detected, routes to pivot.
 * - Increments `implementationTurns` on each normal (non-pivot) execution.
 */
export function implementNode(state: GraphState): Partial<GraphState> {
  // Turn budget check: if exceeded, signal pivot instead of implementing
  const budgetExceeded = checkTurnBudget(state);
  if (budgetExceeded !== null) {
    return budgetExceeded;
  }

  // Entropy detection: if the agent is looping, signal pivot
  if (detectEntropy(state)) {
    return {
      status: "strategy_pivot",
      projectConfig: { ...state.projectConfig, status: "strategy_pivot" },
      pendingRecoveryNode: "pivot_agent",
    };
  }

  return {
    status: "implementing",
    projectConfig: { ...state.projectConfig, status: "implementing" },
    ...incrementTurnBudget(state),
  };
}

/**
 * verifyNode — Final task verification and regression testing.
 *
 * Stub: marks the active task as "completed" if one exists. Full implementation
 * will run the full test suite, check for regressions, validate acceptance
 * criteria, and update the task status based on verification results.
 *
 * The routing decision (retry / advance / terminate) is made by
 * `routeAfterVerify`, NOT by this node — keeping the routing logic
 * separate from the state update logic.
 */
export function verifyNode(state: GraphState): Partial<GraphState> {
  const updatedTasks = state.tasks.map((t) =>
    t.taskId === state.activeTaskId
      ? { ...t, status: "completed" as const }
      : t,
  );
  return { tasks: updatedTasks };
}

// ── Conditional routing ───────────────────────────────────────────────────────

/**
 * The set of destinations that `routeAfterVerify` can return.
 *
 * - `"implement"`    — retry the implementation loop (task failed).
 * - `"distill"`      — advance to the next task/epic (task passed, work remains).
 * - `"pivot_agent"`  — strategy pivot requested (turn budget exceeded or entropy detected).
 * - `END`            — terminate the pipeline (all work is complete).
 */
export type VerifyRoute = "implement" | "distill" | "pivot_agent" | typeof END;

/**
 * Routing function for the conditional edge after `verifyNode`.
 *
 * Priority order:
 * 1. If `state.activeTaskId` resolves to a task with `status === "failed"`,
 *    return `"implement"` to retry the TDD implementation loop.
 * 2. If any epic has a non-terminal status (`!== "completed" && !== "failed"`),
 *    return `"distill"` to continue with the next task in the pipeline.
 * 3. Otherwise return `END` — all epics are in a terminal state.
 *
 * @param state - Current graph state after `verifyNode` has run.
 * @returns The name of the next node or `END`.
 */
export function routeAfterVerify(state: GraphState): VerifyRoute {
  // Priority 1: strategy pivot if `pendingRecoveryNode` signals it.
  if (state.pendingRecoveryNode === "pivot_agent") {
    return "pivot_agent";
  }

  // Priority 2: retry if the active task failed verification.
  const activeTask = state.tasks.find((t) => t.taskId === state.activeTaskId);
  if (activeTask?.status === "failed") {
    return "implement";
  }

  // Priority 3: advance if there are epics still in progress.
  const hasActiveEpics = state.epics.some(
    (e) => e.status !== "completed" && e.status !== "failed",
  );
  if (hasActiveEpics) {
    return "distill";
  }

  // Priority 4: terminate — all epics are complete or failed.
  return END;
}

// Re-export HITL node functions for test access.
export { approveDesignNode, approveTaskDagNode };

// ── OrchestrationGraph ────────────────────────────────────────────────────────

/**
 * OrchestrationGraph wraps the compiled LangGraph `StateGraph` for the devs
 * orchestration pipeline.
 *
 * ## Usage
 *
 * For standard single-run usage (no checkpointing):
 * ```ts
 * const og = new OrchestrationGraph();
 * ```
 *
 * For HITL-capable usage (with checkpointing and resume support):
 * ```ts
 * import { MemorySaver, Command, isInterrupted } from "@langchain/langgraph";
 *
 * const og = new OrchestrationGraph(new MemorySaver());
 * const config = { configurable: { thread_id: "project-id" } };
 *
 * // Run to first HITL gate
 * const r1 = await og.graph.invoke(state, config);
 * if (isInterrupted(r1)) {
 *   const gate = r1[INTERRUPT][0].value.gate; // "design_approval"
 *   // Prompt user, collect decision...
 *   const signal: HitlApprovalSignal = { approved: true, approvedAt: new Date().toISOString() };
 *   await og.graph.invoke(new Command({ resume: signal }), config);
 * }
 * ```
 *
 * ## HITL Gates
 *
 * The graph has two mandatory approval gates:
 * 1. `approveDesign` (after `design`, before `distill`)
 * 2. `approveTaskDag` (after `distill`, before `implement`)
 *
 * Both gates use LangGraph's `interrupt()` mechanism. The `MemorySaver`
 * checkpointer is required for resumption.
 *
 * @param checkpointer - Optional checkpointer. Defaults to a new `MemorySaver`
 *   instance. Pass a custom checkpointer for production use (e.g., SQLite-backed).
 */
export class OrchestrationGraph {
  /**
   * The compiled LangGraph StateGraph.
   *
   * The type is intentionally left as the inferred return type of `.compile()`
   * so callers benefit from full LangGraph type inference on `invoke`, `stream`,
   * and other methods without requiring an explicit `CompiledGraph<...>` import.
   */
  readonly graph;

  constructor(checkpointer: BaseCheckpointSaver = new MemorySaver()) {
    this.graph = new StateGraph(OrchestratorAnnotation)
      // ── Nodes ──────────────────────────────────────────────────────────────
      .addNode("research", researchNode)
      .addNode("design", designNode)
      .addNode("approveDesign", approveDesignNode)
      .addNode("distill", distillNode)
      .addNode("approveTaskDag", approveTaskDagNode)
      .addNode("implement", implementNode)
      .addNode("verify", verifyNode)
      // ── Robustness nodes ────────────────────────────────────────────────────
      .addNode("error", errorNode)
      .addNode("pivot_agent", pivotAgentNode)
      // ── Linear edges ───────────────────────────────────────────────────────
      .addEdge(START, "research")
      .addEdge("research", "design")
      .addEdge("design", "approveDesign")
      // ── Design approval gate (conditional) ─────────────────────────────────
      // Returns: "distill" (approved) | "design" (rejected — loop back for revision)
      .addConditionalEdges("approveDesign", routeAfterApproveDesign)
      .addEdge("distill", "approveTaskDag")
      // ── DAG approval gate (conditional) ────────────────────────────────────
      // Returns: "implement" (approved) | "distill" (rejected — loop back for revision)
      .addConditionalEdges("approveTaskDag", routeAfterApproveTaskDag)
      .addEdge("implement", "verify")
      // ── Conditional routing from verify ────────────────────────────────────
      // Returns: "implement" (retry) | "distill" (advance) | "pivot_agent" | END
      .addConditionalEdges("verify", routeAfterVerify)
      // ── Error recovery routing ──────────────────────────────────────────────
      // Returns: "pivot_agent" (3+ consecutive errors) | "implement" (retry)
      .addConditionalEdges("error", routeAfterError)
      // ── PivotAgent terminates the run (stub: END) ───────────────────────────
      // Full implementation will loop back to "implement" with a new strategy.
      .addEdge("pivot_agent", END)
      .compile({ checkpointer });
  }
}
