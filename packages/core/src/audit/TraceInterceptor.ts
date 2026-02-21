/**
 * @devs/core audit/TraceInterceptor.ts
 *
 * Real-time Trace Interceptor — the Flight Recorder capture engine.
 *
 * `TraceInterceptor` listens for agent interaction events (THOUGHT, ACTION,
 * OBSERVATION) emitted on the `SharedEventBus` and **synchronously** persists
 * them as `agent_logs` rows in `state.sqlite` before the LangGraph state
 * transition proceeds.
 *
 * ## How it fits in the orchestration cycle
 *
 *   1. A LangGraph node executes and the agent produces a thought.
 *   2. The node calls `bus.publish("TRACE_THOUGHT", payload)`.
 *   3. `EventBus.send()` calls `this.emit(BUS_MESSAGE_EVENT, message)` which
 *      is a synchronous Node.js EventEmitter dispatch.
 *   4. `TraceInterceptor`'s registered handler is invoked synchronously.
 *   5. `persistTrace()` calls `StateRepository.appendAgentLog()` — synchronous
 *      via better-sqlite3.
 *   6. Control returns to the LangGraph node with the log already committed.
 *
 * This chain guarantees **audit trail integrity**: a trace can never be
 * "missed" because the persistence happens before the state transition that
 * advances the graph.
 *
 * ## Secret masking
 *
 * `TraceInterceptor` applies the same secret-masking regexes used by the
 * robustness error-recovery system (`maskSensitiveData`) to the JSON-encoded
 * content before it is written to SQLite. When a dedicated `SecretMasker`
 * service is introduced, this call site should be updated to use it.
 *
 * ## DB unavailability
 *
 * If `StateRepository.appendAgentLog()` throws (e.g., `SQLITE_BUSY` during a
 * concurrent write), `persistTrace()` catches the error, logs it to stderr,
 * and returns `null` instead of propagating the exception. This means
 * individual trace records may be lost during transient DB contention, but
 * the orchestration pipeline does NOT crash. The `maxRetries` option allows
 * callers to configure immediate-retry behaviour for busy errors.
 *
 * Requirements: [TAS-001], [3_MCP-MCP-002], [TAS-046], [TAS-056],
 *               [1_PRD-REQ-PIL-004]
 */

import { maskSensitiveData } from "../orchestration/robustness.js";
import { StateRepository } from "../persistence/state_repository.js";
import { SharedEventBus, type UnsubscribeFn } from "../events/SharedEventBus.js";

// ── Public types ──────────────────────────────────────────────────────────────

/** Discriminator for the three supported trace content types. */
export type TraceContentType = "THOUGHT" | "ACTION" | "OBSERVATION";

/**
 * A single agent interaction event to be persisted to `agent_logs`.
 *
 * The `content` field is a free-form JSON-serialisable object whose shape
 * depends on `content_type`:
 *
 * - THOUGHT     : `{ thought: string }`
 * - ACTION      : `{ tool_name: string, tool_input: Record<string, unknown> }`
 * - OBSERVATION : `{ tool_result: unknown }`
 *
 * Callers may embed additional fields in `content`; the TraceInterceptor
 * always injects `turn_index` into the stored blob as well.
 */
export interface TraceEvent {
  /** FK → tasks(id). The task currently being executed. */
  task_id: number;
  /** Optional FK → epics(id) for efficient epic-scoped audit queries. */
  epic_id?: number | null;
  /**
   * Zero-based index of the agent's turn within this task execution.
   * Always stored inside the content JSON blob so it is queryable.
   */
  turn_index: number;
  /** Agent persona (e.g., "developer", "researcher", "reviewer"). */
  agent_role: string;
  /** Interaction type discriminator. */
  content_type: TraceContentType;
  /** Free-form JSON-serialisable payload specific to `content_type`. */
  content: Record<string, unknown>;
  /** Optional git commit SHA linking the trace to the current repository state. */
  commit_hash?: string | null;
}

/** Configuration options for `TraceInterceptor`. */
export interface TraceInterceptorOptions {
  /**
   * Total number of attempts when `StateRepository.appendAgentLog()` throws a
   * transient error (e.g., `SQLITE_BUSY`).
   * Default: 1 (single attempt — fail fast and return null on error).
   *
   * Note: Retries are synchronous (no delay between attempts). This is safe
   * because better-sqlite3 is a synchronous API and retrying immediately is
   * the right behaviour for lock-held-briefly scenarios. For longer contention
   * windows, set `PRAGMA busy_timeout` on the database connection instead.
   *
   * @example
   * // 3 total attempts (2 retries after the first failure):
   * new TraceInterceptor(repo, { maxAttempts: 3 });
   */
  maxAttempts?: number;
}

// ── TraceInterceptor ──────────────────────────────────────────────────────────

