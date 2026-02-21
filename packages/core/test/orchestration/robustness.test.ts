/**
 * packages/core/test/orchestration/robustness.test.ts
 *
 * Test suite for state machine robustness and error recovery.
 *
 * Covers:
 *   1. `maskSensitiveData` — strips secrets from error messages.
 *   2. `classifyError` — categorises errors as transient / logic / unknown.
 *   3. `buildErrorRecord` — constructs a masked ErrorRecord from an exception.
 *   4. `countConsecutiveErrors` — counts consecutive same-message errors.
 *   5. `errorNode` — appends ErrorRecord, marks task failed, sets status "error".
 *   6. `routeAfterError` — routes to "pivot_agent" after 3 consecutive errors,
 *      "implement" otherwise.
 *   7. Turn-budget enforcement:
 *      - `checkTurnBudget` returns null below limit, pivot update at/above limit.
 *      - `incrementTurnBudget` increments by 1.
 *      - `resetTurnBudget` resets to 0.
 *      - `implementNode` via graph: transitions to "strategy_pivot" after
 *        MAX_IMPLEMENTATION_TURNS turns.
 *   8. `detectEntropy` — returns true when loopCount ≥ ENTROPY_LOOP_THRESHOLD.
 *   9. `findStaleOrDirtyStates` — identifies in_progress tasks on startup.
 *  10. `pivotAgentNode` — transitions to "strategy_pivot" and resets turn budget.
 *  11. OrchestrationGraph — includes "error" and "pivot_agent" nodes.
 *  12. `routeAfterVerify` — routes to "pivot_agent" when pendingRecoveryNode is set.
 *
 * Requirements: [8_RISKS-REQ-001], [TAS-078], [9_ROADMAP-PHASE-001],
 *               [1_PRD-REQ-REL-002], [9_ROADMAP-REQ-012]
 */

import { describe, it, expect } from "vitest";
import {
  maskSensitiveData,
  classifyError,
  buildErrorRecord,
  countConsecutiveErrors,
  errorNode,
  routeAfterError,
  checkTurnBudget,
  incrementTurnBudget,
  resetTurnBudget,
  detectEntropy,
  findStaleOrDirtyStates,
  pivotAgentNode,
  MAX_IMPLEMENTATION_TURNS,
  CONSECUTIVE_ERROR_PIVOT_THRESHOLD,
  ENTROPY_LOOP_THRESHOLD,
} from "../../src/orchestration/robustness.js";
import {
  implementNode,
  routeAfterVerify,
  OrchestrationGraph,
} from "../../src/orchestration/graph.js";
import {
  createInitialState,
  type GraphState,
  type ProjectConfig,
  type ErrorRecord,
  type EntropyRecord,
  type TaskRecord,
} from "../../src/orchestration/types.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function validProjectConfig(): ProjectConfig {
  return {
    projectId: "proj-robust-001",
    name: "Robustness Test Project",
    description: "Tests for error recovery and turn budget",
    status: "initializing",
    createdAt: "2026-02-21T10:00:00.000Z",
    updatedAt: "2026-02-21T10:00:00.000Z",
  };
}

function baseState(): GraphState {
  return createInitialState(validProjectConfig()) as GraphState;
}

function taskInProgress(taskId: string): TaskRecord {
  return {
    taskId,
    epicId: "epic-001",
    name: `Task ${taskId}`,
    description: "Stub task",
    status: "in_progress",
    agentRole: "developer",
    dependsOn: [],
  };
}

function errorRecord(
  message: string,
  taskId: string | null,
  count = 1,
): ErrorRecord {
  return {
    errorId: `err-${message}`,
    capturedAt: "2026-02-21T10:00:00.000Z",
    sourceNode: "implement",
    message,
    stackTrace: "",
    kind: "unknown",
    consecutiveCount: count,
    taskId,
  };
}

// ── maskSensitiveData ─────────────────────────────────────────────────────────

