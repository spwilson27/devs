# Task: Implement MCP Tool Wrappers for Short-Term and Medium-Term Memory (Sub-Epic: 04_Short_and_Medium_Term_Memory)

## Covered Requirements
- [3_MCP-TAS-016], [3_MCP-TAS-017]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/mcp_memory_tools.test.ts`, write unit/integration tests that:
  - **`memory_append_entry` tool**: Calling the tool handler with a valid `ContextEntry`-shaped JSON argument calls `ShortTermMemory.append()` and returns a success response `{ success: true }`.
  - **`memory_get_window` tool**: Calling the tool handler with `{ lastN: 5 }` calls `ShortTermMemory.getWindow(5)` and returns a JSON array of `ContextEntry` objects.
  - **`memory_get_token_count` tool**: Returns `{ tokenCount: <number> }` matching `ShortTermMemory.tokenCount()`.
  - **`memory_clear_short_term` tool**: Calls `ShortTermMemory.clear()` and returns `{ success: true }`.
  - **`memory_snapshot` tool**: Calls `ShortTermMemory.snapshot()` and returns a serializable JSON object.
  - **`memory_restore_snapshot` tool**: Calls `ShortTermMemory.restore(snapshot)` with the provided snapshot argument and returns `{ success: true }`.
  - **`memory_log_task` tool**: Calling with a valid `TaskSummary`-shaped argument calls `MediumTermMemory.logTask()` and returns `{ success: true }`.
  - **`memory_get_epic_summaries` tool**: Calling with `{ epicId: 'epic-1', limit: 10 }` calls `MediumTermMemory.getEpicSummaries('epic-1', { limit: 10 })` and returns the results as a JSON array.
  - **`memory_log_failed_strategy` tool**: Calling with a valid `StrategyFailure`-shaped argument calls `MediumTermMemory.logFailedStrategy()` and returns `{ success: true }`.
  - **`memory_get_failed_strategies` tool**: Calling with `{ epicId: 'epic-1' }` returns a JSON array of `StrategyFailure` objects.
  - **`memory_set_epic_override` tool**: Calling with `{ epicId, key, value }` calls `MediumTermMemory.setEpicOverride()` and returns `{ success: true }`.
  - **`memory_get_epic_overrides` tool**: Calling with `{ epicId }` returns a `Record<string, string>`.
  - **Input validation**: Each tool handler returns a structured MCP error response (not a thrown exception) when given invalid/missing required arguments. Test at least 2 tools for this behavior.
  - Use dependency injection (pass `ShortTermMemory` and `MediumTermMemory` mocks) so no real SQLite DB is required in unit tests.

## 2. Task Implementation
- [ ] Create `packages/memory/src/mcp/memory_tools.ts` that:
  - Imports `McpServer` (or the equivalent tool-registration API) from `@modelcontextprotocol/sdk`.
  - Accepts `shortTerm: IShortTermMemory` and `mediumTerm: IMediumTermMemory` as constructor arguments via a `registerMemoryTools(server: McpServer, shortTerm: IShortTermMemory, mediumTerm: IMediumTermMemory): void` factory function.
  - Registers the following MCP tools with JSON Schema input validation:
    - **Short-term tools** (backed by `IShortTermMemory`):
      - `memory_append_entry` — input: `ContextEntry` schema; calls `shortTerm.append(entry)`.
      - `memory_get_window` — input: `{ lastN?: number }`; calls `shortTerm.getWindow(lastN)`.
      - `memory_get_token_count` — no input; calls `shortTerm.tokenCount()`.
      - `memory_clear_short_term` — no input; calls `shortTerm.clear()`.
      - `memory_snapshot` — no input; calls `shortTerm.snapshot()`.
      - `memory_restore_snapshot` — input: `ShortTermSnapshot` schema; calls `shortTerm.restore(snapshot)`.
    - **Medium-term tools** (backed by `IMediumTermMemory`):
      - `memory_log_task` — input: `TaskSummary` schema; calls `mediumTerm.logTask(summary)`.
      - `memory_get_epic_summaries` — input: `{ epicId: string; limit?: number }`; calls `mediumTerm.getEpicSummaries(epicId, { limit })`.
      - `memory_log_failed_strategy` — input: `StrategyFailure` schema; calls `mediumTerm.logFailedStrategy(record)`.
      - `memory_get_failed_strategies` — input: `{ epicId: string }`; calls `mediumTerm.getFailedStrategies(epicId)`.
      - `memory_set_epic_override` — input: `{ epicId: string; key: string; value: string }`; calls `mediumTerm.setEpicOverride(epicId, key, value)`.
      - `memory_get_epic_overrides` — input: `{ epicId: string }`; calls `mediumTerm.getEpicOverrides(epicId)`.
  - Each tool handler wraps execution in try/catch and returns a structured MCP error content block on failure (never throws to the MCP framework).
  - All tool descriptions clearly state: which memory tier the tool targets, what data is read/written, and what the return shape is.
- [ ] Add `@modelcontextprotocol/sdk` as a dependency in `packages/memory/package.json` if not already present.
- [ ] Export `registerMemoryTools` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify that `registerMemoryTools` uses JSON Schema (not raw TypeScript types) for input validation, matching the MCP SDK's tool registration API.
- [ ] Verify that each tool description string is concise (< 80 chars) and machine-readable (no markdown formatting).
- [ ] Verify that no tool directly imports `ShortTermMemory` or `MediumTermMemory` concrete classes — only the `IShortTermMemory` and `IMediumTermMemory` interfaces (dependency inversion).
- [ ] Verify that tool handlers for async medium-term operations properly `await` the promise and handle rejection in the catch block.
- [ ] Verify that the `zod` schemas from `schemas.ts` are used (converted via `zod-to-json-schema` or equivalent) for input validation rather than duplicating schema definitions.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test mcp_memory_tools` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/mcp/mcp_memory_tools.agent.md` documenting:
  - The complete list of registered tools with their input/output schemas.
  - How to call `registerMemoryTools` in the MCP server bootstrap file.
  - The dependency injection pattern: why concrete classes are not imported directly.
  - `3_MCP-TAS-016`: which tools correspond to short-term memory access.
  - `3_MCP-TAS-017`: which tools correspond to medium-term memory access.
  - The error response format used when tool execution fails.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test mcp_memory_tools --reporter=json > /tmp/mcp_tools_results.json`.
- [ ] Assert: `node -e "const r = require('/tmp/mcp_tools_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` exits with `0`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` — must exit with code `0`.
- [ ] Verify that the list of registered tool names in `memory_tools.ts` matches the expected tool names by running: `grep -c "server.tool(" packages/memory/src/mcp/memory_tools.ts` and asserting the count equals `12`.
