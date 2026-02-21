# Task: Build SSE (Server-Sent Events) Bridge for Real-time Event Streaming (Sub-Epic: 01_Real-time Event Bus Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-069], [1_PRD-REQ-MAP-005]

## 1. Initial Test Written
- [ ] Create `packages/core/src/transport/__tests__/sse-bridge.test.ts`.
- [ ] Write an integration test using Node.js `http` module and `EventSource` (via `eventsource` npm package or `fetch` with a streaming response) that:
  1. Instantiates `SseBridge` and calls `start()`.
  2. Makes an HTTP GET request to `http://127.0.0.1:{port}/events` with header `Authorization: Bearer {bridge.token}`.
  3. Publishes a `STATE_TRANSITION` event to `EventBus`.
  4. Asserts the SSE stream emits a `data:` line within 200ms, and the parsed JSON matches the event payload.
- [ ] Write a test verifying that requests without the `Authorization: Bearer {token}` header receive HTTP 401 and the SSE stream is not established.
- [ ] Write a test verifying that batched `THOUGHT_STREAM` events arrive as a single SSE event with `event: THOUGHT_STREAM_BATCH` and `data:` being a JSON array.
- [ ] Write a test verifying the SSE bridge sends a `: keepalive` comment line every 15 seconds to prevent proxy timeouts — use `vi.useFakeTimers()` to advance time and capture written bytes.
- [ ] Write a test verifying that when the client closes the connection, the bridge removes the response from its internal client set.
- [ ] Write a test verifying `SseBridge.stop()` closes all open SSE response streams and the HTTP server within 1000ms.
- [ ] Use `vitest` with `beforeEach`/`afterEach` for bridge lifecycle management.

## 2. Task Implementation
- [ ] Create `packages/core/src/transport/sse-bridge.ts`:
  - Export `SseBridgeOptions`: `{ port?: number; host?: string; keepaliveIntervalMs?: number; eventBus?: EventBus; logger?: Logger; }` with defaults `host = '127.0.0.1'`, `port = 0`, `keepaliveIntervalMs = 15000`.
  - Export `SseBridge` class:
    - Constructor accepts `SseBridgeOptions`. Generate a cryptographically random `token` (same pattern as `WsBridge`: `crypto.randomBytes(32).toString('hex')`).
    - Method `start(): Promise<number>` — creates a plain `http.Server` with a single route `GET /events`. Binds to `host:port`, resolves with actual port.
    - On GET `/events`: validate `Authorization: Bearer {token}` header; respond 401 if invalid.
    - On authenticated GET: write SSE headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`). Add response to internal `Set<http.ServerResponse>`. Start a keepalive timer (`setInterval`) that writes `: keepalive\n\n` every `keepaliveIntervalMs`.
    - Subscribe to `EventBus` for `'*'` events. Immediately dispatch non-`THOUGHT_STREAM` events as `data: {json}\n\n`. Wire a `ThoughtBatchingBuffer` to send batched events as `event: THOUGHT_STREAM_BATCH\ndata: {json}\n\n`.
    - Private `broadcast(eventName: string | null, data: string): void` — iterates the response set, writes SSE frame to each, catches errors (removes closed response, clears its keepalive timer).
    - On response `close` event: remove from set, clear keepalive timer.
    - Method `stop(): Promise<void>` — clears all keepalive timers, ends all SSE response streams, closes the HTTP server, unsubscribes from `EventBus`.
    - Expose `readonly port: number` and `readonly token: string`.
- [ ] Update `packages/core/src/transport/index.ts` to also export `SseBridge` and `SseBridgeOptions`.

## 3. Code Review
- [ ] Verify the bridge only listens on `127.0.0.1` — not on `0.0.0.0`. This is a hard security requirement from [5_SECURITY_DESIGN-REQ-SEC-SD-069].
- [ ] Verify `X-Accel-Buffering: no` header is set to disable nginx/proxy buffering, ensuring low-latency delivery.
- [ ] Verify keepalive intervals are stored per-client (in a `Map<http.ServerResponse, NodeJS.Timeout>`) and cleared on client disconnect to prevent timer leaks.
- [ ] Verify `stop()` calls `response.end()` on every open SSE stream, not `response.destroy()`, to allow the browser/client to detect clean stream termination.
- [ ] Verify there are no shared mutable state bugs: each SSE client gets its own keepalive timer, not a shared one.
- [ ] Verify the SSE event format strictly follows the spec: `event: {name}\ndata: {json}\n\n` (double newline terminator).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test src/transport/__tests__/sse-bridge.test.ts` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test --coverage` and verify line coverage for `src/transport/sse-bridge.ts` is ≥ 90%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a section `## SSE Bridge` to `packages/core/README.md` documenting: the `/events` endpoint, `Authorization: Bearer {token}` auth, SSE event names and data format, and keepalive behavior.
- [ ] Update `docs/architecture/event-bus.md` to include `SseBridge` alongside `WsBridge` in the transport layer diagram.
- [ ] Append to `docs/agent-memory/decisions.md`: "Phase 12 / Task 04 — `SseBridge` provides an SSE alternative to WebSockets on GET /events with Bearer token auth. Suitable for browser-native EventSource clients. Keepalive comment frames sent every 15s. Both bridges bind to 127.0.0.1 only."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --reporter=json --outputFile=test-results/sse-bridge.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run the smoke test script `scripts/smoke/sse-bridge-smoke.ts` (create it): start the `SseBridge`, connect via a `fetch` streaming request with the correct Bearer token, publish one `THOUGHT_STREAM` and one `STATE_TRANSITION` event, parse the SSE stream and assert both are received within 1000ms. Exit 0 on success, exit 1 on failure.
