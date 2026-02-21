# Task: Implement Cross-Container Tool Routing in ToolProxy (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [3_MCP-UNKNOWN-201]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/__tests__/tool-proxy-routing.test.ts`, write the following tests:
  - Test that `ToolProxy.route(toolCall)` forwards the call to the `ProjectServer` endpoint matching the `toolCall.serviceId` as looked up from `ProjectServerRegistry`.
  - Test that when `toolCall.serviceId` is not in the registry, `route` throws a `ServiceNotFoundError` with the unknown `serviceId` in the message.
  - Test that when the target `ProjectServer` returns HTTP 200 with a JSON body, `route` returns the parsed `ToolResult`.
  - Test that when the target `ProjectServer` returns HTTP 500, `route` throws a `ToolExecutionError` containing the service's error response body.
  - Test that `ToolProxy.route` applies argument sanitization (path traversal check) before forwarding — a `toolCall.args.path` containing `../` causes a `PathTraversalError` to be thrown before any HTTP request is made.
  - Test that `ToolProxy.route` sets a `Authorization: Bearer <token>` header on every outbound request, where the token is sourced from the `SessionTokenStore` (mock the store in this test).

## 2. Task Implementation
- [ ] Update `packages/core/src/mcp/tool-proxy.ts`:
  - Inject `ProjectServerRegistry` and `SessionTokenStore` via constructor (dependency injection).
  - Implement `route(toolCall: ToolCall): Promise<ToolResult>`:
    1. Validate `toolCall.args` with `sanitizeToolArgs(toolCall.args)` (path traversal check — throws `PathTraversalError` if `../` detected in any string arg).
    2. Lookup the `ProjectServerRecord` from `registry.getByServiceId(toolCall.serviceId)` — throw `ServiceNotFoundError` if not found.
    3. Retrieve the session Bearer token from `tokenStore.getToken(toolCall.sessionId)`.
    4. Issue an HTTP POST to `${record.endpoint}/tools/execute` with JSON body `toolCall` and header `Authorization: Bearer <token>`, 30-second timeout.
    5. On HTTP 200, parse and return the body as `ToolResult`.
    6. On non-200, throw `ToolExecutionError` with the response body and status code.
- [ ] Define `ToolCall` and `ToolResult` interfaces in `packages/core/src/mcp/types.ts` if not already defined:
  ```ts
  interface ToolCall { serviceId: string; sessionId: string; tool: string; args: Record<string, unknown>; }
  interface ToolResult { output: unknown; metadata?: Record<string, unknown>; }
  ```
- [ ] Add `ServiceNotFoundError`, `ToolExecutionError`, and `PathTraversalError` to `packages/core/src/mcp/errors.ts`.
- [ ] Export updated `ToolProxy` and new error types from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify `sanitizeToolArgs` checks ALL string values in `args` recursively (not just the top-level `path` key) for path traversal patterns.
- [ ] Confirm the Bearer token is sourced from `SessionTokenStore` and NOT hardcoded or derived from environment variables in this function.
- [ ] Verify the HTTP timeout is enforced via `AbortController` (30 seconds) and a timeout results in a `ToolExecutionError` (not an unhandled promise rejection).
- [ ] Ensure `ToolProxy` is stateless (no internal mutable state beyond constructor-injected dependencies) for safe reuse across concurrent calls.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern tool-proxy-routing` and confirm all tests pass.
- [ ] Run the full MCP test suite: `pnpm --filter @devs/core test -- --testPathPattern mcp` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/core/src/mcp/README.md` with a "Cross-Container Routing" section describing:
  - The routing flow: `ToolProxy.route` → `ProjectServerRegistry` lookup → HTTP POST to `ProjectServer`.
  - The argument sanitization step and which patterns are rejected.
  - Bearer token injection from `SessionTokenStore`.
- [ ] Update `index.agent.md` to record that all multi-container tool calls MUST route through `ToolProxy.route` (never direct HTTP calls).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` (exit code 0).
- [ ] Run `pnpm --filter @devs/core test` (exit code 0).
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` (exit code 0).
