# Task: Implement ToolProxy Sandbox Bridge with MCP Injection (Sub-Epic: 07_Sandbox Bridge & Injection)

## Covered Requirements
- [3_MCP-TAS-037], [1_PRD-REQ-OBS-004]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/tool-proxy.test.ts`, write unit tests for the `ToolProxy` class:
  - Test that `ToolProxy.route(toolCall)` forwards a tool call to the correct `SandboxExecutor` based on tool name.
  - Test that `ToolProxy` throws a `ToolNotFoundError` when an unregistered tool is invoked.
  - Test that `ToolProxy` correctly injects MCP endpoint configuration (host, port, bearer token) into the Docker/WebContainer environment at initialization.
  - Test that an instantiated `ToolProxy` exposes a secure, monitored interface accessible only through the MCP transport layer (verify the underlying HTTP server binds only to `localhost`).
- [ ] In `packages/core/src/sandbox/__tests__/sandbox-injector.test.ts`, write integration tests for `SandboxInjector`:
  - Test that `SandboxInjector.inject(sandboxConfig)` copies the MCP server binary and its configuration into the ephemeral environment's `/mcp-server` directory.
  - Test that environment variables `MCP_HOST`, `MCP_PORT`, and `MCP_TOKEN` are set inside the sandbox after injection.
  - Test that `SandboxInjector` returns a `SandboxSession` object with a valid `sessionId` and `mcpEndpoint` URL.
  - Test that injection into a Docker container correctly mounts the MCP server volume using `dockerode`.
- [ ] In `packages/core/src/sandbox/__tests__/isolation.test.ts`, write E2E tests verifying isolation:
  - Test that the Developer Agent can call `run_test_task` via the injected MCP server and receive a structured result.
  - Test that the Developer Agent cannot call tools scoped outside its current phase (expect `403 Forbidden` response).

## 2. Task Implementation
- [ ] Create `packages/core/src/sandbox/tool-proxy.ts`:
  - Export a `ToolProxy` class with constructor `(registry: ToolRegistry, sandboxExecutor: SandboxExecutor, config: McpConfig)`.
  - Implement `async route(toolCall: ToolCall): Promise<ToolResult>` which:
    1. Looks up the tool in `registry.resolve(toolCall.name, agentRole, projectPhase)`.
    2. Sanitizes and validates arguments using `zod` schema attached to the `ToolDefinition`.
    3. Delegates execution to `sandboxExecutor.execute(toolCall)` and returns the result.
  - Throw `ToolNotFoundError` (custom error class) when tool resolution fails.
- [ ] Create `packages/core/src/sandbox/sandbox-injector.ts`:
  - Export a `SandboxInjector` class with method `async inject(config: SandboxConfig): Promise<SandboxSession>`.
  - For Docker environments: use `dockerode` to start a container from the configured image, copy the pre-built `mcp-server` binary to `/mcp-server/` inside the container, and set environment variables `MCP_HOST=127.0.0.1`, `MCP_PORT`, `MCP_TOKEN` (randomly generated UUID v4).
  - For WebContainer environments: use the WebContainer API to mount the `mcp-server` directory and set the equivalent process environment.
  - Return `SandboxSession { sessionId: string, mcpEndpoint: string, containerId?: string }`.
- [ ] Create `packages/core/src/sandbox/types.ts` with interfaces: `SandboxConfig`, `SandboxSession`, `McpConfig`, `ToolCall`, `ToolResult`.
- [ ] Wire `ToolProxy` and `SandboxInjector` into the main `OrchestratorServer` initialization in `packages/core/src/orchestrator/server.ts`.
- [ ] Expose the ability for the Developer Agent to call `inspect_state`, `run_test_task`, and `execute_query` tools through the `ToolProxy` (these map to the injected ProjectServer running inside the sandbox).

## 3. Code Review
- [ ] Verify that `ToolProxy` never passes raw, unsanitized arguments to `SandboxExecutor`; all inputs must pass `zod` validation with a strict schema.
- [ ] Confirm that `SandboxInjector` does not hard-code credentials; `MCP_TOKEN` must be ephemeral and unique per session.
- [ ] Ensure `ToolProxy.route` is the single entry point for all sandbox tool calls—no direct calls to `SandboxExecutor` from outside this class.
- [ ] Verify that the `SandboxInjector` correctly handles both Docker and WebContainer target environments via a strategy pattern (no `if/else` branching based on environment type in the injector's public API).
- [ ] Confirm all public APIs are fully typed with no `any` types.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="sandbox"` and confirm all tests in `packages/core/src/sandbox/__tests__/` pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="isolation"` and confirm E2E isolation tests pass.
- [ ] Verify test coverage for `tool-proxy.ts` and `sandbox-injector.ts` is ≥ 90% (lines and branches) using `pnpm --filter @devs/core test -- --coverage`.

## 5. Update Documentation
- [ ] Create `packages/core/src/sandbox/sandbox.agent.md` documenting: the purpose of the Sandbox Bridge, the `ToolProxy` routing flow, the `SandboxInjector` injection lifecycle, supported environment types (Docker, WebContainer), and required environment variables.
- [ ] Update `packages/core/README.md` to include a section on the Sandbox Bridge architecture.
- [ ] Add `3_MCP-TAS-037` and `1_PRD-REQ-OBS-004` to the requirements coverage matrix in `docs/requirements-coverage.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript compilation errors.
- [ ] Run `pnpm --filter @devs/core test -- --ci --forceExit` and confirm the exit code is `0`.
- [ ] Execute `node scripts/verify-coverage.js --package core --threshold 90` to confirm coverage thresholds are met and the script exits with code `0`.
