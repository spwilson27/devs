# Task: Implement `run_profiler` MCP Tool for System-Wide Profiling (Sub-Epic: 19_System-Wide Profiling and TDD Loop)

## Covered Requirements
- [1_PRD-REQ-NEED-DEVS-03]

## 1. Initial Test Written
- [ ] Create `src/mcp/tools/__tests__/runProfilerTool.test.ts`.
- [ ] Write a unit test `should return an error if profiling data is empty` — mock `ProfilingService.getMetrics()` to return `[]` and assert the tool response contains `{ error: 'No profiling data available.' }`.
- [ ] Write a unit test `should identify the slowest phase by durationMs` — mock `getMetrics()` returning three `PhaseMetric` entries with `durationMs` of 500, 2000, and 800; assert the response's `slowestPhase` field equals the entry with `durationMs: 2000`.
- [ ] Write a unit test `should identify the most token-intensive phase by total_tokens` — mock the same three entries with `tokenUsage.total` of 1000, 400, and 6000; assert `mostTokenIntensivePhase` equals the entry with `total: 6000`.
- [ ] Write a unit test `should include a sorted breakdown of all phases` — assert the response includes a `phases` array sorted descending by `durationMs`.
- [ ] Write an integration test `run_profiler tool is registered in the MCP server` — start a test instance of the MCP server and call `tools/list`; assert the tool named `run_profiler` is present with valid `inputSchema`.
- [ ] Write an E2E test `run_profiler returns valid JSON-RPC response` — issue a `tools/call` request with `{ name: "run_profiler", arguments: {} }` over the in-process MCP transport and assert the response has `content[0].type === "text"` and the parsed JSON contains `slowestPhase`.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/runProfilerTool.ts`.
- [ ] Define the tool using the project's MCP SDK tool registration pattern:
  ```typescript
  server.tool(
    'run_profiler',
    'Triggers system-wide profiling analysis and returns a report identifying the slowest and most token-intensive agent phases.',
    {}, // no input parameters required
    async () => { ... }
  );
  ```
- [ ] Inside the handler:
  1. Call `profilingService.getMetrics()`.
  2. If empty, return `{ content: [{ type: 'text', text: JSON.stringify({ error: 'No profiling data available.' }) }] }`.
  3. Sort metrics by `durationMs` descending.
  4. Sort metrics by `tokenUsage.total` descending.
  5. Build a result object: `{ slowestPhase, mostTokenIntensivePhase, phases: sortedByDuration }`.
  6. Return `{ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }`.
- [ ] Register `runProfilerTool` in `src/mcp/server.ts` by importing and calling it during server initialisation, passing the shared `ProfilingService` instance.
- [ ] Ensure `ProfilingService` is injected (not imported as a singleton) into the tool registration function to keep it testable.

## 3. Code Review
- [ ] Verify the tool name `run_profiler` exactly matches the requirement specification in `2_TAS-REQ-010`.
- [ ] Confirm the tool's `inputSchema` is an empty object `{}` (no required arguments) and the schema is valid JSON Schema Draft 7.
- [ ] Confirm the handler never throws unhandled exceptions — all errors must be caught and returned as structured JSON in the `content` array.
- [ ] Verify sorting is stable and deterministic for phases with equal `durationMs` or equal `totalTokens` (use `phase` name as a tiebreaker).
- [ ] Confirm the tool is listed in `src/mcp/server.ts` tool registration block alongside other MCP tools.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/mcp/tools/__tests__/runProfilerTool.test.ts --reporter=verbose`.
- [ ] Assert exit code is `0` and all tests pass.
- [ ] Run the full test suite `npx vitest run` to confirm no regressions.

## 5. Update Documentation
- [ ] Add `run_profiler` to the MCP tool catalogue table in `docs/mcp-tools.md` with columns: Tool Name, Description, Input Schema, Output Schema.
- [ ] Update `docs/architecture/profiling.md` with a sub-section `### run_profiler MCP Tool` describing how agents invoke it and what the response shape looks like.
- [ ] Update `docs/agent-memory/phase_14.md` with: `run_profiler MCP tool implemented; returns slowestPhase and mostTokenIntensivePhase from ProfilingService.getMetrics().`

## 6. Automated Verification
- [ ] Run `npx vitest run --coverage src/mcp/tools` and assert line coverage ≥ 90% for `runProfilerTool.ts`.
- [ ] Run `node -e "const s=require('./dist/mcp/server'); console.log(JSON.stringify(s.listTools()))" | grep -q run_profiler && echo PASS || echo FAIL` (after build) to confirm the tool is registered.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