describe("maskSensitiveData", () => {
  it("redacts Bearer tokens", () => {
    const input = "Authorization: Bearer abc123XYZ-token==";
    const result = maskSensitiveData(input);
    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("abc123XYZ-token");
  });

  it("redacts API key assignments", () => {
    const input = "Error: api_key=sk-MYSECRETKEY1234";
    const result = maskSensitiveData(input);
    expect(result).toContain("[API_KEY=REDACTED]");
    expect(result).not.toContain("sk-MYSECRETKEY1234");
  });

  it("redacts AWS access key IDs", () => {
    const input = "AKIAIOSFODNN7EXAMPLE is invalid";
    const result = maskSensitiveData(input);
    expect(result).toContain("[AWS_KEY=REDACTED]");
    expect(result).not.toContain("AKIAIOSFODNN7EXAMPLE");
  });

  it("redacts password assignments", () => {
    const input = "password=hunter2 not matching";
    const result = maskSensitiveData(input);
    expect(result).toContain("[SECRET=REDACTED]");
    expect(result).not.toContain("hunter2");
  });

  it("redacts HTTP basic auth credentials in URLs", () => {
    const input = "Connecting to https://user:p@ssw0rd@api.example.com/v1";
    const result = maskSensitiveData(input);
    expect(result).toContain("[CREDENTIALS_REDACTED]");
    expect(result).not.toContain("p@ssw0rd");
  });

  it("passes through text with no secrets unchanged", () => {
    const input = "ReferenceError: foo is not defined at line 42";
    expect(maskSensitiveData(input)).toBe(input);
  });

  it("handles empty string", () => {
    expect(maskSensitiveData("")).toBe("");
  });
});

// ── classifyError ─────────────────────────────────────────────────────────────

describe("classifyError", () => {
  it("classifies timeout as 'transient'", () => {
    expect(classifyError(new Error("request timeout exceeded"))).toBe("transient");
  });

  it("classifies rate limit as 'transient'", () => {
    expect(classifyError(new Error("429 rate limit hit"))).toBe("transient");
  });

  it("classifies network reset as 'transient'", () => {
    expect(classifyError(new Error("ECONNRESET"))).toBe("transient");
  });

  it("classifies TypeError as 'logic'", () => {
    expect(classifyError(new TypeError("Cannot read properties of undefined"))).toBe("logic");
  });

  it("classifies 'is not a function' as 'logic'", () => {
    expect(classifyError(new Error("foo is not a function"))).toBe("logic");
  });

  it("classifies assertion failures as 'logic'", () => {
    expect(classifyError(new Error("assertion failed: expected true"))).toBe("logic");
  });

  it("classifies unknown errors as 'unknown'", () => {
    expect(classifyError(new Error("something went wrong"))).toBe("unknown");
  });

  it("classifies non-Error objects as 'unknown'", () => {
    expect(classifyError("some string error")).toBe("unknown");
    expect(classifyError(42)).toBe("unknown");
  });
});

// ── buildErrorRecord ──────────────────────────────────────────────────────────

describe("buildErrorRecord", () => {
  it("creates a record with a non-empty errorId", () => {
    const record = buildErrorRecord(new Error("oops"), "implement", "task-1", 1);
    expect(record.errorId).toBeTruthy();
    expect(record.errorId).toMatch(/^err-/);
  });

  it("stores masked message (no secrets in output)", () => {
    const err = new Error("Bearer supersecret123 failed");
    const record = buildErrorRecord(err, "implement", "task-1", 1);
    expect(record.message).not.toContain("supersecret123");
    expect(record.message).toContain("[REDACTED]");
  });

  it("stores the source node and task ID", () => {
    const record = buildErrorRecord(new Error("fail"), "designNode", "task-42", 2);
    expect(record.sourceNode).toBe("designNode");
    expect(record.taskId).toBe("task-42");
    expect(record.consecutiveCount).toBe(2);
  });

  it("handles null taskId", () => {
    const record = buildErrorRecord(new Error("fail"), "research", null, 1);
    expect(record.taskId).toBeNull();
  });

  it("handles non-Error objects", () => {
    const record = buildErrorRecord("string error", "verify", null, 1);
    expect(record.message).toBe("string error");
    expect(record.stackTrace).toBe("");
  });

  it("sets capturedAt as a valid ISO 8601 string", () => {
    const record = buildErrorRecord(new Error("x"), "n", null, 1);
    expect(() => new Date(record.capturedAt)).not.toThrow();
    expect(new Date(record.capturedAt).toISOString()).toBe(record.capturedAt);
  });
});

// ── countConsecutiveErrors ────────────────────────────────────────────────────

