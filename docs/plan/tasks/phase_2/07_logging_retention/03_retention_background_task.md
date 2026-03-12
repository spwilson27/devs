# Task: Implement Background Retention Sweep Task (Sub-Epic: 07_Logging & Retention)

## Covered Requirements
- [2_TAS-REQ-086]

## Dependencies
- depends_on: [docs/plan/tasks/phase_2/07_logging_retention/02_retention_sweep_logic.md]
- shared_components: [devs-server]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-server` for the retention sweep task.
- [ ] The test should start the server (with a mock project registry and repository).
- [ ] Verify that the sweep runs at startup by checking the `CheckpointStore` logs or by asserting that the relevant runs are deleted.
- [ ] Use `tokio::time::pause` and `tokio::time::advance(Duration::from_hours(24))` to verify that the sweep task repeats every 24 hours.

## 2. Task Implementation
- [ ] In `devs-server/src/main.rs` (or a dedicated server component), implement the `start_retention_sweep_task` function.
- [ ] The function MUST spawn a Tokio task that:
    - [ ] Runs the retention sweep logic for each project in the `ProjectRegistry` at server startup.
    - [ ] Then, enters an infinite loop that:
        - [ ] Sleeps for 24 hours.
        - [ ] Triggers the sweep logic for each project.
- [ ] Ensure that the task handles project additions or deletions if the `ProjectRegistry` is updated during runtime (re-scan the registry each time).
- [ ] The sweep task MUST NOT crash the server if a single project's sweep fails; log at `ERROR` level and continue.

## 3. Code Review
- [ ] Verify that the task does not delete runs in `Running` or `Paused` status (this should be enforced by the sweep logic but verified here too).
- [ ] Ensure the 24-hour interval is strictly followed.
- [ ] Verify that the task uses `tokio::time::sleep` and not blocking sleep.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server`.
- [ ] Verify the integration test for the sweep task passes.

## 5. Update Documentation
- [ ] Update server operation documentation to reflect the background retention sweep behavior.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage for `2_TAS-REQ-086`.
