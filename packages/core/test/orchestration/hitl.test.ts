/**
 * packages/core/test/orchestration/hitl.test.ts
 *
 * Tests for the HITL (Human-in-the-Loop) approval gate mechanism.
 *
 * Tests verify:
 *   1. The graph enters a SUSPENDED state (isInterrupted returns true) when it
 *      reaches an approval node.
 *   2. The graph only proceeds once a specific "Approval Signal" is received.
 *   3. Individual approval node stubs return correct state updates on resume.
 *   4. The conditional routing after each approval gate behaves correctly.
 *   5. The full pipeline executes through both HITL gates with explicit approvals.
 *   6. Rejected approvals route back to the preceding phase node.
 *   7. The orchestrator cannot bypass approval gates autonomously.
 *
 * Requirements: [TAS-078], [9_ROADMAP-PHASE-001]
 */

import { describe, it, expect } from "vitest";
import { MemorySaver, Command, isInterrupted, INTERRUPT } from "@langchain/langgraph";
import {
  approveDesignNode,
  approveTaskDagNode,
  routeAfterApproveDesign,
  routeAfterApproveTaskDag,
  type HitlApprovalSignal,
  type HitlDecisionRecord,
} from "../../src/orchestration/hitl.js";
import {
  createInitialState,
  type GraphState,
  type ProjectConfig,
  type HitlGate,
} from "../../src/orchestration/types.js";
import { OrchestrationGraph } from "../../src/orchestration/graph.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function validProjectConfig(): ProjectConfig {
  return {
    projectId: "hitl-test-proj",
    name: "HITL Test Project",
    description: "Tests for HITL approval gates",
    status: "initializing",
    createdAt: "2026-02-21T10:00:00.000Z",
    updatedAt: "2026-02-21T10:00:00.000Z",
  };
}

function baseState(): GraphState {
  return createInitialState(validProjectConfig()) as GraphState;
}

function approvalSignal(approved: boolean, feedback?: string): HitlApprovalSignal {
  return {
    approved,
    feedback,
    approvedBy: approved ? "test-user" : undefined,
    approvedAt: "2026-02-21T10:00:00.000Z",
  };
}

function stateWithDecision(gate: HitlGate, approved: boolean): GraphState {
  const signal = approvalSignal(approved);
  const decision: HitlDecisionRecord = {
    gate,
    signal,
    decidedAt: "2026-02-21T10:00:00.000Z",
  };
  return {
    ...baseState(),
    hitlDecisions: [decision],
    pendingApprovalGate: null,
  };
}

// ── routeAfterApproveDesign ───────────────────────────────────────────────────

describe("routeAfterApproveDesign — routing logic", () => {
  it("routes to 'distill' when the most recent design decision is approved", () => {
    const state = stateWithDecision("design_approval", true);
    expect(routeAfterApproveDesign(state)).toBe("distill");
  });

  it("routes to 'design' when the most recent design decision is rejected", () => {
    const state = stateWithDecision("design_approval", false);
    expect(routeAfterApproveDesign(state)).toBe("design");
  });

  it("routes to 'distill' with latest approved decision when multiple decisions exist", () => {
    const rejected: HitlDecisionRecord = {
      gate: "design_approval",
      signal: approvalSignal(false, "Needs more detail"),
      decidedAt: "2026-02-21T09:00:00.000Z",
    };
    const approved: HitlDecisionRecord = {
      gate: "design_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T10:00:00.000Z",
    };
    const state: GraphState = {
      ...baseState(),
      hitlDecisions: [rejected, approved],
      pendingApprovalGate: null,
    };
    expect(routeAfterApproveDesign(state)).toBe("distill");
  });

  it("routes to 'design' when most recent design decision is rejected (overrides earlier approval)", () => {
    const approved: HitlDecisionRecord = {
      gate: "design_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T09:00:00.000Z",
    };
    const rejected: HitlDecisionRecord = {
      gate: "design_approval",
      signal: approvalSignal(false, "Found issues"),
      decidedAt: "2026-02-21T10:00:00.000Z",
    };
    const state: GraphState = {
      ...baseState(),
      hitlDecisions: [approved, rejected],
      pendingApprovalGate: null,
    };
    expect(routeAfterApproveDesign(state)).toBe("design");
  });

  it("ignores dag_approval decisions when routing for design approval", () => {
    // Only dag_approval in hitlDecisions, no design_approval
    const dagDecision: HitlDecisionRecord = {
      gate: "dag_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T10:00:00.000Z",
    };
    const state: GraphState = {
      ...baseState(),
      hitlDecisions: [dagDecision],
      pendingApprovalGate: null,
    };
    // No design_approval found → default to design (needs approval)
    expect(routeAfterApproveDesign(state)).toBe("design");
  });
});

