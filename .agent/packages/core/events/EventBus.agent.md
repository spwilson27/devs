---
package: "@devs/core"
module: "events/EventBus"
type: module-doc
status: active
created: 2026-02-21
requirements: ["2_TAS-REQ-018", "1_PRD-REQ-INT-004"]
dependencies: ["node:net", "node:fs", "node:events", "events/types"]
---

# events/EventBus.ts — Low-Level IPC EventBus

## Purpose

Unix Domain Socket–based IPC bus.  Handles connection lifecycle (listen /
connect), NDJSON message framing, fan-out broadcasting, and client reconnection
with exponential back-off.

## Exports

### `BUS_MESSAGE_EVENT`

```typescript
const BUS_MESSAGE_EVENT = "bus:message";
```

The Node.js `EventEmitter` event name emitted by `EventBus` for every decoded
inbound message.  `SharedEventBus` registers on this event to route messages to
topic-specific subscribers.

### `EventBusOptions`

```typescript
interface EventBusOptions {
  reconnectDelay?:        number;  // Default: 1 000 ms
  maxReconnectAttempts?:  number;  // Default: 10
  connectionTimeout?:     number;  // Default: 5 000 ms
}
```

### `EventBus`

```typescript
class EventBus extends EventEmitter {
  constructor(socketPath: string, role: "server" | "client", options?: EventBusOptions)

  startServer():    Promise<void>   // Server role only
  connectClient():  Promise<void>   // Client role only
  send(message: BusMessage): void
  close():          Promise<void>   // Idempotent
}
```

#### EventEmitter Events

| Event | Args | Description |
|-------|------|-------------|
| `"bus:message"` | `(msg: AnyBusMessage)` | Decoded inbound message |
| `"listening"` | — | Server is bound and accepting connections |
| `"connected"` | — | Client successfully connected to server |
| `"reconnected"` | — | Client successfully reconnected after drop |
| `"max_reconnect_exceeded"` | — | Client gave up reconnecting |
| `"error"` | `(err: Error)` | Socket-level error (non-fatal) |

## Wire Protocol

**NDJSON (Newline-Delimited JSON)** — each message is:

```
<JSON string>\n
```

- Receiver buffers incoming `Buffer` chunks until `\n` is found.
- Multiple messages in one TCP segment are split on `\n`.
- Partial messages spanning multiple segments are buffered until complete.
- Malformed or unknown-topic frames are silently discarded.

## Message Flow

```
Client A  ──publish──>  [client socket]  ──>  [server]  ──fan-out──>  Client B
                                                  │
                                                  └──> local emit (server subscribers)
```

When the server publishes:
```
[server]  ──send──>  local emit + broadcast to ALL clients
```

## Reconnection

Back-off formula: `delay × 2^min(attempts, 6)`.

| Attempt | Delay (base=1 s) |
|---------|-----------------|
| 1       | 1 s             |
| 2       | 2 s             |
| 3       | 4 s             |
| 4       | 8 s             |
| 5       | 16 s            |
| 6       | 32 s            |
| 7+      | 64 s (capped)   |

After `maxReconnectAttempts`, emits `"max_reconnect_exceeded"` and stops.

## Resource Cleanup

- **Server `close()`**: destroys all client sockets, closes the server, removes
  the socket file.
- **Client `close()`**: destroys the client socket, cancels pending reconnect timer.
- Both are idempotent (safe to call multiple times).

## Testing

`packages/core/test/events/eventbus.test.ts` (low-level section) covers:
- `BUS_MESSAGE_EVENT` delivery server→client and client→server
- Large message (100 KB) multi-chunk assembly
- `"listening"` and `"connected"` events
- Connection timeout rejection
