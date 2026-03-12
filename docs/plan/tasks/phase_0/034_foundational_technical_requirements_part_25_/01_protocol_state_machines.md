# Task: Protocol State Machines Implementation (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086E]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core`, create `src/state_machine.rs` and write unit tests for `WorkflowRun` and `StageRun` status transitions.
- [ ] Test all valid transitions defined in [2_TAS-REQ-019] and [2_TAS-REQ-020].
- [ ] Test that illegal transitions return `FAILED_PRECONDITION` or equivalent `TransitionError`.
- [ ] Test that transitions are exhaustive match arms in the implementation.

## 2. Task Implementation
- [ ] Implement the `StateMachine` trait for `WorkflowRun` and `StageRun`.
- [ ] Ensure `RunStatus` and `StageStatus` enums follow the normative state machines.
- [ ] Implement transition logic that returns `Err(TransitionError::IllegalTransition)` for invalid paths.
- [ ] Ensure all transitions satisfy the requirements in [2_TAS-REQ-019], [2_TAS-REQ-020], and [2_TAS-REQ-102].

## 3. Code Review
- [ ] Verify that `StateMachine` trait is defined in `devs-core`.
- [ ] Verify that illegal transitions return the correct error kind as specified in [2_TAS-REQ-086B].
- [ ] Verify that the state machine doesn't contain any business logic, only state transitions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Ensure all state machine unit tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the implementation of normative state machines in `devs-core`.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments and code quality standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086E] to the new tests.
