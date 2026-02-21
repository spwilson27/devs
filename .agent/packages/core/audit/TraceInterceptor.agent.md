---
module: packages/core/src/audit/TraceInterceptor.ts
package: "@devs/core"
layer: audit
status: implemented
requirements:
  - TAS-001
  - 3_MCP-MCP-002
  - TAS-046
  - TAS-056
  - 1_PRD-REQ-PIL-004
---

# TraceInterceptor

The Flight Recorder capture engine. Subscribes to agent interaction events (`TRACE_THOUGHT`, `TRACE_ACTION`, `TRACE_OBSERVATION`) on the `SharedEventBus` and **synchronously** persists them as `agent_logs` rows in `state.sqlite` before the LangGraph state transition proceeds.

## Purpose

Provides Glass-Box observability over every agent reasoning step, tool invocation, and tool result. Every row in `agent_logs` is a THOUGHT, ACTION, or OBSERVATION produced by a real agent execution, giving operators a complete replay of any agent's work.

## Exports

### `TraceContentType` (type)

`"THOUGHT" | "ACTION" | "OBSERVATION"` — discriminator for the three supported trace event types.

### `TraceEvent` (interface)

Input to `persistTrace()`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `task_id` | `number` | Yes | FK → tasks(id) |
| `epic_id` | `number \| null` | No | FK → epics(id) for epic-scoped queries |
| `turn_index` | `number` | Yes | Zero-based; always stored in content blob |
| `agent_role` | `string` | Yes | Stored in `agent_logs.role` column |
| `content_type` | `TraceContentType` | Yes | Stored in `agent_logs.content_type` column |
| `content` | `Record<string, unknown>` | Yes | Merged with `turn_index`, JSON-stringified, secret-masked |
| `commit_hash` | `string \| null` | No | Links trace to current git state |

### `TraceInterceptorOptions` (interface)

Constructor options:

| Field | Type | Default | Notes |
|---|---|---|---|
| `maxAttempts` | `number` | `1` | Total attempt count on `SQLITE_BUSY`; `1` means fail fast (no retry) |

### `TraceInterceptor` (class)

Constructor: `new TraceInterceptor(stateRepo: StateRepository, options?: TraceInterceptorOptions)`

| Method | Signature | Description |
|---|---|---|
| `persistTrace` | `(event: TraceEvent): number \| null` | Synchronously persists one trace entry. Returns row id on success, `null` on failure (never throws). |
| `subscribe` | `(bus: SharedEventBus): UnsubscribeFn` | Subscribes to `TRACE_THOUGHT`, `TRACE_ACTION`, `TRACE_OBSERVATION` topics. Returns an unsubscribe function. |

## Synchronous Persistence Chain

```
bus.publish("TRACE_THOUGHT", payload)
  → EventBus.send()
    → this.emit(BUS_MESSAGE_EVENT, message)   ← synchronous EventEmitter dispatch
      → TraceInterceptor handler
        → persistTrace()
          → StateRepository.appendAgentLog()  ← synchronous better-sqlite3
            → SQL INSERT committed to WAL
  → returns to calling LangGraph node
```

The `agent_logs` row is fully committed **before** `bus.publish()` returns. No intermediate state is possible.

## Content Blob Schema

`agent_logs.content` is always a JSON object with `turn_index` as the first key:

| `content_type` | JSON shape |
|---|---|
| `THOUGHT` | `{ "turn_index": N, "thought": "..." }` |
| `ACTION` | `{ "turn_index": N, "tool_name": "...", "tool_input": {...} }` |
| `OBSERVATION` | `{ "turn_index": N, "tool_result": ... }` |

Callers may embed additional fields alongside the standard keys.

## Secret Masking

`_buildContentBlob()` calls `maskSensitiveData()` from `orchestration/robustness.ts` on the JSON string before it reaches SQLite. Redacted patterns: Bearer tokens, `api_key=...`, AWS key IDs, passwords in URLs. **Integration note**: replace with the dedicated `SecretMasker` service when it is introduced.

## DB Unavailability Handling

