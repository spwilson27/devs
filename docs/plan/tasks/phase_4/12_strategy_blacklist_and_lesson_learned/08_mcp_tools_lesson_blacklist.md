# Task: Expose MCP Tools for Strategy Blacklist and Lesson Logging (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [3_MCP-TAS-052], [4_USER_FEATURES-REQ-068]

## 1. Initial Test Written
- [ ] Create `packages/mcp/src/__tests__/lesson-tools.test.ts` with the following test cases for each MCP tool:

  **`log_lesson_learned` tool:**
  - Calling the tool with valid inputs (`task_id`, `strategy_description`, `rca_summary`, `failure_type`, `source_agent`) returns `{ success: true, lesson_id: string }`.
  - Calling with a duplicate `task_id` + `strategy_description` returns `{ success: false, error: 'LESSON_ALREADY_EXISTS' }` (does NOT throw; MCP tools must return structured errors).
  - Calling with a missing required field returns `{ success: false, error: 'VALIDATION_ERROR', detail: string }`.

  **`check_strategy_blacklist` tool:**
  - Calling with `task_id` and `strategy` returns `{ blacklisted: true, lesson: LessonLearned }` when a matching active lesson exists.
  - Calling when no match exists returns `{ blacklisted: false }`.
  - Calling with an empty `strategy` string returns `{ blacklisted: false }` (no check performed).

  **`list_directive_history` tool:**
  - Calling with `task_id` returns `{ entries: DirectiveHistoryEntry[] }` ordered by `created_at DESC`.
  - Calling without `task_id` returns all entries paginated by `limit` (default 50) and `offset` (default 0).

  - Mock `LessonLearnedService` and `DirectiveHistoryService` via `jest.spyOn`; no real SQLite I/O.

## 2. Task Implementation
- [ ] Create `packages/mcp/src/tools/lessonTools.ts` implementing three MCP tool definitions:

  **`log_lesson_learned`:**
  ```ts
  {
    name: 'log_lesson_learned',
    description: 'Log a strategy failure as a Lesson Learned to prevent future agents from repeating the same mistake.',
    inputSchema: {
      type: 'object',
      required: ['task_id', 'strategy_description', 'rca_summary', 'failure_type', 'source_agent'],
      properties: {
        task_id: { type: 'string' },
        strategy_description: { type: 'string' },
        rca_summary: { type: 'string' },
        failure_type: { type: 'string', enum: ['ARCHITECTURAL_MISUNDERSTANDING','TOOL_MISUSE','DEPENDENCY_CONFLICT','LOGIC_ERROR','UNKNOWN'] },
        source_agent: { type: 'string' },
      },
    },
  }
  ```

  **`check_strategy_blacklist`:**
  ```ts
  {
    name: 'check_strategy_blacklist',
    description: 'Check whether a proposed strategy is blacklisted for a given task before attempting it.',
    inputSchema: {
      type: 'object',
      required: ['task_id', 'strategy'],
      properties: {
        task_id: { type: 'string' },
        strategy: { type: 'string' },
      },
    },
  }
  ```

  **`list_directive_history`:**
  ```ts
  {
    name: 'list_directive_history',
    description: 'Retrieve the log of all human interventions, optionally filtered by task.',
    inputSchema: {
      type: 'object',
      properties: {
        task_id: { type: 'string' },
        limit: { type: 'number', default: 50 },
        offset: { type: 'number', default: 0 },
      },
    },
  }
  ```

- [ ] Implement the handler for each tool using `LessonLearnedService` and `DirectiveHistoryService` obtained from the MCP server's shared service registry (the `ServiceRegistry` pattern already used by other MCP tools in `packages/mcp`).
- [ ] Register all three tools in `packages/mcp/src/index.ts` using the existing tool registration pattern.
- [ ] Ensure all tool handlers return structured JSON responses (never throw unhandled exceptions to the MCP transport).

## 3. Code Review
- [ ] Confirm all three tool handlers follow the project's existing MCP tool handler signature: `async (input: unknown) => MCPToolResult`.
- [ ] Confirm input validation is done using the project's existing JSON Schema validator (e.g., `ajv`) before passing input to the service layer.
- [ ] Confirm that `LessonAlreadyExistsError` is caught inside the `log_lesson_learned` handler and converted to `{ success: false, error: 'LESSON_ALREADY_EXISTS' }` — not propagated as a thrown exception.
- [ ] Confirm `check_strategy_blacklist` short-circuits and returns `{ blacklisted: false }` immediately when `strategy` is empty, without querying SQLite.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test -- --testPathPattern="lesson-tools"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/mcp test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Add the three new MCP tools to `packages/mcp/TOOLS.md` (or the project's MCP tool catalog) with: tool name, description, input schema, and example response.
- [ ] Update the MCP server's `AGENT.md` to reference the strategy blacklist tools and describe when an agent should call `check_strategy_blacklist` (i.e., before implementing any task strategy).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test -- --coverage --testPathPattern="lesson-tools"` and confirm exit code 0.
- [ ] Run `pnpm tsc --noEmit --project packages/mcp/tsconfig.json` and confirm zero TypeScript errors.
- [ ] Start the MCP server locally and invoke `check_strategy_blacklist` via `curl` or `mcp-client` with a known blacklisted strategy seed — assert the response contains `blacklisted: true` with the lesson record.
