# Task: Expose Internal `devs` State and Enable External AI Assistant Querying via MCP (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [1_PRD-REQ-INT-011], [1_PRD-REQ-INT-012]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/state_exposure.test.ts`, write unit tests verifying that `[1_PRD-REQ-INT-011]` (MCP state exposure) is met holistically:
  - Test: the `OrchestratorServer` tool manifest (returned by `listTools()`) includes at minimum the following tool names: `get_project_context`, `get_project_status`, `search_memory`, `inject_directive`, `rewind_to_task`. This ensures the full internal state surface is accessible via MCP.
  - Test: each tool's JSON Schema (in the MCP tool manifest) passes JSON Schema Draft-7 validation using `ajv`.
  - Test: all tool descriptions are non-empty strings of at least 20 characters (sufficient for an AI assistant to understand what to call).
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/assistant_querying.test.ts`, write tests for `[1_PRD-REQ-INT-012]` (external AI assistant querying):
  - Test: an MCP client connecting with a valid Bearer token can call `get_project_status` and receive a valid response.
  - Test: an MCP client connecting without a Bearer token (or with an invalid one) receives HTTP 401 and an MCP error before any tool handler runs.
  - Test: an MCP client can call `get_project_context` with `include_docs: true` and receive PRD/TAS text (verifying full document access for external assistants).
  - Test: rapid sequential calls (10 calls in <2 seconds) from the same MCP client do not cause server errors (rate-limiting does not kick in below this threshold).
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/assistant_querying.integration.test.ts`:
  - Start a real `OrchestratorServer` listening on `localhost:0` (random port).
  - Connect with the `@modelcontextprotocol/sdk` client using the correct Bearer token.
  - Call `get_project_status` and `get_project_context` end-to-end.
  - Assert responses are valid JSON matching the TypeScript interfaces.
  - Verify the server is bound to `localhost` only (attempt a connection from `0.0.0.0` and assert it is refused).

## 2. Task Implementation
- [ ] In `packages/core/src/mcp/orchestrator/server.ts`, ensure the `OrchestratorServer` class:
  - Accepts a `port: number` and `authToken: string` in its constructor config.
  - Uses the MCP SDK's HTTP transport bound exclusively to `127.0.0.1` (not `0.0.0.0`).
  - Implements Bearer token middleware: parse `Authorization: Bearer <token>` header, compare with `authToken` using a constant-time comparison (`crypto.timingSafeEqual`), and reject with HTTP 401 + `McpError(UNAUTHORIZED)` if invalid.
  - Calls all `register*Tool` functions from `packages/core/src/mcp/orchestrator/tools/index.ts` during construction.
  - Exposes a `listTools(): ToolManifestEntry[]` method that returns the full tool manifest for testing purposes.
- [ ] Implement a `createOrchestratorServer(config: OrchestratorServerConfig)` factory function exported from `packages/core/src/mcp/orchestrator/index.ts`:
  ```typescript
  export interface OrchestratorServerConfig {
    port: number;
    authToken: string;
    db: Database;
    vectorStore: VectorStore;
    gitService: GitService;
  }
  export function createOrchestratorServer(config: OrchestratorServerConfig): OrchestratorServer;
  ```
- [ ] Ensure the MCP server's tool manifest (returned by the MCP `initialize` handshake) lists all registered tools so that external AI assistants (e.g., Claude, Gemini) can discover them via `list_tools` without prior knowledge.

## 3. Code Review
- [ ] Confirm `crypto.timingSafeEqual` is used for token comparison (not `===`) to prevent timing attacks.
- [ ] Confirm the server binds to `127.0.0.1` in all code paths — search for any `0.0.0.0` or wildcard bind and flag as a security defect.
- [ ] Confirm all registered tools appear in the MCP `initialize` response's `capabilities.tools` list (the SDK should handle this automatically; verify it does).
- [ ] Confirm the `OrchestratorServerConfig` interface does not have optional security fields — `authToken` must be required, not optional, to prevent accidentally running an unauthenticated server.
- [ ] Confirm error responses for 401 do not include the server's `authToken` value in any field.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=state_exposure` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=assistant_querying` and confirm all tests pass.
- [ ] Run the full `@devs/core` test suite and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/orchestrator/server.agent.md` documenting:
  - `OrchestratorServer` class purpose, constructor config fields, and security model.
  - How `[1_PRD-REQ-INT-011]` (state exposure) is satisfied: list of tools that expose internal state.
  - How `[1_PRD-REQ-INT-012]` (assistant querying) is satisfied: MCP tool discovery via `initialize` handshake.
  - Bearer token authentication scheme and `crypto.timingSafeEqual` rationale.
  - localhost-only binding and its security implications.
  - Example: how an external AI assistant (e.g., Claude Desktop with MCP config) would connect and call `get_project_status`.
- [ ] Update `packages/core/src/mcp/orchestrator/index.agent.md` to describe the `createOrchestratorServer` factory and its config interface.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern="state_exposure|assistant_querying"` and assert coverage ≥ 90% for `server.ts`.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run a security check: `grep -rn "0\.0\.0\.0" packages/core/src/mcp/orchestrator/` and assert zero matches.
- [ ] Run a security check: `grep -rn "authToken.*optional\|authToken.*?" packages/core/src/mcp/orchestrator/server.ts` and assert zero matches (token must be required).
