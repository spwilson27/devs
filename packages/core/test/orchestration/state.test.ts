/**
 * packages/core/test/orchestration/state.test.ts
 *
 * Type validation and factory tests for the OrchestratorState definitions.
 *
 * Tests validate:
 *   1. The `createInitialState` factory produces a valid, fully-populated state.
 *   2. All mandatory fields (projectId, activeEpicId, activeTaskId, status) are
 *      present and correctly typed.
 *   3. Collection fields default to empty arrays.
 *   4. `AgentLogRecord` integrates correctly with the TurnEnvelope schemas.
 *   5. The LangGraph `OrchestratorAnnotation` is defined and has the expected keys.
 *
 * Requirements: [TAS-097], [2_TAS-REQ-016], [9_ROADMAP-PHASE-001]
 */

import { describe, it, expect } from "vitest";
import {
  createInitialState,
  OrchestratorAnnotation,
  type OrchestratorState,
  type ProjectConfig,
  type ProjectStatus,
  type DocumentStatus,
  type RequirementStatus,
  type EpicStatus,
  type TaskStatus,
  type DocumentRecord,
  type RequirementRecord,
  type EpicRecord,
  type TaskRecord,
  type AgentLogRecord,
  type EntropyRecord,
  type GraphState,
} from "../../src/orchestration/types.js";

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Returns a fully valid ProjectConfig fixture. */
function validProjectConfig(): ProjectConfig {
  return {
    projectId: "proj-uuid-001",
    name: "Test Project",
    description: "A project for testing orchestration state",
    status: "initializing",
    createdAt: "2026-02-21T10:00:00.000Z",
    updatedAt: "2026-02-21T10:00:00.000Z",
  };
}

/** Returns a fully valid DocumentRecord fixture. */
function validDocumentRecord(): DocumentRecord {
  return {
    documentId: "doc-uuid-001",
    projectId: "proj-uuid-001",
    type: "PRD",
    title: "Product Requirements Document",
    content: "# PRD\n\nThis is the PRD.",
    status: "draft",
    version: 1,
    createdAt: "2026-02-21T10:00:00.000Z",
    updatedAt: "2026-02-21T10:00:00.000Z",
  };
}

/** Returns a fully valid RequirementRecord fixture. */
function validRequirementRecord(): RequirementRecord {
  return {
    requirementId: "req-uuid-001",
    projectId: "proj-uuid-001",
    externalId: "TAS-097",
    description: "Define the orchestration state",
    status: "pending",
    dependsOn: [],
  };
}

/** Returns a fully valid EpicRecord fixture. */
function validEpicRecord(): EpicRecord {
  return {
    epicId: "epic-uuid-001",
    projectId: "proj-uuid-001",
    name: "Phase 4: LangGraph Core Orchestration Engine",
    description: "Implement the core orchestration engine",
    status: "active",
    phaseNumber: 4,
    requirementIds: ["req-uuid-001"],
  };
}

/** Returns a fully valid TaskRecord fixture. */
function validTaskRecord(): TaskRecord {
  return {
    taskId: "task-uuid-001",
    epicId: "epic-uuid-001",
    name: "Define Orchestration State and Types",
    description: "Define OrchestratorState interface and LangGraph annotations",
    status: "in_progress",
    agentRole: "developer",
    dependsOn: [],
  };
}

/** Returns a fully valid AgentLogRecord fixture. */
function validAgentLogRecord(): AgentLogRecord {
  return {
    logId: "log-uuid-001",
    taskId: "task-uuid-001",
    turnIndex: 0,
    agentId: "developer",
    content: {
      thought: "Analyzing the task requirements to define state types.",
      action: "Writing TypeScript interface definitions.",
      observation: "No prior state definitions exist; starting fresh.",
    },
    metadata: {
      version: "1.0.0",
      task_id: "task-uuid-001",
      timestamp: "2026-02-21T10:00:00.000Z",
      confidence: 0.9,
      estimated_complexity: "medium",
    },
  };
}

/** Returns a fully valid EntropyRecord fixture. */
function validEntropyRecord(): EntropyRecord {
  return {
    outputHash: "a3f5b7c9d1e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4",
    seenAt: "2026-02-21T10:00:00.000Z",
    taskId: "task-uuid-001",
    loopCount: 1,
  };
}

