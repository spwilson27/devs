# Task: Workflow Run Snapshot Immutability Enforcement (Sub-Epic: 080_Detailed Domain Specifications (Part 45))

## Covered Requirements
- [2_TAS-REQ-477]

## Dependencies
- depends_on: []
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create test module `tests::snapshot_immutability`
- [ ] Write test `test_snapshot_set_on_pending_to_running`: create a `WorkflowRun` in `Pending` state with `definition_snapshot = None`. Transition it to `Running` while providing a snapshot. Assert the snapshot is now `Some(...)` and matches the provided value.
- [ ] Write test `test_snapshot_overwrite_returns_error`: create a `WorkflowRun` already in `Running` state with a non-null `definition_snapshot`. Attempt to set the snapshot again (simulating a second transition or direct set). Assert the operation returns `Err(ImmutableSnapshotError)`.
- [ ] Write test `test_snapshot_none_before_running`: create a `WorkflowRun` in `Pending` state. Assert `definition_snapshot` is `None`.
- [ ] Write test `test_snapshot_persists_through_completion`: create a `WorkflowRun` with a snapshot set, transition to `Completed`. Assert `definition_snapshot` is still the original value.

## 2. Task Implementation
- [ ] Define `ImmutableSnapshotError` as a dedicated error type (or variant in the domain error enum) in `devs-core`.
- [ ] In the `WorkflowRun` struct, make `definition_snapshot` a private field with a setter method: `pub fn set_definition_snapshot(&mut self, snapshot: WorkflowDefinitionSnapshot) -> Result<(), ImmutableSnapshotError>`.
- [ ] The setter checks: if `self.definition_snapshot.is_some()`, return `Err(ImmutableSnapshotError)`. Otherwise, set and return `Ok(())`.
- [ ] In the `Pending → Running` state transition method, call `set_definition_snapshot` with the provided snapshot. This is the only code path that sets it.
- [ ] Provide a public getter `pub fn definition_snapshot(&self) -> Option<&WorkflowDefinitionSnapshot>`.

## 3. Code Review
- [ ] Verify `definition_snapshot` is not `pub` — only accessible through the getter/setter.
- [ ] Verify no other code path (including deserialization) bypasses the immutability check for in-memory mutations. (Deserialization from checkpoint is fine since it's restoring existing state.)
- [ ] Confirm the error type has a useful `Display` message.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core snapshot_immutability` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-477` annotation to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core snapshot_immutability -- --nocapture` and verify zero failures. Grep for `2_TAS-REQ-477`.
