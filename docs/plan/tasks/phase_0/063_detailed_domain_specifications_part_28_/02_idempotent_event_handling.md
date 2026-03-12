# Task: Implement Idempotent Terminal Event Processing (Part 28) (Sub-Epic: 063_Detailed Domain Specifications (Part 28))

## Covered Requirements
- [2_TAS-REQ-280]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/state.rs` (or `scheduler.rs`) to verify that terminal events are processed idempotently.
- [ ] In the test, trigger a `StageCompleted` event for a stage that is already in a terminal state (e.g. `Completed`).
- [ ] Assert that the second event is discarded and does not cause a new state transition or redundant event emission.
- [ ] Verify that the test fails (Red) or incorrectly processes the duplicate event before the fix.
- [ ] Annotate the tests with `// Covers: [2_TAS-REQ-280]`.

## 2. Task Implementation
- [ ] Update the event processing logic in `devs-core` or the state manager to check the current stage status before applying terminal events.
- [ ] Ensure that if a stage is already in a terminal state (`Completed`, `Failed`, `Cancelled`, `TimedOut`), any subsequent terminal events for that stage are ignored.
- [ ] Log a `DEBUG` message when a duplicate terminal event is discarded to aid in troubleshooting.
- [ ] Reference `[2_TAS-REQ-280]` in doc comments for the relevant event handling functions.

## 3. Code Review
- [ ] Ensure that idempotency logic correctly handles all terminal states as defined in the `StageStatus` state machine.
- [ ] Verify that non-terminal transitions (like `Waiting` to `Eligible`) are still processed correctly.
- [ ] Check for potential race conditions during event processing and state updates.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the event idempotency tests pass.
- [ ] Run `./do lint` for documentation and quality checks.

## 5. Update Documentation
- [ ] Document the idempotent event processing model in the relevant crate's module documentation.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps `2_TAS-REQ-280` to the new tests.
- [ ] Ensure 100% traceability for the requirement.
