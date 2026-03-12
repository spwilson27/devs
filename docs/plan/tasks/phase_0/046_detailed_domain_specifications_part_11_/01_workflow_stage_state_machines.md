# Task: Workflow and Stage State Machines (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-102]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-core/src/state_machine.rs` (or equivalent) that:
    - Verify `WorkflowRun` transitions through all valid states: `Pending` -> `Running` -> `Completed`/`Failed`/`Cancelled`.
    - Verify `StageRun` transitions: `Waiting` -> `Eligible` -> `Running` -> `Completed`/`Failed`/`TimedOut`/`Cancelled`.
    - Verify illegal transitions return `Err(TransitionError::InvalidTransition { from, event })`.
    - Test edge cases like calling `Complete` on an already `Completed` run.

## 2. Task Implementation
- [ ] Define the `StateMachine` trait in `devs-core`.
- [ ] Implement `StateMachine` for `WorkflowRun` struct.
- [ ] Implement `StateMachine` for `StageRun` struct.
- [ ] Use exhaustive match arms for all transitions to ensure correctness.
- [ ] Define `WorkflowRunEvent` and `StageRunEvent` enums as specified in [2_TAS-REQ-102].
- [ ] Implement `TransitionError` with `from` and `event` fields for diagnostics.

## 3. Code Review
- [ ] Ensure all transitions satisfy the requirements in [2_TAS-REQ-102].
- [ ] Verify that terminal states correctly return `true` for `is_terminal()`.
- [ ] Check that `TransitionError` provides clear diagnostic information.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to ensure state machine logic is correct and achieves high coverage.

## 5. Update Documentation
- [ ] Document the state machine transitions in the `devs-core` README or doc comments.

## 6. Automated Verification
- [ ] Run `./do verify` to ensure requirement traceability for [2_TAS-REQ-102] is maintained.
