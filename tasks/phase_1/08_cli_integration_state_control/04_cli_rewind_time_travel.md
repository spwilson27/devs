# Task: Implement `rewind` Command (Time-Travel) (Sub-Epic: 08_CLI Integration & State Control)

## Covered Requirements
- [1_PRD-REQ-INT-006]

## 1. Initial Test Written
- [ ] Write integration tests in `packages/cli/tests/rewind.spec.ts` using `execa` and `simple-git` to verify:
    - Running `devs rewind <task_id>` in a project with multiple completed tasks.
    - Verifying that the Git HEAD is checked out to the commit hash associated with the target `task_id`.
    - Verifying that subsequent tasks in the `tasks` table are marked as `PENDING` or deleted from the current implementation path.
    - Verifying that the current task in the `projects` table is updated to match the target.
    - Ensuring files on disk match the state at the target `task_id`.

## 2. Task Implementation
- [ ] Add the `rewind` command to the CLI: `devs rewind <task_id>`.
- [ ] Implement the `rewind` logic:
    - Retrieve the `git_commit_hash` associated with the target `task_id` from the `tasks` table.
    - Use `simple-git` to perform a hard reset to the target commit hash.
    - Update the SQLite `tasks` and `projects` tables to mark all tasks *after* the target as `PENDING` or `REVERTED`.
    - Ensure that any current orchestration process is notified to stop or reload.
- [ ] Implement validation to ensure the target `task_id` is a valid past state.

## 3. Code Review
- [ ] Verify that Git operations are handled safely and that uncommitted changes are detected (and handled, e.g., by stashing or warning).
- [ ] Ensure that SQLite and Git states are kept in sync within the operation.
- [ ] Check that `rewind` provides clear warnings about potentially losing work if changes haven't been committed.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/cli` and ensure `rewind` tests pass.

## 5. Update Documentation
- [ ] Add the `rewind` command to the CLI documentation with clear warnings about its destructive nature.
- [ ] Explain how Git-SQLite correlation enables this feature.

## 6. Automated Verification
- [ ] Run `devs rewind <task_id>` and verify that `git log -1` returns the expected commit hash and `sqlite3` shows the correct project state.
