# Task: Implement `rewind_to_task` MCP Tool (Sub-Epic: 17_MCP Tool Implementation)

## Covered Requirements
- [2_TAS-REQ-008]

## 1. Initial Test Written
- [ ] Create `src/mcp/tools/__tests__/rewind-to-task.test.ts` with the following test cases:
  - `rewindToTask({ taskId })` performs a `git reset --hard <commitSha>` where `commitSha` is the commit recorded in the `tasks` table for `taskId`.
  - When `taskId` does not exist in the `tasks` table, the function throws `RewindError` with code `TASK_NOT_FOUND`.
  - When the `tasks` row for `taskId` has no `commit_sha`, the function throws `RewindError` with code `NO_COMMIT_RECORDED`.
  - After a successful rewind, the SQLite `tasks` table is updated: all tasks with `created_at > tasks[taskId].created_at` have their `status` set to `pending` and `commit_sha` cleared.
  - After a successful rewind, `directives` rows associated with rewound tasks are deleted.
  - Integration test: use a real git repo fixture (bare repo with 3 commits) and a seeded SQLite DB; call `rewindToTask` and assert both the git HEAD and DB state are rolled back correctly.
  - Test that concurrent calls to `rewindToTask` are serialised (second call waits or errors if a rewind is already in progress) using a DB-level advisory lock or a mutex.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/rewind-to-task.ts`:
  - Export interface `RewindToTaskInput { taskId: string; }`.
  - Export class `RewindError extends Error` with `code: 'TASK_NOT_FOUND' | 'NO_COMMIT_RECORDED' | 'GIT_RESET_FAILED' | 'REWIND_IN_PROGRESS'`.
  - Export async function `rewindToTask(input: RewindToTaskInput, db: Database, repoRoot: string): Promise<{ rewindedToCommit: string; tasksReset: number }>`.
  - Query `SELECT commit_sha, created_at FROM tasks WHERE id = ?` — throw `RewindError('TASK_NOT_FOUND')` or `RewindError('NO_COMMIT_RECORDED')` as appropriate.
  - Set an in-memory mutex (or SQLite `PRAGMA locking_mode = EXCLUSIVE` on a `rewind_lock` table) to prevent concurrent rewinds.
  - Run `git -C <repoRoot> reset --hard <commitSha>` via `execFileSync` with a 60 s timeout.
  - In a single SQLite transaction:
    - `UPDATE tasks SET status = 'pending', commit_sha = NULL WHERE created_at > ?` (using the rewound task's `created_at`).
    - `DELETE FROM directives WHERE task_id IN (SELECT id FROM tasks WHERE created_at > ?)`.
  - Release the lock and return `{ rewindedToCommit: commitSha, tasksReset: <count> }`.
- [ ] Register the tool in `src/mcp/server.ts`:
  - Tool name: `rewind_to_task`
  - Input schema: `{ taskId: string }`
  - Output schema: `{ success: boolean, rewindedToCommit: string, tasksReset: number }`
  - Handler: call `rewindToTask(input, db, repoRoot)` and return the result.

## 3. Code Review
- [ ] Confirm `commitSha` from the DB is validated against `/^[0-9a-f]{7,40}$/` before passing to `execFileSync`.
- [ ] Verify `repoRoot` is an absolute path resolved at startup — never derived from user input.
- [ ] Confirm the SQLite rollback (tasks reset + directive deletion) is wrapped in a single transaction; if the transaction fails, the git reset must also be reverted (document that git revert is a best-effort on failure).
- [ ] Ensure no shell interpolation: `execFileSync('git', ['-C', repoRoot, 'reset', '--hard', commitSha], ...)` — array form, not string.
- [ ] Check that `RewindError` variants are all handled in the MCP error middleware with appropriate HTTP-status analogues in the MCP error codes.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/rewind-to-task` and confirm all tests pass.
- [ ] Run `npm run build` to confirm TypeScript compiles without errors in strict mode.

## 5. Update Documentation
- [ ] Add `rewind_to_task` section to `docs/mcp-tools.md` with:
  - Description: "Rolls back both git state and SQLite task state to the commit recorded for `taskId`."
  - Warning: destructive — all progress after `taskId` is lost.
  - Input/output schema.
  - Example invocation and expected output.
- [ ] Create `src/mcp/tools/rewind-to-task.agent.md` documenting: purpose, two-phase rollback strategy (git then DB), concurrency guard, and failure recovery guidance.
- [ ] Add `// [2_TAS-REQ-008]` traceability comment at the top of `rewind-to-task.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=src/mcp/tools/rewind-to-task --coverage` and assert line coverage ≥ 90%.
- [ ] Run `grep "rewind_to_task" src/mcp/server.ts` and confirm the tool is registered.
- [ ] Run `grep "2_TAS-REQ-008" src/mcp/tools/rewind-to-task.ts` and confirm the traceability comment exists.
- [ ] Run `grep "execFileSync.*git.*reset" src/mcp/tools/rewind-to-task.ts` and confirm the array-form `execFileSync` call (not string interpolation) is used.
