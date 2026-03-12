# Task: Atomic Cancellation Acceptance (Sub-Epic: 084_Detailed Domain Specifications (Part 49))

## Covered Requirements
- [2_TAS-REQ-495]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-core` that simulates a `WorkflowRun` with multiple stages in various states (`Waiting`, `Eligible`, `Running`).
- [ ] The test should trigger a cancellation on the `WorkflowRun`.
- [ ] Mock the `CheckpointStore` to track the number of calls and the data written.
- [ ] Assert that a single `checkpoint.json` write occurs containing all cancelled statuses.
- [ ] Verify that no intermediate writes occur where some stages are cancelled and others are not.

## 2. Task Implementation
- [ ] Modify the `StateMachine` in `devs-core` to handle workflow cancellation atomically.
- [ ] Ensure the transition logic updates all active stages (Waiting, Eligible, Running) to `Cancelled` state before returning the new state for persistence.
- [ ] Ensure the `CheckpointStore` in `devs-checkpoint` is called once with the complete, consistent snapshot of the run state.

## 3. Code Review
- [ ] Verify that the state transition logic is purely functional (returns new state) or that the mutable update is protected by a single lock/transaction.
- [ ] Ensure that no side effects (like spawning new stages) can occur between the cancellation and the checkpoint write.
- [ ] Verify that the `Cancelled` status is correctly applied to all relevant stages.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and `cargo test -p devs-checkpoint`.
- [ ] Ensure all tests pass, including the new atomic cancellation test.

## 5. Update Documentation
- [ ] Add a doc comment to the cancellation method in the state machine explaining the atomicity guarantee.
- [ ] Update `MEMORY.md` if any architectural assumptions about state persistence were changed.

## 6. Automated Verification
- [ ] Run `./do verify_requirements` to ensure `2_TAS-REQ-495` is correctly mapped and tested.
