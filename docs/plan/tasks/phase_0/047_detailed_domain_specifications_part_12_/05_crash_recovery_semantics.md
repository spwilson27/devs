# Task: Implement Crash-Recovery Semantics (Sub-Epic: 047_Detailed Domain Specifications (Part 12))

## Covered Requirements
- [2_TAS-REQ-110]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/state/recovery_tests.rs` that:
    - Defines a `WorkflowRun` with various stage statuses: `Running`, `Eligible`, `Waiting`, `Pending`.
    - Applies the recovery logic (simulating `load_all_runs`).
    - Asserts that:
        - `Running` stages are transitioned to `Eligible`.
        - `Eligible` stages remain `Eligible`.
        - A `Running` run with all terminal stages is transitioned to `Completed`.
        - `Pending` runs remain `Pending`.

## 2. Task Implementation
- [ ] Implement the `apply_recovery_semantics(run: &mut WorkflowRun)` function in `devs-core/src/state/recovery.rs`.
- [ ] Use the `StateMachine` trait to perform the transitions, ensuring they are legal.
- [ ] Implement the logic to detect when a `Running` run has only terminal stages and update its status accordingly.
- [ ] Ensure that `load_all_runs` (to be fully implemented in a later phase) calls this function for every restored run.

## 3. Code Review
- [ ] Verify that the state transitions match [2_TAS-REQ-110] exactly.
- [ ] Ensure that illegal transitions result in an error or are handled gracefully during recovery.
- [ ] Confirm that `Pending` runs are correctly identified as needing re-queueing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure recovery semantic tests pass.

## 5. Update Documentation
- [ ] Document the crash-recovery rules in the `RunStatus` or `StateMachine` module documentation.
- [ ] Update the agent memory with the implemented recovery transitions.

## 6. Automated Verification
- [ ] Verify the traceability tag: `// Covers: 2_TAS-REQ-110` is present in the test file.
- [ ] Run `./do lint` to ensure no warnings or errors.