// ── createInitialState ────────────────────────────────────────────────────────

describe("createInitialState", () => {
  it("returns an object with all required top-level fields", () => {
    const state = createInitialState(validProjectConfig());

    expect(state).toHaveProperty("projectConfig");
    expect(state).toHaveProperty("documents");
    expect(state).toHaveProperty("requirements");
    expect(state).toHaveProperty("epics");
    expect(state).toHaveProperty("tasks");
    expect(state).toHaveProperty("agentLogs");
    expect(state).toHaveProperty("entropy");
    expect(state).toHaveProperty("activeEpicId");
    expect(state).toHaveProperty("activeTaskId");
    expect(state).toHaveProperty("status");
  });

  it("stores the projectConfig unchanged", () => {
    const config = validProjectConfig();
    const state = createInitialState(config);

    expect(state.projectConfig).toEqual(config);
    expect(state.projectConfig.projectId).toBe("proj-uuid-001");
    expect(state.projectConfig.name).toBe("Test Project");
  });

  it("initializes all collection fields as empty arrays", () => {
    const state = createInitialState(validProjectConfig());

    expect(state.documents).toEqual([]);
    expect(state.requirements).toEqual([]);
    expect(state.epics).toEqual([]);
    expect(state.tasks).toEqual([]);
    expect(state.agentLogs).toEqual([]);
    expect(state.entropy).toEqual([]);
  });

  it("sets activeEpicId to null", () => {
    const state = createInitialState(validProjectConfig());
    expect(state.activeEpicId).toBeNull();
  });

  it("sets activeTaskId to null", () => {
    const state = createInitialState(validProjectConfig());
    expect(state.activeTaskId).toBeNull();
  });

  it("mirrors projectConfig.status in the top-level status field", () => {
    const config: ProjectConfig = { ...validProjectConfig(), status: "planning" };
    const state = createInitialState(config);
    expect(state.status).toBe("planning");
  });

  it("produces a state that satisfies the OrchestratorState interface (compile-time check)", () => {
    const state: OrchestratorState = createInitialState(validProjectConfig());
    // If this assignment compiles, the return type is structurally correct.
    expect(state).toBeDefined();
  });

  it("initializes errorHistory to an empty array", () => {
    const state = createInitialState(validProjectConfig());
    expect(state.errorHistory).toEqual([]);
  });

  it("initializes implementationTurns to 0", () => {
    const state = createInitialState(validProjectConfig());
    expect(state.implementationTurns).toBe(0);
  });

  it("initializes pendingRecoveryNode to null", () => {
    const state = createInitialState(validProjectConfig());
    expect(state.pendingRecoveryNode).toBeNull();
  });
});

// ── ProjectConfig ─────────────────────────────────────────────────────────────

describe("ProjectConfig", () => {
  it("accepts all valid ProjectStatus values", () => {
    const validStatuses: ProjectStatus[] = [
      "initializing",
      "researching",
      "specifying",
      "planning",
      "implementing",
      "completed",
      "failed",
      // Robustness statuses (Phase 1 / Task 05)
      "error",
      "strategy_pivot",
    ];
    for (const status of validStatuses) {
      const config: ProjectConfig = { ...validProjectConfig(), status };
      const state = createInitialState(config);
      expect(state.status).toBe(status);
    }
  });

  it("includes projectId, name, description, status, createdAt, updatedAt", () => {
    const config = validProjectConfig();
    expect(config.projectId).toBeDefined();
    expect(config.name).toBeDefined();
    expect(config.description).toBeDefined();
    expect(config.status).toBeDefined();
    expect(config.createdAt).toBeDefined();
    expect(config.updatedAt).toBeDefined();
  });
});

// ── DocumentRecord ────────────────────────────────────────────────────────────

describe("DocumentRecord", () => {
  it("can be constructed with all required fields", () => {
    const doc = validDocumentRecord();
    expect(doc.documentId).toBe("doc-uuid-001");
    expect(doc.type).toBe("PRD");
    expect(doc.status).toBe("draft");
    expect(doc.version).toBe(1);
  });

  it("accepts all valid DocumentStatus values", () => {
    const statuses: DocumentStatus[] = ["draft", "approved", "superseded"];
    for (const status of statuses) {
      const doc: DocumentRecord = { ...validDocumentRecord(), status };
      expect(doc.status).toBe(status);
    }
  });

  it("is accepted in the state documents array", () => {
    const state: OrchestratorState = {
      ...createInitialState(validProjectConfig()),
      documents: [validDocumentRecord()],
    };
    expect(state.documents).toHaveLength(1);
    expect(state.documents[0]!.type).toBe("PRD");
  });
});

