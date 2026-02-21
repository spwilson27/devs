# Task: Implement `inject_directive` Tool on OrchestratorServer (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [2_TAS-REQ-007]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/inject_directive.test.ts`, write unit tests for the `inject_directive` MCP tool handler:
  - Test: calling the tool with `{ task_id: "task-42", directive: "Do not use global state", priority: "high" }` inserts a row in the `directives` SQLite table with the correct `task_id`, `content`, `priority`, and a generated UUID `id`.
  - Test: the returned value is `{ directive_id: string, task_id: string, applied: true }`.
  - Test: if the active agent's context loop is running, the directive is also written to the `agent_directives_queue` table so it is picked up on the next SAOP turn.
  - Test: calling with an unknown `task_id` returns `McpError` with code `TASK_NOT_FOUND`.
  - Test: the `priority` field is validated as one of `"low"`, `"normal"`, `"high"`, `"critical"` and invalid values return a Zod validation error.
  - Test: `priority` defaults to `"normal"` when omitted.
  - Test: the tool is registered with name `"inject_directive"` and the correct Zod schema.
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/inject_directive.integration.test.ts`:
  - Start an in-memory OrchestratorServer.
  - Call `inject_directive` via MCP SDK client.
  - Verify the directive row appears in SQLite immediately after the call.
  - Verify that a subsequent `get_project_status` call reflects the constraint in the active task's context.

## 2. Task Implementation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/inject_directive.ts`:
  - Export `registerInjectDirectiveTool(server: McpServer, db: Database, agentQueue: AgentDirectivesQueue)`.
  - Zod schema:
    ```typescript
    z.object({
      task_id: z.string(),
      directive: z.string().min(1).max(2000),
      priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
    })
    ```
  - Handler:
    1. Verify `task_id` exists: `SELECT id FROM tasks WHERE id = ?` — throw `McpError(TASK_NOT_FOUND)` if missing.
    2. Generate `directive_id = crypto.randomUUID()`.
    3. Insert into `directives` table: `INSERT INTO directives (id, task_id, content, priority, created_at) VALUES (?, ?, ?, ?, ?)`.
    4. If `agentQueue.isActive(task_id)`, also call `agentQueue.enqueue(task_id, { directive_id, content: directive, priority })` to notify the running agent loop.
    5. Return `{ directive_id, task_id, applied: true }`.
- [ ] Define the `directives` table schema in `packages/core/src/db/schema.ts` (add if not present):
  ```sql
  CREATE TABLE IF NOT EXISTS directives (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    content TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    created_at TEXT NOT NULL
  );
  ```
- [ ] Register `inject_directive` in `packages/core/src/mcp/orchestrator/tools/index.ts`.

## 3. Code Review
- [ ] Confirm that directive injection is atomic: the SQLite insert and the `agentQueue.enqueue` call are either both completed or both rolled back (wrap in a transaction).
- [ ] Confirm `directive` content is not echoed back into the active agent context raw — it must go through `agentQueue` so the SAOP turn envelope wraps it correctly.
- [ ] Confirm the `directives` table `content` column is TEXT (not BLOB) and the max length (2000 chars) is enforced at the Zod layer before hitting the DB.
- [ ] Confirm `created_at` is stored as ISO 8601 UTC string (not a local timestamp).
- [ ] Confirm the tool description explains that this is a human-in-the-loop control mechanism and that directives affect the currently active task only.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=inject_directive` and confirm all tests pass.
- [ ] Run the full `@devs/core` test suite and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/inject_directive.agent.md` documenting:
  - Semantics of "directive" (human-in-the-loop constraint, not a hard override).
  - `priority` level meanings and how the agent loop processes them.
  - `directives` and `agent_directives_queue` table schemas.
  - `AgentDirectivesQueue` interface contract.
  - Error codes (`TASK_NOT_FOUND`).
  - Example MCP call and response JSON.
- [ ] Update `packages/core/src/mcp/orchestrator/tools/index.agent.md` with an entry for `inject_directive`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=inject_directive` and assert statement coverage ≥ 90%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Assert `inject_directive` appears in the orchestrator server's tool manifest.
- [ ] Run a targeted DB verification script: after calling `inject_directive` in the integration test, run `SELECT COUNT(*) FROM directives WHERE task_id = 'task-42'` and assert the count equals 1.
