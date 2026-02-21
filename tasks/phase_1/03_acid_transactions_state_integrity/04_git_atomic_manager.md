# Task: Git-Atomic Transactional Manager (Sub-Epic: 03_ACID Transactions & State Integrity)

## Covered Requirements
- [8_RISKS-REQ-041], [8_RISKS-REQ-094]

## 1. Initial Test Written
- [ ] Create `packages/core/test/orchestration/GitAtomicManager.test.ts`:
    - Mock a `GitManager` and a `StateRepository`.
    - Test that if a `GitManager.commit()` fails, the `StateRepository.updateTaskStatus()` is rolled back (or a reverse operation is performed).
    - Test that if `StateRepository.updateTaskStatus()` fails, the `GitManager.commit()` is NOT executed.
    - Test that a successful `Git-SQLite` update result in a consistent state where the `tasks` table's `git_commit_hash` matches the actual Git HEAD.

## 2. Task Implementation
- [ ] In `packages/core/src/orchestration/GitAtomicManager.ts`:
    - Implement a `commitTaskChange(taskId: string, commitMessage: string)` method.
    - The method MUST:
        1. Open a SQLite transaction via `StateRepository.transaction()`.
        2. Update the `tasks` status to `SUCCESS` in the database.
        3. Attempt a `git commit` via the `GitManager`.
        4. If `git commit` fails, THROW an error to trigger the SQLite ROLLBACK.
        5. If `git commit` succeeds, retrieve the `commit_hash`.
        6. Update the `tasks` record with the `git_commit_hash`.
        7. Close/Commit the SQLite transaction.
    - Wrap the "Success -> Commit -> Log Write" flow in this single transaction.

## 3. Code Review
- [ ] Ensure that `simple-git` errors correctly propagate to the SQLite transaction callback.
- [ ] Confirm that the `Git-SQLite` correlation is robust and doesn't leave the database in a "Success" state if the Git commit fails.
- [ ] Verify that the `git_commit_hash` is correctly captured and stored in the `tasks` table.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/orchestration/GitAtomicManager.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the `Git-Atomic` strategy and its importance for the `devs rewind` capability.

## 6. Automated Verification
- [ ] Run a simulation script `scripts/simulate_git_failure.ts` that mocks a Git error and verifies that the task status in the database remains unchanged (rolled back).