describe("countConsecutiveErrors", () => {
  it("returns 1 for an empty history (first occurrence)", () => {
    expect(countConsecutiveErrors([], "oops", "task-1")).toBe(1);
  });

  it("returns 2 when the previous entry has the same message and taskId", () => {
    const history = [errorRecord("oops", "task-1", 1)];
    expect(countConsecutiveErrors(history, "oops", "task-1")).toBe(2);
  });

  it("returns 3 for two preceding same-message entries", () => {
    const history = [
      errorRecord("oops", "task-1", 1),
      errorRecord("oops", "task-1", 2),
    ];
    expect(countConsecutiveErrors(history, "oops", "task-1")).toBe(3);
  });

  it("stops counting at a different message (non-consecutive)", () => {
    const history = [
      errorRecord("different error", "task-1", 1),
      errorRecord("oops", "task-1", 1),
    ];
    // The last entry is "oops", but before it is "different error" → count stops
    expect(countConsecutiveErrors(history, "oops", "task-1")).toBe(2);
  });

  it("stops counting at a different taskId", () => {
    const history = [
      errorRecord("oops", "task-2", 1), // different task
    ];
    expect(countConsecutiveErrors(history, "oops", "task-1")).toBe(1);
  });

  it("returns 1 when no preceding entries match", () => {
    const history = [errorRecord("other error", "task-1", 1)];
    expect(countConsecutiveErrors(history, "oops", "task-1")).toBe(1);
  });
});

// ── errorNode ─────────────────────────────────────────────────────────────────

describe("errorNode", () => {
  it("appends an ErrorRecord to errorHistory", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "implement",
      activeTaskId: "task-001",
      tasks: [taskInProgress("task-001")],
    };
    const result = errorNode(state);
    expect(result.errorHistory).toHaveLength(1);
  });

  it("sets project status to 'error'", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "implement",
    };
    const result = errorNode(state);
    expect(result.status).toBe("error");
  });

  it("updates projectConfig.status to 'error'", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "implement",
    };
    const result = errorNode(state);
    expect(result.projectConfig?.status).toBe("error");
  });

  it("marks the active task as 'failed'", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-007",
      tasks: [taskInProgress("task-007")],
      pendingRecoveryNode: "implement",
    };
    const result = errorNode(state);
    const task = result.tasks?.find((t) => t.taskId === "task-007");
    expect(task?.status).toBe("failed");
  });

  it("does not modify tasks that are not the active task", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-001",
      tasks: [taskInProgress("task-001"), taskInProgress("task-002")],
      pendingRecoveryNode: "implement",
    };
    const result = errorNode(state);
    const other = result.tasks?.find((t) => t.taskId === "task-002");
    expect(other?.status).toBe("in_progress");
  });

  it("clears pendingRecoveryNode after handling the error", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "implement",
    };
    const result = errorNode(state);
    expect(result.pendingRecoveryNode).toBeNull();
  });

  it("records the sourceNode from pendingRecoveryNode", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "designNode",
    };
    const result = errorNode(state);
    const record = result.errorHistory?.[0];
    expect(record?.sourceNode).toBe("designNode");
  });

  it("handles null pendingRecoveryNode gracefully (sourceNode = 'unknown')", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: null,
    };
    const result = errorNode(state);
    const record = result.errorHistory?.[0];
    expect(record?.sourceNode).toBe("unknown");
  });

  it("does not expose sensitive data in the error message", () => {
    // errorNode synthesizes the message from the sourceNode name — no secrets
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "implement",
    };
    const result = errorNode(state);
    const record = result.errorHistory?.[0];
    expect(record?.message).not.toContain("Bearer");
    expect(record?.message).not.toContain("password=");
  });
});

// ── routeAfterError ───────────────────────────────────────────────────────────

describe("routeAfterError", () => {
  it("routes to 'implement' when error count is below threshold", () => {
    const state: GraphState = {
      ...baseState(),
      errorHistory: [errorRecord("oops", "task-1", 1)],
    };
    expect(routeAfterError(state)).toBe("implement");
  });

  it("routes to 'implement' when error count is exactly below threshold (2)", () => {
    const state: GraphState = {
      ...baseState(),
      errorHistory: [errorRecord("oops", "task-1", 2)],
    };
    expect(routeAfterError(state)).toBe("implement");
  });

  it(`routes to 'pivot_agent' at exactly CONSECUTIVE_ERROR_PIVOT_THRESHOLD (${CONSECUTIVE_ERROR_PIVOT_THRESHOLD})`, () => {
    const state: GraphState = {
      ...baseState(),
      errorHistory: [
        errorRecord("oops", "task-1", CONSECUTIVE_ERROR_PIVOT_THRESHOLD),
      ],
    };
    expect(routeAfterError(state)).toBe("pivot_agent");
  });

  it("routes to 'pivot_agent' above the threshold", () => {
    const state: GraphState = {
      ...baseState(),
      errorHistory: [
        errorRecord("oops", "task-1", CONSECUTIVE_ERROR_PIVOT_THRESHOLD + 5),
      ],
    };
    expect(routeAfterError(state)).toBe("pivot_agent");
  });

  it("routes to 'implement' when errorHistory is empty", () => {
    const state: GraphState = { ...baseState(), errorHistory: [] };
    expect(routeAfterError(state)).toBe("implement");
  });

  it("uses the LAST error in history for the threshold check", () => {
    const state: GraphState = {
      ...baseState(),
      errorHistory: [
        errorRecord("oops", "task-1", CONSECUTIVE_ERROR_PIVOT_THRESHOLD), // high
        errorRecord("different", "task-1", 1), // last entry is low
      ],
    };
    // Last entry has count=1 → should NOT pivot
    expect(routeAfterError(state)).toBe("implement");
  });
});

