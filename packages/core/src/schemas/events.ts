/**
 * packages/core/src/schemas/events.ts
 *
 * Defines the real-time event types and their payloads for the
 * RTES (Real-time Trace & Event Streaming) bus.
 *
 * Events are emitted by the orchestrator core and consumed by:
 *   - The VSCode Extension UI (for live progress rendering)
 *   - The CLI Dashboard (for terminal streaming)
 *   - The SQLite `agent_logs` table (for persistence & replay)
 *
 * Requirements: [TAS-113], [TAS-038]
 *
 * Extensibility: New event types can be added by defining a new payload
 * schema and adding it to the `EventPayloadSchema` discriminated union.
 * No existing schemas need modification.
 */

import { z } from "zod";
import { AgentIdSchema } from "./turn_envelope.js";

// ── THOUGHT_STREAM ────────────────────────────────────────────────────────────

/**
 * Emitted in incremental chunks as the agent produces its reasoning_chain.
 * Enables low-latency UI feedback so users can watch reasoning unfold in
 * real time rather than waiting for the full turn to complete.
 *
 * TAS-113: AGENT_THOUGHT_STREAM
 */
export const ThoughtStreamPayloadSchema = z.object({
  type: z.literal("THOUGHT_STREAM"),
  /** The agent that is reasoning. */
  agent_id: AgentIdSchema,
  /** Zero-based ordinal of the turn this chunk belongs to. */
  turn_index: z.number().int().nonnegative(),
  /** An incremental text chunk from the reasoning chain. */
  chunk: z.string(),
  /** True if this is the final chunk for this turn's thought stream. */
  is_final: z.boolean(),
});

export type ThoughtStreamPayload = z.infer<typeof ThoughtStreamPayloadSchema>;

// ── TOOL_LIFECYCLE_INVOKED ────────────────────────────────────────────────────

/**
 * Emitted when an agent dispatches a tool call.
 * The `call_id` correlates this event with its corresponding
 * TOOL_LIFECYCLE_COMPLETED event.
 *
 * TAS-113: TOOL_LIFECYCLE (INVOKED transition)
 */
export const ToolLifecycleInvokedPayloadSchema = z.object({
  type: z.literal("TOOL_LIFECYCLE_INVOKED"),
  /** Unique ID for this specific tool invocation (matches SAOP command call_id). */
  call_id: z.string(),
  /** Name of the MCP tool being invoked. */
  tool: z.string(),
  /** Tool-specific parameters supplied to the invocation. */
  arguments: z.record(z.string(), z.unknown()),
  /** ISO 8601 UTC timestamp of when the invocation was dispatched. */
  timestamp: z.string().datetime(),
});

export type ToolLifecycleInvokedPayload = z.infer<
  typeof ToolLifecycleInvokedPayloadSchema
>;

// ── TOOL_LIFECYCLE_COMPLETED ──────────────────────────────────────────────────

/**
 * Emitted when a tool call completes (success, failure, or timeout).
 *
 * TAS-113: TOOL_LIFECYCLE (COMPLETED transition)
 */
export const ToolLifecycleCompletedPayloadSchema = z.object({
  type: z.literal("TOOL_LIFECYCLE_COMPLETED"),
  /** Correlates to the matching TOOL_LIFECYCLE_INVOKED call_id. */
  call_id: z.string(),
  /** Name of the MCP tool that completed. */
  tool: z.string(),
  /** Outcome of the tool invocation. */
  status: z.enum(["success", "failure", "timeout"]),
  /** Wall-clock duration in milliseconds. Must be >= 0. */
  duration_ms: z.number().nonnegative(),
  /** ISO 8601 UTC timestamp of completion. */
  timestamp: z.string().datetime(),
});

export type ToolLifecycleCompletedPayload = z.infer<
  typeof ToolLifecycleCompletedPayloadSchema
>;

// ── TASK_TRANSITION ───────────────────────────────────────────────────────────

/**
 * Emitted when a task moves between lifecycle states
 * (e.g., PENDING → IN_PROGRESS → COMPLETED).
 *
 * The optional `git_hash` provides a Git State Correlation point (TAS-114),
 * allowing the system to revert the full environment to this task's state.
 */
export const TaskTransitionPayloadSchema = z.object({
  type: z.literal("TASK_TRANSITION"),
  /** Correlation ID of the task in the SQLite `tasks` table. */
  task_id: z.string(),
  /** The state the task was in before this transition. */
  from_state: z.string(),
  /** The state the task moved to. */
  to_state: z.string(),
  /**
   * HEAD commit hash at the time of the transition.
   * Present when a commit was made as part of the transition (TAS-114).
   */
  git_hash: z.string().optional(),
  /** ISO 8601 UTC timestamp of the transition. */
  timestamp: z.string().datetime(),
});

export type TaskTransitionPayload = z.infer<typeof TaskTransitionPayloadSchema>;

// ── SANDBOX_PULSE ─────────────────────────────────────────────────────────────

/**
 * Emitted in real time as the sandbox produces terminal output.
 * Sensitive lines are masked before emission (secrets redacted).
 *
 * TAS-113: SANDBOX_BUFFER_PULSE
 */
export const SandboxPulsePayloadSchema = z.object({
  type: z.literal("SANDBOX_PULSE"),
  /** A single line of terminal output from the sandbox. */
  line: z.string(),
  /** True if one or more secrets in this line were redacted. */
  masked: z.boolean(),
  /** ISO 8601 UTC timestamp of when the line was captured. */
  timestamp: z.string().datetime(),
});

export type SandboxPulsePayload = z.infer<typeof SandboxPulsePayloadSchema>;

// ── Discriminated union ───────────────────────────────────────────────────────

/**
 * The EventPayloadSchema is a discriminated union keyed on `type`.
 *
 * The discriminant `type` is a string literal in each payload variant,
 * enabling exhaustive switching in TypeScript consumers and exact validation
 * in the Zod parser.
 *
 * To add a new event type: define a new payload schema with a unique `type`
 * literal and add it to this union. Existing schemas are unaffected.
 */
export const EventPayloadSchema = z.discriminatedUnion("type", [
  ThoughtStreamPayloadSchema,
  ToolLifecycleInvokedPayloadSchema,
  ToolLifecycleCompletedPayloadSchema,
  TaskTransitionPayloadSchema,
  SandboxPulsePayloadSchema,
]);

export type EventPayload = z.infer<typeof EventPayloadSchema>;

// ── Event (full wrapper) ──────────────────────────────────────────────────────

/**
 * A complete event as it travels across the RTES bus and is persisted to
 * the `agent_logs` table.
 *
 * - `event_id`:   A UUID uniquely identifying this event instance.
 * - `session_id`: Identifies the orchestration session this event belongs to.
 * - `payload`:    One of the typed EventPayload variants.
 */
export const EventSchema = z.object({
  event_id: z.string().uuid(),
  session_id: z.string(),
  payload: EventPayloadSchema,
});

export type Event = z.infer<typeof EventSchema>;
