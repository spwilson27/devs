/**
 * packages/core/src/events/types.ts
 *
 * TypeScript type definitions for the EventBus IPC protocol.
 *
 * Defines the event topic registry, per-topic payload shapes, and the
 * generic BusMessage envelope used to transport events across process
 * boundaries via Unix Domain Sockets.
 *
 * Requirements: [2_TAS-REQ-018], [1_PRD-REQ-INT-004]
 */

// ── Topic registry ─────────────────────────────────────────────────────────────

/**
 * The canonical set of topics that can be published on the EventBus.
 *
 * - STATE_CHANGE      : Emitted whenever the SQLite state is mutated (task status,
 *                       project lifecycle, etc.). Enables the CLI and VSCode extension
 *                       to stay in sync without polling.
 * - PAUSE             : Control command to pause the active orchestration turn.
 * - RESUME            : Control command to resume a previously paused orchestration.
 * - LOG_STREAM        : Incremental log lines emitted during active orchestration
 *                       turns for real-time streaming to the CLI dashboard or VSCode
 *                       Output Channel.
 * - TRACE_THOUGHT     : Emitted when an agent emits a reasoning step (thought).
 *                       Consumed by the TraceInterceptor to persist THOUGHT entries
 *                       to the `agent_logs` Glass-Box audit table.
 * - TRACE_ACTION      : Emitted when an agent initiates a tool call. Consumed by
 *                       the TraceInterceptor to persist ACTION entries.
 * - TRACE_OBSERVATION : Emitted when an agent receives a tool result. Consumed by
 *                       the TraceInterceptor to persist OBSERVATION entries.
 */
export const EventTopics = {
  STATE_CHANGE: "STATE_CHANGE",
  PAUSE: "PAUSE",
  RESUME: "RESUME",
  LOG_STREAM: "LOG_STREAM",
  TRACE_THOUGHT: "TRACE_THOUGHT",
  TRACE_ACTION: "TRACE_ACTION",
  TRACE_OBSERVATION: "TRACE_OBSERVATION",
} as const;

export type EventTopic = (typeof EventTopics)[keyof typeof EventTopics];

/** Runtime set of valid topic strings, used to filter malformed wire messages. */
export const VALID_TOPICS: ReadonlySet<string> = new Set(Object.values(EventTopics));

// ── Payload shapes ─────────────────────────────────────────────────────────────

/**
 * Payload for STATE_CHANGE events.
 *
 * Emitted by any process that mutates the SQLite state database.  Consumers
 * (CLI, VSCode) should use this event to invalidate their local caches and
 * re-query the relevant entity.
 */
export interface StateChangePayload {
  /** The entity table that was mutated (e.g. "task", "project", "epic"). */
  entityType: string;
  /** Primary key or human-readable ID of the affected entity. */
  entityId: string | number;
  /** The status value before the mutation (omit if not applicable). */
  previousStatus?: string;
  /** The new status value after the mutation. */
  newStatus: string;
  /** ISO 8601 UTC timestamp of when the mutation occurred. */
  timestamp: string;
}

/**
 * Payload for PAUSE events.
 *
 * Emitted by the CLI or VSCode extension when the user requests that the
 * active orchestration turn be paused.  The orchestration engine honours
 * this signal at the next safe checkpoint boundary.
 */
export interface PausePayload {
  /** Human-readable reason for the pause (optional). */
  reason?: string;
  /** The process / surface that initiated the pause ("cli" | "vscode" | "user"). */
  requestedBy: string;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
}

/**
 * Payload for RESUME events.
 *
 * Emitted when the user or an automated system resumes a previously paused
 * orchestration session.
 */
export interface ResumePayload {
  /** The process / surface that initiated the resume. */
  requestedBy: string;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
}

/**
 * Payload for LOG_STREAM events.
 *
 * Emitted at high frequency during active orchestration turns.  Consumers
 * should append these lines to a terminal buffer or Output Channel rather
 * than storing them long-term (use the SQLite audit log for persistence).
 */
export interface LogStreamPayload {
  /** Severity level. */
  level: "debug" | "info" | "warn" | "error";
  /** The log line text. */
  message: string;
  /** The agent that produced the log (optional). */
  agentId?: string;
  /** The task being executed when the log was produced (optional). */
  taskId?: string;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
}

