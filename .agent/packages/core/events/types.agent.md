---
package: "@devs/core"
module: "events/types"
type: module-doc
status: active
created: 2026-02-21
requirements: ["2_TAS-REQ-018", "1_PRD-REQ-INT-004"]
dependencies: []
---

# events/types.ts — EventBus Type Definitions

## Purpose

Defines the complete type system for the EventBus IPC protocol.  This is the
single source of truth for event topics, payload shapes, and the wire-format
message envelope.

## Exports

### `EventTopics`

```typescript
const EventTopics = {
  STATE_CHANGE: "STATE_CHANGE",
  PAUSE:        "PAUSE",
  RESUME:       "RESUME",
  LOG_STREAM:   "LOG_STREAM",
} as const;
```

### `EventTopic`

```typescript
type EventTopic = "STATE_CHANGE" | "PAUSE" | "RESUME" | "LOG_STREAM";
```

### `VALID_TOPICS`

```typescript
const VALID_TOPICS: ReadonlySet<string>;
```

Runtime set used by `EventBus._isValidMessage()` to discard frames with unknown
topic values (e.g. from malformed or version-mismatched senders).

### Payload Interfaces

| Interface | Topic | Key Fields |
|-----------|-------|------------|
| `StateChangePayload` | `STATE_CHANGE` | `entityType`, `entityId`, `previousStatus?`, `newStatus`, `timestamp` |
| `PausePayload` | `PAUSE` | `reason?`, `requestedBy`, `timestamp` |
| `ResumePayload` | `RESUME` | `requestedBy`, `timestamp` |
| `LogStreamPayload` | `LOG_STREAM` | `level`, `message`, `agentId?`, `taskId?`, `timestamp` |

### `EventPayloadMap`

```typescript
type EventPayloadMap = {
  STATE_CHANGE: StateChangePayload;
  PAUSE:        PausePayload;
  RESUME:       ResumePayload;
  LOG_STREAM:   LogStreamPayload;
};
```

Used as the generic constraint in `subscribe<T>` and `publish<T>` to give
callers fully-typed payload access without casts.

### `BusMessage<T>`

```typescript
interface BusMessage<T extends EventTopic = EventTopic> {
  id:        string;              // UUID v4
  topic:     T;
  payload:   EventPayloadMap[T];
  timestamp: string;              // ISO 8601 UTC
  source:    string;              // e.g. "server:1234"
}
```

### `AnyBusMessage`

```typescript
type AnyBusMessage = BusMessage<"STATE_CHANGE"> | BusMessage<"PAUSE"> | ...;
```

Discriminated union over all concrete `BusMessage<T>` variants.  Use
`switch (msg.topic)` for exhaustive narrowing.

## Extension Pattern

To add a new event type:
1. Add the topic name to `EventTopics`.
2. Define a new payload interface.
3. Add the topic → payload entry to `EventPayloadMap`.

No changes to `EventBus.ts` or `SharedEventBus.ts` are required.
