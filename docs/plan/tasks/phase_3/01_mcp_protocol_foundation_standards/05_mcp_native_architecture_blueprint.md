# Task: Establish MCP-Native Architecture Blueprint for Orchestrator and Generated Projects (Sub-Epic: 01_MCP Protocol Foundation & Standards)

## Covered Requirements
- [1_PRD-REQ-PIL-005], [TAS-101], [TAS-036]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/architecture_blueprint.test.ts`, write unit tests that:
  - Import `OrchestratorMcpBlueprint` and `ProjectMcpBlueprint` from `@devs/mcp/blueprint`.
  - Assert that `OrchestratorMcpBlueprint.REQUIRED_TOOLS` is an array containing at least `['get_project_context', 'search_memory', 'inject_directive', 'rewind_to_task']`.
  - Assert that `ProjectMcpBlueprint.REQUIRED_TOOLS` is an array containing at least `['inspect_state', 'run_test_task', 'execute_query', 'run_profiler']`.
  - Assert that `OrchestratorMcpBlueprint.validate(registry)` returns `{ valid: false, missingTools: ['inject_directive', ...] }` when a `ToolRegistry` is passed that is missing one of the required tools.
  - Assert that `OrchestratorMcpBlueprint.validate(registry)` returns `{ valid: true, missingTools: [] }` when all required tools are registered.
  - Assert that `ProjectMcpBlueprint.validate(registry)` behaves the same way for its required tool list.
- [ ] In `packages/mcp/src/__tests__/blueprint_integration.test.ts`, write an integration test that:
  - Creates a `McpServer`, registers all `OrchestratorMcpBlueprint.REQUIRED_TOOLS` as stub tools (minimal `inputSchema`), calls `OrchestratorMcpBlueprint.validate(registry)`, and asserts `valid === true`.
  - Calls `McpSpecValidator.detectProprietaryExtensions` on each stub tool definition and asserts `hasExtensions === false`.

## 2. Task Implementation
- [ ] Create `packages/mcp/src/blueprint/index.ts` as the blueprint submodule barrel.
- [ ] Create `packages/mcp/src/blueprint/orchestrator_blueprint.ts` implementing `OrchestratorMcpBlueprint` as a static class:
  - `REQUIRED_TOOLS: readonly string[]` = `['get_project_context', 'search_memory', 'inject_directive', 'rewind_to_task']`. Each name corresponds to a tool the `OrchestratorServer` MUST expose per [1_PRD-REQ-PIL-005] and [TAS-101].
  - `OPTIONAL_TOOLS: readonly string[]` = tools that are recommended but not mandatory (e.g., `'list_tasks'`, `'get_phase_status'`).
  - `validate(registry: ToolRegistry): BlueprintValidationResult` — checks that all `REQUIRED_TOOLS` names are present in `registry.getAll().map(t => t.name)`; returns `{ valid: boolean; missingTools: string[] }`.
  - `generateStubRegistry(): ToolRegistry` — creates and returns a `ToolRegistry` pre-populated with minimal stub `ToolDefinition` objects for all `REQUIRED_TOOLS` (used in tests and documentation generation).
- [ ] Create `packages/mcp/src/blueprint/project_blueprint.ts` implementing `ProjectMcpBlueprint` as a static class:
  - `REQUIRED_TOOLS: readonly string[]` = `['inspect_state', 'run_test_task', 'execute_query', 'run_profiler']`. These are the tools every generated project's internal MCP server (`/mcp-server`) MUST expose per [1_PRD-REQ-PIL-005].
  - `OPTIONAL_TOOLS: readonly string[]` = (e.g., `'get_logs'`, `'reset_state'`).
  - `validate(registry: ToolRegistry): BlueprintValidationResult` — same pattern as `OrchestratorMcpBlueprint.validate`.
  - `generateStubRegistry(): ToolRegistry`.
- [ ] Create `packages/mcp/src/blueprint/types.ts` exporting:
  - `BlueprintValidationResult = { valid: boolean; missingTools: string[] }`.
- [ ] Update `packages/mcp/src/index.ts` to re-export all blueprint symbols.
- [ ] In `packages/mcp/src/server.ts`, add an optional `blueprint?: 'orchestrator' | 'project'` constructor option. If set, call the corresponding blueprint's `validate(registry)` during `start()` and throw a `BlueprintViolationError` if `valid === false`, listing all missing tools. This makes misconfigured servers fail fast.
- [ ] Create `packages/mcp/src/blueprint/errors.ts` defining `BlueprintViolationError extends Error` with a `missingTools: string[]` property.

## 3. Code Review
- [ ] Confirm `REQUIRED_TOOLS` arrays are declared as `readonly string[]` (not plain `string[]`) to prevent accidental mutation.
- [ ] Confirm `generateStubRegistry()` produces only spec-compliant tool definitions (no proprietary fields), verifiable by calling `McpSpecValidator.detectProprietaryExtensions` on each.
- [ ] Confirm `OrchestratorMcpBlueprint` and `ProjectMcpBlueprint` have no circular dependency on `McpServer` (they may depend on `ToolRegistry` but not on server startup logic).
- [ ] Confirm `BlueprintViolationError` message includes the list of missing tool names in a human-readable format for easy debugging.
- [ ] Confirm both blueprints' `REQUIRED_TOOLS` are derived from the requirements ([1_PRD-REQ-PIL-005], [TAS-101]) and not invented ad hoc — add inline comments citing the requirement IDs.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test -- --testPathPattern=blueprint` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/mcp build` and confirm `dist/blueprint/` directory is present with all compiled files.
- [ ] Instantiate a `McpServer` with `blueprint: 'orchestrator'` and an empty `ToolRegistry` and assert it throws `BlueprintViolationError` on `start()`.

## 5. Update Documentation
- [ ] Add a "MCP-Native Architecture Blueprint" section to `packages/mcp/README.md` documenting:
  - The purpose of `OrchestratorMcpBlueprint` and `ProjectMcpBlueprint`.
  - The list of required tools for each blueprint and the requirement IDs they satisfy.
  - How to use `validate()` in CI to assert blueprint conformance.
- [ ] Create `docs/architecture/mcp_native_blueprint.md` containing a Mermaid diagram showing:
  - The orchestrator's MCP server exposing `OrchestratorMcpBlueprint.REQUIRED_TOOLS` to CLI/Extension clients.
  - Each generated project's `/mcp-server` exposing `ProjectMcpBlueprint.REQUIRED_TOOLS` to the AI agent.
- [ ] Update `docs/agent_memory/phase_3.md` with: "All MCP servers in the devs system MUST be validated against their respective blueprint (`OrchestratorMcpBlueprint` or `ProjectMcpBlueprint`) before accepting connections. A server that fails blueprint validation MUST NOT start."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test -- --coverage --testPathPattern=blueprint` and assert line coverage ≥ 90% for `src/blueprint/orchestrator_blueprint.ts` and `src/blueprint/project_blueprint.ts`.
- [ ] Run a canary integration script that:
  1. Creates a `ToolRegistry` with all `OrchestratorMcpBlueprint.REQUIRED_TOOLS` registered as stubs.
  2. Calls `OrchestratorMcpBlueprint.validate(registry)` and asserts `valid === true`.
  3. Removes one tool from the registry, calls `validate` again, asserts `valid === false` and `missingTools.length === 1`.
  - Assert the script exits 0.
- [ ] Run the full CI pipeline for `@devs/mcp` and assert exit code 0.