// ── RequirementRecord ─────────────────────────────────────────────────────────

describe("RequirementRecord", () => {
  it("can be constructed with all required fields", () => {
    const req = validRequirementRecord();
    expect(req.requirementId).toBe("req-uuid-001");
    expect(req.externalId).toBe("TAS-097");
    expect(req.dependsOn).toEqual([]);
  });

  it("accepts all valid RequirementStatus values", () => {
    const statuses: RequirementStatus[] = [
      "pending",
      "active",
      "satisfied",
      "blocked",
    ];
    for (const status of statuses) {
      const req: RequirementRecord = { ...validRequirementRecord(), status };
      expect(req.status).toBe(status);
    }
  });

  it("supports dependsOn with multiple requirement IDs (DAG edges)", () => {
    const req: RequirementRecord = {
      ...validRequirementRecord(),
      requirementId: "req-uuid-002",
      externalId: "TAS-098",
      dependsOn: ["req-uuid-001"],
    };
    expect(req.dependsOn).toHaveLength(1);
    expect(req.dependsOn[0]).toBe("req-uuid-001");
  });
});

// ── EpicRecord ────────────────────────────────────────────────────────────────

describe("EpicRecord", () => {
  it("can be constructed with all required fields", () => {
    const epic = validEpicRecord();
    expect(epic.epicId).toBe("epic-uuid-001");
    expect(epic.phaseNumber).toBe(4);
    expect(epic.requirementIds).toHaveLength(1);
  });

  it("accepts all valid EpicStatus values", () => {
    const statuses: EpicStatus[] = ["pending", "active", "completed", "failed"];
    for (const status of statuses) {
      const epic: EpicRecord = { ...validEpicRecord(), status };
      expect(epic.status).toBe(status);
    }
  });
});

// ── TaskRecord ────────────────────────────────────────────────────────────────

describe("TaskRecord", () => {
  it("can be constructed with all required fields", () => {
    const task = validTaskRecord();
    expect(task.taskId).toBe("task-uuid-001");
    expect(task.agentRole).toBe("developer");
    expect(task.dependsOn).toEqual([]);
  });

  it("accepts all valid TaskStatus values", () => {
    const statuses: TaskStatus[] = [
      "pending",
      "in_progress",
      "completed",
      "failed",
      "blocked",
    ];
    for (const status of statuses) {
      const task: TaskRecord = { ...validTaskRecord(), status };
      expect(task.status).toBe(status);
    }
  });

  it("accepts all valid agentRole values", () => {
    const roles = ["researcher", "architect", "developer", "reviewer"] as const;
    for (const role of roles) {
      const task: TaskRecord = { ...validTaskRecord(), agentRole: role };
      expect(task.agentRole).toBe(role);
    }
  });

  it("accepts an optional gitHash field", () => {
    const task: TaskRecord = {
      ...validTaskRecord(),
      gitHash: "abc123def456",
    };
    expect(task.gitHash).toBe("abc123def456");
  });

  it("gitHash is optional — works without it", () => {
    const task = validTaskRecord();
    expect(task.gitHash).toBeUndefined();
  });
});

// ── AgentLogRecord — integration with TurnEnvelope schemas ───────────────────

