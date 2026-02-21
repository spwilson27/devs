/**
 * packages/core/test/orchestration/graph.test.ts
 *
 * Integration tests for the OrchestrationGraph cyclical StateGraph.
 *
 * Tests verify:
 *   1. The OrchestrationGraph compiles correctly and has the expected nodes.
 *   2. Individual node stub functions return the correct state updates.
 *   3. The `routeAfterVerify` conditional router handles all routing branches:
 *      - verify → implement (active task failed — retry loop)
 *      - verify → distill  (task passed, active epics remain — advance)
 *      - verify → END      (all epics completed or failed — terminate)
 *   4. The full graph executes successfully and terminates when no work remains.
 *   5. The node execution sequence is correct:
 *      research → design → distill → implement → verify → (conditional routing)
 *
 * Requirements: [9_ROADMAP-TAS-101], [TAS-009], [TAS-103],
 *               [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]
 */

import { describe, it, expect } from "vitest";
import { END } from "@langchain/langgraph";
import {
  OrchestrationGraph,
  researchNode,
  designNode,
  distillNode,
  implementNode,
  verifyNode,
  routeAfterVerify,
} from "../../src/orchestration/graph.js";
import {
  createInitialState,
  type GraphState,
  type ProjectConfig,
  type TaskRecord,
  type EpicRecord,
} from "../../src/orchestration/types.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function validProjectConfig(): ProjectConfig {
  return {
    projectId: "proj-001",
    name: "Graph Test Project",
    description: "Tests for OrchestrationGraph",
    status: "initializing",
    createdAt: "2026-02-21T10:00:00.000Z",
    updatedAt: "2026-02-21T10:00:00.000Z",
  };
}

function baseState(): GraphState {
  return createInitialState(validProjectConfig()) as GraphState;
}

function taskWithStatus(
  taskId: string,
  status: TaskRecord["status"],
): TaskRecord {
  return {
    taskId,
    epicId: "epic-001",
    name: `Task ${taskId}`,
    description: "Stub task for routing tests",
    status,
    agentRole: "developer",
    dependsOn: [],
  };
}

function epicWithStatus(
  epicId: string,
  status: EpicRecord["status"],
): EpicRecord {
  return {
    epicId,
    projectId: "proj-001",
    name: `Epic ${epicId}`,
    description: "Stub epic for routing tests",
    status,
    phaseNumber: 1,
    requirementIds: [],
  };
}

// ── OrchestrationGraph — compilation and structure ───────────────────────────

describe("OrchestrationGraph — compilation", () => {
  it("compiles without errors", () => {
    const og = new OrchestrationGraph();
    expect(og.graph).toBeDefined();
  });

  it("compiled graph has all 5 required nodes", () => {
    const og = new OrchestrationGraph();
    const nodeKeys = Object.keys(og.graph.nodes);
    expect(nodeKeys).toContain("research");
    expect(nodeKeys).toContain("design");
    expect(nodeKeys).toContain("distill");
    expect(nodeKeys).toContain("implement");
    expect(nodeKeys).toContain("verify");
  });

  it("graph instances are independent (not shared state)", () => {
    const og1 = new OrchestrationGraph();
    const og2 = new OrchestrationGraph();
    expect(og1.graph).not.toBe(og2.graph);
  });
});

// ── researchNode ──────────────────────────────────────────────────────────────

describe("researchNode", () => {
  it("returns status 'researching'", () => {
    const result = researchNode(baseState());
    expect(result.status).toBe("researching");
  });

  it("updates projectConfig.status to 'researching'", () => {
    const result = researchNode(baseState());
    expect(result.projectConfig?.status).toBe("researching");
  });

  it("does not mutate the input state", () => {
    const state = baseState();
    researchNode(state);
    expect(state.status).toBe("initializing");
  });
});

// ── designNode ────────────────────────────────────────────────────────────────

describe("designNode", () => {
  it("returns status 'specifying'", () => {
    const result = designNode(baseState());
    expect(result.status).toBe("specifying");
  });

  it("updates projectConfig.status to 'specifying'", () => {
    const result = designNode(baseState());
    expect(result.projectConfig?.status).toBe("specifying");
  });

  it("does not mutate the input state", () => {
    const state = baseState();
    designNode(state);
    expect(state.status).toBe("initializing");
  });
});

// ── distillNode ───────────────────────────────────────────────────────────────

describe("distillNode", () => {
  it("returns status 'planning'", () => {
    const result = distillNode(baseState());
    expect(result.status).toBe("planning");
  });

  it("updates projectConfig.status to 'planning'", () => {
    const result = distillNode(baseState());
    expect(result.projectConfig?.status).toBe("planning");
  });

  it("does not mutate the input state", () => {
    const state = baseState();
    distillNode(state);
    expect(state.status).toBe("initializing");
  });
});

// ── implementNode ─────────────────────────────────────────────────────────────

describe("implementNode", () => {
  it("returns status 'implementing'", () => {
    const result = implementNode(baseState());
    expect(result.status).toBe("implementing");
  });

  it("updates projectConfig.status to 'implementing'", () => {
    const result = implementNode(baseState());
    expect(result.projectConfig?.status).toBe("implementing");
  });

  it("does not mutate the input state", () => {
    const state = baseState();
    implementNode(state);
    expect(state.status).toBe("initializing");
  });
});

// ── verifyNode ────────────────────────────────────────────────────────────────

