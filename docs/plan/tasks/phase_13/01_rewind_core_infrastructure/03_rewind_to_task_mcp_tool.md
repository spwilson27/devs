# Task: Implement rewind_to_task MCP Tool (Sub-Epic: 01_Rewind Core Infrastructure)

## Covered Requirements
- [2_TAS-REQ-008], [TAS-047]

## 1. Initial Test Written
- [ ] Write a unit test (`src/mcp/tools/__tests__/rewindToTask.test.ts`) for a `rewindToTask(db, taskId, repoPath)` function:
  - Assert it throws `RewindError('Task not found')` when the `taskId` does not exist in the `tasks` table.
  - Assert it throws `RewindError('Task has no git_head recorded')` when the `tasks` row exists but `git_head` is `NULL`.
  - Assert it throws `RewindError('Dirty workspace')` when `simple-git(repoPath).status()` reports uncommitted changes (`files.length > 0`).
  - Assert it calls `git.checkout(['-f', sha])` with the `git_head` SHA retrieved from the `tasks` table for a valid, clean-workspace scenario.
  - Assert it executes a SQLite `DELETE FROM tasks WHERE rowid > (SELECT rowid FROM tasks WHERE id = ?)` (or equivalent) to remove all task rows added after the target task, in a `withTransaction`.
  - Assert it executes `DELETE FROM state_transitions WHERE task_id IN (<deleted task ids>)` in the same transaction.
  - Assert the function returns a `RewindResult` object: `{ restoredTaskId: string, restoredGitHead: string, deletedTaskCount: number }`.
- [ ] Write an integration test using a real temp Git repo and in-memory SQLite that:
  1. Seeds the DB with 3 tasks (`t1`, `t2`, `t3`) each with distinct `git_head` SHAs (real commits).
  2. Calls `rewindToTask(db, 't1', repoPath)`.
  3. Asserts `git rev-parse HEAD` equals the SHA stored for `t1`.
  4. Asserts the `tasks` table now contains only `t1`.
  5. Asserts `state_transitions` for `t2` and `t3` are deleted.

## 2. Task Implementation
- [ ] Create `src/mcp/tools/rewindToTask.ts` that exports:
  - `class RewindError extends Error { constructor(message: string) { super(message); this.name = 'RewindError'; } }`
  - `interface RewindResult { restoredTaskId: string; restoredGitHead: string; deletedTaskCount: number; }`
  - `async function rewindToTask(db: Database, taskId: string, repoPath: string): Promise<RewindResult>`:
    1. Reads the target task row; throws `RewindError('Task not found')` if absent.
    2. Throws `RewindError('Task has no git_head recorded')` if `git_head` is null.
    3. Calls `simple-git(repoPath).status()`; throws `RewindError('Dirty workspace: commit or stash changes before rewinding')` if `result.files.length > 0`.
    4. Calls `simple-git(repoPath).checkout(['-f', row.git_head])`.
    5. Inside `withTransaction(db, () => { ... })`:
       - SELECT `rowid` of target task.
       - Collect `id`s of all tasks with `rowid` greater than target's `rowid`.
       - `DELETE FROM state_transitions WHERE task_id IN (...)`.
       - `DELETE FROM tasks WHERE rowid > <target_rowid>`.
       - Returns count of deleted task rows.
    6. Returns `RewindResult`.
- [ ] Register `rewindToTask` as an MCP tool in `src/mcp/server.ts` (or equivalent registration file):
  - Tool name: `rewind_to_task`
  - Input schema (JSON Schema): `{ "type": "object", "properties": { "taskId": { "type": "string" }, "repoPath": { "type": "string" } }, "required": ["taskId", "repoPath"] }`
  - Handler calls `rewindToTask(db, input.taskId, input.repoPath)` and returns the `RewindResult` as the tool response content.

## 3. Code Review
- [ ] Verify the dirty-workspace check occurs **before** any Git or SQLite mutation to prevent partial state changes.
- [ ] Verify `git checkout -f` is called **before** the SQLite transaction, so if the checkout fails, no DB mutation occurs.
- [ ] Verify the SQLite DELETE uses `rowid`-based ordering (insertion order) rather than timestamp strings to guarantee correct ordering even if timestamps collide.
- [ ] Verify `RewindError` is distinguishable from generic `Error` by name for upstream error handling.
- [ ] Confirm the MCP tool registration uses strict JSON Schema validation so agents cannot call it with malformed input.
- [ ] Verify no raw SQL strings exist outside `rewindToTask.ts` for the rewind-specific queries.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/mcp/tools/__tests__/rewindToTask"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors.
- [ ] Run `npm run mcp:validate` (or equivalent MCP schema validation script) to confirm the `rewind_to_task` tool schema is valid.

## 5. Update Documentation
- [ ] Create `src/mcp/tools/rewindToTask.agent.md` documenting:
  - **Purpose**: Roll back Git filesystem and SQLite relational state to the point immediately after `taskId` was completed.
  - **Pre-conditions**: Clean workspace (no uncommitted changes), `taskId` must have a recorded `git_head`.
  - **Post-conditions**: Git HEAD == `tasks.git_head` for `taskId`; all tasks after `taskId` are deleted from the DB.
  - **Error codes**: `Task not found`, `Task has no git_head recorded`, `Dirty workspace`.
  - **MCP tool name**: `rewind_to_task`.
- [ ] Update `src/state/state.agent.md` to reference `rewindToTask` as the consumer of the `git_head` column.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="rewindToTask" --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm the coverage gate passes.
- [ ] Run the integration test that seeds 3 tasks and rewinds to task 1, then assert via `git -C <repoPath> rev-parse HEAD` shell output equals the stored SHA (script: `scripts/verify_rewind_integration.sh`).
