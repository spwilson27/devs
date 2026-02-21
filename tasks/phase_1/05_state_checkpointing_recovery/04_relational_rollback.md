# Task: Implement Relational State Rollback Service (Sub-Epic: 05_State Checkpointing & Recovery)

## Covered Requirements
- [8_RISKS-REQ-070]

## 1. Initial Test Written
- [ ] Create a unit test suite in `@devs/core/tests/persistence/RelationalRollback.test.ts`.
- [ ] Test that `RelationalRollback` correctly deletes records in `agent_logs`, `tasks`, and `requirements` with timestamps succeeding a given target snapshot.
- [ ] Test the "Atomicity Path": Simulate a failure during rollback and verify that the database remains in a consistent state (e.g., either all target records are deleted or none are).
- [ ] Test the "Correctness Path": Verify that no records preceding the target snapshot are deleted.

## 2. Task Implementation
- [ ] Create `@devs/core/src/persistence/RelationalRollback.ts`.
- [ ] Implement `rollbackToSnapshot(projectId: string, snapshotId: string)`:
    - [ ] Determine the timestamp or sequence number associated with the `snapshotId` (from the `checkpoints` table).
    - [ ] Wrap the following operations in a single `db.transaction(() => { ... })`:
        - [ ] Delete from `agent_logs` where `projectId` = :projectId and `timestamp` > :snapshotTimestamp.
        - [ ] Delete from `tasks` where `projectId` = :projectId and `updated_at` > :snapshotTimestamp.
        - [ ] Update the status of existing tasks to match their state at the target snapshot.
        - [ ] Delete from `requirements` where `projectId` = :projectId and `created_at` > :snapshotTimestamp.
        - [ ] Update the overall project status to match the target snapshot's milestone.
- [ ] Implement a `devs rewind` command in `@devs/cli` that invokes `rollbackToSnapshot`.
- [ ] Ensure that all relational deletions are ACID-compliant and that the database is not left in a partially rolled-back state.

## 3. Code Review
- [ ] Verify that all rollback operations are within a single transaction.
- [ ] Ensure that the `snapshotTimestamp` is correctly determined from the `checkpoints` table.
- [ ] Check for potential data loss scenarios where critical records might be accidentally deleted.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core` and ensure all relational rollback tests pass.
- [ ] Manually execute `devs rewind` to a previous snapshot and verify the relational state in `state.sqlite` using a SQL browser or CLI.

## 5. Update Documentation
- [ ] Update `docs/specs/8_risks_mitigation.md` confirming implementation of [8_RISKS-REQ-070].
- [ ] Add a "Rollback and Rewind" section to the project's documentation.

## 6. Automated Verification
- [ ] Execute `scripts/verify_relational_rollback.ts` which:
    - [ ] Simulates multiple task executions and log entries.
    - [ ] Records a snapshot ID.
    - [ ] Executes more tasks.
    - [ ] Invokes `rollbackToSnapshot` with the recorded snapshot ID.
    - [ ] Queries `state.sqlite` to verify that all records with timestamps succeeding the snapshot have been deleted and the state is consistent.
