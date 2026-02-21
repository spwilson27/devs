# Task: Implement Task Snapshot Logic (Sub-Epic: 06_Git Integration & Snapshot Strategy)

## Covered Requirements
- [TAS-055], [TAS-054]

## 1. Initial Test Written
- [ ] Write integration tests for `SnapshotManager.createTaskSnapshot(taskId)`.
- [ ] Mock the `GitClient` to verify that `add('.')` and `commit(message)` are called.
- [ ] Verify that the commit message contains the `taskId`.
- [ ] Test that the snapshot process fails if the workspace is in an invalid state (e.g., git not initialized).
- [ ] Test that the snapshot process is skipped if no changes are detected.

## 2. Task Implementation
- [ ] Create `@devs/core/src/git/SnapshotManager.ts`.
- [ ] Implement `createTaskSnapshot(taskId: string, context: SnapshotContext)`.
- [ ] The logic must:
    - Stage all changed files in the project root (excluding `.devs/` and other ignored paths).
    - Generate a standard commit message: `task: complete task {taskId}`.
    - Execute the commit via `GitClient`.
    - Return the resulting commit hash.
- [ ] Integrate this manager into the `ImplementationNode` of the LangGraph orchestrator to trigger after task success.

## 3. Code Review
- [ ] Ensure that the snapshot logic is atomic; a failure in git should not corrupt the SQLite state (and vice versa).
- [ ] Verify that only project files are staged, and `.devs/` is strictly excluded from this operation.
- [ ] Confirm that the implementation follows the "Snapshot-at-Commit" strategy defined in TAS-054.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- @devs/core/src/git/SnapshotManager.test.ts`.

## 5. Update Documentation
- [ ] Update the `Snapshot Strategy` section in the project TAS or AOD.

## 6. Automated Verification
- [ ] Execute a mock task cycle and verify that a new git commit is created in the repository with the expected message.
