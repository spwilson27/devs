# Task: Implement devs rewind Command (Sub-Epic: 03_CLI State Control & Commands)

## Covered Requirements
- [1_PRD-REQ-INT-006], [9_ROADMAP-TAS-706]

## 1. Initial Test Written
- [ ] Create integration tests in `packages/cli/src/__tests__/commands/rewind.test.ts`.
- [ ] Prepare a mock project with a history of 3 completed tasks, each with a recorded Git commit hash in the `tasks` table.
- [ ] Test `devs rewind --task <TaskID>`: Verify that the filesystem is restored to the commit hash associated with `<TaskID>`.
- [ ] Test SQLite restoration: Verify that all records in `tasks`, `agent_logs`, and `entropy_events` created *after* the target Task ID are either deleted or marked as `REVERTED`.
- [ ] Test Edge Case: Attempting to rewind to a non-existent Task ID or an ID in the future.

## 2. Task Implementation
- [ ] Register the `rewind` command in `packages/cli/src/index.ts`.
- [ ] Implement the `RewindService` in `packages/core/src/services/RewindService.ts`.
- [ ] Logic for Git restoration: Use `simple-git` to perform a hard reset to the commit hash stored in the `tasks` table for the target task.
- [ ] Logic for SQLite restoration: Wrap the database cleanup in an ACID transaction. Remove all logs and results associated with tasks subsequent to the target task.
- [ ] Reset the `OrchestratorState` (Zustand store) to reflect the new "Current Task" as the task immediately following the target.
- [ ] Implement a confirmation prompt in the CLI (unless `--force` is provided) to prevent accidental data loss.

## 3. Code Review
- [ ] Verify that Git hard reset handles uncommitted changes safely (warn the user).
- [ ] Ensure that the `tasks` table's `status` for the target task is set back to `PENDING` or appropriate state for resumption.
- [ ] Check that vector memory (LanceDB) is also considered (marked for re-indexing or handled) if architectural decisions were rewound.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/__tests__/commands/rewind.test.ts`.
- [ ] Verify file system state and SQLite record counts after a successful rewind.

## 5. Update Documentation
- [ ] Document the "Time-Travel" (Rewind) feature in `docs/features/rewind.md`.
- [ ] Add warnings about uncommitted changes and the destructive nature of SQLite log cleanup.

## 6. Automated Verification
- [ ] Run a "Fidelity Check" script:
    1. Snapshot filesystem and DB state at Task 2.
    2. Complete Task 3.
    3. Run `devs rewind --task 2`.
    4. Verify current filesystem and DB checksums match the Task 2 snapshot.
