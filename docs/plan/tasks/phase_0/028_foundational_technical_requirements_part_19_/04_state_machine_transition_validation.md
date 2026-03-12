# Task: Implement `StateMachine` Transition Validation and Atomic Persistence (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-020A]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test `devs-core/src/state_machine/tests.rs`.
- [ ] Define a mock `StateMachine` implementation.
- [ ] Write a test that attempts an illegal transition (e.g., `Completed` -> `Running`) and verify it returns `TransitionError::IllegalTransition`.
- [ ] Write a test that performs a valid transition and verify that the `checkpoint.json` is written **before** any event is emitted to gRPC subscribers (mock the gRPC emitter).

## 2. Task Implementation
- [ ] Define the `StateMachine` trait in `devs-core/src/state_machine/mod.rs`.
- [ ] Implement the `TransitionError` enum with the `IllegalTransition { from, to }` variant.
- [ ] Implement validation logic in the `transition` method to reject invalid transitions.
- [ ] Ensure the current state is preserved when a transition is rejected.
- [ ] Integrate with `devs-checkpoint` to ensure that every successful state transition is persisted to `checkpoint.json`.
- [ ] Implement an atomic "commit" pattern where the persistence happens before notification.

## 3. Code Review
- [ ] Verify that no transition is applied if it is illegal.
- [ ] Ensure that `checkpoint.json` contains the updated state immediately after a valid transition.
- [ ] Confirm that gRPC subscribers only receive the event *after* the state is durable in `checkpoint.json`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Verify that all illegal transition test cases fail with the correct error.
- [ ] Confirm that persistence and notification order is preserved in integration tests.

## 5. Update Documentation
- [ ] Document the `StateMachine` trait and its transition validation rules in `devs-core/README.md`.

## 6. Automated Verification
- [ ] Run a property-based test (e.g., using `proptest`) to explore all state transitions and verify no illegal transitions are ever allowed to modify the internal state.
