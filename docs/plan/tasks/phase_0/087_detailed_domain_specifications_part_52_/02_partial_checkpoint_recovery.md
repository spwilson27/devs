# Task: Implement Partial Checkpoint Recovery Logic (Sub-Epic: 087_Detailed Domain Specifications (Part 52))

## Covered Requirements
- [2_TAS-REQ-511]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-checkpoint/tests/recovery.rs` (or equivalent) that:
    - Sets up a mocked checkpoint directory containing two runs (A and B).
    - Writes a corrupt (invalid JSON) `checkpoint.json` for run A.
    - Writes a valid `checkpoint.json` for run B.
    - Calls `CheckpointStore::recover()` or the equivalent server startup recovery function.
    - Verifies that the recovery function does NOT return an error.
    - Verifies that run B is recovered successfully and added to the in-memory registry.
    - Verifies that run A is marked as `Unrecoverable` (via a specific status or in-memory flag).
    - Verifies that both runs are returned when calling `list_runs` (or its internal equivalent).

## 2. Task Implementation
- [ ] Implement the `CheckpointStore` recovery logic in `devs-checkpoint`.
- [ ] Use a loop to iterate through the project's checkpoint directory.
- [ ] Wrap the `serde_json::from_reader` (or equivalent) call in a result check.
- [ ] If parsing fails:
    - Log an `ERROR` message containing the file path and the specific parse error.
    - Create a stub entry in the in-memory run registry with status `Unrecoverable`.
    - Continue to the next checkpoint file.
- [ ] Ensure the server startup process correctly handles this partial failure without aborting.
- [ ] Ensure that `list_runs` in `devs-grpc` or `devs-core` can correctly report `Unrecoverable` runs.

## 3. Code Review
- [ ] Ensure that `Unrecoverable` is a distinct variant in the `RunStatus` enum in `devs-core`.
- [ ] Verify that errors are logged at the `ERROR` level as required.
- [ ] Check that the in-memory state is consistent even when recovery is partial.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test --package devs-checkpoint` and ensure all recovery tests pass.

## 5. Update Documentation
- [ ] Add a section in `devs-checkpoint` documentation explaining the handling of corrupt checkpoint files.

## 6. Automated Verification
- [ ] Run `cargo test` and verify that the `recovery_corrupt_file` test passes.
- [ ] Verify traceability annotations are present: `/// Verifies [2_TAS-REQ-511]`.
