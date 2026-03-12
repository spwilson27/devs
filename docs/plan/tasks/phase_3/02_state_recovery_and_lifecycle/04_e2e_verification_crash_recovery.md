# Task: E2E Verification of Server Crash Recovery (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026], [1_PRD-REQ-031]

## Dependencies
- depends_on: [docs/plan/tasks/phase_3/02_state_recovery_and_lifecycle/03_server_startup_recovery_integration.md]
- shared_components: [devs-server, devs-cli, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/e2e_crash_recovery.rs`.
- [ ] The test should:
    1. Start a `devs-server`.
    2. Register a project and a workflow.
    3. Submit a run via `devs-cli submit`.
    4. Wait until at least one stage is in the `Running` state (verified via `devs-cli status`).
    5. Kill the `devs-server` process abruptly (SIGKILL).
    6. Verify that a `checkpoint.json` exists in the project's state branch.
    7. Restart the `devs-server`.
    8. Use `devs-cli status` to verify the run has recovered and the formerly `Running` stage is now `Eligible` or back to `Running` (after re-scheduling).
    9. Wait for the run to complete successfully.

## 2. Task Implementation
- [ ] This task is primarily about the test infrastructure itself. Ensure the E2E test correctly handles process management and cleanup of temporary git repos and server instances.
- [ ] Use a mock agent tool that sleeps for a specific duration to give the test time to kill the server mid-run.

## 3. Code Review
- [ ] Ensure the test doesn't rely on brittle timing (use polling or status checks instead).
- [ ] Verify that it covers all aspects of the recovery rules [2_TAS-REQ-110] in an E2E context.

## 4. Run Automated Tests to Verify
- [ ] `./do test`

## 5. Update Documentation
- [ ] Update the `devs` developer guide with instructions on how to run and interpret this E2E test.

## 6. Automated Verification
- [ ] Run `./do coverage` to ensure that this E2E test contributes to the required coverage for `1_PRD-REQ-031` and `2_TAS-REQ-026`.
