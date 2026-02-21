/**
 * packages/core/test/schemas/interaction.test.ts
 *
 * Type validation tests for the SAOP interaction schemas:
 *   - TurnEnvelope  (TAS-112)
 *   - EventPayload  (TAS-113)
 *
 * Tests validate:
 *   1. Valid objects are accepted by the schema.
 *   2. Invalid objects (missing mandatory fields, wrong types, bad enum values)
 *      are correctly rejected.
 */

import { describe, it, expect } from "vitest";
import { TurnEnvelopeSchema } from "../../src/schemas/turn_envelope.js";
import {
  EventPayloadSchema,
  EventSchema,
} from "../../src/schemas/events.js";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a fully valid TurnEnvelope fixture. */
function validTurnEnvelope() {
  return {
    turn_index: 0,
    agent_id: "developer",
    role: "developer",
    content: {
      thought:
        "The previous turn returned a failing test. I need to implement the feature.",
      action: "I will create the schema file at the expected path.",
      observation: "The test runner reported 1 failing test in interaction.test.ts.",
    },
    metadata: {
      version: "1.0.0",
      task_id: "task-abc-123",
      timestamp: "2026-02-21T10:00:00.000Z",
      confidence: 0.9,
      estimated_complexity: "medium",
    },
  };
}

// ── TurnEnvelope ─────────────────────────────────────────────────────────────

describe("TurnEnvelopeSchema", () => {
  it("accepts a valid TurnEnvelope", () => {
    expect(() => TurnEnvelopeSchema.parse(validTurnEnvelope())).not.toThrow();
  });

  it("returns a typed object matching the input", () => {
    const result = TurnEnvelopeSchema.parse(validTurnEnvelope());
    expect(result.turn_index).toBe(0);
    expect(result.agent_id).toBe("developer");
    expect(result.role).toBe("developer");
    expect(result.content.thought).toContain("failing test");
    expect(result.metadata.confidence).toBe(0.9);
  });

  it("accepts all valid agent_id values", () => {
    const ids = ["researcher", "architect", "developer", "reviewer"] as const;
    for (const id of ids) {
      const envelope = { ...validTurnEnvelope(), agent_id: id, role: id };
      expect(() => TurnEnvelopeSchema.parse(envelope)).not.toThrow();
    }
  });

  it("accepts all valid estimated_complexity values", () => {
    const complexities = ["low", "medium", "high"] as const;
    for (const c of complexities) {
      const envelope = {
        ...validTurnEnvelope(),
        metadata: { ...validTurnEnvelope().metadata, estimated_complexity: c },
      };
      expect(() => TurnEnvelopeSchema.parse(envelope)).not.toThrow();
    }
  });

  it("rejects an envelope with missing content field", () => {
    const { content: _removed, ...noContent } = validTurnEnvelope();
    expect(() => TurnEnvelopeSchema.parse(noContent)).toThrow();
  });

  it("rejects an envelope with missing metadata field", () => {
    const { metadata: _removed, ...noMeta } = validTurnEnvelope();
    expect(() => TurnEnvelopeSchema.parse(noMeta)).toThrow();
  });

  it("rejects an invalid agent_id", () => {
    const invalid = { ...validTurnEnvelope(), agent_id: "unknown_agent" };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects a non-integer turn_index", () => {
    const invalid = { ...validTurnEnvelope(), turn_index: 1.5 };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects a negative turn_index", () => {
    const invalid = { ...validTurnEnvelope(), turn_index: -1 };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects a confidence value > 1.0", () => {
    const invalid = {
      ...validTurnEnvelope(),
      metadata: { ...validTurnEnvelope().metadata, confidence: 1.5 },
    };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects a confidence value < 0.0", () => {
    const invalid = {
      ...validTurnEnvelope(),
      metadata: { ...validTurnEnvelope().metadata, confidence: -0.1 },
    };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects an invalid estimated_complexity", () => {
    const invalid = {
      ...validTurnEnvelope(),
      metadata: { ...validTurnEnvelope().metadata, estimated_complexity: "extreme" },
    };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects an invalid version in metadata", () => {
    const invalid = {
      ...validTurnEnvelope(),
      metadata: { ...validTurnEnvelope().metadata, version: "2.0.0" },
    };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });

  it("rejects a THOUGHT_STREAM content with missing thought field", () => {
    const { thought: _removed, ...noThought } = validTurnEnvelope().content;
    const invalid = { ...validTurnEnvelope(), content: noThought };
    expect(() => TurnEnvelopeSchema.parse(invalid)).toThrow();
  });
});

// ── EventPayload ──────────────────────────────────────────────────────────────

describe("EventPayloadSchema — THOUGHT_STREAM", () => {
  const validPayload = {
    type: "THOUGHT_STREAM" as const,
    agent_id: "developer" as const,
    turn_index: 2,
    chunk: "I am analyzing the failing test output...",
    is_final: false,
  };

  it("accepts a valid THOUGHT_STREAM payload", () => {
    expect(() => EventPayloadSchema.parse(validPayload)).not.toThrow();
  });

  it("rejects THOUGHT_STREAM missing chunk", () => {
    const { chunk: _removed, ...invalid } = validPayload;
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });

  it("rejects THOUGHT_STREAM missing is_final", () => {
    const { is_final: _removed, ...invalid } = validPayload;
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });

  it("rejects THOUGHT_STREAM with invalid agent_id", () => {
    const invalid = { ...validPayload, agent_id: "robot" };
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });
});

