# Task: Implement `get_project_context` Tool on OrchestratorServer (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [3_MCP-TAS-077]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/get_project_context.test.ts`, write unit tests for the `get_project_context` MCP tool handler:
  - Test: calling the tool with a valid `project_id` returns a `ProjectContext` object whose shape matches the interface `{ requirements: Array<{ id: string; status: "pending"|"met"|"failed"; doc_link: string }>, active_epic: { id: string; title: string; progress: number }, ... }`.
  - Test: when `include_docs` is `true`, the returned object contains the full PRD and TAS document text under `docs`.
  - Test: when `include_docs` is `false` or omitted, the `docs` field is absent or empty.
  - Test: calling with an unknown `project_id` returns a structured MCP error response with code `PROJECT_NOT_FOUND`.
  - Test: the tool is registered in the MCP tool registry with name `"get_project_context"`, the correct JSON Schema for `{ project_id: string, include_docs?: boolean }`, and a valid description string.
  - Write integration tests in `packages/core/src/mcp/orchestrator/__tests__/get_project_context.integration.test.ts`:
    - Spin up an in-memory `OrchestratorServer` (use the test harness from Phase 3 setup).
    - Call `get_project_context` via the MCP SDK client.
    - Assert that requirement fulfillment data is sourced from the SQLite `requirements` table seeded with known fixtures.
    - Assert sub-second response latency (<1000 ms).

## 2. Task Implementation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/get_project_context.ts`:
  - Export a `registerGetProjectContextTool(server: McpServer, db: Database)` function.
  - Register the tool using `server.tool("get_project_context", schema, handler)` where:
    - `schema` is a Zod schema: `z.object({ project_id: z.string(), include_docs: z.boolean().optional() })`.
    - `handler` is an async function that:
      1. Queries the SQLite `requirements` table (`SELECT id, status, doc_link FROM requirements WHERE project_id = ?`) to build the requirements array.
      2. Queries the `epics` table for the active epic (`SELECT id, title, progress FROM epics WHERE project_id = ? AND status = 'active' LIMIT 1`).
      3. If `include_docs` is `true`, reads the PRD and TAS from the `documents` table and attaches them to a `docs` field.
      4. Constructs and returns a `ProjectContext` object.
      5. If the project is not found, throws an `McpError` with code `PROJECT_NOT_FOUND`.
- [ ] Define the `ProjectContext` TypeScript interface in `packages/core/src/mcp/orchestrator/types.ts` (or extend if it already exists):
  ```typescript
  export interface ProjectContext {
    requirements: Array<{ id: string; status: "pending" | "met" | "failed"; doc_link: string }>;
    active_epic: { id: string; title: string; progress: number };
    docs?: { prd: string; tas: string };
  }
  ```
- [ ] Register `get_project_context` in the main tool registration entry point `packages/core/src/mcp/orchestrator/tools/index.ts`.

## 3. Code Review
- [ ] Verify the tool handler is a pure async function with no side effects beyond reads.
- [ ] Confirm Zod schema is used for input validation (not manual checks), and invalid inputs cause a structured MCP validation error before reaching the handler body.
- [ ] Confirm the `ProjectContext` interface is exported from `packages/core/src/mcp/orchestrator/types.ts` and matches the spec in `[3_MCP-TAS-077]`.
- [ ] Confirm `McpError` is thrown (not a plain `Error`) for `PROJECT_NOT_FOUND`, so the MCP SDK serializes it correctly to the client.
- [ ] Confirm no raw SQL strings are concatenated with user input — only parameterized queries are used.
- [ ] Confirm that the tool description string is human-readable and suitable for an AI assistant's tool manifest.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=get_project_context` and confirm all unit tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=get_project_context.integration` and confirm all integration tests pass.
- [ ] Run the full `@devs/core` test suite (`pnpm --filter @devs/core test`) and confirm no regressions are introduced.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/get_project_context.agent.md` documenting:
  - Purpose and return shape of the tool.
  - Required SQLite tables and columns (`requirements`, `epics`, `documents`).
  - Error codes (`PROJECT_NOT_FOUND`).
  - Example MCP call and response JSON.
- [ ] Update `packages/core/src/mcp/orchestrator/tools/index.agent.md` (tool registry manifest) to include an entry for `get_project_context` with its schema and description.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=get_project_context` and assert statement coverage ≥ 90% for `get_project_context.ts`.
- [ ] Run `pnpm --filter @devs/core build` to confirm TypeScript compilation succeeds with zero errors.
- [ ] Assert the tool appears in the output of `node -e "const {createOrchestratorServer} = require('./packages/core/dist'); const s = createOrchestratorServer(); console.log(JSON.stringify(s.listTools()))"` and includes `get_project_context` with the correct schema.
