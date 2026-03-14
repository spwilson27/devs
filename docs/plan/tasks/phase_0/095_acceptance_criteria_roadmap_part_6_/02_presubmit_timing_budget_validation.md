# Task: Presubmit Timing Budget Validation (Sub-Epic: 095_Acceptance Criteria & Roadmap (Part 6))

## Covered Requirements
- [AC-ROAD-P0-004]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Domain Types & Invariants)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/state_machine_exhaustive.rs` (or equivalent), write an exhaustive unit test for `StateMachine::transition()` that covers **every** `(from_state, event)` pair NOT defined in the `RunStatus` and `StageStatus` transition tables.
- [ ] For each invalid pair, assert that the return value is `Err(TransitionError::IllegalTransition)` — never a panic, never `Ok(...)`.
- [ ] Generate the invalid pairs programmatically: enumerate all variants of the state enum and all variants of the event enum, subtract the valid transitions defined in the transition table, and test every remaining combination.
- [ ] Include `// Covers: AC-ROAD-P0-004` annotation in the test.
- [ ] Also write a positive test confirming all **valid** transitions return `Ok(new_state)` to ensure the transition table is complete.

## 2. Task Implementation
- [ ] In `devs-core`, ensure `StateMachine::transition(from: State, event: Event) -> Result<State, TransitionError>` is implemented with an explicit match over `(from, event)` pairs. The catch-all arm must return `Err(TransitionError::IllegalTransition { from, event })`.
- [ ] Ensure `TransitionError::IllegalTransition` variant exists in the error enum and carries the `from` state and `event` for diagnostic purposes.
- [ ] Ensure the state machine does NOT use `unreachable!()`, `panic!()`, or `todo!()` for undefined transitions — all paths must return a `Result`.
- [ ] Implement for both `RunStatus` and `StageStatus` state machines.

## 3. Code Review
- [ ] Verify the exhaustive test truly covers ALL invalid combinations (use `strum::IntoEnumIterator` or equivalent to enumerate variants).
- [ ] Verify no `unwrap()` or `expect()` calls exist in the state machine transition logic.
- [ ] Verify `TransitionError` implements `Debug`, `Display`, and `std::error::Error`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- state_machine` and confirm all tests pass.
- [ ] Run `cargo test -p devs-core -- state_machine 2>&1 | grep -c 'test result: ok'` to verify execution.

## 5. Update Documentation
- [ ] Add doc comments to `StateMachine::transition()` explaining the error-not-panic contract.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- state_machine_exhaustive --nocapture` and assert exit code 0.
- [ ] Run `grep -r 'Covers: AC-ROAD-P0-004' crates/devs-core/` and assert at least 1 match.
