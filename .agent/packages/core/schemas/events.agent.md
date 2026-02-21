---
package: "@devs/core"
module: "schemas/events"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-113", "TAS-038"]
---

# schemas/events.ts — RTES Event Schemas

## Purpose

Defines all real-time event types and their payloads for the RTES
(Real-time Trace & Event Streaming) bus. Events are emitted by the orchestrator
core and consumed by the VSCode Extension UI, CLI Dashboard, and persisted to
the SQLite `agent_logs` table.

## Exports

| Symbol                              | Kind       | Description                                      |
|-------------------------------------|------------|--------------------------------------------------|
| `ThoughtStreamPayloadSchema`        | Zod schema | Incremental reasoning chunk from an agent        |
| `ThoughtStreamPayload`              | Type       | Inferred type                                    |
| `ToolLifecycleInvokedPayloadSchema` | Zod schema | Tool call dispatched                             |
| `ToolLifecycleInvokedPayload`       | Type       | Inferred type                                    |
| `ToolLifecycleCompletedPayloadSchema` | Zod schema | Tool call result received                      |
| `ToolLifecycleCompletedPayload`     | Type       | Inferred type                                    |
| `TaskTransitionPayloadSchema`       | Zod schema | Task lifecycle state change                      |
| `TaskTransitionPayload`             | Type       | Inferred type                                    |
| `SandboxPulsePayloadSchema`         | Zod schema | Real-time sandbox terminal output line           |
| `SandboxPulsePayload`               | Type       | Inferred type                                    |
| `EventPayloadSchema`                | Zod schema | Discriminated union of all payload variants      |
| `EventPayload`                      | Type       | Union type of all payloads                       |
| `EventSchema`                       | Zod schema | Full event wrapper (event_id + session_id + payload) |
| `Event`                             | Type       | Inferred type from `EventSchema`                 |

## Event Types

### `THOUGHT_STREAM`
Emitted incrementally as the agent produces its reasoning chain.
```
{ type, agent_id, turn_index, chunk: string, is_final: boolean }
```

### `TOOL_LIFECYCLE_INVOKED`
Emitted when an agent dispatches a tool call via MCP.
```
{ type, call_id, tool, arguments: Record<string, unknown>, timestamp }
```

### `TOOL_LIFECYCLE_COMPLETED`
Emitted when a tool call completes. Correlates with INVOKED via `call_id`.
```
{ type, call_id, tool, status: "success"|"failure"|"timeout", duration_ms, timestamp }
```

### `TASK_TRANSITION`
Emitted when a task moves between lifecycle states (e.g., PENDING → IN_PROGRESS).
Optional `git_hash` provides a Git State Correlation point (TAS-114).
```
{ type, task_id, from_state, to_state, git_hash?: string, timestamp }
```

### `SANDBOX_PULSE`
Emitted per line as the sandbox produces terminal output. Secrets are masked.
```
{ type, line: string, masked: boolean, timestamp }
```

## Extensibility

To add a new event type:
1. Define a new `z.object({ type: z.literal("NEW_TYPE"), ... })` schema.
2. Add it to the `EventPayloadSchema` discriminated union array.
3. Export the schema and its inferred type.
4. No existing schemas require modification.

## Design Notes

- The discriminant key is always `"type"` — a string literal in every variant.
- `event_id` in `EventSchema` is a UUID, enforced by `z.string().uuid()`.
- `duration_ms` in TOOL_LIFECYCLE_COMPLETED is `nonnegative()` — zero is valid
  (instantaneous tool calls are theoretically possible).
- `git_hash` in TASK_TRANSITION is optional because not all transitions
  correspond to a git commit (e.g., PENDING → IN_PROGRESS has no commit yet).

## Related Modules

- `schemas/turn_envelope.ts` — provides `AgentIdSchema` used by THOUGHT_STREAM.
- `index.ts` — re-exports all symbols from this module.
