# Task: Enforce localhost-only MCP Server Binding with Bearer Token Authentication Middleware (Sub-Epic: 03_IPC Security & Authentication)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-033], [5_SECURITY_DESIGN-REQ-SEC-SD-026]

## 1. Initial Test Written

- [ ] In `packages/mcp-server/src/__tests__/localhost-binding.test.ts`, write unit and integration tests:
  - **Binding address**: start the MCP server and assert it binds to `127.0.0.1` exclusively. Attempt to connect via `::1` (IPv6 loopback) and assert the connection is refused or filtered.
  - **Port not 0.0.0.0**: assert that under no code path does the server bind to `0.0.0.0` or `::` (grep the source in a test assertion using `fs.readFileSync` to prevent regressions).
- [ ] In `packages/mcp-server/src/__tests__/bearer-auth.test.ts`, write unit and integration tests:
  - **Token generation**: assert `generateBearerToken()` returns a base64url-encoded string representing exactly 32 bytes (256 bits) of random data.
  - **Middleware — valid token**: send an HTTP request with `Authorization: Bearer <validToken>` header and assert the handler is called (HTTP 200).
  - **Middleware — missing header**: assert HTTP 401 with body `{ error: 'UNAUTHORIZED', reason: 'missing_bearer_token' }`.
  - **Middleware — wrong token**: assert HTTP 401 with body `{ error: 'UNAUTHORIZED', reason: 'invalid_bearer_token' }`, using `timingSafeEqual` internally (verify by mock).
  - **Middleware — malformed header**: send `Authorization: Basic abc` and assert HTTP 401.
  - **Internal MCP server (generated projects)**: assert that the `ProjectMcpServer` (from `packages/mcp-server/src/project-server.ts`) also enforces the same Bearer token middleware.
  - All tests must fail before implementation.

## 2. Task Implementation

- [ ] In `packages/mcp-server/src/localhost-guard.ts`, implement:
  - `assertLocalhostOnly(server: http.Server | net.Server): void` — attaches a `connection` event listener that checks `socket.remoteAddress`; if not `127.0.0.1` or `::1`, immediately calls `socket.destroy()` and emits a `warn` log with the rejected address.
  - Export `LOCALHOST` constant `'127.0.0.1'` used as the exclusive listen host throughout the codebase.
- [ ] In `packages/mcp-server/src/bearer-auth.ts`, implement:
  - `generateBearerToken(): string` — `crypto.randomBytes(32).toString('base64url')`.
  - `createBearerAuthMiddleware(token: string): RequestHandler` — Express/Connect-style middleware:
    - Extracts the `Authorization` header, validates the `Bearer ` prefix, and compares the token using `crypto.timingSafeEqual`.
    - Returns `401` JSON on any failure; calls `next()` on success.
  - `class BearerAuthError extends Error` with `code: 'MISSING_TOKEN' | 'INVALID_TOKEN' | 'MALFORMED_HEADER'`.
- [ ] In `packages/mcp-server/src/orchestrator-server.ts` (already scaffolded in Phase 3), apply:
  - Pass `host: LOCALHOST` to `server.listen()`.
  - Call `assertLocalhostOnly(httpServer)` after `listen`.
  - Generate a 256-bit token at startup with `generateBearerToken()`.
  - Register `createBearerAuthMiddleware(token)` as the first Express middleware before all MCP route handlers.
  - Store the token in `process.env.DEVS_ORCHESTRATOR_TOKEN` so that the CLI and Extension can read it via the secure IPC channel (task 02).
- [ ] Apply identical localhost binding and Bearer auth to `packages/mcp-server/src/project-server.ts` (the internal MCP server template injected into generated projects), satisfying REQ-SEC-SD-026.

## 3. Code Review

- [ ] Grep for `listen(` across `packages/mcp-server/` and assert no call omits the `host` argument or passes anything other than `LOCALHOST`.
- [ ] Confirm `assertLocalhostOnly` is called after every `server.listen()` to catch any future regression.
- [ ] Confirm `generateBearerToken` is called once per server lifecycle (not per request) and the result is stored securely in memory, not written to disk or logs.
- [ ] Confirm the Bearer token is never logged at any log level (audit the logger usage in auth middleware).
- [ ] Confirm the `timingSafeEqual` comparison uses buffers of equal length to prevent length-based timing leaks.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/mcp-server test` — all tests in `localhost-binding.test.ts` and `bearer-auth.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit` — zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/mcp-server test --reporter=verbose` and confirm each test case name is listed as passing.

## 5. Update Documentation

- [ ] Add/extend `docs/security/mcp-server-security.md`:
  - "All MCP servers bind exclusively to `127.0.0.1` (enforced by `assertLocalhostOnly` defence-in-depth check after `listen`)."
  - "Bearer token is 256 bits (32 bytes) generated via `crypto.randomBytes`; encoded as base64url."
  - "Token is distributed to authorised clients via the secure IPC channel (UDS/Named Pipe with handshake) — never via config files or environment variables visible to child processes."
  - Include a mermaid diagram showing request flow: Client → `createBearerAuthMiddleware` → MCP route handler.
- [ ] Update `packages/mcp-server/index.agent.md`: "OrchestratorServer and ProjectServer bind to 127.0.0.1 only. Bearer token: 32-byte random, base64url, compared with timingSafeEqual."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/mcp-server test --coverage` — line coverage ≥ 90% for `localhost-guard.ts` and `bearer-auth.ts`.
- [ ] Run `node scripts/verify-mcp-localhost.mjs` (create this script):
  - Starts the `OrchestratorServer` on a random port.
  - Asserts a valid Bearer token request succeeds (HTTP 200).
  - Asserts a request missing the `Authorization` header returns HTTP 401.
  - Asserts a connection attempt to `0.0.0.0:<port>` from outside loopback is rejected (skipped if running in a container with no external interface).
  - Exit 0 = pass.
- [ ] Run `grep -rn "listen(" packages/mcp-server/src/ | grep -v "127.0.0.1\|LOCALHOST"` and assert zero results (no unguarded `listen` calls).
