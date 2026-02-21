# Task: Implement Deterministic Rollback for Filesystem and State (Sub-Epic: 33_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-074]

## 1. Initial Test Written
- [ ] Write unit tests in `src/tests/state/rollback.test.ts` to simulate a sequence of tasks producing Git commits and SQLite records.
- [ ] Assert that triggering a rollback to a specific historical Task ID accurately restores both the Git working tree to the exact commit and the SQLite database state.

## 2. Task Implementation
- [ ] Create a `RollbackManager` class in `src/state/rollback.ts` to coordinate Git and SQLite synchronicity.
- [ ] Implement the `git reset --hard <commit_hash>` command targeting the exact hash associated with the given Task ID.
- [ ] Implement the database deletion query to remove or safely revert all SQLite records (tasks, logs, and agent memory) created after the targeted Task ID.
- [ ] Add a CLI command (e.g., `devs rollback <task-id>`) that triggers this rollback logic safely from the user interface.

## 3. Code Review
- [ ] Verify that a rollback sequence is strictly atomic—if Git rollback succeeds but SQLite deletion fails, provide an immediate recovery or retry mechanism.
- [ ] Ensure any currently uncommitted or dirty working directories are either blocked from rollback or safely stashed to prevent unintentional data loss.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/tests/state/rollback.test.ts` to check determinism of state restoration across Git and SQLite.

## 5. Update Documentation
- [ ] Document the CLI usage for `devs rollback <task-id>` in `docs/cli-commands.md` and `docs/user-features.md`.
- [ ] Update internal architectural documentation about the interaction between the Git index and the SQLite state machine.

## 6. Automated Verification
- [ ] Run an automated End-to-End (E2E) verification script that completes two distinct tasks, rolls back to the first task, and programmatically asserts that the second task's files and database records no longer exist in the sandbox.