// ── Turn budget enforcement ───────────────────────────────────────────────────

describe("checkTurnBudget", () => {
  it("returns null when turns are below the limit", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: MAX_IMPLEMENTATION_TURNS - 1,
    };
    expect(checkTurnBudget(state)).toBeNull();
  });

  it("returns a pivot update at exactly the limit", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: MAX_IMPLEMENTATION_TURNS,
    };
    const result = checkTurnBudget(state);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("strategy_pivot");
    expect(result?.pendingRecoveryNode).toBe("pivot_agent");
  });

  it("returns a pivot update above the limit", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: MAX_IMPLEMENTATION_TURNS + 5,
    };
    expect(checkTurnBudget(state)?.status).toBe("strategy_pivot");
  });

  it("returns null at zero turns", () => {
    const state: GraphState = { ...baseState(), implementationTurns: 0 };
    expect(checkTurnBudget(state)).toBeNull();
  });
});

describe("incrementTurnBudget", () => {
  it("increments by exactly 1", () => {
    const state: GraphState = { ...baseState(), implementationTurns: 3 };
    expect(incrementTurnBudget(state).implementationTurns).toBe(4);
  });

  it("increments from 0 to 1", () => {
    const state: GraphState = { ...baseState(), implementationTurns: 0 };
    expect(incrementTurnBudget(state).implementationTurns).toBe(1);
  });
});

describe("resetTurnBudget", () => {
  it("returns 0 regardless of current value", () => {
    expect(resetTurnBudget().implementationTurns).toBe(0);
  });
});

describe("implementNode — turn budget integration", () => {
  it("transitions to 'strategy_pivot' when turn budget is exceeded", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: MAX_IMPLEMENTATION_TURNS,
    };
    const result = implementNode(state);
    expect(result.status).toBe("strategy_pivot");
  });

  it("increments implementationTurns on normal execution", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: 3,
    };
    const result = implementNode(state);
    expect(result.implementationTurns).toBe(4);
  });

  it("returns 'implementing' status when budget is not exceeded", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: 0,
    };
    const result = implementNode(state);
    expect(result.status).toBe("implementing");
  });
});

// ── Entropy detection ─────────────────────────────────────────────────────────

function makeEntropyRecord(taskId: string, loopCount: number): EntropyRecord {
  return {
    outputHash: `hash-${loopCount}`,
    seenAt: "2026-02-21T10:00:00.000Z",
    taskId,
    loopCount,
  };
}

describe("detectEntropy", () => {
  it("returns false when activeTaskId is null", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      entropy: [makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD)],
    };
    expect(detectEntropy(state)).toBe(false);
  });

  it("returns false when entropy is empty", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      entropy: [],
    };
    expect(detectEntropy(state)).toBe(false);
  });

  it("returns false when loopCount is below threshold", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      entropy: [makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD - 1)],
    };
    expect(detectEntropy(state)).toBe(false);
  });

  it(`returns true at exactly ENTROPY_LOOP_THRESHOLD (${ENTROPY_LOOP_THRESHOLD})`, () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      entropy: [makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD)],
    };
    expect(detectEntropy(state)).toBe(true);
  });

  it("returns true above the threshold", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      entropy: [makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD + 2)],
    };
    expect(detectEntropy(state)).toBe(true);
  });

  it("only checks entropy for the active task (ignores other tasks)", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      entropy: [
        makeEntropyRecord("task-2", ENTROPY_LOOP_THRESHOLD), // different task
        makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD - 1), // active task below threshold
      ],
    };
    expect(detectEntropy(state)).toBe(false);
  });

  it("uses the most recent entropy entry for the active task", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      entropy: [
        makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD - 1),
        makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD), // most recent
      ],
    };
    expect(detectEntropy(state)).toBe(true);
  });

  it("triggers pivot in implementNode when entropy is detected", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-1",
      implementationTurns: 0,
      entropy: [makeEntropyRecord("task-1", ENTROPY_LOOP_THRESHOLD)],
    };
    const result = implementNode(state);
    expect(result.status).toBe("strategy_pivot");
    expect(result.pendingRecoveryNode).toBe("pivot_agent");
  });
});

