# Task: Snapshot Immutability and Attempt Counter (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-477], [2_TAS-REQ-478]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/state/tests.rs`, create a unit test for `WorkflowRun` snapshot immutability.
- [ ] Initialize a `WorkflowRun` with `definition_snapshot = None` and transition it from `Pending` to `Running` (this should set the snapshot).
- [ ] Attempt to call `set_snapshot()` again on the `Running` run and verify that it returns `ImmutableSnapshotError`.
- [ ] In `crates/devs-core/src/state/tests.rs`, create a unit test for `StageRun.attempt` incrementing.
- [ ] Test that `attempt` starts at 1.
- [ ] Test that a transition from `Failed` back to `Pending` (retry) increments `attempt` to 2.
- [ ] Test that a transition from `Running` to `Eligible` due to a rate-limit event (pool fallback) does NOT increment `attempt`.
- [ ] Test that a genuine failure (non-zero exit with no rate-limit match) increments the `attempt` counter.

## 2. Task Implementation
- [ ] Define `ImmutableSnapshotError` in `crates/devs-core/src/error.rs`.
- [ ] Update `WorkflowRun::transition_to_running()` in `crates/devs-core/src/state/run.rs` to set the `definition_snapshot` and enforce immutability.
- [ ] Ensure that any subsequent attempt to modify the snapshot returns the `ImmutableSnapshotError`.
- [ ] Update the `StageRun` state transition logic in `crates/devs-core/src/state/stage.rs` to handle the `attempt` counter according to the spec:
- Start `attempt` at 1.
- Increment on genuine failure.
- Do NOT increment on rate-limit fallback transitions.
- [ ] Ensure the `StateMachine` trait reflects these behaviors correctly.

## 3. Code Review
- [ ] Verify that the `attempt` counter starts at 1 for the first execution.
- [ ] Ensure that the `ImmutableSnapshotError` is returned when a non-null snapshot would be overwritten.
- [ ] Confirm that rate-limit events are correctly identified in the state transition logic to prevent incorrect attempt increments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and specifically the new state machine tests to confirm the behavior.

## 5. Update Documentation
- [ ] Update developer memory or documentation about the `attempt` counter semantics.

## 6. Automated Verification
- [ ] Execute `./do lint` to ensure that doc comments and code quality standards are met.
- [ ] Execute `./do test` to ensure that the new tests are integrated and traceability is maintained.
