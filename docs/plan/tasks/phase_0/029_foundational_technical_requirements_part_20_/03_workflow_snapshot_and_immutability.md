# Task: Implement Workflow Snapshot Persistence and Immutability (Sub-Epic: 029_Foundational Technical Requirements (Part 20))

## Covered Requirements
- [2_TAS-REQ-022A], [2_TAS-REQ-022B]

## Dependencies
- depends_on: [01_checkpoint_persistence_atomic_null.md]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-checkpoint/src/snapshotter.rs` (or similar) that:
    - Verifies that `Snapshotter::save_snapshot(path, definition)` creates an atomic write of the workflow definition.
    - Verifies that attempting to call `save_snapshot` a second time for the same path results in a `panic!` in `#[cfg(debug_assertions)]` (debug builds).
    - Verifies that attempting to call `save_snapshot` a second time for the same path returns a `Result::Err(ImmutableSnapshotError)` in release builds (using `#[cfg(not(debug_assertions))]` if possible, or by mocking the environment).

## 2. Task Implementation
- [ ] Implement a `Snapshotter` struct or trait in `devs-checkpoint`.
- [ ] Use the same atomic write mechanism from `CheckpointStore` (refactor to a common utility if necessary).
- [ ] Implement the `WorkflowDefinition` verbatim serialization logic.
- [ ] Add an existence check before writing: `if std::path::Path::new(path).exists() { ... }`.
- [ ] If the file exists:
    - In debug builds (`cfg!(debug_assertions)`): `panic!("Snapshot immutability violated")`.
    - In release builds: Return `Err(devs_checkpoint::Error::ImmutableSnapshotError)`.
- [ ] Define the `ImmutableSnapshotError` variant in the `devs-checkpoint` error enum.

## 3. Code Review
- [ ] Verify that the immutability logic follows [2_TAS-REQ-022B] exactly.
- [ ] Ensure that the snapshot is written atomically.
- [ ] Check that `WorkflowDefinition` is serialized verbatim.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure snapshot tests pass.
- [ ] Test the panic behavior in a debug build test case.

## 5. Update Documentation
- [ ] Update the `devs-checkpoint` README or module documentation with the snapshot immutability policy.

## 6. Automated Verification
- [ ] Run `python3 .tools/verify_requirements.py` to ensure traceability.
- [ ] Verify that `workflow_snapshot.json` cannot be overwritten by manual file operations if the app is running in a way that checks this.
