# Task: Missing Workflow Snapshot Handling (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-484]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] In `devs-checkpoint`, create a test suite `snapshot_recovery_tests.rs`.
- [ ] Write a test for a recovered run that has a valid `checkpoint.json` but is missing its `workflow_snapshot.json`.
- [ ] Write a test that attempts to execute a stage for this run.
- [ ] Assert that a stage with template resolution requirements transitions to `Failed` with the error `MissingSnapshot`.
- [ ] Assert that a stage WITHOUT template resolution requirements is allowed to execute normally.
- [ ] Write a test for a corrupted `workflow_snapshot.json` and assert it is handled identically to the missing file case.

## 2. Task Implementation
- [ ] In `devs-core/src/recovery.rs` (or similar), implement the logic for `MissingSnapshot` handling.
- [ ] Implement a `check_snapshot_availability` method:
    - Verify that `workflow_snapshot.json` exists and is parseable.
    - Store the snapshot availability state in the run's memory.
- [ ] Modify the stage execution dispatcher:
    - Before starting a stage, check if it requires reading the workflow definition (e.g., for template resolution or branch logic).
    - If it does AND the snapshot is missing/corrupt, transition the stage to `Failed` with `error = "MissingSnapshot"`.
    - If the stage does NOT require the snapshot (e.g., a simple task with no templates), permit execution to continue.
- [ ] Ensure that this transition happens immediately at the start of the stage's execution.

## 3. Code Review
- [ ] Verify that stages without template references are NOT blocked by a missing snapshot.
- [ ] Confirm that `MissingSnapshot` error is correctly propagated to the run's status and logs.
- [ ] Ensure that the snapshot existence check is efficient and cached if possible.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test snapshot_recovery_tests`.
- [ ] Verify all tests pass, ensuring granular failure based on stage requirements.

## 5. Update Documentation
- [ ] Document the `MissingSnapshot` error and the conditions under which it occurs in the user-facing documentation.

## 6. Automated Verification
- [ ] Run `./do test` and check the traceability report to ensure `2_TAS-REQ-484` is mapped to the passing tests.
