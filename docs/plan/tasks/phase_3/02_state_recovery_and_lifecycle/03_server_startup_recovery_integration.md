# Task: Integrate Recovery into Server Startup and Resume Execution (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026], [2_TAS-REQ-001]

## Dependencies
- depends_on: [docs/plan/tasks/phase_3/02_state_recovery_and_lifecycle/02_checkpoint_restoration_service.md]
- shared_components: [devs-server, devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-server/tests/startup_recovery.rs` that starts a `devs-server` instance.
- [ ] Before starting, seed the project's state branch with several `checkpoint.json` files representing an in-flight run.
- [ ] Assert that upon startup, the server's `ServerState` is populated with these runs.
- [ ] Assert that for each recovered run, a message is sent to the `DagScheduler` to resume execution.

## 2. Task Implementation
- [ ] Update the `devs-server` startup sequence (in `main.rs` or `lib.rs`) to include the restoration step after the pool manager is initialized.
- [ ] Call the `RestorationService` to get the recovered `WorkflowRun` objects.
- [ ] For each recovered run, populate the in-memory `ServerState` with its state and status.
- [ ] Trigger the `DagScheduler` for each recovered `WorkflowRun` to resume its execution lifecycle.
- [ ] Ensure that pool permits are NOT incorrectly allocated during recovery; let the scheduler re-acquire them as stages are dispatched.

## 3. Code Review
- [ ] Verify that the startup sequence follows the exact order defined in [2_TAS-REQ-001].
- [ ] Ensure the scheduler is correctly notified for each recovered run.
- [ ] Check that no redundant "new run" events are fired if they would duplicate state.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-server`

## 5. Update Documentation
- [ ] Update the `devs-server` documentation with the finalized startup lifecycle.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `1_PRD-REQ-031` and `2_TAS-REQ-026` are covered by tests.
