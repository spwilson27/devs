# Task: Implement Real-Time SAOP Trace Stream Endpoint (SSE/WebSocket) (Sub-Epic: 10_Observability & Real-Time Tracing)

## Covered Requirements
- [3_MCP-TAS-038], [1_PRD-REQ-OBS-003]

## 1. Initial Test Written

- [ ] In `packages/mcp-orchestrator/src/__tests__/trace-stream.test.ts`, write integration tests using `supertest` and `eventsource` (or `EventSource` from `eventsource` npm package):
  - Test that `GET /trace/stream` returns `Content-Type: text/event-stream` with headers `Cache-Control: no-cache` and `Connection: keep-alive`.
  - Test that when a `SAOPEnvelope` is published via `TraceStreamBus.publish(envelope)`, a connected SSE client receives it as a `data:` line followed by `\n\n` within 200 ms.
  - Test that the SSE stream sends a heartbeat comment line (`": heartbeat\n\n"`) every 15 seconds (use fake timers to advance clock).
  - Test that multiple simultaneous SSE clients (simulate 3 clients) each independently receive the same published envelope.
  - Test that when a client disconnects (close the response), it is removed from the subscriber list and no further writes are attempted on that response.
  - Test that the endpoint rejects requests without a valid Bearer token (return `401 Unauthorized`) when `AUTH_ENABLED=true` environment variable is set.
  - Test that published envelopes exceeding 1 MB are rejected with a log warning and not written to SSE clients (prevent stream stall).
  - (Optional / stretch) Write a WebSocket variant test if the implementation supports `ws://` as fallback.

## 2. Task Implementation

- [ ] Create `packages/mcp-orchestrator/src/trace/trace-stream-bus.ts`:
  - Implement `TraceStreamBus` as a singleton event emitter using Node.js `EventEmitter`.
  - Export `publish(envelope: SAOPEnvelope): void`: emits `'envelope'` event with the envelope.
  - Export `subscribe(handler: (envelope: SAOPEnvelope) => void): () => void`: adds a listener and returns an unsubscribe function.
- [ ] Create `packages/mcp-orchestrator/src/trace/trace-stream-router.ts`:
  - Implement an Express (or Fastify, matching the project's existing HTTP framework) router exported as `traceStreamRouter`.
  - Register `GET /trace/stream` handler:
    1. If `process.env.AUTH_ENABLED === 'true'`, extract `Authorization: Bearer <token>` header and validate it against `process.env.MCP_BEARER_TOKEN`; respond `401` on mismatch.
    2. Set response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`.
    3. Send an initial comment `": connected\n\n"` to flush the connection.
    4. Subscribe to `TraceStreamBus` via `subscribe()`. On each envelope:
       - Reject if `JSON.stringify(envelope).length > 1_048_576` (log warning, skip).
       - Write `data: ${JSON.stringify(envelope)}\n\n` to the response.
    5. Set up a 15-second heartbeat interval sending `": heartbeat\n\n"`.
    6. On `req.on('close')`, call the unsubscribe function and clear the heartbeat interval.
- [ ] Wire `traceStreamRouter` into the existing `OrchestratorServer`'s Express/Fastify app in `packages/mcp-orchestrator/src/server.ts` at path prefix `/trace`.
- [ ] Integrate `FlightRecorder.record()` call inside `TraceStreamBus.publish()` so every published envelope is also persisted to `.devs/trace.log` (satisfying `1_PRD-REQ-OBS-003`).

## 3. Code Review

- [ ] Confirm the SSE response does NOT buffer: verify `X-Accel-Buffering: no` is set and that `res.flushHeaders()` (or equivalent) is called immediately after setting headers.
- [ ] Confirm the heartbeat prevents proxy timeouts on long-idle streams (verify interval is ≤ 30 s).
- [ ] Confirm that the `subscribe` / unsubscribe pattern does not leak listeners when clients disconnect abruptly (verify `req.on('close')` is always registered).
- [ ] Confirm that `TraceStreamBus` is imported into `FlightRecorder` only via the `publish` call, not vice versa (no circular dependency).
- [ ] Confirm that the 1 MB size guard is applied before writing, not after.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/mcp-orchestrator test -- --testPathPattern=trace-stream` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/mcp-orchestrator tsc --noEmit` to confirm no TypeScript compile errors.

## 5. Update Documentation

- [ ] In `docs/agent-memory/observability.md`, add a section "Real-Time SAOP Trace Stream" documenting:
  - The SSE endpoint URL pattern: `http://localhost:<MCP_PORT>/trace/stream`.
  - Event format: one `SAOPEnvelope` JSON object per SSE `data:` line.
  - Authentication: `Authorization: Bearer <MCP_BEARER_TOKEN>` when `AUTH_ENABLED=true`.
  - How the VSCode Extension should connect (use `EventSource` from the `eventsource` npm package, pass the Bearer token as a query param or custom header via `EventSourceInit`).
- [ ] Update `docs/agent-memory/protocol-decisions.md` with the decision to use SSE over WebSocket as the primary streaming mechanism (rationale: simpler, HTTP/1.1 compatible, works through most proxies), and note that `3_MCP-TAS-038` is satisfied.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/mcp-orchestrator test -- --coverage --testPathPattern=trace-stream` and assert line coverage ≥ 90% for `trace-stream-bus.ts` and `trace-stream-router.ts`.
- [ ] Execute smoke test script:
  ```bash
  # Start the orchestrator in test mode
  MCP_PORT=19999 AUTH_ENABLED=false pnpm --filter @devs/mcp-orchestrator start &
  SERVER_PID=$!
  sleep 2
  # Subscribe and publish
  curl -s -N http://localhost:19999/trace/stream &
  CURL_PID=$!
  sleep 1
  # Trigger a publish via a test endpoint (or direct node call)
  node -e "
    const {getTraceStreamBus} = require('./packages/mcp-orchestrator/dist/trace/trace-stream-bus');
    getTraceStreamBus().publish({type:'thought', turn_index:1, payload:{analysis:{reasoning_chain:'smoke-test'}}, timestamp_ns:'0'});
  "
  sleep 1
  kill $CURL_PID $SERVER_PID
  echo "PASS"
  ```
