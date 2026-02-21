# Task: Build WebSocket Server Bridge for Real-time Event Streaming (Sub-Epic: 01_Real-time Event Bus Infrastructure)

## Covered Requirements
- [TAS-038], [5_SECURITY_DESIGN-REQ-SEC-SD-069], [1_PRD-REQ-MAP-005]

## 1. Initial Test Written
- [ ] Create `packages/core/src/transport/__tests__/ws-bridge.test.ts`.
- [ ] Write an integration test using `ws` library's `WebSocket` client that:
  1. Instantiates `WsBridge` bound to a random free port.
  2. Connects a test WebSocket client.
  3. Publishes a `STATE_TRANSITION` event to the `EventBus` singleton.
  4. Asserts the client receives a JSON message within 200ms matching `{ type: 'STATE_TRANSITION', fromNode: '...', toNode: '...', checkpointId: '...', timestamp: number }`.
- [ ] Write a test verifying that batched `THOUGHT_STREAM` events arrive as a single JSON array message (`{ type: 'THOUGHT_STREAM_BATCH', events: DevsEvent[] }`) after one buffer flush cycle.
- [ ] Write a test verifying that a second client connecting after the bridge is already running also receives subsequent events (fan-out to N clients).
- [ ] Write a test verifying that when a client disconnects, it is cleanly removed from the internal client set and subsequent publishes do not throw.
- [ ] Write a test verifying the bridge binds only to `127.0.0.1` (localhost) and NOT to `0.0.0.0` — assert `server.address().address === '127.0.0.1'`.
- [ ] Write a test verifying that the bridge rejects WebSocket upgrade requests that do not present a valid `X-Devs-Bridge-Token` header (HTTP 401) — the token is a pre-shared secret generated at bridge startup and exposed via `bridge.token`.
- [ ] Write a test verifying `WsBridge.stop()` closes all client connections and the HTTP upgrade server gracefully within 1000ms.
- [ ] Use `vitest` with `beforeEach`/`afterEach` to start/stop the bridge on a random port to avoid port conflicts.

## 2. Task Implementation
- [ ] Create directory `packages/core/src/transport/`.
- [ ] Create `packages/core/src/transport/ws-bridge.ts`:
  - Import `ws` (`npm:ws`) and Node.js `http` module.
  - Export `WsBridgeOptions`: `{ port?: number; host?: string; eventBus?: EventBus; logger?: Logger; }`.
  - Export `WsBridge` class:
    - Constructor accepts `WsBridgeOptions`. Default `host = '127.0.0.1'`, `port = 0` (OS assigns free port).
    - On construction: generate a cryptographically random 32-byte `token` (hex string) via `crypto.randomBytes(32).toString('hex')`. Expose as `readonly token: string`.
    - Method `start(): Promise<number>` — creates an `http.Server`, attaches a `ws.WebSocketServer` to it, binds to `host:port`, resolves with the actual port once listening.
    - On WebSocket upgrade: inspect `request.headers['x-devs-bridge-token']`; if missing or mismatched, destroy the socket with HTTP 401 and log the rejection.
    - On authenticated client connect: add client to `Set<ws.WebSocket>`. Subscribe to `EventBus` for `'*'` events. Send buffered batch messages to the client via the `ThoughtBatchingBuffer`'s `onFlush` callback. Non-batched events are JSON-serialized and sent immediately.
    - Fan-out: the `onFlush` callback serializes the batch as `JSON.stringify({ type: 'THOUGHT_STREAM_BATCH', events: batch })` and sends to all connected clients via `broadcastToClients()` private method.
    - `broadcastToClients(message: string): void` — iterates the client set, skips clients where `readyState !== WebSocket.OPEN`, sends the message, catches per-client errors (logs and removes the client).
    - Method `stop(): Promise<void>` — closes all client sockets, closes the `ws.WebSocketServer`, closes the HTTP server. Unsubscribes from `EventBus`.
    - Expose `readonly port: number` (set after `start()` resolves).
- [ ] Create `packages/core/src/transport/index.ts` re-exporting `WsBridge`, `WsBridgeOptions`.
- [ ] Ensure `packages/core/src/index.ts` re-exports from `./transport/index.ts`.
- [ ] Add `ws` and `@types/ws` to `packages/core/package.json` dependencies.

## 3. Code Review
- [ ] Verify the bridge ONLY binds to localhost (`127.0.0.1`) and never `0.0.0.0` — this is a security requirement from [5_SECURITY_DESIGN-REQ-SEC-SD-069].
- [ ] Verify the pre-shared token is generated fresh on each `WsBridge` instantiation and is never hardcoded or logged in plaintext.
- [ ] Verify `broadcastToClients` handles partial failures gracefully: one client's send error must not prevent broadcasting to the remaining clients.
- [ ] Verify `stop()` does not leave dangling listeners on `EventBus` — the `SubscriptionToken` must be stored and used to call `EventBus.unsubscribe()`.
- [ ] Verify JSON serialization errors (e.g., circular references in event payload) are caught and logged, not thrown to callers.
- [ ] Verify the `ThoughtBatchingBuffer` is instantiated inside `WsBridge` (not shared globally) so each bridge has its own buffer and flush cadence.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test src/transport/__tests__/ws-bridge.test.ts` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core test --coverage` and verify line coverage for `src/transport/ws-bridge.ts` is ≥ 90%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a section `## WebSocket Bridge` to `packages/core/README.md` documenting: startup sequence, token-based auth header (`X-Devs-Bridge-Token`), message format for batched vs. immediate events, and shutdown procedure.
- [ ] Update `docs/architecture/event-bus.md` with a Mermaid sequence diagram: `EventBus → WsBridge.broadcastToClients() → [VSCode Webview WS Client, CLI TUI WS Client]`.
- [ ] Append to `docs/agent-memory/decisions.md`: "Phase 12 / Task 03 — `WsBridge` binds only to 127.0.0.1 with a per-instance cryptographic pre-shared token in `X-Devs-Bridge-Token` header. THOUGHT_STREAM events are batched; all other events are sent immediately to all connected clients."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --reporter=json --outputFile=test-results/ws-bridge.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run the smoke test script `scripts/smoke/ws-bridge-smoke.ts` (create it): start a `WsBridge`, connect a `ws` client with the correct token, publish one event of each type, assert all are received within 500ms, then call `stop()`. Exit 0 on success, exit 1 on failure.