/**
 * Captures and persists agent interaction events to the `agent_logs` table.
 *
 * ### Usage (direct persist)
 * ```ts
 * const interceptor = new TraceInterceptor(stateRepo);
 *
 * // Inside a LangGraph node after the agent produces a thought:
 * interceptor.persistTrace({
 *   task_id: currentTaskId,
 *   turn_index: turnIndex,
 *   agent_role: "developer",
 *   content_type: "THOUGHT",
 *   content: { thought: "I need to refactor the authentication module." },
 * });
 * ```
 *
 * ### Usage (EventBus integration — recommended for orchestration)
 * ```ts
 * // Server process sets up the bus and interceptor once:
 * const bus = await SharedEventBus.createServer(socketPath);
 * const interceptor = new TraceInterceptor(stateRepo);
 * interceptor.subscribe(bus);
 *
 * // Any LangGraph node publishes events — persistence is automatic:
 * bus.publish("TRACE_THOUGHT", {
 *   task_id: currentTaskId,
 *   turn_index: 0,
 *   agent_role: "developer",
 *   thought: "Analyzing the requirements...",
 *   timestamp: new Date().toISOString(),
 * });
 * ```
 */
export class TraceInterceptor {
  private readonly stateRepo: StateRepository;
  private readonly maxAttempts: number;

  constructor(stateRepo: StateRepository, options?: TraceInterceptorOptions) {
    this.stateRepo = stateRepo;
    this.maxAttempts = options?.maxAttempts ?? 1;
  }

  // ── Core API ───────────────────────────────────────────────────────────────

  /**
   * Synchronously persists a trace event to the `agent_logs` table.
   *
   * Applies secret masking to the content blob before writing. Wraps the
   * write in the StateRepository's transaction API (ACID, SAVEPOINT-safe).
   *
   * Returns the new row's primary-key `id` on success, or `null` if all
   * retry attempts fail. Never throws — errors are logged to stderr.
   *
   * @param event - The trace event to persist.
   * @returns The new `agent_logs.id`, or `null` on failure.
   */
  persistTrace(event: TraceEvent): number | null {
    const contentBlob = this._buildContentBlob(event);

    let lastError: unknown;
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        return this.stateRepo.appendAgentLog({
          task_id: event.task_id,
          epic_id: event.epic_id ?? null,
          role: event.agent_role,
          content_type: event.content_type,
          content: contentBlob,
          commit_hash: event.commit_hash ?? null,
        });
      } catch (err) {
        lastError = err;
      }
    }

    // All attempts exhausted — log and return null (graceful failure).
    console.error(
      "[TraceInterceptor] Failed to persist trace after",
      this.maxAttempts,
      "attempt(s):",
      lastError
    );
    return null;
  }

  /**
   * Subscribes to the three trace topics on a `SharedEventBus` and calls
   * `persistTrace()` for each incoming event.
   *
   * Persistence is **synchronous** within the EventEmitter dispatch chain —
   * the `agent_logs` row is committed before `bus.publish()` returns, which
   * guarantees no trace can be skipped between LangGraph state transitions.
   *
   * @param bus - A `SharedEventBus` instance (server or client mode).
   * @returns An unsubscribe function. Call it to stop persisting events.
   */
  subscribe(bus: SharedEventBus): UnsubscribeFn {
    const unsubThought = bus.subscribe("TRACE_THOUGHT", (payload) => {
      this.persistTrace({
        task_id: payload.task_id,
        epic_id: payload.epic_id,
        turn_index: payload.turn_index,
        agent_role: payload.agent_role,
        content_type: "THOUGHT",
        content: { thought: payload.thought },
        commit_hash: payload.commit_hash,
      });
    });

    const unsubAction = bus.subscribe("TRACE_ACTION", (payload) => {
      this.persistTrace({
        task_id: payload.task_id,
        epic_id: payload.epic_id,
        turn_index: payload.turn_index,
        agent_role: payload.agent_role,
        content_type: "ACTION",
        content: {
          tool_name: payload.tool_name,
          tool_input: payload.tool_input,
        },
        commit_hash: payload.commit_hash,
      });
    });

    const unsubObservation = bus.subscribe("TRACE_OBSERVATION", (payload) => {
      this.persistTrace({
        task_id: payload.task_id,
        epic_id: payload.epic_id,
        turn_index: payload.turn_index,
        agent_role: payload.agent_role,
        content_type: "OBSERVATION",
        content: { tool_result: payload.tool_result },
        commit_hash: payload.commit_hash,
      });
    });

    return () => {
      unsubThought();
      unsubAction();
      unsubObservation();
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Builds the JSON blob stored in `agent_logs.content`.
   *
   * Always injects `turn_index` as the first key so consumers can locate it
   * without parsing the full payload. Applies `maskSensitiveData` to redact
   * secrets (API keys, Bearer tokens, basic-auth credentials) before writing.
   *
   * Integration note: replace `maskSensitiveData` with the `SecretMasker`
   * service when it is introduced in a later phase.
   */
  private _buildContentBlob(event: TraceEvent): string {
    // Merge turn_index as the first key, then spread the rest of the content.
    const raw = JSON.stringify({ turn_index: event.turn_index, ...event.content });
    // Apply baseline secret masking before the content reaches SQLite.
    return maskSensitiveData(raw);
  }
}
