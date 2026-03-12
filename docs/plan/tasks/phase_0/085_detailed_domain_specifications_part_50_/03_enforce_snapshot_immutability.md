# Task: Enforce Snapshot Immutability (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-504]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write a unit test for `WorkflowRun` in `devs-core/src/models/run.rs` (or equivalent).
- [ ] The test should create a `WorkflowRun` with an existing `definition_snapshot`.
- [ ] Attempt to call a setter or update method (e.g., `set_snapshot`) with a new snapshot.
- [ ] Assert that the method returns an error `ImmutableSnapshotError`.
- [ ] Assert that the internal snapshot remains unchanged.

## 2. Task Implementation
- [ ] Define `ImmutableSnapshotError` in `devs-core/src/error.rs`.
- [ ] In the `WorkflowRun` struct, ensure the field `definition_snapshot` is private or guarded by a method that checks if it is already `Some`.
- [ ] Implement a method like `set_snapshot(snapshot: WorkflowDefinition) -> Result<(), ImmutableSnapshotError>`.
- [ ] In this method, if `self.definition_snapshot.is_some()`, return the error. Otherwise, set the field.

## 3. Code Review
- [ ] Ensure that no other part of the codebase can bypass this check (e.g., by direct field access).
- [ ] Verify that the error message is clear and follows project standards.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.

## 5. Update Documentation
- [ ] Add a doc comment to `WorkflowRun::definition_snapshot` explaining its immutability.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows `2_TAS-REQ-504` as covered.
