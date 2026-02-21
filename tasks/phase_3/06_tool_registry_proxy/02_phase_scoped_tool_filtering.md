# Task: Phase-Scoped Tool Filtering & list_tools MCP Capability (Sub-Epic: 06_Tool Registry & Proxy)

## Covered Requirements
- [3_MCP-TAS-063], [TAS-077]

## 1. Initial Test Written
- [ ] Create `packages/core/src/tool-registry/__tests__/phase-filter.test.ts`.
- [ ] Write a unit test that creates a `ToolRegistry` with three tools tagged to different phases (`phase_1`, `phase_2`, `phase_3`) and asserts that `listToolsForPhase('phase_2')` returns only the tool(s) tagged to `phase_2`.
- [ ] Write a unit test asserting that a tool tagged to multiple phases appears in the results for each of those phases.
- [ ] Write a unit test asserting that `listToolsForPhase('unknown_phase')` returns an empty array (not an error).
- [ ] Create `packages/core/src/tool-registry/__tests__/epic-filter.test.ts`.
- [ ] Write a unit test that asserts `listToolsForContext({ phaseId, epicId })` returns the intersection of tools allowed for that specific phase + epic combination.
- [ ] Create `packages/mcp/src/__tests__/list-tools-handler.test.ts`.
- [ ] Write an integration test that mounts the MCP server with a `ToolRegistry` seeded with phase-tagged tools, issues a `tools/list` MCP request with a phase context header, and asserts the response contains only the tools permitted for that phase.
- [ ] Write a test asserting that a `tools/list` request with no phase context returns all registered tools (graceful fallback).
- [ ] All tests must fail before implementation.

## 2. Task Implementation
- [ ] Extend `ToolDefinition` in `packages/core/src/tool-registry/types.ts`:
  - Add `allowedPhases?: string[]` – if absent, the tool is available in all phases.
  - Add `allowedEpics?: string[]` – if absent, the tool is available in all epics.
- [ ] Add to `ToolRegistry`:
  - `listToolsForPhase(phaseId: string): RegisteredTool[]` – filters by `allowedPhases`.
  - `listToolsForEpic(phaseId: string, epicId: string): RegisteredTool[]` – filters by both `allowedPhases` and `allowedEpics`.
  - `listToolsForContext(ctx: Pick<ToolExecutionContext, 'phaseId' | 'epicId'>): RegisteredTool[]` – delegates to `listToolsForEpic`.
- [ ] Update `createDefaultRegistry()` to tag the five built-in tools with their permitted phases (all five are available from `phase_3` onward; consult `docs/architecture/mcp-tool-registry.md` for the phase-permission table).
- [ ] In `packages/mcp/src/orchestrator/handlers/list-tools.ts`, implement the `tools/list` MCP request handler:
  - Extract `phaseId` and `epicId` from the MCP request meta or session context (fall back to `'*'` if absent).
  - Call `registry.listToolsForContext(ctx)`.
  - Map `RegisteredTool[]` to the MCP `Tool[]` wire format: `{ name, description, inputSchema }`.
  - Return the standard MCP `ListToolsResult`.
- [ ] Register the handler in `packages/mcp/src/orchestrator/OrchestratorServer.ts` under the MCP `tools/list` capability.

## 3. Code Review
- [ ] Confirm that the filtering logic is a pure function with no side effects – it does not mutate the registry.
- [ ] Confirm that the MCP handler does not hard-code any phase IDs; all phase/epic filtering is delegated to `ToolRegistry` methods.
- [ ] Verify that the MCP `ListToolsResult` schema is exactly compliant with MCP SDK `@modelcontextprotocol/sdk` types (no extra undocumented fields).
- [ ] Ensure that `allowedPhases: []` (empty array) is treated as "no phases allowed" and returns no tools — distinct from `undefined` (all phases).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern phase-filter` – all tests pass.
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern epic-filter` – all tests pass.
- [ ] Run `pnpm test --filter @devs/mcp -- --testPathPattern list-tools-handler` – all tests pass.
- [ ] Run `pnpm tsc --noEmit` across the monorepo – zero errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/mcp-tool-registry.md` to include the phase-permission table and describe the `allowedPhases`/`allowedEpics` tagging mechanism.
- [ ] Update `packages/mcp/README.md` with a "Dynamic Tool Discovery" section referencing `[3_MCP-TAS-063]`.
- [ ] Record in `memory/phase_3/decisions.md`: "Tool phase-scoping uses allow-list tagging on ToolDefinition; absence of allowedPhases means unrestricted access."

## 6. Automated Verification
- [ ] CI: `pnpm test --filter @devs/core -- --testPathPattern "(phase-filter|epic-filter)" --ci` exits 0.
- [ ] CI: `pnpm test --filter @devs/mcp -- --testPathPattern list-tools-handler --ci` exits 0.
- [ ] CI: `pnpm tsc --noEmit` exits 0.
