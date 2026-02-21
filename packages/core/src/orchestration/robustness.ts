/**
 * packages/core/src/orchestration/robustness.ts
 *
 * State machine robustness and error recovery for the devs orchestration engine.
 *
 * ## Features
 *
 * ### Global Error Node (`errorNode`)
 * A catch-all LangGraph node that captures unhandled exceptions from pipeline nodes.
 * On activation it:
 * - Appends a structured `ErrorRecord` to `state.errorHistory` (stack trace masked).
 * - Updates the active task status to `"failed"`.
 * - Updates the project status to `"error"`.
 * - Decides whether to retry or invoke the `PivotAgent` based on error count.
 *
 * ### Turn Budget Enforcement
 * `checkTurnBudget(state)` inspects `state.implementationTurns` against
 * `MAX_IMPLEMENTATION_TURNS` (10). When exceeded it returns a state update
 * that transitions the project to `"strategy_pivot"` and routes to `pivotAgentNode`.
 *
 * ### PivotAgent Node (`pivotAgentNode`)
 * A stub node invoked when the same error occurs 3+ consecutive times or when
 * the turn budget is exceeded. Transitions status to `"strategy_pivot"` and
 * resets `implementationTurns` to 0. Full implementation (querying a separate
 * AI agent for a new strategy) will be added in a later phase.
 *
 * ### Entropy Detector (`detectEntropy`)
 * A pure function that inspects `state.entropy` for repeated output hashes.
 * Returns `true` if the top entropy record for the active task has a `loopCount`
 * at or above `ENTROPY_LOOP_THRESHOLD` (3). Used by the orchestrator to determine
 * whether to pivot before consuming more tokens.
 *
 * ### Chaos Recovery (`findStaleOrDirtyStates`)
 * A utility that scans `state.tasks` for tasks in ambiguous/non-terminal states
 * (`"in_progress"`) that may indicate the process was interrupted mid-execution.
 * Returns a list of `StaleTaskInfo` records which the orchestrator can use to
 * offer `rewind` or `resume` choices to the user.
 *
 * ## Error Routing (`routeAfterError`)
 * Conditional routing function for the edge that leaves `errorNode`:
 * - `"pivot_agent"` — same error occurred ≥ `CONSECUTIVE_ERROR_PIVOT_THRESHOLD` (3) times.
 * - `"implement"`   — transient / first-occurrence error; retry the implementation.
 * - `"verify"`      — logic error after one retry; let verify record the failure.
 *
 * ## Secret Masking
 * `maskSensitiveData(message)` strips common secret patterns (API keys, bearer
 * tokens, passwords) from error messages and stack traces before they are
 * stored in `ErrorRecord`. Integration with a full SecretMasker service is
 * planned for a later phase; this provides a baseline implementation.
 *
 * Requirements: [8_RISKS-REQ-001], [TAS-078], [9_ROADMAP-PHASE-001],
 *               [1_PRD-REQ-REL-002], [9_ROADMAP-REQ-012]
 */

import type {
  GraphState,
  ErrorRecord,
  ErrorKind,
  TaskStatus,
} from "./types.js";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Maximum number of implementation turns allowed for a single task before the
 * orchestrator triggers a `STRATEGY_PIVOT`.
 *
 * Requirements: [1_PRD-REQ-REL-002]
 */
export const MAX_IMPLEMENTATION_TURNS = 10;

/**
 * Number of consecutive identical errors that trigger the `PivotAgent`.
 *
 * Requirements: [9_ROADMAP-REQ-012]
 */
export const CONSECUTIVE_ERROR_PIVOT_THRESHOLD = 3;

/**
 * Number of consecutive loop iterations (same output hash) that trigger entropy
 * detection and a pivot decision.
 */
export const ENTROPY_LOOP_THRESHOLD = 3;

// ── Secret masking ────────────────────────────────────────────────────────────