describe("verifyNode", () => {
  it("marks the active task as 'completed'", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-001",
      tasks: [taskWithStatus("task-001", "in_progress")],
    };
    const result = verifyNode(state);
    const updated = result.tasks?.find((t) => t.taskId === "task-001");
    expect(updated?.status).toBe("completed");
  });

  it("does not modify other tasks", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-001",
      tasks: [
        taskWithStatus("task-001", "in_progress"),
        taskWithStatus("task-002", "pending"),
      ],
    };
    const result = verifyNode(state);
    const other = result.tasks?.find((t) => t.taskId === "task-002");
    expect(other?.status).toBe("pending");
  });

  it("handles null activeTaskId gracefully (no task updated)", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [taskWithStatus("task-001", "in_progress")],
    };
    const result = verifyNode(state);
    const task = result.tasks?.find((t) => t.taskId === "task-001");
    // No active task → map is identity for all tasks
    expect(task?.status).toBe("in_progress");
  });

  it("handles empty task list without error", () => {
    const state: GraphState = { ...baseState(), tasks: [], activeTaskId: null };
    const result = verifyNode(state);
    expect(result.tasks).toEqual([]);
  });
});

// ── routeAfterVerify — conditional routing ────────────────────────────────────

describe("routeAfterVerify — routing logic", () => {
  it("routes to 'implement' when the active task has failed (retry loop)", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-001",
      tasks: [taskWithStatus("task-001", "failed")],
      epics: [],
    };
    expect(routeAfterVerify(state)).toBe("implement");
  });

  it("routes to 'distill' when an active epic exists", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [epicWithStatus("epic-001", "active")],
    };
    expect(routeAfterVerify(state)).toBe("distill");
  });

  it("routes to 'distill' when a pending epic exists", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [epicWithStatus("epic-001", "pending")],
    };
    expect(routeAfterVerify(state)).toBe("distill");
  });

  it("routes to END when all epics are completed", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [epicWithStatus("epic-001", "completed")],
    };
    expect(routeAfterVerify(state)).toBe(END);
  });

  it("routes to END when all epics are in terminal 'failed' state", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [epicWithStatus("epic-001", "failed")],
    };
    expect(routeAfterVerify(state)).toBe(END);
  });

  it("routes to END when there are no epics and no tasks", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [],
    };
    expect(routeAfterVerify(state)).toBe(END);
  });

  it("failed task takes priority over active epics (retry before advancing)", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-001",
      tasks: [taskWithStatus("task-001", "failed")],
      epics: [epicWithStatus("epic-001", "active")],
    };
    // Even though there are active epics, the failed task must be retried first
    expect(routeAfterVerify(state)).toBe("implement");
  });

  it("routes to 'distill' when mixed completed+active epics exist", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [
        epicWithStatus("epic-001", "completed"),
        epicWithStatus("epic-002", "active"),
      ],
    };
    expect(routeAfterVerify(state)).toBe("distill");
  });

  it("routes to END when all epics are completed (multiple epics)", () => {
    const state: GraphState = {
      ...baseState(),
      activeTaskId: null,
      tasks: [],
      epics: [
        epicWithStatus("epic-001", "completed"),
        epicWithStatus("epic-002", "completed"),
        epicWithStatus("epic-003", "failed"),
      ],
    };
    expect(routeAfterVerify(state)).toBe(END);
  });

  it("non-failed active task does not trigger retry", () => {
    // Task exists but is NOT failed — should check epics next
    const state: GraphState = {
      ...baseState(),
      activeTaskId: "task-001",
      tasks: [taskWithStatus("task-001", "completed")],
      epics: [],
    };
    // Completed task + no epics → END
    expect(routeAfterVerify(state)).toBe(END);
  });
});

// ── Full graph integration — end-to-end execution ─────────────────────────────

describe("OrchestrationGraph — full pipeline execution", () => {
  it("executes the full pipeline (research→design→distill→implement→verify) and terminates", async () => {
    const og = new OrchestrationGraph();
    // Initial state: no epics, no tasks → verifyNode will route to END after first pass
    const initial = createInitialState(validProjectConfig()) as GraphState;

    const result = await og.graph.invoke(initial);

    // The last status-updating node is implementNode → "implementing"
    expect(result.status).toBe("implementing");
  });

  it("final state has projectConfig.status matching the pipeline end status", async () => {
    const og = new OrchestrationGraph();
    const initial = createInitialState(validProjectConfig()) as GraphState;

    const result = await og.graph.invoke(initial);

    // projectConfig is updated by each node in sequence:
    // initializing → researching → specifying → planning → implementing
    expect(result.projectConfig.status).toBe("implementing");
  });

  it("final state preserves all original state fields that no node modified", async () => {
    const og = new OrchestrationGraph();
    const initial = createInitialState(validProjectConfig()) as GraphState;

    const result = await og.graph.invoke(initial);

    // Fields not modified by any stub node remain as initialized
    expect(result.activeEpicId).toBeNull();
    expect(result.activeTaskId).toBeNull();
    expect(result.documents).toEqual([]);
    expect(result.requirements).toEqual([]);
    expect(result.agentLogs).toEqual([]);
    expect(result.entropy).toEqual([]);
  });

  it("graph invoke returns an OrchestratorState-compatible object", async () => {
    const og = new OrchestrationGraph();
    const initial = createInitialState(validProjectConfig()) as GraphState;

    const result = await og.graph.invoke(initial);

    // Shape check — all top-level fields must be present
    expect(result).toHaveProperty("projectConfig");
    expect(result).toHaveProperty("documents");
    expect(result).toHaveProperty("requirements");
    expect(result).toHaveProperty("epics");
    expect(result).toHaveProperty("tasks");
    expect(result).toHaveProperty("agentLogs");
    expect(result).toHaveProperty("entropy");
    expect(result).toHaveProperty("activeEpicId");
    expect(result).toHaveProperty("activeTaskId");
    expect(result).toHaveProperty("status");
  });
});
