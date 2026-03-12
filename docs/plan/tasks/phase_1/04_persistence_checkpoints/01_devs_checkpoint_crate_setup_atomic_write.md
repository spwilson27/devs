# Task: devs-checkpoint crate setup and atomic checkpoint writing (Sub-Epic: 04_Persistence & Checkpoints)

## Covered Requirements
- [2_TAS-REQ-017], [1_PRD-REQ-029]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/lib.rs` that verifies the `CheckpointStore` can write a `WorkflowRun` object to a specific file path.
- [ ] The test MUST verify the atomicity by asserting that a temporary file is created and then moved (renamed) to the final `checkpoint.json` path.
- [ ] Use `tempfile` crate for testing. Verify the schema version field `"schema_version": 1` is present in the output JSON.
- [ ] Test that if the write fails (e.g. invalid directory), no partial file is left in the final location.

## 2. Task Implementation
- [ ] Create a new library crate `devs-checkpoint` in the workspace.
- [ ] Depend on `devs-core` (for `WorkflowRun` and `StageRun` types), `serde`, `serde_json`, and `tempfile`.
- [ ] Define a `CheckpointStore` trait with a `write_checkpoint(run_id: &RunId, run: &WorkflowRun) -> Result<(), CheckpointError>` method.
- [ ] Implement a `FileCheckpointStore` that fulfills the trait.
- [ ] Implement the atomic write protocol:
    1. Serialize `WorkflowRun` to JSON with `schema_version: 1`.
    2. Write to a `.tmp` file using the `tempfile` crate (or `NamedTempFile`).
    3. Call `persist()` or `std::fs::rename()` to move it to its final location at `.devs/runs/<run-id>/checkpoint.json`. [2_TAS-REQ-016]
- [ ] Ensure the `.devs/runs/<run-id>/` directory is created if it doesn't exist.

## 3. Code Review
- [ ] Verify that `CheckpointError` uses `thiserror` and is descriptive.
- [ ] Ensure that `serde_json::to_string_pretty` is used for human-inspectability of the checkpoints.
- [ ] Check that no sensitive data from the process environment is accidentally included in the checkpoint.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` to execute the unit tests.
- [ ] Run `./do test` to ensure no workspace regressions.

## 5. Update Documentation
- [ ] Document the `CheckpointStore` trait and `FileCheckpointStore` implementation in the crate's `lib.rs` doc comments.
- [ ] Add a note to `MEMORY.md` regarding the completion of the atomic write protocol.

## 6. Automated Verification
- [ ] Run `verify_requirements.py` to ensure [2_TAS-REQ-017] and [1_PRD-REQ-029] are covered by the new tests.
