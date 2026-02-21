/**
 * packages/core/src/orchestration/hitl.ts
 *
 * Implements the HITL (Human-in-the-Loop) approval gate mechanism for the
 * devs orchestration engine.
 *
 * ## Overview
 *
 * Two mandatory approval gates are injected into the pipeline:
 *
 * 1. **`approveDesignNode`** — pauses execution after PRD/TAS generation so the
 *    user can review the generated design documents before the pipeline proceeds
 *    to requirement distillation.
 *
 * 2. **`approveTaskDagNode`** — pauses execution after requirement distillation
 *    so the user can review and approve the generated task DAG before
 *    implementation begins.
 *
 * ## Interrupt Mechanism
 *
 * Both nodes use LangGraph's `interrupt()` function. When executed:
 * - **First invocation**: `interrupt()` throws a `GraphInterrupt`, suspending
 *   the graph. The caller receives the state with `isInterrupted(result) === true`.
 *   The interrupt value includes `{ gate, message }` for external systems to use.
 * - **After resume**: `interrupt()` returns the `HitlApprovalSignal` provided
 *   via `Command({ resume: signal })`. The node records the decision and returns
 *   a state update.
 *
 * ## Resumption Contract
 *
 * The graph **must** be compiled with a checkpointer (e.g. `MemorySaver`) for
 * resumption to work. Without a checkpointer, suspension is detectable but the
 * graph cannot be resumed.
 *
 * To resume a suspended graph:
 * ```ts
 * import { Command } from "@langchain/langgraph";
 * const approval: HitlApprovalSignal = { approved: true, approvedAt: new Date().toISOString() };
 * await graph.invoke(new Command({ resume: approval }), { configurable: { thread_id: "..." } });
 * ```
 *
 * ## Routing After Approval
 *
 * Each gate has a corresponding routing function used as a `addConditionalEdges`
 * target:
 * - `routeAfterApproveDesign`: "distill" (approved) | "design" (rejected)
 * - `routeAfterApproveTaskDag`: "implement" (approved) | "distill" (rejected)
 *
 * Rejection routes loop back to the preceding generation node, allowing the
 * user to trigger a revision cycle before approving again.
 *
 * ## EventBus Integration (Future)
 *
 * When an EventBus is available, approval nodes should emit a
 * `HITL_APPROVAL_REQUIRED` event with the gate identifier and interrupt value.
 * This allows CLI and VSCode Extension consumers to prompt the user without
 * polling. The emission point is before `interrupt()` is called. This is
 * currently documented here for Phase 2 implementation.
 *
 * Requirements: [TAS-078], [9_ROADMAP-PHASE-001],
 *               [5_SECURITY_DESIGN-REQ-SEC-SD-022]
 */

import { interrupt } from "@langchain/langgraph";
import type {
  GraphState,
  HitlGate,
  HitlApprovalSignal,
  HitlDecisionRecord,
} from "./types.js";

// Re-export HITL types so callers only need to import from this module or index.ts.
export type { HitlGate, HitlApprovalSignal, HitlDecisionRecord };

// ── Interrupt value types ─────────────────────────────────────────────────────

/**
 * The value embedded in the LangGraph `interrupt()` call.
 * Available via `result[INTERRUPT][0].value` when the graph is suspended.
 *
 * External systems (CLI, VSCode Extension) read this value to understand
 * which gate is awaiting approval and what context is available for review.
 */
export interface HitlInterruptValue {
  /** Which approval gate triggered this interrupt. */
  gate: HitlGate;
  /** Human-readable message describing what needs to be reviewed. */
  message: string;
  /**
   * The current pipeline status at the time of interruption.
   * Set to `"paused_for_approval"` to signal the pause state.
   */
  currentStatus: "paused_for_approval";
}

// ── Approval gate nodes ───────────────────────────────────────────────────────

/**
 * HITL approval gate for the design phase (PRD/TAS review).
 *
 * Pauses execution after `designNode` has generated the specification documents.
 * The user must review the generated PRD, TAS, and other design artifacts before
 * the pipeline proceeds to requirement distillation.
 *
 * **Interrupt flow:**
 * 1. Emits interrupt with `{ gate: "design_approval", message, currentStatus }`.
 * 2. Caller detects `isInterrupted(result)` and prompts the user for a decision.
 * 3. User provides `HitlApprovalSignal` via `Command({ resume: signal })`.
 * 4. Node records the decision and returns state update.
 *
 * **State updates on approved resume:**
 * - `status` → `"planning"` (advance to distillation)
 * - `projectConfig.status` → `"planning"`
 * - `hitlDecisions` → appended with this gate's decision record
 * - `pendingApprovalGate` → `null` (cleared)
 *
 * **State updates on rejected resume:**
 * - `status` → `"specifying"` (return to design phase)
 * - `projectConfig.status` → `"specifying"`
 * - `hitlDecisions` → appended with rejection record (for audit trail)
 * - `pendingApprovalGate` → `null`
 *
 * @param state - Current graph state (passed by LangGraph).
 * @returns Partial state update (applied only after successful resume).
 */
