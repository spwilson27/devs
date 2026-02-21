# Task: Implement MCP Server Injection into Research Agent Sandbox on Startup (Sub-Epic: 05_Research Sandbox & Security Permissions)

## Covered Requirements
- [1_PRD-REQ-MAP-004]

## 1. Initial Test Written
- [ ] In `src/research/sandbox/__tests__/sandbox_bootstrap.test.ts`, write a unit test `SandboxBootstrap > injectsMcpServersOnStartup` that:
  - Mocks a `SandboxConfig` object containing a list of at least two MCP server definitions (e.g., `{ name: "search-mcp", endpoint: "...", token: "..." }`).
  - Mocks the `McpClientRegistry` class and verifies that `McpClientRegistry.register(serverConfig)` is called once per server in the config during bootstrap.
  - Asserts that after `SandboxBootstrap.initialize(config)` resolves, `McpClientRegistry.getAll()` returns the correct set of registered servers.
- [ ] Write an integration test `SandboxBootstrap > failsStartupIfMcpServerUnreachable` that:
  - Configures a mock MCP server endpoint that responds with a connection refused error.
  - Asserts that `SandboxBootstrap.initialize(config)` rejects with a `McpServerUnavailableError`.
  - Asserts that the sandbox remains in a `HALTED` state (not `RUNNING`) after a failed injection.
- [ ] Write a unit test `SandboxBootstrap > exposesMcpToolsToResearchAgent` that:
  - After successful `initialize()`, calls `SandboxBootstrap.getAvailableTools()`.
  - Asserts the returned tool list includes all tools advertised by the registered MCP servers.

## 2. Task Implementation
- [ ] Create `src/research/sandbox/sandbox_config.ts`:
  - Export a `McpServerDefinition` interface: `{ name: string; endpoint: string; authToken: string; healthCheckPath: string; }`.
  - Export a `SandboxConfig` interface: `{ mcpServers: McpServerDefinition[]; phaseId: string; }`.
- [ ] Create `src/research/sandbox/mcp_client_registry.ts`:
  - Implement a singleton `McpClientRegistry` class with methods:
    - `register(server: McpServerDefinition): Promise<void>` — connects to the MCP server endpoint, performs a health check GET request to `server.healthCheckPath`, and stores the active client.
    - `getAll(): McpServerDefinition[]` — returns all registered server definitions.
    - `getToolsForServer(name: string): string[]` — returns the tool names advertised by the named server.
    - `clear(): void` — for use in tests only, resets the registry.
  - Throw `McpServerUnavailableError` (custom error class in `src/research/sandbox/errors.ts`) if the health check fails.
- [ ] Create `src/research/sandbox/sandbox_bootstrap.ts`:
  - Export a `SandboxBootstrap` class with:
    - `private state: 'IDLE' | 'RUNNING' | 'HALTED'`
    - `async initialize(config: SandboxConfig): Promise<void>` — iterates over `config.mcpServers`, calls `McpClientRegistry.register()` for each, sets `state = 'RUNNING'` on full success, and sets `state = 'HALTED'` on any failure before re-throwing.
    - `getAvailableTools(): string[]` — aggregates tools from `McpClientRegistry` across all servers.
    - `getState(): 'IDLE' | 'RUNNING' | 'HALTED'` — returns current state.
- [ ] Create `src/research/sandbox/errors.ts`:
  - Export `McpServerUnavailableError extends Error` with `serverName` and `endpoint` fields.

## 3. Code Review
- [ ] Verify `McpClientRegistry` is a true singleton (only one instance possible per process).
- [ ] Verify that `SandboxBootstrap.initialize()` is atomic: if any server fails, no partial state is committed (all-or-nothing registration). Confirm `state` is only set to `RUNNING` after all servers succeed.
- [ ] Confirm that `McpServerUnavailableError` carries enough context (server name and endpoint) for actionable error messages.
- [ ] Ensure no raw credentials or tokens are logged at any point during `register()`.
- [ ] Verify all public methods have JSDoc comments describing their contract, parameters, and thrown errors.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/research/sandbox/__tests__/sandbox_bootstrap.test.ts --coverage` and confirm:
  - All 3 test cases pass.
  - Branch coverage for `sandbox_bootstrap.ts` and `mcp_client_registry.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Create `src/research/sandbox/sandbox_bootstrap.agent.md` documenting:
  - The purpose of the Research Sandbox bootstrap process.
  - The `SandboxConfig` interface fields and their semantics.
  - The startup sequence: config load → MCP server registration → health check → tool enumeration.
  - The `HALTED` failure state and how to recover (re-initialization with corrected config).
- [ ] Append to `docs/architecture/phase_5_research.md` (create if absent) a section titled "MCP Sandbox Injection" describing the bootstrap contract.

## 6. Automated Verification
- [ ] Run `npx jest src/research/sandbox/__tests__/sandbox_bootstrap.test.ts --json --outputFile=/tmp/sandbox_bootstrap_results.json`.
- [ ] Execute `node -e "const r = require('/tmp/sandbox_bootstrap_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to confirm exit code 0.
- [ ] Run `npx tsc --noEmit` and verify zero TypeScript errors related to the new files.