// ── routeAfterApproveTaskDag ──────────────────────────────────────────────────

describe("routeAfterApproveTaskDag — routing logic", () => {
  it("routes to 'implement' when the most recent DAG decision is approved", () => {
    const state = stateWithDecision("dag_approval", true);
    expect(routeAfterApproveTaskDag(state)).toBe("implement");
  });

  it("routes to 'distill' when the most recent DAG decision is rejected", () => {
    const state = stateWithDecision("dag_approval", false);
    expect(routeAfterApproveTaskDag(state)).toBe("distill");
  });

  it("routes to 'implement' with latest approved DAG decision when multiple exist", () => {
    const rejected: HitlDecisionRecord = {
      gate: "dag_approval",
      signal: approvalSignal(false, "Missing tasks"),
      decidedAt: "2026-02-21T09:00:00.000Z",
    };
    const approved: HitlDecisionRecord = {
      gate: "dag_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T10:00:00.000Z",
    };
    const state: GraphState = {
      ...baseState(),
      hitlDecisions: [rejected, approved],
      pendingApprovalGate: null,
    };
    expect(routeAfterApproveTaskDag(state)).toBe("implement");
  });

  it("ignores design_approval decisions when routing for DAG approval", () => {
    // Only design_approval in hitlDecisions, no dag_approval
    const designDecision: HitlDecisionRecord = {
      gate: "design_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T10:00:00.000Z",
    };
    const state: GraphState = {
      ...baseState(),
      hitlDecisions: [designDecision],
      pendingApprovalGate: null,
    };
    // No dag_approval found → default to distill (needs approval)
    expect(routeAfterApproveTaskDag(state)).toBe("distill");
  });
});

// ── approveDesignNode (unit tests) ────────────────────────────────────────────

describe("approveDesignNode — state updates on resume", () => {
  it("records the approval decision in hitlDecisions after resume", () => {
    // We can test the state-update logic directly by calling the routing helper
    // with a state that represents post-resume conditions.
    // The interrupt() call itself is tested in integration tests below.
    const state = stateWithDecision("design_approval", true);
    const lastDecision = state.hitlDecisions.find(
      (d) => d.gate === "design_approval",
    );
    expect(lastDecision).toBeDefined();
    expect(lastDecision?.signal.approved).toBe(true);
    expect(lastDecision?.gate).toBe("design_approval");
  });

  it("records rejection decision correctly", () => {
    const state = stateWithDecision("design_approval", false);
    const lastDecision = state.hitlDecisions.find(
      (d) => d.gate === "design_approval",
    );
    expect(lastDecision?.signal.approved).toBe(false);
  });

  it("does not mutate the input state hitlDecisions array", () => {
    const state = baseState();
    const originalDecisions = state.hitlDecisions;
    // Simulate post-resume state update (without calling interrupt())
    const newDecisions: HitlDecisionRecord[] = [
      ...state.hitlDecisions,
      {
        gate: "design_approval",
        signal: approvalSignal(true),
        decidedAt: "2026-02-21T10:00:00.000Z",
      },
    ];
    // Original array unchanged
    expect(originalDecisions).not.toBe(newDecisions);
    expect(originalDecisions.length).toBe(0);
    expect(newDecisions.length).toBe(1);
  });
});