export function approveDesignNode(state: GraphState): Partial<GraphState> {
  const interruptValue: HitlInterruptValue = {
    gate: "design_approval",
    message:
      "Review the generated design documents (PRD, TAS, MCP Design, Security, " +
      "UI/UX) before the pipeline proceeds to requirement distillation. " +
      `Documents generated: ${state.documents.length}.`,
    currentStatus: "paused_for_approval",
  };

  // Future: emit EventBus event here so CLI/VSCode can prompt user without polling.
  // eventBus.emit("HITL_APPROVAL_REQUIRED", interruptValue);

  // Suspend graph execution. Returns the approval signal when resumed.
  const signal = interrupt<HitlInterruptValue>(interruptValue) as HitlApprovalSignal;

  // ── Only reached after resume with HitlApprovalSignal ──────────────────────

  const decision: HitlDecisionRecord = {
    gate: "design_approval",
    signal,
    decidedAt: new Date().toISOString(),
  };

  const nextStatus = signal.approved ? "planning" : "specifying";

  return {
    status: nextStatus,
    projectConfig: { ...state.projectConfig, status: nextStatus },
    hitlDecisions: [...state.hitlDecisions, decision],
    pendingApprovalGate: null,
  };
}

/**
 * HITL approval gate for the task DAG review.
 *
 * Pauses execution after `distillNode` has extracted requirements and generated
 * the task DAG. The user must review the planned phases and atomic tasks before
 * the pipeline proceeds to TDD implementation.
 *
 * **Interrupt flow:**
 * 1. Emits interrupt with `{ gate: "dag_approval", message, currentStatus }`.
 * 2. Caller detects `isInterrupted(result)` and prompts the user.
 * 3. User provides `HitlApprovalSignal` via `Command({ resume: signal })`.
 * 4. Node records the decision and returns state update.
 *
 * **State updates on approved resume:**
 * - `status` → `"implementing"` (advance to TDD implementation)
 * - `projectConfig.status` → `"implementing"`
 * - `hitlDecisions` → appended with this gate's decision record
 * - `pendingApprovalGate` → `null`
 *
 * **State updates on rejected resume:**
 * - `status` → `"planning"` (return to distillation phase)
 * - `projectConfig.status` → `"planning"`
 * - `hitlDecisions` → appended with rejection record
 * - `pendingApprovalGate` → `null`
 *
 * @param state - Current graph state (passed by LangGraph).
 * @returns Partial state update (applied only after successful resume).
 */
export function approveTaskDagNode(state: GraphState): Partial<GraphState> {
  const interruptValue: HitlInterruptValue = {
    gate: "dag_approval",
    message:
      "Review the generated task DAG before implementation begins. " +
      `Requirements: ${state.requirements.length}, ` +
      `Tasks: ${state.tasks.length}. ` +
      "Verify that the phases and atomic tasks are correct before proceeding.",
    currentStatus: "paused_for_approval",
  };

  // Future: emit EventBus event here so CLI/VSCode can prompt user without polling.
  // eventBus.emit("HITL_APPROVAL_REQUIRED", interruptValue);

  const signal = interrupt<HitlInterruptValue>(interruptValue) as HitlApprovalSignal;

  // ── Only reached after resume with HitlApprovalSignal ──────────────────────

  const decision: HitlDecisionRecord = {
    gate: "dag_approval",
    signal,
    decidedAt: new Date().toISOString(),
  };

  const nextStatus = signal.approved ? "implementing" : "planning";

  return {
    status: nextStatus,
    projectConfig: { ...state.projectConfig, status: nextStatus },
    hitlDecisions: [...state.hitlDecisions, decision],
    pendingApprovalGate: null,
  };
}

// ── Conditional routing ───────────────────────────────────────────────────────

/**
 * The set of routes available after the design approval gate.
 *
 * - `"distill"` — design was approved; proceed to requirement distillation.
 * - `"design"`  — design was rejected; loop back for revision.
 */
export type DesignApprovalRoute = "distill" | "design";

/**
 * Routes after `approveDesignNode` based on the most recent design decision.
 *
 * Looks up the LAST `design_approval` decision in `state.hitlDecisions`.
 * If no design decision is found (unexpected state), defaults to `"design"`
 * to prevent unauthorized pipeline advancement.
 *
 * @param state - Graph state AFTER `approveDesignNode` has run and returned.
 * @returns `"distill"` if approved, `"design"` if rejected or no decision found.
 */
export function routeAfterApproveDesign(state: GraphState): DesignApprovalRoute {
  // Find the most recent design_approval decision (last in array wins).
  const lastDesignDecision = [...state.hitlDecisions]
    .reverse()
    .find((d) => d.gate === "design_approval");

  return lastDesignDecision?.signal.approved === true ? "distill" : "design";
}

/**
 * The set of routes available after the task DAG approval gate.
 *
 * - `"implement"` — DAG was approved; proceed to TDD implementation loop.
 * - `"distill"`   — DAG was rejected; loop back to distillation for revision.
 */
export type DagApprovalRoute = "implement" | "distill";

/**
 * Routes after `approveTaskDagNode` based on the most recent DAG decision.
 *
 * Looks up the LAST `dag_approval` decision in `state.hitlDecisions`.
 * If no DAG decision is found (unexpected state), defaults to `"distill"`
 * to prevent unauthorized pipeline advancement.
 *
 * @param state - Graph state AFTER `approveTaskDagNode` has run and returned.
 * @returns `"implement"` if approved, `"distill"` if rejected or no decision found.
 */
export function routeAfterApproveTaskDag(state: GraphState): DagApprovalRoute {
  const lastDagDecision = [...state.hitlDecisions]
    .reverse()
    .find((d) => d.gate === "dag_approval");

  return lastDagDecision?.signal.approved === true ? "implement" : "distill";
}
