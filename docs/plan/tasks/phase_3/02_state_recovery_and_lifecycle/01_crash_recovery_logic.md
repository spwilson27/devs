# Task: Implement Crash-Recovery State Transformation Logic (Sub-Epic: 02_State Recovery and Lifecycle)

## Covered Requirements
- [1_PRD-REQ-031], [2_TAS-REQ-026], [2_TAS-REQ-110]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/recovery.rs` (or within `workflow_run.rs`) that defines a `WorkflowRun` with various `StageRun` statuses (`Running`, `Eligible`, `Waiting`, `Pending`, `Completed`).
- [ ] Assert that after applying the recovery transformation function, the statuses are updated according to [2_TAS-REQ-110]:
    - `Running` stage -> `Eligible`
    - `Eligible` stage -> `Eligible`
    - `Waiting` stage -> `Waiting` (will be re-evaluated by scheduler)
    - `Pending` run -> `Pending`
    - `Running` run with all terminal stages -> `Completed` or `Failed` (based on stage outcomes)

## 2. Task Implementation
- [ ] Implement a `recover()` method or a standalone transformation function in `devs-core` that accepts a `WorkflowRun` and returns the recovered version.
- [ ] Ensure all `Running` stages are reset to `Eligible` to allow the scheduler to re-dispatch them.
- [ ] Ensure `WorkflowRun` status is updated if it was `Running` but its terminal state can now be determined.
- [ ] Handle timestamp resets if necessary (e.g. `started_at` for a recovered `Eligible` stage might need careful handling or just be left as is until it runs again).

## 3. Code Review
- [ ] Verify that the logic strictly follows [2_TAS-REQ-110].
- [ ] Ensure the implementation is pure and has no side effects (no I/O).

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-core`

## 5. Update Documentation
- [ ] Update `devs-core` internal documentation regarding the recovery state machine.

## 6. Automated Verification
- [ ] Run `./do test` to ensure traceability for `1_PRD-REQ-031` and `2_TAS-REQ-026` is maintained.
