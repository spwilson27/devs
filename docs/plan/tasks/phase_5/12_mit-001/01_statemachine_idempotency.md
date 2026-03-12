# Task: Harden StateMachine for Idempotency and Illegal Transitions (Sub-Epic: 12_MIT-001)

## Covered Requirements
- [AC-RISK-001-02]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core/src/state.rs` (or `devs-core/tests/state_machine_tests.rs`) that attempts to transition a `StageRun` that is already in a terminal state (`Completed`, `Failed`, `Cancelled`, `TimedOut`) into any other state.
- [ ] Assert that the `StateMachine::transition()` method returns `Err(TransitionError::IllegalTransition)` within 1ms.
- [ ] Assert that the internal state remains unchanged after the illegal transition attempt.
- [ ] Verify that a second terminal event for a stage already in a terminal state (e.g., `Completed` -> `Completed`) is ALSO rejected with `IllegalTransition` (idempotency check).

## 2. Task Implementation
- [ ] Modify `devs-core/src/state.rs`: Update the `StateMachine::transition()` implementation to explicitly check the current status of the `StageRun` or `WorkflowRun`.
- [ ] If the current status is terminal, return `Err(TransitionError::IllegalTransition)` regardless of the incoming event, unless the transition is specifically allowed (none are terminal to non-terminal).
- [ ] Ensure that no state mutation (e.g., updating `completed_at` or `exit_code`) occurs before this check passes.
- [ ] Optimize the check to ensure it completes within the 1ms latency requirement specified in [AC-RISK-001-02].

## 3. Code Review
- [ ] Verify that the `TransitionError::IllegalTransition` enum variant contains the `from` and `to` states for debugging.
- [ ] Confirm that terminal states are correctly defined according to §3.5 of [2_TAS].
- [ ] Ensure no `clone()` calls or expensive operations occur before the terminal state check.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure the new idempotency tests pass.
- [ ] Run `cargo test -p devs-core -- --ignored` if any stress tests were added.

## 5. Update Documentation
- [ ] Update doc comments for `StateMachine::transition()` in `devs-core/src/lib.rs` to reflect the idempotency and terminal state constraints.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% requirement-to-test traceability for [AC-RISK-001-02].
- [ ] Verify traceability via `target/traceability.json`.
