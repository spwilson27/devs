# Task: Workflow-Level Timeout Enforcement (Sub-Epic: 05_Error Handling & Timeouts)

## Covered Requirements
- [1_PRD-REQ-028]

## Dependencies
- depends_on: [01_stage_timeout_enforcement.md]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-scheduler` that mocks a `WorkflowRun` with a 2-second global `timeout_secs`.
- [ ] Add two stages that each take 10 seconds.
- [ ] Verify that after 2 seconds, the entire `WorkflowRun` is marked `Failed` (or `TimedOut` if applicable).
- [ ] Ensure that all `Running` stages are transitioned to `Cancelled` and their sub-processes are signaled to terminate.
- [ ] Verify that `Waiting` stages are marked as `Cancelled`.

## 2. Task Implementation
- [ ] Implement a global timeout monitor for each `WorkflowRun` in `devs-scheduler`'s dispatch loop.
- [ ] Update the `WorkflowRun` struct in `devs-core` to track the `started_at` timestamp.
- [ ] When the workflow timeout expires, trigger a cascade cancellation of all non-terminal stages (using the logic from `2_TAS-REQ-020B`).
- [ ] Transition the `WorkflowRun` to `RunStatus::Failed` with a clear message indicating a global timeout violation.
- [ ] Ensure the terminal state is written atomically to the project checkpoint.
- [ ] Add a validation rule to `devs-config` ensuring that `stage.timeout_secs` does not exceed `workflow.timeout_secs` (per `3_PRD-BR-034`).

## 3. Code Review
- [ ] Verify that the global timer is started at the moment the run transitions to `Running`.
- [ ] Ensure that the global timeout is checked even if no scheduler event occurs (e.g., using `tokio::select!` with a timer in the event loop).
- [ ] Confirm that `3_PRD-BR-034` is enforced at load time to prevent invalid configurations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler`.
- [ ] Run `cargo test -p devs-config`.
- [ ] Verify 90% unit test coverage for the workflow timeout logic.

## 5. Update Documentation
- [ ] Document the workflow-level timeout behavior and configuration in the project's architecture docs.

## 6. Automated Verification
- [ ] Run `./do test` and verify that requirement `[1_PRD-REQ-028]` and business rule `[3_PRD-BR-034]` are marked as covered.