describe("EventPayloadSchema — TOOL_LIFECYCLE_INVOKED", () => {
  const validPayload = {
    type: "TOOL_LIFECYCLE_INVOKED" as const,
    call_id: "call-xyz-001",
    tool: "isolated_fs",
    arguments: { path: "/src/main.ts", operation: "read" },
    timestamp: "2026-02-21T10:01:00.000Z",
  };

  it("accepts a valid TOOL_LIFECYCLE_INVOKED payload", () => {
    expect(() => EventPayloadSchema.parse(validPayload)).not.toThrow();
  });

  it("rejects TOOL_LIFECYCLE_INVOKED missing call_id", () => {
    const { call_id: _removed, ...invalid } = validPayload;
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });

  it("rejects TOOL_LIFECYCLE_INVOKED missing tool", () => {
    const { tool: _removed, ...invalid } = validPayload;
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });
});

describe("EventPayloadSchema — TOOL_LIFECYCLE_COMPLETED", () => {
  const validPayload = {
    type: "TOOL_LIFECYCLE_COMPLETED" as const,
    call_id: "call-xyz-001",
    tool: "isolated_fs",
    status: "success" as const,
    duration_ms: 42,
    timestamp: "2026-02-21T10:01:00.042Z",
  };

  it("accepts a valid TOOL_LIFECYCLE_COMPLETED payload", () => {
    expect(() => EventPayloadSchema.parse(validPayload)).not.toThrow();
  });

  it("accepts all valid status values", () => {
    const statuses = ["success", "failure", "timeout"] as const;
    for (const s of statuses) {
      const payload = { ...validPayload, status: s };
      expect(() => EventPayloadSchema.parse(payload)).not.toThrow();
    }
  });

  it("rejects an invalid status value", () => {
    const invalid = { ...validPayload, status: "pending" };
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });

  it("rejects a negative duration_ms", () => {
    const invalid = { ...validPayload, duration_ms: -1 };
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });
});

describe("EventPayloadSchema — TASK_TRANSITION", () => {
  const validPayload = {
    type: "TASK_TRANSITION" as const,
    task_id: "task-abc-123",
    from_state: "IN_PROGRESS",
    to_state: "COMPLETED",
    timestamp: "2026-02-21T10:05:00.000Z",
  };

  it("accepts a valid TASK_TRANSITION payload", () => {
    expect(() => EventPayloadSchema.parse(validPayload)).not.toThrow();
  });

  it("accepts TASK_TRANSITION with optional git_hash", () => {
    const withHash = { ...validPayload, git_hash: "a1b2c3d4e5f6" };
    expect(() => EventPayloadSchema.parse(withHash)).not.toThrow();
  });

  it("rejects TASK_TRANSITION missing from_state", () => {
    const { from_state: _removed, ...invalid } = validPayload;
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });
});

describe("EventPayloadSchema — SANDBOX_PULSE", () => {
  const validPayload = {
    type: "SANDBOX_PULSE" as const,
    line: "npm install completed successfully",
    masked: false,
    timestamp: "2026-02-21T10:02:00.000Z",
  };

  it("accepts a valid SANDBOX_PULSE payload", () => {
    expect(() => EventPayloadSchema.parse(validPayload)).not.toThrow();
  });

  it("accepts SANDBOX_PULSE with masked=true", () => {
    const masked = { ...validPayload, masked: true };
    expect(() => EventPayloadSchema.parse(masked)).not.toThrow();
  });

  it("rejects SANDBOX_PULSE missing line", () => {
    const { line: _removed, ...invalid } = validPayload;
    expect(() => EventPayloadSchema.parse(invalid)).toThrow();
  });
});

// ── EventSchema (full event wrapper) ─────────────────────────────────────────

describe("EventSchema", () => {
  it("accepts a valid Event with THOUGHT_STREAM payload", () => {
    const event = {
      event_id: "550e8400-e29b-41d4-a716-446655440000",
      session_id: "session-001",
      payload: {
        type: "THOUGHT_STREAM" as const,
        agent_id: "architect" as const,
        turn_index: 1,
        chunk: "Evaluating solution space...",
        is_final: true,
      },
    };
    expect(() => EventSchema.parse(event)).not.toThrow();
  });

  it("rejects Event missing event_id", () => {
    const invalid = {
      session_id: "session-001",
      payload: {
        type: "SANDBOX_PULSE",
        line: "some output",
        masked: false,
        timestamp: "2026-02-21T10:00:00.000Z",
      },
    };
    expect(() => EventSchema.parse(invalid)).toThrow();
  });

  it("rejects Event with unknown payload type", () => {
    const invalid = {
      event_id: "550e8400-e29b-41d4-a716-446655440000",
      session_id: "session-001",
      payload: { type: "UNKNOWN_EVENT", data: "foo" },
    };
    expect(() => EventSchema.parse(invalid)).toThrow();
  });
});
