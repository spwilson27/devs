# Task: Integrate Git Hash Persistence in SQLite (Sub-Epic: 06_Git Integration & Snapshot Strategy)

## Covered Requirements
- [TAS-095], [TAS-114], [9_ROADMAP-REQ-015]

## 1. Initial Test Written
- [ ] Write integration tests for `TaskRepository.updateGitHash(taskId, hash)`.
- [ ] Verify that the `git_commit_hash` column in the `tasks` table is updated correctly.
- [ ] Test a "round-trip" where a task is marked as finished, a git snapshot is taken, and the hash is stored and then retrieved.
- [ ] Ensure that attempting to update a non-existent task throws an error.

## 2. Task Implementation
- [ ] Modify `@devs/core/src/persistence/TaskRepository.ts` to include `updateGitHash`.
- [ ] Ensure the database schema for the `tasks` table has a `git_commit_hash` TEXT column (refer to TAS-109).
- [ ] Update the LangGraph state transition logic (likely in `ImplementationNode` or a dedicated `CommitNode`) to:
    - Get the commit hash from `SnapshotManager`.
    - Call `TaskRepository.updateGitHash(taskId, commitHash)` within the same transaction as the task status update if possible, or immediately after.
- [ ] Implement logic to ensure "Time-Travel" (`devs rewind`) can lookup this hash to perform a `git checkout`.

## 3. Code Review
- [ ] Confirm that every `CommitNode` execution updates the `tasks` table with the `git_commit_hash` as per 9_ROADMAP-REQ-015.
- [ ] Verify that the correlation is robust and handles empty commits or git errors gracefully.
- [ ] Check for ACID compliance: the DB update should be atomic.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` and verify the persistence of git hashes.

## 5. Update Documentation
- [ ] Update the data schema documentation to reflect the `git_commit_hash` field.

## 6. Automated Verification
- [ ] Query the `state.sqlite` database after a task completion and verify that the `tasks` table contains a valid 40-character git hash for the completed task.
