# Task: Implement `get_task_trace` MCP Tool for Full Tool Output Retrieval (Sub-Epic: 10_Spec_Refresh_Protocol)

## Covered Requirements
- [3_MCP-TAS-051]

## 1. Initial Test Written
- [ ] In `packages/mcp-server/src/__tests__/getTaskTrace.test.ts`, write tests for the `get_task_trace` MCP tool handler:
  - **Happy path**: Insert a row into the `task_traces` SQLite table with `traceId='trace-001'` and `fullOutput='<200-line string>'`. Call the handler with `{ traceId: 'trace-001' }` and assert the response contains the full 200-line string verbatim.
  - **Not found**: Call the handler with `{ traceId: 'nonexistent' }` and assert the response is a structured error: `{ error: 'TRACE_NOT_FOUND', traceId: 'nonexistent' }`.
  - **Schema validation**: Call the handler with a missing `traceId` parameter and assert the response is `{ error: 'INVALID_INPUT', message: 'traceId is required' }`.
  - **Large output**: Insert a `fullOutput` of 1 MB (1,048,576 chars). Assert the full 1 MB string is returned without truncation.
  - **Write path**: Call `storeTaskTrace({ traceId: 'trace-002', fullOutput: 'hello' })` and then retrieve via handler — assert round-trip fidelity.

## 2. Task Implementation
- [ ] Add migration `packages/mcp-server/src/migrations/003_task_traces.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS task_traces (
    trace_id   TEXT PRIMARY KEY,
    full_output TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  ```
- [ ] Create `packages/mcp-server/src/tools/getTaskTrace.ts`:
  - Export `storeTaskTrace(db: BetterSqlite3.Database, traceId: string, fullOutput: string): void` — upserts into `task_traces`.
  - Export `getTaskTraceHandler(db: BetterSqlite3.Database): McpToolHandler` — returns an MCP tool handler function:
    ```ts
    async (params: unknown) => {
      // 1. Validate params — traceId must be a non-empty string.
      // 2. Query task_traces WHERE trace_id = params.traceId.
      // 3. If not found, return { error: 'TRACE_NOT_FOUND', traceId }.
      // 4. If found, return { traceId, fullOutput: row.full_output }.
    }
    ```
- [ ] Register the tool in `packages/mcp-server/src/server.ts`:
  ```ts
  server.tool('get_task_trace', getTaskTraceSchema, getTaskTraceHandler(db));
  ```
  Where `getTaskTraceSchema` is a Zod schema: `z.object({ traceId: z.string().min(1) })`.
- [ ] Wire `storeTaskTrace` into the existing tool execution middleware so every tool invocation whose output exceeds 500 chars automatically stores the full output in `task_traces` and records the `traceId` on the resulting `ContextMessage`.

## 3. Code Review
- [ ] Verify `storeTaskTrace` uses `INSERT OR REPLACE` (upsert) — not a conditional SELECT + INSERT.
- [ ] Confirm the MCP tool schema uses Zod and validation errors are returned as structured `{ error: 'INVALID_INPUT' }` responses, not thrown exceptions.
- [ ] Verify the 500-char threshold for automatic trace storage is a named constant (`TOOL_OUTPUT_TRACE_THRESHOLD = 500`) in `packages/mcp-server/src/constants.ts`.
- [ ] Confirm no tool output is ever truncated inside `storeTaskTrace` — the full raw bytes are always stored.
- [ ] Confirm the `task_traces` table uses `TEXT PRIMARY KEY` (not INTEGER), so `traceId` values are arbitrary UUIDs.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern=getTaskTrace` — all tests pass.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --coverage` — `getTaskTrace.ts` has ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add `get_task_trace` to the MCP tool reference in `docs/mcp/tools.md` with parameters, return shape, and an example response.
- [ ] Update `packages/memory/README.md` to cross-reference `get_task_trace` as the retrieval mechanism for truncated tool results.
- [ ] Add the `task_traces` schema to `docs/database/schema.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server build` — zero TypeScript errors.
- [ ] Run the MCP server in test mode and exercise the tool via HTTP: `curl -s -X POST http://localhost:3001/mcp -d '{"tool":"get_task_trace","params":{"traceId":"nonexistent"}}' | grep TRACE_NOT_FOUND` — exits 0.
- [ ] Run `pnpm --filter @devs/mcp-server test` — full suite passes with zero failures.
