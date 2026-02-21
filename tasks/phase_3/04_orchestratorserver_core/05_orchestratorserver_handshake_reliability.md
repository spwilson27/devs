# Task: OrchestratorServer MCP Handshake Reliability & 100% Success Rate Validation (Sub-Epic: 04_OrchestratorServer Core)

## Covered Requirements
- [9_ROADMAP-REQ-023]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/handshake-reliability.test.ts`, write tests that:
  - Run the full MCP initialization handshake (connect → `initialize` → `initialized`) **50 consecutive times** against a single server instance, asserting every iteration succeeds (0 failures). This validates [9_ROADMAP-REQ-023]'s 100% success rate requirement.
  - Run the handshake **10 times in parallel** (using `Promise.all`) against the same server instance and assert all 10 resolve without error and within 2000ms each.
  - Assert that a handshake attempt with an **incorrect Bearer Token** consistently returns HTTP `401` — 10 out of 10 attempts must fail with the auth error (no accidental pass-throughs).
  - Test **reconnect behavior**: disconnect a client mid-session, reconnect, perform the handshake, and assert the new session is clean (previous session state not leaked).
  - Test **graceful degradation**: call `server.stop()` and then attempt a handshake — assert the client receives a clean `ECONNREFUSED` error rather than hanging indefinitely. Set a 3-second timeout on the connection attempt.
- [ ] In `packages/mcp/src/__tests__/handshake-metrics.test.ts`, write a test that:
  - Runs 100 sequential handshakes and captures the duration of each.
  - Asserts median handshake duration is under 50ms (localhost, no actual I/O).
  - Asserts no single handshake exceeds 500ms (timeout guard).
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] In `packages/mcp/src/orchestrator-server.ts`, implement connection lifecycle tracking:
  - Maintain an internal `activeConnections: Set<Socket>` so that `stop()` can close all open sockets promptly.
  - Track each incoming connection via the HTTP server's `connection` event: `httpServer.on('connection', socket => this.activeConnections.add(socket))`.
  - On `stop()`, iterate `activeConnections` and call `socket.destroy()` after the HTTP server `close()` to drain immediately.
- [ ] Implement a `handshakeTimeout` option in `OrchestratorServerConfig` (default `5000ms`):
  - If a client does not complete the MCP `initialize` → `initialized` exchange within this timeout, the server closes the connection with a structured error.
  - Add `handshakeTimeout?: number` to `OrchestratorServerConfig` interface and update `validateConfig` to accept `0 < handshakeTimeout <= 30000`.
- [ ] Add a connection health check endpoint at `GET /health` (HTTP, not MCP) that:
  - Does NOT require Bearer Token authentication (it's a basic liveness probe).
  - Returns `{ status: "ok", serverName: "devs-orchestrator", uptime: <seconds> }` with HTTP `200`.
  - This allows external monitoring and validates the server is reachable before attempting the full MCP handshake.
- [ ] In `packages/mcp/src/metrics.ts`, create a lightweight in-memory `HandshakeMetrics` tracker:
  - `recordHandshake(durationMs: number, success: boolean): void`
  - `getMetrics(): { total: number; succeeded: number; failed: number; medianMs: number; maxMs: number }`
  - Called from the server on each handshake completion.
- [ ] Register `HandshakeMetrics` on the server and expose metrics via `OrchestratorServer.getHandshakeMetrics()` (for test assertions and future MCP tool exposure).

## 3. Code Review
- [ ] Confirm `activeConnections` cleanup in `stop()` prevents the server from hanging open during tests or restarts.
- [ ] Verify `handshakeTimeout` is enforced using `setTimeout` + connection abort — no silent hung connections.
- [ ] Confirm `/health` endpoint does NOT expose sensitive state or tokens — it is a pure liveness check.
- [ ] Verify `HandshakeMetrics` uses an in-memory circular buffer or sorted array for median calculation — do not use `Array.sort()` on unbounded arrays for performance (cap at last 1000 samples).
- [ ] Confirm Bearer Token check is applied to all MCP endpoints but explicitly **not** to `/health` — separation of concerns.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` — the 50-iteration sequential handshake test must pass with 0 failures.
- [ ] Run `pnpm --filter @devs/mcp test --reporter=verbose` to see per-test durations and confirm none of the 100-handshake tests exceed the time budget.
- [ ] Run `curl http://localhost:3100/health` (after starting the server manually) and confirm `{"status":"ok","serverName":"devs-orchestrator","uptime":...}` is returned.

## 5. Update Documentation
- [ ] Update `packages/mcp/README.md` with a `## Health Check` section:
  - Document `GET /health` endpoint, no auth required, response schema.
- [ ] Update `packages/mcp/README.md` with a `## Reliability` section:
  - Document the `handshakeTimeout` config option, default value, and valid range.
  - Note the 100% handshake success rate requirement per [9_ROADMAP-REQ-023].
- [ ] Update `docs/agent-memory/phase_3.md`: "OrchestratorServer implements connection lifecycle tracking via `activeConnections` Set, handshake timeout enforcement, and in-memory `HandshakeMetrics`. `/health` endpoint available without auth. Handshake success rate validated to 100% via 50-iteration sequential test."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test --reporter=json > /tmp/mcp-handshake-results.json` and assert exit code `0`.
- [ ] Run `cat /tmp/mcp-handshake-results.json | jq '[.testResults[].assertionResults[] | select(.status != "passed")] | length'` — must output `0`.
- [ ] Run the following reliability check script:
  ```bash
  node -e "
  const {createOrchestratorServer} = require('./packages/mcp/dist');
  const {Client} = require('@modelcontextprotocol/sdk/client/index.js');
  const {StreamableHTTPClientTransport} = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
  async function main() {
    const server = createOrchestratorServer({ port: 0, token: 'reliability-token' });
    const { port } = await server.start();
    let failures = 0;
    for (let i = 0; i < 10; i++) {
      try {
        const client = new Client({ name: 'test', version: '0.0.1' });
        const transport = new StreamableHTTPClientTransport(new URL(\`http://127.0.0.1:\${port}/mcp\`), { headers: { Authorization: 'Bearer reliability-token' } });
        await client.connect(transport);
        await client.close();
      } catch (e) { failures++; }
    }
    await server.stop();
    console.assert(failures === 0, \`Expected 0 failures, got \${failures}\`);
    console.log('reliability: PASS');
  }
  main().catch(e => { console.error('reliability: FAIL', e); process.exit(1); });
  "
  ```
  — must print `reliability: PASS`.