/**
 * Patterns of sensitive data that must be redacted before storing in error records.
 *
 * Each entry is a `[pattern, replacement]` pair applied in order.
 * The patterns cover the most common secret forms; a full implementation
 * would delegate to a dedicated SecretMasker service.
 */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  // Bearer tokens
  [/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]"],
  // Generic API keys (key=value format)
  [/(?:api[_-]?key|apikey|x-api-key)[=:\s]+['"]?[\w\-]{8,}['"]?/gi, "[API_KEY=REDACTED]"],
  // AWS access key IDs
  [/AKIA[0-9A-Z]{16}/g, "[AWS_KEY=REDACTED]"],
  // Generic passwords in query strings or env assignments
  [/(?:password|passwd|secret|token)[=:\s]+['"]?[^\s'"]{4,}['"]?/gi, "[SECRET=REDACTED]"],
  // Basic auth credentials in URLs
  [/https?:\/\/[^:@\s]+:[^@\s]+@/gi, "https://[CREDENTIALS_REDACTED]@"],
];

/**
 * Masks known secret patterns in a string before it is stored in an error record.
 *
 * @param text - Raw text that may contain sensitive data.
 * @returns Sanitized text with secrets replaced by redaction markers.
 */
export function maskSensitiveData(text: string): string {
  let result = text;
  for (const [pattern, replacement] of SECRET_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ── Error classification ──────────────────────────────────────────────────────

/**
 * Classifies an error as `"transient"`, `"logic"`, or `"unknown"` based on
 * message heuristics. Used to inform the retry vs. pivot decision.
 *
 * @param error - The caught error or error message.
 * @returns Classification of the error kind.
 */
export function classifyError(error: unknown): ErrorKind {
  const message =
    error instanceof Error ? error.message : String(error);
  const lc = message.toLowerCase();

  // Transient: timeout, rate-limit, network, temp failures
  if (
    lc.includes("timeout") ||
    lc.includes("rate limit") ||
    lc.includes("econnreset") ||
    lc.includes("econnrefused") ||
    lc.includes("network") ||
    lc.includes("503") ||
    lc.includes("429")
  ) {
    return "transient";
  }

  // Logic: type errors, assertion failures, null references, invariant violations
  if (
    lc.includes("typeerror") ||
    lc.includes("referenceerror") ||
    lc.includes("assertion") ||
    lc.includes("invariant") ||
    lc.includes("cannot read") ||
    lc.includes("is not a function") ||
    lc.includes("undefined is not")
  ) {
    return "logic";
  }

  return "unknown";
}

// ── Error node ────────────────────────────────────────────────────────────────

/**
 * Creates a structured `ErrorRecord` from a caught exception.
 *
 * Applies `maskSensitiveData` to both the message and the stack trace before
 * the record is stored in state.
 *
 * @param error    - The caught exception.
 * @param sourceNode - The graph node where the exception originated.
 * @param taskId   - The active task ID at the time of the error.
 * @param consecutiveCount - How many consecutive times this error has occurred.
 * @returns A fully-populated `ErrorRecord` ready for insertion into `errorHistory`.
 */
export function buildErrorRecord(
  error: unknown,
  sourceNode: string,
  taskId: string | null,
  consecutiveCount: number,
): ErrorRecord {
  const rawMessage =
    error instanceof Error ? error.message : String(error);
  const rawStack =
    error instanceof Error && error.stack ? error.stack : "";

  return {
    errorId: `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    capturedAt: new Date().toISOString(),
    sourceNode,
    message: maskSensitiveData(rawMessage),
    stackTrace: maskSensitiveData(rawStack),
    kind: classifyError(error),
    consecutiveCount,
    taskId,
  };
}

/**
 * Counts how many consecutive times the most recent error (by masked message)
 * has appeared in `errorHistory` for the given task.
 *
 * @param history - Existing error history from state.
 * @param message - The masked message of the new error.
 * @param taskId  - The active task ID.
 * @returns Consecutive count (1 = first occurrence, 2 = second in a row, …).
 */
export function countConsecutiveErrors(
  history: readonly ErrorRecord[],
  message: string,
  taskId: string | null,
): number {
  // Walk backwards through history looking for consecutive matching errors
  let count = 1;
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry.taskId === taskId && entry.message === message) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Global error recovery node.
 *
 * This node should be wired as the error handler in the LangGraph topology.
 * It receives the state as-is (the error is passed via `pendingRecoveryNode`)
 * and appends a structured `ErrorRecord` to `state.errorHistory`.
 *
 * Callers that catch an exception must:
 * 1. Serialize the error into `pendingRecoveryNode` (set to the source node name).
 * 2. Route to `"error"` instead of propagating the exception.
 *
 * The `errorNode` itself does NOT receive the `Error` object directly — LangGraph
 * cannot pass arbitrary JS objects between nodes. Instead, the triggering node
 * must store the error message in a state field before routing here. For this
 * stub implementation, `pendingRecoveryNode` carries the source node name and
 * a generic error message is synthesized.
 *
 * @param state - Current graph state. `state.pendingRecoveryNode` should contain
 *   the source node name; `state.activeTaskId` identifies the failing task.
 * @returns Partial state update: appended error record, updated task/project status.
 */
export function errorNode(state: GraphState): Partial<GraphState> {
  const sourceNode = state.pendingRecoveryNode ?? "unknown";
  const taskId = state.activeTaskId;

  // Synthesize an error object for the generic "entered error node" case
  const syntheticError = new Error(
    `Node '${sourceNode}' routed to error recovery.`,
  );

  const maskedMessage = maskSensitiveData(syntheticError.message);
  const consecutiveCount = countConsecutiveErrors(
    state.errorHistory,
    maskedMessage,
    taskId,
  );

  const record = buildErrorRecord(
    syntheticError,
    sourceNode,
    taskId,
    consecutiveCount,
  );

  // Update the active task status to "failed"
  const updatedTasks = state.tasks.map((t) =>
    t.taskId === taskId
      ? { ...t, status: "failed" as TaskStatus }
      : t,
  );

  return {
    errorHistory: [...state.errorHistory, record],
    tasks: updatedTasks,
    status: "error",
    projectConfig: { ...state.projectConfig, status: "error" },
    pendingRecoveryNode: null,
  };
}

// ── Turn budget enforcement ───────────────────────────────────────────────────

/**
 * Checks whether the implementation turn budget has been exceeded.
 *
 * Call this at the start of `implementNode` (or wrap it as a pre-node check).
 * Returns a partial state update if the budget is exceeded, or `null` if
 * the budget is fine and execution should continue normally.
 *
 * @param state - Current graph state.
 * @returns Partial state update signalling `"strategy_pivot"`, or `null`.
 */
export function checkTurnBudget(
  state: GraphState,
): Partial<GraphState> | null {
  if (state.implementationTurns >= MAX_IMPLEMENTATION_TURNS) {
    return {
      status: "strategy_pivot",
      projectConfig: { ...state.projectConfig, status: "strategy_pivot" },
      pendingRecoveryNode: "pivot_agent",
    };
  }
  return null;
}

/**
 * Increments the implementation turn counter in state.
 *
 * Must be called at the END of each successful `implementNode` invocation
 * (not on error paths) to track budget consumption.
 *
 * @param state - Current graph state.
 * @returns Partial state update with incremented `implementationTurns`.
 */
export function incrementTurnBudget(state: GraphState): Partial<GraphState> {
  return { implementationTurns: state.implementationTurns + 1 };
}

/**
 * Resets the implementation turn counter when a new task is activated.
 *
 * @returns Partial state update resetting `implementationTurns` to `0`.
 */
export function resetTurnBudget(): Partial<GraphState> {
  return { implementationTurns: 0 };
}

// ── PivotAgent node ───────────────────────────────────────────────────────────

/**
 * PivotAgent node (stub).
 *
 * Invoked when the same error occurs `CONSECUTIVE_ERROR_PIVOT_THRESHOLD` (3)
 * consecutive times, or when `MAX_IMPLEMENTATION_TURNS` is exceeded.
 *
 * This stub records the pivot decision in state by transitioning to
 * `"strategy_pivot"` and resetting the turn budget. A full implementation
 * will invoke a separate AI agent to propose an alternative implementation
 * strategy (e.g., decompose the task differently, try a different library).
 *
 * Requirements: [9_ROADMAP-REQ-012]
 *
 * @param state - Current graph state.
 * @returns Partial state update: status → "strategy_pivot", turns reset to 0.
 */
export function pivotAgentNode(state: GraphState): Partial<GraphState> {
  return {
    status: "strategy_pivot",
    projectConfig: { ...state.projectConfig, status: "strategy_pivot" },
    implementationTurns: 0,
    pendingRecoveryNode: null,
  };
}

// ── Error routing ─────────────────────────────────────────────────────────────

/**
 * Routes after `errorNode` based on the consecutive error count.
 *
 * Decision tree:
 * 1. If the most recent error occurred `CONSECUTIVE_ERROR_PIVOT_THRESHOLD`+ times
 *    consecutively → `"pivot_agent"` (the agent is stuck; escalate).
 * 2. Otherwise → `"implement"` (retry the implementation loop).
 *
 * @param state - Graph state after `errorNode` has run.
 * @returns Next node name.
 */
export type ErrorRoute = "pivot_agent" | "implement";

export function routeAfterError(state: GraphState): ErrorRoute {
  const lastError = state.errorHistory[state.errorHistory.length - 1];
  if (
    lastError !== undefined &&
    lastError.consecutiveCount >= CONSECUTIVE_ERROR_PIVOT_THRESHOLD
  ) {
    return "pivot_agent";
  }
  return "implement";
}

// ── Entropy detection ─────────────────────────────────────────────────────────

/**
 * Detects whether the active task is caught in an agent output loop.
 *
 * Inspects `state.entropy` for the active task and checks whether the most
 * recent entropy entry has a `loopCount` at or above `ENTROPY_LOOP_THRESHOLD`.
 *
 * @param state - Current graph state.
 * @returns `true` if a loop is detected (should pivot), `false` otherwise.
 */
export function detectEntropy(state: GraphState): boolean {
  if (state.activeTaskId === null) return false;

  const taskEntropy = state.entropy.filter(
    (e) => e.taskId === state.activeTaskId,
  );
  if (taskEntropy.length === 0) return false;

  // The most recent entropy record is the last in the array
  const latest = taskEntropy[taskEntropy.length - 1];
  return latest.loopCount >= ENTROPY_LOOP_THRESHOLD;
}

// ── Chaos recovery ────────────────────────────────────────────────────────────

/**
 * Information about a stale task found during startup chaos recovery.
 */
export interface StaleTaskInfo {
  /** The task ID. */
  taskId: string;
  /** The task name. */
  name: string;
  /** The ambiguous/non-terminal status found on startup. */
  status: string;
  /** The epic ID the task belongs to. */
  epicId: string;
}

/**
 * Scans `state.tasks` for tasks in non-terminal "stale" states.
 *
 * A task is considered stale if its status is `"in_progress"` — this indicates
 * the process was interrupted (crash, SIGTERM) while the task was executing.
 * The orchestrator can use this information to offer `rewind` (discard progress)
 * or `resume` (continue from checkpoint) choices to the user.
 *
 * Called during startup chaos recovery (on `OrchestrationGraph` initialization
 * with an existing state loaded from the SQLite checkpoint saver).
 *
 * @param state - Current graph state (typically loaded from a checkpoint).
 * @returns Array of stale task descriptors. Empty array = no recovery needed.
 */
export function findStaleOrDirtyStates(state: GraphState): StaleTaskInfo[] {
  return state.tasks
    .filter((t) => t.status === "in_progress")
    .map((t) => ({
      taskId: t.taskId,
      name: t.name,
      status: t.status,
      epicId: t.epicId,
    }));
}
