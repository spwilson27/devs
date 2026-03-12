# Task: Illegal Transition Guard Acceptance (Sub-Epic: 083_Detailed Domain Specifications (Part 48))

## Covered Requirements
- [2_TAS-REQ-494]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` for the `StateMachine` or `StageRun` transition logic.
- [ ] Create a `StageRun` and transition it from `Pending` to `Running`.
- [ ] Transition it from `Running` to `Completed`.
- [ ] Attempt to transition it from `Completed` back to `Running`.
- [ ] Verify that the transition fails with a `TransitionError::IllegalTransition { from: Completed, to: Running }`.
- [ ] Verify that the state remains as `Completed`.
- [ ] In another test, attempt several other illegal transitions (e.g. `Completed` to `Failed`) and verify they are all blocked by the guard.

## 2. Task Implementation
- [ ] In `devs-core`, update the `StateMachine` trait or the `StageRun::transition` method to enforce valid state transitions.
- [ ] Define the set of allowed transitions (e.g. `Pending -> Running`, `Running -> Completed`, `Running -> Failed`, `Running -> Paused`, etc.).
- [ ] Use a match or a transition matrix to validate each request.
- [ ] If a transition is illegal, return the `TransitionError::IllegalTransition` enum with the from/to states as fields.
- [ ] Ensure the transition logic is atomic (e.g. using an internal mutex if the state machine is mutable, or returning a new state if it's functional).

## 3. Code Review
- [ ] Confirm that the transition error fields match the requirement exactly: `from` and `to` states.
- [ ] Verify that all terminal states (e.g. `Completed`, `Failed`, `Unrecoverable`) are correctly guarded against further transitions (except perhaps retry-specific ones if allowed).
- [ ] Ensure the transition matrix is exhaustive and well-documented.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure the illegal transition tests pass.

## 5. Update Documentation
- [ ] Document the valid and invalid state transitions for the `StageRun` in the `devs-core` documentation.

## 6. Automated Verification
- [ ] Run `./do verify_requirements.py` to ensure `[2_TAS-REQ-494]` is correctly mapped to the test.
