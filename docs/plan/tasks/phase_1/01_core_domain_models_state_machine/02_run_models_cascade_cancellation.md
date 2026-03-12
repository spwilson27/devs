# Task: Run Models and Cascade Cancellation Logic (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-025], [2_TAS-REQ-020B], [2_TAS-REQ-027]

## Dependencies
- depends_on: [01_status_state_machines.md]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests for `WorkflowRun::transition_to(status)` in `devs-core`.
- [ ] Write unit tests verifying that when `WorkflowRun` transitions to `Failed` or `Cancelled`, all non-terminal `StageRun` instances within that workflow must be transitioned to `Cancelled`.
- [ ] Write unit tests verifying that terminal `StageRun` statuses (Completed, Failed, TimedOut, Cancelled) are NOT changed during cascade cancellation.
- [ ] Verifies [2_TAS-REQ-020B].

## 2. Task Implementation
- [ ] Define `WorkflowRun` struct in `devs-core/src/models/run.rs` containing `run_id`, `slug`, `workflow_name`, `status`, `stages` (`Vec<StageRun>`), `started_at`, `completed_at`.
- [ ] Define `StageRun` struct in `devs-core/src/models/run.rs` containing `stage_id`, `name`, `status`, `attempt`, `started_at`, `completed_at`, `exit_code`.
- [ ] Implement `WorkflowRun::transition_to(&mut self, new_status: RunStatus) -> Result<(), TransitionError>`.
- [ ] In `transition_to`, if the new status is a terminal failure/cancel state (`Failed` or `Cancelled`), iterate through `self.stages` and for each non-terminal `StageRun`, transition its status to `Cancelled`.
- [ ] Ensure terminal `StageRun` statuses are preserved during iteration.
- [ ] Define `is_terminal()` methods for both `RunStatus` and `StageStatus`.
- [ ] Ensure all structs derive `Serialize`, `Deserialize`, `Debug`, `Clone`.
- [ ] Implements [2_TAS-REQ-025], [2_TAS-REQ-020B], [2_TAS-REQ-027] (core mutation logic).

## 3. Code Review
- [ ] Verify that the `WorkflowRun` and `StageRun` structures match the requirements in [2_TAS-REQ-025].
- [ ] Ensure the cascade cancellation logic is atomic with respect to the `WorkflowRun` status transition.
- [ ] Check that `is_terminal()` exhaustively lists all terminal statuses as per TAS §4.2.2.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify all run model and cascade cancellation tests pass.

## 5. Update Documentation
- [ ] Add doc comments for `WorkflowRun` and `StageRun` structs and their transition logic.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to ensure traceability for the implemented REQ IDs.