// ── Chaos recovery ────────────────────────────────────────────────────────────

describe("findStaleOrDirtyStates", () => {
  it("returns empty array when no tasks are in_progress", () => {
    const state: GraphState = {
      ...baseState(),
      tasks: [
        { ...taskInProgress("task-1"), status: "completed" },
        { ...taskInProgress("task-2"), status: "pending" },
      ],
    };
    expect(findStaleOrDirtyStates(state)).toEqual([]);
  });

  it("returns stale task info for each in_progress task", () => {
    const state: GraphState = {
      ...baseState(),
      tasks: [taskInProgress("task-1"), taskInProgress("task-2")],
    };
    const stale = findStaleOrDirtyStates(state);
    expect(stale).toHaveLength(2);
    expect(stale[0].taskId).toBe("task-1");
    expect(stale[0].status).toBe("in_progress");
    expect(stale[1].taskId).toBe("task-2");
  });

  it("returns empty array for an empty task list", () => {
    const state: GraphState = { ...baseState(), tasks: [] };
    expect(findStaleOrDirtyStates(state)).toEqual([]);
  });

  it("includes name and epicId in the stale task info", () => {
    const state: GraphState = {
      ...baseState(),
      tasks: [taskInProgress("task-5")],
    };
    const stale = findStaleOrDirtyStates(state);
    expect(stale[0].name).toBe("Task task-5");
    expect(stale[0].epicId).toBe("epic-001");
  });

  it("does not include failed or completed tasks", () => {
    const state: GraphState = {
      ...baseState(),
      tasks: [
        { ...taskInProgress("task-1"), status: "failed" },
        { ...taskInProgress("task-2"), status: "completed" },
        taskInProgress("task-3"), // only this is stale
      ],
    };
    const stale = findStaleOrDirtyStates(state);
    expect(stale).toHaveLength(1);
    expect(stale[0].taskId).toBe("task-3");
  });
});

// ── pivotAgentNode ────────────────────────────────────────────────────────────

describe("pivotAgentNode", () => {
  it("transitions status to 'strategy_pivot'", () => {
    const result = pivotAgentNode(baseState());
    expect(result.status).toBe("strategy_pivot");
  });

  it("updates projectConfig.status to 'strategy_pivot'", () => {
    const result = pivotAgentNode(baseState());
    expect(result.projectConfig?.status).toBe("strategy_pivot");
  });

  it("resets implementationTurns to 0", () => {
    const state: GraphState = {
      ...baseState(),
      implementationTurns: MAX_IMPLEMENTATION_TURNS,
    };
    const result = pivotAgentNode(state);
    expect(result.implementationTurns).toBe(0);
  });

  it("clears pendingRecoveryNode", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "pivot_agent",
    };
    const result = pivotAgentNode(state);
    expect(result.pendingRecoveryNode).toBeNull();
  });

  it("does not mutate the input state", () => {
    const state = baseState();
    pivotAgentNode(state);
    expect(state.status).toBe("initializing");
  });
});

// ── OrchestrationGraph — robustness node registration ─────────────────────────

describe("OrchestrationGraph — robustness nodes registered", () => {
  it("includes 'error' node in the compiled graph", () => {
    const og = new OrchestrationGraph();
    const nodeKeys = Object.keys(og.graph.nodes);
    expect(nodeKeys).toContain("error");
  });

  it("includes 'pivot_agent' node in the compiled graph", () => {
    const og = new OrchestrationGraph();
    const nodeKeys = Object.keys(og.graph.nodes);
    expect(nodeKeys).toContain("pivot_agent");
  });

  it("has 9 user-defined nodes total (7 original + error + pivot_agent)", () => {
    const og = new OrchestrationGraph();
    // Object.keys includes the internal "__start__" node; filter it out for counting user nodes
    const userNodeKeys = Object.keys(og.graph.nodes).filter(
      (k) => !k.startsWith("__"),
    );
    expect(userNodeKeys).toHaveLength(9);
  });
});

// ── routeAfterVerify — pendingRecoveryNode integration ────────────────────────

describe("routeAfterVerify — pivot routing", () => {
  it("routes to 'pivot_agent' when pendingRecoveryNode is 'pivot_agent'", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: "pivot_agent",
    };
    expect(routeAfterVerify(state)).toBe("pivot_agent");
  });

  it("does NOT route to 'pivot_agent' when pendingRecoveryNode is null", () => {
    const state: GraphState = {
      ...baseState(),
      pendingRecoveryNode: null,
    };
    // No epics, no tasks → should route to END
    expect(routeAfterVerify(state)).not.toBe("pivot_agent");
  });
});