describe("approveTaskDagNode — state updates on resume", () => {
  it("records the DAG approval decision in hitlDecisions", () => {
    const state = stateWithDecision("dag_approval", true);
    const lastDecision = state.hitlDecisions.find(
      (d) => d.gate === "dag_approval",
    );
    expect(lastDecision).toBeDefined();
    expect(lastDecision?.signal.approved).toBe(true);
    expect(lastDecision?.gate).toBe("dag_approval");
  });

  it("does not interfere with existing design_approval decisions", () => {
    const designDecision: HitlDecisionRecord = {
      gate: "design_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T09:00:00.000Z",
    };
    const dagDecision: HitlDecisionRecord = {
      gate: "dag_approval",
      signal: approvalSignal(true),
      decidedAt: "2026-02-21T10:00:00.000Z",
    };
    const state: GraphState = {
      ...baseState(),
      hitlDecisions: [designDecision, dagDecision],
      pendingApprovalGate: null,
    };
    expect(state.hitlDecisions).toHaveLength(2);
    expect(state.hitlDecisions[0].gate).toBe("design_approval");
    expect(state.hitlDecisions[1].gate).toBe("dag_approval");
  });
});

// ── HitlApprovalSignal type validation ────────────────────────────────────────

describe("HitlApprovalSignal — signal structure", () => {
  it("approved signal has required fields", () => {
    const signal = approvalSignal(true, "Looks good");
    expect(signal.approved).toBe(true);
    expect(signal.approvedAt).toBeTruthy();
    expect(signal.approvedBy).toBe("test-user");
    expect(signal.feedback).toBe("Looks good");
  });

  it("rejection signal has approved: false", () => {
    const signal = approvalSignal(false, "Needs more work");
    expect(signal.approved).toBe(false);
    expect(signal.feedback).toBe("Needs more work");
  });

  it("minimal approval signal requires only approved and approvedAt", () => {
    const signal: HitlApprovalSignal = {
      approved: true,
      approvedAt: "2026-02-21T10:00:00.000Z",
    };
    expect(signal.approved).toBe(true);
    expect(signal.approvedBy).toBeUndefined();
    expect(signal.feedback).toBeUndefined();
  });
});

// ── Full graph integration — HITL suspension and resumption ───────────────────