/**
 * Payload for TRACE_THOUGHT events.
 *
 * Emitted by an orchestration node when an agent produces a reasoning step.
 * The TraceInterceptor subscribes to this topic and persists it as a THOUGHT
 * entry in the `agent_logs` table (Glass-Box audit trail).
 *
 * Requirements: [TAS-001], [TAS-046], [1_PRD-REQ-PIL-004]
 */
export interface TraceThoughtPayload {
  /** FK to the task currently being executed. */
  task_id: number;
  /** Optional FK to the parent epic (enables epic-scoped audit queries). */
  epic_id?: number | null;
  /** Zero-based index of the agent's turn within this task execution. */
  turn_index: number;
  /** Agent persona (e.g., "developer", "researcher", "reviewer"). */
  agent_role: string;
  /** The raw reasoning text produced by the agent. */
  thought: string;
  /** Optional git commit SHA linking the trace to the current repository state. */
  commit_hash?: string | null;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
}

/**
 * Payload for TRACE_ACTION events.
 *
 * Emitted by an orchestration node when an agent initiates a tool call.
 * The TraceInterceptor persists it as an ACTION entry in `agent_logs`.
 *
 * Requirements: [TAS-001], [TAS-046], [1_PRD-REQ-PIL-004]
 */
export interface TraceActionPayload {
  /** FK to the task currently being executed. */
  task_id: number;
  /** Optional FK to the parent epic. */
  epic_id?: number | null;
  /** Zero-based index of the agent's turn within this task execution. */
  turn_index: number;
  /** Agent persona. */
  agent_role: string;
  /** The name of the tool being invoked. */
  tool_name: string;
  /** The structured input provided to the tool. */
  tool_input: Record<string, unknown>;
  /** Optional git commit SHA. */
  commit_hash?: string | null;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
}

/**
 * Payload for TRACE_OBSERVATION events.
 *
 * Emitted by an orchestration node when an agent receives a tool result.
 * The TraceInterceptor persists it as an OBSERVATION entry in `agent_logs`.
 *
 * Requirements: [TAS-001], [TAS-046], [1_PRD-REQ-PIL-004]
 */
export interface TraceObservationPayload {
  /** FK to the task currently being executed. */
  task_id: number;
  /** Optional FK to the parent epic. */
  epic_id?: number | null;
  /** Zero-based index of the agent's turn within this task execution. */
  turn_index: number;
  /** Agent persona. */
  agent_role: string;
  /** The result returned by the tool (any JSON-serialisable value). */
  tool_result: unknown;
  /** Optional git commit SHA. */
  commit_hash?: string | null;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
}

// ── Payload map & discriminated access ────────────────────────────────────────

/**
 * Maps each EventTopic to its payload shape.
 *
 * Used to make `subscribe` and `publish` generically typed so that callers
 * always receive the correct payload type without manual casts.
 */
export type EventPayloadMap = {
  STATE_CHANGE: StateChangePayload;
  PAUSE: PausePayload;
  RESUME: ResumePayload;
  LOG_STREAM: LogStreamPayload;
  TRACE_THOUGHT: TraceThoughtPayload;
  TRACE_ACTION: TraceActionPayload;
  TRACE_OBSERVATION: TraceObservationPayload;
};

// ── Wire message envelope ──────────────────────────────────────────────────────

/**
 * A fully-resolved, typed bus message as it travels over the IPC socket.
 *
 * The generic parameter `T` narrows the `payload` field to the correct shape
 * for the given `topic`.  When parsing incoming data from the socket, the
 * `topic` field is checked first before narrowing.
 *
 * @example
 * const msg: BusMessage<"STATE_CHANGE"> = {
 *   id: "uuid",
 *   topic: "STATE_CHANGE",
 *   payload: { entityType: "task", entityId: 1, newStatus: "completed", timestamp: "..." },
 *   timestamp: "...",
 *   source: "server:1234",
 * };
 */
export interface BusMessage<T extends EventTopic = EventTopic> {
  /** UUID v4 — unique per message instance, used for deduplication. */
  id: string;
  /** The event topic this message belongs to. */
  topic: T;
  /** The event-specific payload. */
  payload: EventPayloadMap[T];
  /** ISO 8601 UTC timestamp of when the message was published. */
  timestamp: string;
  /** Identifier of the publishing process (e.g. "server:1234", "client:5678"). */
  source: string;
}

/**
 * A union over all possible fully-resolved BusMessage variants.
 *
 * Use this type when receiving messages from the wire to get exhaustive
 * narrowing via `switch (msg.topic)`.
 */
export type AnyBusMessage = {
  [K in EventTopic]: BusMessage<K>;
}[EventTopic];
