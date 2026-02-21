---
package: "@devs/core"
module: "events/SharedEventBus"
type: module-doc
status: active
created: 2026-02-21
requirements: ["2_TAS-REQ-018", "1_PRD-REQ-INT-004", "9_ROADMAP-REQ-037"]
dependencies: ["node:crypto", "events/EventBus", "events/types"]
---

# events/SharedEventBus.ts — Typed Pub/Sub EventBus

## Purpose

High-level, fully-typed publish/subscribe abstraction over `EventBus`.  This
is the primary interface for all CLI, VSCode extension, and orchestration code.
Hides IPC socket details behind a clean `subscribe` / `publish` / `close` API.

## Exports

### `EVENTBUS_SOCKET_NAME`

```typescript
const EVENTBUS_SOCKET_NAME = "eventbus.sock";
```

Filename for the socket within `.devs/`.  Use with `resolveDevsDir()`:

```ts
const socketPath = path.join(resolveDevsDir(fromDir), EVENTBUS_SOCKET_NAME);
```

### `SubscribeCallback<T>`

```typescript
type SubscribeCallback<T extends EventTopic> = (payload: EventPayloadMap[T]) => void;
```

### `UnsubscribeFn`

```typescript
type UnsubscribeFn = () => void;
```

### `SharedEventBus`

```typescript
class SharedEventBus {
  readonly bus: EventBus;  // Exposed for testing

  subscribe<T extends EventTopic>(topic: T, callback: SubscribeCallback<T>): UnsubscribeFn
  publish<T extends EventTopic>(topic: T, payload: EventPayloadMap[T]): void
  close(): Promise<void>

  static createServer(socketPath: string, options?: EventBusOptions): Promise<SharedEventBus>
  static createClient(socketPath: string, options?: EventBusOptions): Promise<SharedEventBus>
}
```

## Usage

### Orchestration engine (server):

```ts
import * as path from 'node:path';
import { SharedEventBus, EVENTBUS_SOCKET_NAME, resolveDevsDir } from '@devs/core';

const socketPath = path.join(resolveDevsDir(), EVENTBUS_SOCKET_NAME);
const bus = await SharedEventBus.createServer(socketPath);

bus.publish('STATE_CHANGE', {
  entityType: 'task',
  entityId: 42,
  newStatus: 'completed',
  timestamp: new Date().toISOString(),
});

// On shutdown:
await bus.close();
```

### CLI / VSCode extension (client):

```ts
const bus = await SharedEventBus.createClient(socketPath);

const unsub = bus.subscribe('STATE_CHANGE', (payload) => {
  console.log(`[${payload.entityType}:${payload.entityId}] → ${payload.newStatus}`);
});

// Stop listening:
unsub();
await bus.close();
```

## Message Envelope

Every `publish()` call wraps the payload in a `BusMessage` before sending:

```
{ id: uuid, topic, payload, timestamp (ISO 8601), source: "server|client:<pid>" }
```

The `id` is a UUID v4 generated via `node:crypto.randomUUID()`.

## Testing

`packages/core/test/events/eventbus.test.ts` covers:

- Server creation, client connection, socket file lifecycle
- Stale socket file removal on restart
- STATE_CHANGE / PAUSE / RESUME / LOG_STREAM delivery (server → client)
- Client → server delivery
- Fan-out to multiple clients
- Multiple subscribers per topic
- Unsubscribe stops delivery
- Wrong-topic isolation
- Message envelope fields (id, topic, timestamp, source)
- Unique IDs per publish
- Sub-100ms latency over local UDS
- TypeScript payload type enforcement (compile-time)
- Client reconnection after server restart
- `"reconnected"` event emission
- Idempotent `close()`
- Multiple client disconnect/reconnect