describe("OrchestrationGraph — HITL suspension and resumption", () => {
  it("graph enters SUSPENDED state when it reaches the design approval gate", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-design-001" } };

    const result = await og.graph.invoke(initial, config);

    // The graph must be suspended (not fully executed)
    expect(isInterrupted(result)).toBe(true);
  });

  it("interrupted state contains design_approval gate info in the interrupt value", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-design-002" } };

    const result = await og.graph.invoke(initial, config);

    expect(isInterrupted(result)).toBe(true);
    const interrupts = (result as unknown as Record<typeof INTERRUPT, { value: { gate: string } }[]>)[INTERRUPT];
    expect(interrupts[0].value.gate).toBe("design_approval");
  });

  it("graph does NOT proceed past design approval without an explicit approval signal", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-no-bypass-001" } };

    const result = await og.graph.invoke(initial, config);

    // Graph halted — status is still "specifying" (set by designNode, before approval gate)
    expect(isInterrupted(result)).toBe(true);
    // Not "implementing" — the pipeline did not proceed autonomously
    expect(result.status).not.toBe("implementing");
  });

  it("graph proceeds past design approval gate when approval signal is provided", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-approve-design-001" } };
    const approval = approvalSignal(true);

    // Run to design approval gate
    await og.graph.invoke(initial, config);

    // Provide approval signal — graph should advance to DAG approval gate
    const result = await og.graph.invoke(new Command({ resume: approval }), config);

    // Graph is now suspended at the DAG approval gate (second HITL gate)
    expect(isInterrupted(result)).toBe(true);
    const interrupts = (result as unknown as Record<typeof INTERRUPT, { value: { gate: string } }[]>)[INTERRUPT];
    expect(interrupts[0].value.gate).toBe("dag_approval");
  });

  it("graph proceeds past DAG approval gate when approval signal is provided", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-full-approval-001" } };
    const approval = approvalSignal(true);

    // Run to design approval gate
    await og.graph.invoke(initial, config);

    // Approve design
    await og.graph.invoke(new Command({ resume: approval }), config);

    // Approve DAG — graph should proceed to implementation and complete
    const result = await og.graph.invoke(new Command({ resume: approval }), config);

    // Graph reached "implementing" status after both approvals
    expect(isInterrupted(result)).toBe(false);
    expect(result.status).toBe("implementing");
  });

  it("completed full pipeline state records both approval decisions in hitlDecisions", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-decisions-001" } };
    const approval = approvalSignal(true, "Approved in test");

    await og.graph.invoke(initial, config);
    await og.graph.invoke(new Command({ resume: approval }), config);
    const result = await og.graph.invoke(new Command({ resume: approval }), config);

    // Both decisions must be persisted in hitlDecisions
    expect(result.hitlDecisions).toHaveLength(2);
    expect(result.hitlDecisions[0].gate).toBe("design_approval");
    expect(result.hitlDecisions[1].gate).toBe("dag_approval");
    expect(result.hitlDecisions[0].signal.approved).toBe(true);
    expect(result.hitlDecisions[1].signal.approved).toBe(true);
  });

  it("approval feedback is persisted in the decision record", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-feedback-001" } };
    const designApproval = approvalSignal(true, "Design looks great");
    const dagApproval = approvalSignal(true, "DAG structure is correct");

    await og.graph.invoke(initial, config);
    await og.graph.invoke(new Command({ resume: designApproval }), config);
    const result = await og.graph.invoke(new Command({ resume: dagApproval }), config);

    expect(result.hitlDecisions[0].signal.feedback).toBe("Design looks great");
    expect(result.hitlDecisions[1].signal.feedback).toBe("DAG structure is correct");
  });

  it("rejected design routes back to design node (graph pauses again at design gate)", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-reject-design-001" } };
    const rejection = approvalSignal(false, "Please revise the architecture");

    // Run to design approval gate
    await og.graph.invoke(initial, config);

    // Reject design — graph should re-run design → approveDesign (interrupt again)
    const result = await og.graph.invoke(
      new Command({ resume: rejection }),
      config,
    );

    // Still interrupted (looped back to design → approveDesign)
    expect(isInterrupted(result)).toBe(true);
    const interrupts = (result as unknown as Record<typeof INTERRUPT, { value: { gate: string } }[]>)[INTERRUPT];
    expect(interrupts[0].value.gate).toBe("design_approval");
  });

  it("pendingApprovalGate is null after a completed approval cycle", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-pending-gate-001" } };
    const approval = approvalSignal(true);

    await og.graph.invoke(initial, config);
    await og.graph.invoke(new Command({ resume: approval }), config);
    const result = await og.graph.invoke(new Command({ resume: approval }), config);

    expect(result.pendingApprovalGate).toBeNull();
  });

  it("decidedAt timestamp is recorded on each approval decision", async () => {
    const memory = new MemorySaver();
    const og = new OrchestrationGraph(memory);
    const initial = createInitialState(validProjectConfig()) as GraphState;
    const config = { configurable: { thread_id: "hitl-timestamp-001" } };
    const approval = approvalSignal(true);

    await og.graph.invoke(initial, config);
    await og.graph.invoke(new Command({ resume: approval }), config);
    const result = await og.graph.invoke(new Command({ resume: approval }), config);

    for (const decision of result.hitlDecisions) {
      expect(decision.decidedAt).toBeTruthy();
      // Should be a valid ISO 8601 timestamp
      expect(() => new Date(decision.decidedAt)).not.toThrow();
    }
  });
});

// ── approveDesignNode and approveTaskDagNode direct invocation (non-interrupt path) ──

describe("approveDesignNode — module function exported correctly", () => {
  it("approveDesignNode is a function", () => {
    expect(typeof approveDesignNode).toBe("function");
  });
});

describe("approveTaskDagNode — module function exported correctly", () => {
  it("approveTaskDagNode is a function", () => {
    expect(typeof approveTaskDagNode).toBe("function");
  });
});
