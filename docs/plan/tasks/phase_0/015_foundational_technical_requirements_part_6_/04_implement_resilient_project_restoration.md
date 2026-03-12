# Task: Implement Resilient Project Restoration (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001K]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-server/src/recovery_tests.rs` (or equivalent) that:
    - Registers two projects in a mock registry.
    - Simulates an error for the first project (e.g., corrupt git repository, missing checkpoint branch).
    - Verifies that the server startup sequence continues to process the second project.
    - Asserts that the first project is logged with an `ERROR` level message.
    - Checks that the server reaches the "Ready" state after attempting to restore all projects.

## 2. Task Implementation
- [ ] Implement the `restore_all_projects()` method in `devs-server/src/startup.rs` that:
    - Iterates over all projects in the `ProjectRegistry`.
    - For each project, attempts to call `CheckpointStore::restore_runs()` (from `devs-checkpoint`).
    - Wraps the restoration call in a `match` or `try` block that catches errors.
    - If an error occurs, logs it at `ERROR` level using the `tracing` crate, including the project ID and error message.
    - Continues to the next project in the registry after an error.
- [ ] Ensure that the `CheckpointStore::restore_runs()` method (or its equivalent in `devs-checkpoint`) returns a proper `Result` that differentiates between "project not found" (a potentially fatal registry error) and "restoration failed" (a non-fatal project error).

## 3. Code Review
- [ ] Verify that the log message is indeed at the `ERROR` level and contains sufficient diagnostic information.
- [ ] Ensure that the restoration loop correctly propagates its own state (e.g., which projects failed) to the overall server startup status, but does NOT trigger an `abort`.
- [ ] Confirm that no partial state from a failed project is left in the `SchedulerState`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server` and ensure the recovery tests pass.
- [ ] Mock a project with an invalid git path and run the server locally to verify the error log and the successful startup.

## 5. Update Documentation
- [ ] Update `devs-checkpoint` documentation to clarify that its restoration methods are designed to be used in a resilient loop.

## 6. Automated Verification
- [ ] Run a shell script `tests/verify_resilient_startup.sh` that:
    - Corrupts one project's checkpoint data in a test repository.
    - Starts the `devs-server`.
    - Greps the server logs for the expected `ERROR` message.
    - Uses `devs list` (CLI) to confirm that runs from other projects are correctly listed.