describe("AgentLogRecord — TurnEnvelope integration", () => {
  it("can be constructed with TurnContent and TurnMetadata fields", () => {
    const log = validAgentLogRecord();
    expect(log.agentId).toBe("developer");
    expect(log.turnIndex).toBe(0);
    expect(log.content.thought).toContain("Analyzing");
    expect(log.content.action).toContain("Writing");
    expect(log.content.observation).toContain("No prior");
  });

  it("embeds TurnMetadata with version, task_id, confidence, and complexity", () => {
    const log = validAgentLogRecord();
    expect(log.metadata.version).toBe("1.0.0");
    expect(log.metadata.task_id).toBe("task-uuid-001");
    expect(log.metadata.confidence).toBe(0.9);
    expect(log.metadata.estimated_complexity).toBe("medium");
    expect(log.metadata.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("accepts all four valid agentId values", () => {
    const roles = ["researcher", "architect", "developer", "reviewer"] as const;
    for (const agentId of roles) {
      const log: AgentLogRecord = { ...validAgentLogRecord(), agentId };
      expect(log.agentId).toBe(agentId);
    }
  });

  it("is accepted in the state agentLogs array", () => {
    const state: OrchestratorState = {
      ...createInitialState(validProjectConfig()),
      agentLogs: [validAgentLogRecord()],
    };
    expect(state.agentLogs).toHaveLength(1);
    expect(state.agentLogs[0]!.agentId).toBe("developer");
  });
});

// ── EntropyRecord ─────────────────────────────────────────────────────────────

describe("EntropyRecord", () => {
  it("can be constructed with all required fields", () => {
    const record = validEntropyRecord();
    expect(record.outputHash).toHaveLength(64); // SHA-256 hex = 64 chars
    expect(record.loopCount).toBe(1);
    expect(record.taskId).toBe("task-uuid-001");
  });

  it("is accepted in the state entropy array", () => {
    const state: OrchestratorState = {
      ...createInitialState(validProjectConfig()),
      entropy: [validEntropyRecord()],
    };
    expect(state.entropy).toHaveLength(1);
    expect(state.entropy[0]!.loopCount).toBe(1);
  });
});

// ── OrchestratorState — serializability ──────────────────────────────────────

describe("OrchestratorState — serializability", () => {
  it("can be round-tripped through JSON.stringify / JSON.parse", () => {
    const state: OrchestratorState = {
      ...createInitialState(validProjectConfig()),
      documents: [validDocumentRecord()],
      requirements: [validRequirementRecord()],
      epics: [validEpicRecord()],
      tasks: [validTaskRecord()],
      agentLogs: [validAgentLogRecord()],
      entropy: [validEntropyRecord()],
      activeEpicId: "epic-uuid-001",
      activeTaskId: "task-uuid-001",
    };

    const serialized = JSON.stringify(state);
    const restored = JSON.parse(serialized) as OrchestratorState;

    expect(restored.projectConfig.projectId).toBe("proj-uuid-001");
    expect(restored.documents).toHaveLength(1);
    expect(restored.requirements).toHaveLength(1);
    expect(restored.epics).toHaveLength(1);
    expect(restored.tasks).toHaveLength(1);
    expect(restored.agentLogs).toHaveLength(1);
    expect(restored.entropy).toHaveLength(1);
    expect(restored.activeEpicId).toBe("epic-uuid-001");
    expect(restored.activeTaskId).toBe("task-uuid-001");
  });
});

// ── LangGraph OrchestratorAnnotation ─────────────────────────────────────────

describe("OrchestratorAnnotation — LangGraph channel definition", () => {
  it("is defined and is an object", () => {
    expect(OrchestratorAnnotation).toBeDefined();
    expect(typeof OrchestratorAnnotation).toBe("object");
  });

  it("has a spec with all required state keys", () => {
    const spec = OrchestratorAnnotation.spec;
    expect(spec).toHaveProperty("projectConfig");
    expect(spec).toHaveProperty("documents");
    expect(spec).toHaveProperty("requirements");
    expect(spec).toHaveProperty("epics");
    expect(spec).toHaveProperty("tasks");
    expect(spec).toHaveProperty("agentLogs");
    expect(spec).toHaveProperty("entropy");
    expect(spec).toHaveProperty("activeEpicId");
    expect(spec).toHaveProperty("activeTaskId");
    expect(spec).toHaveProperty("status");
    expect(spec).toHaveProperty("hitlDecisions");
    expect(spec).toHaveProperty("pendingApprovalGate");
    // Robustness channels (Phase 1 / Task 05)
    expect(spec).toHaveProperty("errorHistory");
    expect(spec).toHaveProperty("implementationTurns");
    expect(spec).toHaveProperty("pendingRecoveryNode");
  });

  it("GraphState type is compatible with OrchestratorState (compile-time check)", () => {
    // This verifies at compile-time that GraphState is structurally compatible
    // with OrchestratorState. If it compiles, the types are aligned.
    const state: OrchestratorState = createInitialState(validProjectConfig());
    const graphState: GraphState = state;
    expect(graphState).toBeDefined();
  });
});
