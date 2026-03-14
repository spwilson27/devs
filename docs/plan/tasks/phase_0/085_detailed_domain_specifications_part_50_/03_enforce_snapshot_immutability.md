# Task: Enforce Snapshot Immutability (Sub-Epic: 085_Detailed Domain Specifications (Part 50))

## Covered Requirements
- [2_TAS-REQ-504]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] In `devs-core/src/error.rs` (or equivalent), define `ImmutableSnapshotError` as a struct or enum variant.
- [ ] In `devs-core/src/models/run.rs` (or the module containing `WorkflowRun`), write `test_set_snapshot_succeeds_when_none`:
  - Create a `WorkflowRun` with `definition_snapshot = None`.
  - Call `set_definition_snapshot(snapshot)`.
  - Assert it returns `Ok(())`.
  - Assert `definition_snapshot()` returns `Some(&snapshot)`.
- [ ] Write `test_set_snapshot_returns_error_when_already_set`:
  - Create a `WorkflowRun` with an existing `definition_snapshot` (set via initial construction or a prior successful `set_definition_snapshot`).
  - Call `set_definition_snapshot(new_snapshot)` with a different snapshot.
  - Assert it returns `Err(ImmutableSnapshotError)`.
  - Assert the original snapshot is unchanged (compare by equality).
- [ ] Write `test_set_snapshot_error_does_not_modify_existing`:
  - Same as above but explicitly read the snapshot before and after the failed set, asserting byte-level equality.
- [ ] Add `// Covers: 2_TAS-REQ-504` annotation to all test functions.

## 2. Task Implementation
- [ ] Define `ImmutableSnapshotError` in `devs-core/src/error.rs`. Implement `std::fmt::Display` with message: `"definition snapshot is immutable once set"`. Implement `std::error::Error`.
- [ ] In `WorkflowRun`, ensure the `definition_snapshot` field is private.
- [ ] Implement `pub fn set_definition_snapshot(&mut self, snapshot: WorkflowDefinitionSnapshot) -> Result<(), ImmutableSnapshotError>`:
  - If `self.definition_snapshot.is_some()`, return `Err(ImmutableSnapshotError)`.
  - Otherwise, set `self.definition_snapshot = Some(snapshot)` and return `Ok(())`.
- [ ] Implement `pub fn definition_snapshot(&self) -> Option<&WorkflowDefinitionSnapshot>` as read-only accessor.

## 3. Code Review
- [ ] Verify no public field access can bypass `set_definition_snapshot` (field must be private).
- [ ] Ensure `ImmutableSnapshotError` is a proper error type (implements `Display` + `Error`).
- [ ] Confirm `devs-core` has no new runtime dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- snapshot` to verify all new tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `WorkflowRun::set_definition_snapshot` explaining the immutability guarantee.
- [ ] Add doc comment on `WorkflowRun::definition_snapshot` field (if visible via accessor).

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` includes `2_TAS-REQ-504` as covered.
- [ ] Run `./do lint` to confirm no clippy warnings or formatting issues.
