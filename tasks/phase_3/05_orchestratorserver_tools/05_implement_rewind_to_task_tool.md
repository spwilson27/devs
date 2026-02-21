# Task: Implement `rewind_to_task` Tool on OrchestratorServer (Sub-Epic: 05_OrchestratorServer Tools)

## Covered Requirements
- [2_TAS-REQ-008]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/rewind_to_task.test.ts`, write unit tests for the `rewind_to_task` MCP tool handler:
  - Test: calling `{ task_id: "task-10", dry_run: true }` returns `{ would_reset_to_commit: "<sha>", affected_tasks: ["task-10", "task-11", ...], sqlite_tables_affected: ["tasks", "directives", "agent_logs"] }` without making any changes.
  - Test: calling `{ task_id: "task-10", dry_run: false }` (default):
    - Calls `gitService.resetHard(commitSha)` exactly once with the commit SHA tagged for `task-10`.
    - Calls `dbService.rollbackToCheckpoint(task_id)` exactly once.
    - Returns `{ rewound_to: "task-10", reset_commit: "<sha>", cleared_tasks: number }`.
  - Test: calling with an unknown `task_id` returns `McpError(TASK_NOT_FOUND)`.
  - Test: if `gitService.resetHard` throws (e.g., dirty working tree), the SQLite rollback is NOT performed and the error is surfaced as `McpError(GIT_RESET_FAILED)`.
  - Test: the tool is registered with name `"rewind_to_task"` and schema `{ task_id: string, dry_run?: boolean }`.
- [ ] In `packages/core/src/mcp/orchestrator/__tests__/rewind_to_task.integration.test.ts`:
  - Initialize a real git repo in a temp directory using `simple-git`.
  - Create 3 tagged commits representing task checkpoints.
  - Seed SQLite with task rows matching those commits.
  - Call `rewind_to_task` for the second task and verify:
    - `git log --oneline` shows only the first two commits remain (HEAD = task-2 commit).
    - SQLite `tasks` table rows for task-3 and beyond have status `"rewound"`.

## 2. Task Implementation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/rewind_to_task.ts`:
  - Export `registerRewindToTaskTool(server: McpServer, db: Database, gitService: GitService)`.
  - Zod schema: `z.object({ task_id: z.string(), dry_run: z.boolean().optional().default(false) })`.
  - Handler:
    1. Look up `task_id` in `tasks` table; get the `git_commit_sha` column value. Throw `McpError(TASK_NOT_FOUND)` if absent.
    2. If `dry_run`:
       - Use `gitService.getCommitsBetween(commitSha, "HEAD")` to find affected commits.
       - Query `tasks` for all tasks after this checkpoint.
       - Return a dry-run summary without modifying anything.
    3. If not `dry_run`:
       - Call `gitService.resetHard(commitSha)` — if it throws, re-throw as `McpError(GIT_RESET_FAILED)` without touching SQLite.
       - Call `db.transaction(() => { db.run("UPDATE tasks SET status = 'rewound' WHERE created_at > ? AND project_id = ?", [task_created_at, project_id]); db.run("DELETE FROM directives WHERE task_id IN (SELECT id FROM tasks WHERE status = 'rewound' AND project_id = ?)"); })`.
       - Return `{ rewound_to: task_id, reset_commit: commitSha, cleared_tasks: count }`.
- [ ] Define `GitService` interface in `packages/core/src/services/git.service.ts` if not already present:
  ```typescript
  export interface GitService {
    resetHard(commitSha: string): Promise<void>;
    getCommitsBetween(fromSha: string, toRef: string): Promise<string[]>;
    tagCommit(tag: string, message: string): Promise<void>;
  }
  ```
- [ ] Implement `GitServiceImpl` using `simple-git` in the same file or `packages/core/src/services/git.service.impl.ts`.
- [ ] Ensure each task completion in the orchestrator's agent loop calls `gitService.tagCommit(\`devs/task-\${task_id}\`, ...)` to record the checkpoint. (This is a prerequisite for `rewind_to_task` to function.)
- [ ] Register `rewind_to_task` in `packages/core/src/mcp/orchestrator/tools/index.ts`.

## 3. Code Review
- [ ] Confirm that the git reset and SQLite rollback happen in the correct order: git first, then SQLite. This ensures that if SQLite rollback fails, a retry is possible without a second git reset.
- [ ] Confirm `dry_run` never calls `gitService.resetHard` or any write to SQLite — verify with mock spies.
- [ ] Confirm `GitService` is injected (not a singleton import) so it can be mocked in unit tests.
- [ ] Confirm the `tasks` table has a `git_commit_sha` column (or the equivalent checkpoint reference) — if not present in the schema, add it in this task.
- [ ] Confirm error messages in `McpError` do not leak filesystem paths or internal SQL strings.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=rewind_to_task` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=rewind_to_task.integration` and confirm integration tests pass.
- [ ] Run the full `@devs/core` test suite and confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/orchestrator/tools/rewind_to_task.agent.md` documenting:
  - Semantics of "rewind": what git state is restored, what SQLite rows are cleared.
  - `dry_run` mode behavior and its safe use before destructive rewinds.
  - `GitService` interface contract and the `simple-git` implementation.
  - Required `git_commit_sha` field on the `tasks` table.
  - Error codes (`TASK_NOT_FOUND`, `GIT_RESET_FAILED`).
  - Example MCP call and response JSON.
- [ ] Update `packages/core/src/mcp/orchestrator/tools/index.agent.md` with an entry for `rewind_to_task`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=rewind_to_task` and assert statement coverage ≥ 90%.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] In the integration test teardown, run `git status --porcelain` in the temp repo and assert it outputs nothing (clean working tree after rewind).
