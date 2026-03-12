# Task: Workflow Run Snapshot Immutability (Sub-Epic: 012_Foundational Technical Requirements (Part 3))

## Covered Requirements
- [2_TAS-BR-013]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` to verify that the `definition_snapshot` of a `WorkflowRun` is immutable after the run transitions from `Pending` to `Running`.
- [ ] Create a test case where any attempt to modify the `definition_snapshot` after the run starts results in a `ImmutableSnapshotError` or similar.
- [ ] Create a test case that ensures the state machine enforces this constraint during the `Pending -> Running` transition.

## 2. Task Implementation
- [ ] Implement the `definition_snapshot` field in the `WorkflowRun` struct in `devs-core`.
- [ ] Ensure the field is correctly populated at run creation/start.
- [ ] Add logic to the `StateMachine` implementation for `WorkflowRun` that prevents changes to the `definition_snapshot` field once the status is no longer `Pending`.
- [ ] If using a builder pattern or setters, ensure they check the current status before allowing updates to the snapshot.
- [ ] Verify that the `definition_snapshot` used during stage execution is always the one from the `WorkflowRun` instance, not the live `WorkflowDefinition`.

## 3. Code Review
- [ ] Verify that the immutability enforcement is robust and cannot be bypassed.
- [ ] Check that the state transitions correctly handle the initial snapshotting.
- [ ] Ensure that no redundant copies of the snapshot are being made unnecessarily.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all tests pass.
- [ ] Run `./do test` and ensure the traceability report includes coverage for `[2_TAS-BR-013]`.

## 5. Update Documentation
- [ ] Document the immutability of the `definition_snapshot` in the `devs-core` internal API docs.
- [ ] Update agent memory to reflect the enforcement of the immutability constraint.

## 6. Automated Verification
- [ ] Run `./do test` and ensure the traceability report includes coverage for `[2_TAS-BR-013]`.
