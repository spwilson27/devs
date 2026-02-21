# Task: Implement Orchestrator SAOP Streaming Server (WebSocket/SSE) (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [TAS-058], [3_MCP-TAS-038]

## 1. Initial Test Written

- [ ] In `packages/orchestrator/src/streaming/__tests__/saop-streaming-server.test.ts`, write integration tests using a real WebSocket client (`ws` library) against a locally bound test server:
  - Test that `SaopStreamingServer.start()` binds to a configurable port and responds to WebSocket upgrade requests with HTTP 101.
  - Test that after a client connects and subscribes to a `taskId`, emitting a `ThoughtEnvelope` via `SaopStreamingServer.emit(envelope)` results in the client receiving a JSON-parseable message matching the envelope.
  - Test that emitting an `ActionEnvelope` for one `taskId` is NOT received by a client subscribed only to a different `taskId`.
  - Test that when a client disconnects, `SaopStreamingServer.getConnectionCount()` decrements correctly.
  - Test that `SaopStreamingServer.stop()` closes the server and all active connections within 1000ms.
  - Test SSE endpoint: send a `GET /stream?taskId={uuid}` request and assert the response has `Content-Type: text/event-stream` and receives `data: {...}\n\n` formatted events.
  - Test that an invalid (non-UUID) `taskId` in the SSE query string returns HTTP 400.

## 2. Task Implementation

- [ ] Create `packages/orchestrator/src/streaming/saop-streaming-server.ts`.
- [ ] Import `SAOPEnvelope` from `@devs/core`.
- [ ] Use the `ws` npm package for the WebSocket server implementation.
- [ ] Use Node.js built-in `http` module to host both the WebSocket upgrade handler and an SSE HTTP endpoint on the same port.
- [ ] Implement class `SaopStreamingServer` with:
  - `constructor(port: number)` - stores port, initializes subscription map `Map<string, Set<WebSocket | SseConnection>>`.
  - `start(): Promise<void>` - creates an `http.Server`, attaches a `ws.WebSocketServer`, starts listening.
  - `stop(): Promise<void>` - closes all connections, then closes the server, resolving when the server `close` event fires (with a 1000ms timeout fallback).
  - `emit(envelope: SAOPEnvelope): void` - serializes envelope to JSON, looks up subscribers for `envelope.taskId`, and sends to each subscriber. Also broadcasts to any "global" subscribers subscribed to `taskId: "*"`.
  - `getConnectionCount(): number` - returns total active connections across all subscriptions.
- [ ] WebSocket protocol: on `message` event, parse the client's JSON message. If `{ subscribe: taskId }`, register the socket in the subscription map. If `{ unsubscribe: taskId }`, deregister.
- [ ] SSE handler: for `GET /stream?taskId=<uuid>`, validate the `taskId` with `z.string().uuid()`, write SSE headers, register an `SseConnection` object (wrapping `res`) into the subscription map, and remove it on `req.socket.on("close")`.
- [ ] Export a factory function `createSaopStreamingServer(port: number): SaopStreamingServer`.
- [ ] Wire `SaopStreamingServer` into the orchestrator's startup sequence in `packages/orchestrator/src/index.ts`, reading the port from config key `streaming.port` (default `7890`).

## 3. Code Review

- [ ] Verify that `emit()` does not throw if there are zero subscribers for a `taskId`; it should silently no-op.
- [ ] Confirm that the SSE response correctly flushes headers immediately on connection (`res.flushHeaders()`) so the client receives the event stream open signal.
- [ ] Verify that WebSocket `send()` calls are wrapped in a try/catch and that broken-pipe errors on a dead socket are caught and the socket is removed from the subscription map.
- [ ] Confirm the server does not hold open the Node.js event loop after `stop()` is called (check `server.unref()` usage).
- [ ] Ensure the `taskId: "*"` global subscription is documented with a comment warning that it receives ALL events and should only be used for debugging dashboards.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/orchestrator -- --testPathPattern=saop-streaming-server` and confirm all tests pass.
- [ ] Confirm that tests do not leave dangling server handles (Jest `--detectOpenHandles` flag should report zero open handles after test suite completes).

## 5. Update Documentation

- [ ] Create `packages/orchestrator/src/streaming/saop-streaming-server.agent.md` documenting:
  - The WebSocket subscription protocol (subscribe/unsubscribe message format).
  - The SSE endpoint URL pattern and query parameters.
  - The port configuration key (`streaming.port`).
  - How to emit envelopes from other orchestrator modules via the `SaopStreamingServer.emit()` API.
  - The `taskId: "*"` global subscription behavior and its intended use cases.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/orchestrator -- --testPathPattern=saop-streaming-server --detectOpenHandles` and confirm zero open handles are reported.
- [ ] Run `npm run build --workspace=packages/orchestrator` and confirm zero TypeScript compilation errors.
- [ ] Start the orchestrator in a child process, connect a WebSocket client, emit one envelope of each type, and assert all three are received. This smoke-test script lives at `scripts/smoke-test-saop-server.ts` and is runnable via `npx ts-node scripts/smoke-test-saop-server.ts`.
