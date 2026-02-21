# Task: Implement `get_project_status` Tool on OrchestratorServer (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [2_TAS-REQ-006], [1_PRD-REQ-INT-011]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/get_project_status.test.ts`, write unit tests for the `get_project_status` MCP tool handler:
  - Test: the tool returns a `ProjectStatus` object containing:
    - `requirement_fulfillment`: an array of `{ id: string, status: "pending"|"met"|"failed", title: string }` for all requirements in the project.
    - `task_progress`: an object `{ total: number, completed: number, in_progress: number, pending: number, failed: number }`.
    - `phase_progress`: an object `{ current_phase: number, total_phases: number, current_phase_name: string }`.
    - `last_updated`: ISO 8601 timestamp string.
  - Test: `requirement_fulfillment` counts reflect the seeded database state (e.g., 3 met, 1 failed, 2 pending → only those appear in the correct buckets).
  - Test: the tool is registered with name `"get_project_status"` and schema `{ project_id: string }`.
  - Test: calling with an unknown `project_id` returns `McpError` with code `PROJECT_NOT_FOUND`.
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/get_project_status.integration.test.ts`:
  - Seed SQLite with a known set of requirements, tasks, and phases.
  - Call `get_project_status` via MCP SDK and assert the returned counts and statuses match the seeded data exactly.
  - Assert that the MCP state exposure ([1_PRD-REQ-INT-011]) is satisfied: the returned data represents the full internal state of the `devs` run, not a summary.

## 2. Task Implementation
- [ ] Define `ProjectStatus` in `packages/core/src/mcp/orchestrator/types.ts`:
  ```typescript
  export interface ProjectStatus {
    requirement_fulfillment: Array<{ id: string; status: "pending" | "met" | "failed"; title: string }>;
    task_progress: { total: number; completed: number; in_progress: number; pending: number; failed: number };
    phase_progress: { current_phase: number; total_phases: number; current_phase_name: string };
    last_updated: string; // ISO 8601
  }
  ```
- [ ] Create `packages/core/src/mcp/orchestrator/tools/get_project_status.ts`:
  - Export `registerGetProjectStatusTool(server: McpServer, db: Database)`.
  - Zod schema: `z.object({ project_id: z.string() })`.
  - Handler:
    1. Query `requirements` table: `SELECT id, status, title FROM requirements WHERE project_id = ?`.
    2. Query `tasks` table for progress counts: `SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status`.
    3. Query `phases` table for phase progress: `SELECT phase_number, name FROM phases WHERE project_id = ? AND status = 'active' LIMIT 1` plus `SELECT COUNT(*) FROM phases WHERE project_id = ?`.
    4. Set `last_updated` to `new Date().toISOString()`.
    5. Construct and return `ProjectStatus`.
    6. Throw `McpError(PROJECT_NOT_FOUND)` if no rows are found for `project_id`.
- [ ] Register `get_project_status` in `packages/core/src/mcp/orchestrator/tools/index.ts`.

## 3. Code Review
- [ ] Confirm `task_progress` counts are computed with a SQL `GROUP BY` query (single round-trip), not by fetching all rows and counting in JS.
- [ ] Confirm `last_updated` reflects server time at query execution, not a stale cached value.
- [ ] Confirm `requirement_fulfillment` includes ALL requirements for the project (not paginated), because this tool fulfills `[1_PRD-REQ-INT-011]` (full state exposure).
- [ ] Confirm the tool schema is minimal (`project_id` only) and does not expose internal implementation details.
- [ ] Confirm all SQL queries use parameterized statements.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=get_project_status` and confirm all unit and integration tests pass.
- [ ] Run the full `@devs/core` test suite and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/get_project_status.agent.md` documenting:
  - `ProjectStatus` interface shape and field semantics.
  - Required SQLite tables: `requirements`, `tasks`, `phases`.
  - How this tool satisfies `[1_PRD-REQ-INT-011]` (MCP state exposure) and `[2_TAS-REQ-006]`.
  - Error codes.
  - Example MCP call and response JSON.
- [ ] Update `packages/core/src/mcp/orchestrator/tools/index.agent.md` with an entry for `get_project_status`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=get_project_status` and assert statement coverage ≥ 90%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Assert `get_project_status` appears in the orchestrator server's tool manifest at runtime.