`persistTrace()` wraps `appendAgentLog()` in a try-catch loop (`maxAttempts` total attempts). On exhaustion it logs to stderr and returns `null` — the orchestration pipeline continues without crashing. Individual trace records may be lost during transient contention; set `PRAGMA busy_timeout` on the DB connection for longer wait-and-retry behaviour at the SQLite level.

## EventBus Integration

The three trace topics extend the existing `EventTopics` registry in `events/types.ts`:

| Topic | Payload type | Persisted as |
|---|---|---|
| `TRACE_THOUGHT` | `TraceThoughtPayload` | `content_type = 'THOUGHT'` |
| `TRACE_ACTION` | `TraceActionPayload` | `content_type = 'ACTION'` |
| `TRACE_OBSERVATION` | `TraceObservationPayload` | `content_type = 'OBSERVATION'` |

## Usage

```ts
import {
  createDatabase, initializeSchema, initializeAuditSchema,
  StateRepository, TraceInterceptor, SharedEventBus, EVENTBUS_SOCKET_NAME,
} from "@devs/core";
import * as path from "node:path";

// ── Server process (orchestration engine) ──
const db = createDatabase();
initializeSchema(db);
initializeAuditSchema(db);

const stateRepo = new StateRepository(db);
const interceptor = new TraceInterceptor(stateRepo);

const socketPath = path.join(".devs", EVENTBUS_SOCKET_NAME);
const bus = await SharedEventBus.createServer(socketPath);
interceptor.subscribe(bus);

// ── Inside a LangGraph node ──
bus.publish("TRACE_THOUGHT", {
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  thought: "I need to read the configuration file.",
  timestamp: new Date().toISOString(),
});
// → agent_logs row with content_type='THOUGHT' is committed synchronously.

bus.publish("TRACE_ACTION", {
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  tool_name: "read_file",
  tool_input: { path: ".devs/POLICY.md" },
  timestamp: new Date().toISOString(),
});

bus.publish("TRACE_OBSERVATION", {
  task_id: currentTaskId,
  turn_index: 0,
  agent_role: "developer",
  tool_result: "# POLICY\n...",
  timestamp: new Date().toISOString(),
});
```

## Verification

Query `agent_logs` after a sample run:

```bash
sqlite3 .devs/state.sqlite \
  "SELECT content_type, role, content FROM agent_logs WHERE task_id = 1 ORDER BY id;"
```

## Tests

30 integration tests in `packages/core/test/audit/trace_interceptor.test.ts`:

- **persistTrace — THOUGHT**: persists to `agent_logs`, content accuracy, `turn_index` in blob, `agent_role` in `role` column.
- **persistTrace — ACTION**: persists, `tool_name`/`tool_input` accuracy.
- **persistTrace — OBSERVATION**: persists, `tool_result` accuracy.
- **Full agent turn sequence**: all three content types, `task_id` consistency, insertion order across turns.
- **Metadata completeness**: `task_id`, `turn_index`, `agent_role`, optional `epic_id`, null `epic_id`, optional `commit_hash`, null `commit_hash`.
- **Synchronous persistence guarantee**: immediately readable after return; ACID-durable (visible via second DB connection).
- **DB unavailability**: returns null, no throw; subsequent calls recover.
- **Secret masking**: Bearer tokens redacted; AWS key IDs redacted.
- **EventBus integration**: auto-persist THOUGHT/ACTION/OBSERVATION via bus; full simulated turn; unsubscribe stops persistence.
- **Cross-task isolation**: logs for task A not visible when querying task B.

## Related Modules

- `packages/core/src/events/types.ts` — `TRACE_THOUGHT`, `TRACE_ACTION`, `TRACE_OBSERVATION` topics + payload types
- `packages/core/src/events/SharedEventBus.ts` — pub/sub IPC layer
- `packages/core/src/persistence/state_repository.ts` — `appendAgentLog()` write method
- `packages/core/src/persistence/schema.ts` — `agent_logs` table DDL
- `packages/core/src/persistence/audit_schema.ts` — `agent_logs` performance indices
- `packages/core/src/orchestration/robustness.ts` — `maskSensitiveData()` for secret redaction
- `packages/core/src/audit/README.md` — Flight Recorder overview documentation
