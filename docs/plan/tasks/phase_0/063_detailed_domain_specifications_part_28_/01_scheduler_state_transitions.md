# Task: Implement Scheduler State Machine Transitions (Part 28) (Sub-Epic: 063_Detailed Domain Specifications (Part 28))

## Covered Requirements
- [2_TAS-REQ-278], [2_TAS-REQ-279]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/state_machine.rs` (or similar location where `StateMachine` is defined) to verify the transition from `Waiting` to `Eligible`.
- [ ] Ensure the test checks that a stage remains `Waiting` if any dependency is still in progress.
- [ ] Ensure the test checks that a stage MUST NOT transition to `Eligible` if any dependency is `Failed`, `Cancelled`, or `TimedOut`.
- [ ] Verify that the test fails (Red) since the specific transition logic for these states is not yet implemented or lacks these constraints.
- [ ] Annotate the tests with `// Covers: [2_TAS-REQ-278], [2_TAS-REQ-279]`.

## 2. Task Implementation
- [ ] Update the `StateMachine` implementation in `devs-core` to handle the `Waiting` to `Eligible` transition.
- [ ] Implement logic to check that ALL entries in the `depends_on` list are in the `Completed` state before allowing the transition to `Eligible`.
- [ ] Ensure that stages with no unmet dependencies are eligible to run.
- [ ] Add explicit documentation comments to the transition methods, referencing `[2_TAS-REQ-278]` and `[2_TAS-REQ-279]`.

## 3. Code Review
- [ ] Verify that the state machine transition is atomic and follows the project's state machine patterns.
- [ ] Ensure all public methods and structs have proper doc comments.
- [ ] Check for redundant state checks or potential deadlocks in state transitions.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify the state machine tests pass.
- [ ] Run `./do lint` to ensure documentation and style standards are met.

## 5. Update Documentation
- [ ] Update `devs-core` module-level documentation if the state machine's behavior has been significantly refined.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps `2_TAS-REQ-278` and `2_TAS-REQ-279` to the new tests.
- [ ] Ensure `traceability_pct` is 100% for the covered requirements.
