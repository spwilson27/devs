/**
 * packages/core/src/orchestration/graph.ts
 *
 * Implements the devs OrchestrationGraph — a cyclical LangGraph StateGraph
 * that drives the full pipeline from project discovery through TDD implementation.
 *
 * ## Pipeline topology
 *
 * ```
 * START → researchNode → designNode → distillNode → implementNode → verifyNode
 *                                          ↑              ↑               │
 *                                          └──────────────┼─── distill ◄──┤  (task passed, epics remain)
 *                                                         └──── implement ◄┤  (task failed — retry)
 *                                                                          │
 *                                                                         END  (all epics complete)
 * ```
 *
 * ## Nodes (stubs)
 *
 * All node implementations are stubs that perform the minimal state updates
 * needed to advance the pipeline. Full implementations will be added in
 * later phases as the agent system is built out.
 *
 * - `researchNode`  — Discovery and report generation. Sets status → "researching".
 * - `designNode`    — PRD/TAS blueprinting. Sets status → "specifying".
 * - `distillNode`   — Requirement extraction and task DAG generation. Sets status → "planning".
 * - `implementNode` — TDD implementation loop for a single task. Sets status → "implementing".
 * - `verifyNode`    — Final task verification and regression testing. Updates task status.
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
 *               [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]
 */

import { StateGraph, START, END } from "@langchain/langgraph";
import {
  OrchestratorAnnotation,
  type GraphState,
} from "./types.js";

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
 */
export function implementNode(state: GraphState): Partial<GraphState> {
  return {
    status: "implementing",
    projectConfig: { ...state.projectConfig, status: "implementing" },
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
 * - `"implement"` — retry the implementation loop (task failed).
 * - `"distill"`   — advance to the next task/epic (task passed, work remains).
 * - `END`         — terminate the pipeline (all work is complete).
 */
export type VerifyRoute = "implement" | "distill" | typeof END;

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
  // Priority 1: retry if the active task failed verification.
  const activeTask = state.tasks.find((t) => t.taskId === state.activeTaskId);
  if (activeTask?.status === "failed") {
    return "implement";
  }

  // Priority 2: advance if there are epics still in progress.
  const hasActiveEpics = state.epics.some(
    (e) => e.status !== "completed" && e.status !== "failed",
  );
  if (hasActiveEpics) {
    return "distill";
  }

  // Priority 3: terminate — all epics are complete or failed.
  return END;
}

// ── OrchestrationGraph ────────────────────────────────────────────────────────

/**
 * OrchestrationGraph wraps the compiled LangGraph `StateGraph` for the devs
 * orchestration pipeline.
 *
 * Instantiate once per process and call `graph.invoke(initialState)` to run
 * the full pipeline. The graph is cyclical: `verifyNode` can loop back to
 * `implementNode` on failure or to `distillNode` when more work remains.
 *
 * The `graph` property exposes the compiled `CompiledGraph` for direct use
 * with all LangGraph APIs (invoke, stream, etc.).
 *
 * @example
 * ```ts
 * import { OrchestrationGraph } from "@devs/core";
 * import { createInitialState } from "@devs/core";
 *
 * const orchestrator = new OrchestrationGraph();
 * const result = await orchestrator.graph.invoke(createInitialState(projectConfig));
 * console.log(result.status); // "implementing" (or whatever the final state is)
 * ```
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

  constructor() {
    this.graph = new StateGraph(OrchestratorAnnotation)
      // ── Nodes ──────────────────────────────────────────────────────────────
      .addNode("research", researchNode)
      .addNode("design", designNode)
      .addNode("distill", distillNode)
      .addNode("implement", implementNode)
      .addNode("verify", verifyNode)
      // ── Linear edges ───────────────────────────────────────────────────────
      .addEdge(START, "research")
      .addEdge("research", "design")
      .addEdge("design", "distill")
      .addEdge("distill", "implement")
      .addEdge("implement", "verify")
      // ── Conditional routing from verify ────────────────────────────────────
      // Returns: "implement" (retry) | "distill" (advance) | END (terminate)
      .addConditionalEdges("verify", routeAfterVerify)
      .compile();
  }
}
