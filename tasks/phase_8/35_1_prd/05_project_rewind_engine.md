# Task: Implement Project Rewind (Time-Travel Engine) (Sub-Epic: 35_1_PRD)

## Covered Requirements
- [1_PRD-REQ-UI-011]

## 1. Initial Test Written
- [ ] Create a test file `src/core/state/__tests__/ProjectRewindEngine.test.ts`.
- [ ] Write a test `should lookup the git_commit_hash for a given Task ID from the tasks table`.
- [ ] Write a test `should perform a git hard reset to the retrieved commit hash`.
- [ ] Write a test `should delete or revert SQLite state to match the state at the target Task ID`.
- [ ] Write a test `should throw an error if no git_commit_hash exists for the specified Task ID`.

## 2. Task Implementation
- [ ] Create the `ProjectRewindEngine` class in `src/core/state/`.
- [ ] Implement a method `rewindToTask(taskId: string)` that performs the following sequence:
    - 1. Query the `tasks` table for the `git_commit_hash` of the target task.
    - 2. Invoke the Git service to run `git reset --hard <hash>`.
    - 3. Execute a database rollback. This can be done by deleting all tasks, agent_logs, and entropy events that occurred *after* the target Task ID's completion timestamp.
- [ ] Emit a `PROJECT_REWOUND` event containing the restored Task ID and Git hash.
- [ ] Ensure any active LangGraph instances are terminated prior to executing the rewind.

## 3. Code Review
- [ ] Review the SQLite cleanup logic. It must accurately wipe out future state without corrupting the historical baseline.
- [ ] Verify safety checks: Ensure the engine does not attempt to rewind if the working directory has dirty, uncommitted changes (or stashes them safely).
- [ ] Ensure atomic execution: if the git reset fails, the SQLite state should not be rolled back.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- src/core/state/__tests__/ProjectRewindEngine.test.ts`.
- [ ] Run integration tests simulating a full rewind using a dummy git repo.

## 5. Update Documentation
- [ ] Update `docs/architecture/persistence.md` with the Time-Travel rollback mechanics.
- [ ] Update user documentation for the `devs rewind <task_id>` command.

## 6. Automated Verification
- [ ] E2E script: Complete two dummy tasks, run a rewind to Task 1, and assert that Task 2's code changes and DB records no longer exist in the workspace.
