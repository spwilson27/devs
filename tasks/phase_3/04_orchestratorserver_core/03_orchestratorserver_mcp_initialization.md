# Task: OrchestratorServer MCP SDK Initialization & Localhost Binding (Sub-Epic: 04_OrchestratorServer Core)

## Covered Requirements
- [3_MCP-TAS-036], [1_PRD-REQ-INT-003], [9_ROADMAP-REQ-023]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/orchestrator-server.test.ts`, write integration tests using a free port (`port: 0`) that:
  - Test `OrchestratorServer.start()` resolves successfully and the server becomes reachable at `http://localhost:{assignedPort}/`.
  - Test that the server's MCP handshake (via `@modelcontextprotocol/sdk` `Client.connect()`) succeeds — 100% success rate: assert `client.connect()` resolves without error.
  - Test that the server is **only** reachable on `localhost` / `127.0.0.1` — simulate a connection attempt from a non-localhost address (mock `net.createServer` binding) and assert it is rejected.
  - Test that `OrchestratorServer.stop()` resolves cleanly and subsequent connection attempts fail with a network error.
  - Test that starting the server **without** a valid Bearer Token in `OrchestratorServerConfig` causes the constructor to throw a `ConfigurationError`.
  - Test that Bearer Token auth is enforced: an HTTP request without the `Authorization: Bearer <token>` header to any MCP endpoint returns HTTP `401`.
- [ ] In `packages/mcp/src/__tests__/handshake.test.ts`, write a test that:
  - Creates an `OrchestratorServer` on a random free port.
  - Performs the MCP initialization handshake (send `initialize` message, receive `initialized` response).
  - Asserts the `serverInfo.name` field in the response equals `"devs-orchestrator"`.
  - Asserts the `protocolVersion` in the response matches the SDK's expected version.
  - Repeats the handshake 10 times in sequence and asserts 100% success (0 failures) to validate [9_ROADMAP-REQ-023].
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] In `packages/mcp/src/orchestrator-server.ts`, implement the `OrchestratorServer` class:
  - Constructor takes `OrchestratorServerConfig` and calls `validateConfig()` — throws `ConfigurationError` if invalid.
  - Use `@modelcontextprotocol/sdk`'s `Server` class to instantiate the MCP server:
    ```typescript
    this.mcpServer = new Server(
      { name: "devs-orchestrator", version: "0.1.0" },
      { capabilities: { tools: {} } }
    );
    ```
  - Implement `async start(): Promise<{ port: number }>`:
    - Create an HTTP transport (`StreamableHTTPServerTransport` or equivalent from the SDK) bound exclusively to `127.0.0.1` (not `0.0.0.0`).
    - Integrate Bearer Token middleware: validate `Authorization` header on every incoming request; return `401` if missing or invalid.
    - Connect the MCP `Server` to the transport via `this.mcpServer.connect(transport)`.
    - Resolve with the actual bound port (useful when `port: 0` is specified for tests).
  - Implement `async stop(): Promise<void>`:
    - Call `this.mcpServer.close()` and close the HTTP listener.
    - Await all in-flight requests to drain before resolving.
  - Store current `OrchestratorState` (from `models.ts`) in a private field, initialized via `createInitialOrchestratorState()`.
- [ ] Create `packages/mcp/src/errors.ts` with:
  - `ConfigurationError extends Error` — thrown when `OrchestratorServerConfig` is invalid.
  - `AuthenticationError extends Error` — thrown when Bearer Token validation fails.
- [ ] Update `packages/mcp/src/index.ts` to export `OrchestratorServer`, `ConfigurationError`, `AuthenticationError`.

## 3. Code Review
- [ ] Confirm the server binds to `'127.0.0.1'` explicitly — **never** `'0.0.0.0'` or `'::'`. This is a security requirement per the localhost-only constraint in [3_MCP-TAS-036].
- [ ] Verify Bearer Token validation uses a constant-time comparison (e.g., `crypto.timingSafeEqual`) to prevent timing attacks.
- [ ] Confirm `stop()` does not resolve until the HTTP server's `close` callback fires — no silent resource leaks.
- [ ] Verify `OrchestratorServer` does NOT directly import state from the broader `devs` engine in this task — state is injected or set via setter methods to keep the server decoupled and testable.
- [ ] Confirm `serverInfo.name` is `"devs-orchestrator"` (hardcoded, matches the test assertion).
- [ ] Verify error classes extend `Error` and set `this.name` to the class name for clean stack traces.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` — all tests including handshake tests must pass.
- [ ] Specifically confirm the 10-repeat handshake test in `handshake.test.ts` passes with 0 failures.
- [ ] Run `pnpm --filter @devs/mcp build` — zero TypeScript errors.
- [ ] Manually start the server via `node -e "require('./packages/mcp/dist').createOrchestratorServer({port:3100,token:'test'}).start().then(({port})=>console.log('Listening on', port))"` and confirm it prints the port.

## 5. Update Documentation
- [ ] Update `packages/mcp/README.md` with a `## Server Lifecycle` section:
  - Document `start()` / `stop()` usage, Bearer Token requirement, and localhost-only binding.
  - Include a minimal code example showing server startup.
- [ ] Update `docs/agent-memory/phase_3.md`: "OrchestratorServer binds to `127.0.0.1` only. Bearer Token validated via `crypto.timingSafeEqual`. MCP handshake uses `@modelcontextprotocol/sdk` Server class with `serverInfo.name = 'devs-orchestrator'`."
- [ ] Add a `## Security` section to `packages/mcp/README.md` documenting the localhost binding and Bearer Token requirements.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test --reporter=json > /tmp/mcp-server-init-results.json` and assert exit code `0`.
- [ ] Run `cat /tmp/mcp-server-init-results.json | jq '[.testResults[].assertionResults[] | select(.status != "passed")] | length'` — must output `0`.
- [ ] Run a quick smoke test script:
  ```bash
  node -e "
  const {createOrchestratorServer} = require('./packages/mcp/dist');
  const s = createOrchestratorServer({port:0,token:'smoke-token'});
  s.start().then(({port}) => {
    console.assert(port > 0, 'port must be > 0');
    return s.stop();
  }).then(() => console.log('smoke: PASS')).catch(e => { console.error('smoke: FAIL', e); process.exit(1); });
  "
  ```
  — must print `smoke: PASS`.
