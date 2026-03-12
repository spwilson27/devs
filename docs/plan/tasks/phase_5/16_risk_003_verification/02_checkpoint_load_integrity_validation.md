# Task: Checkpoint JSON Validation and Unrecoverable State Transition during Load (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [AC-RISK-003-02]

## Dependencies
- depends_on: [01_checkpoint_write_failure_handling.md]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint/src/load.rs` (or equivalent location for load logic) that provides a `checkpoint.json` with invalid JSON syntax.
- [ ] Assert that the `CheckpointStore::load_all_runs` (or `validate_checkpoint`) identifies the invalid JSON.
- [ ] Assert that a run with a corrupted `checkpoint.json` is marked with `RunStatus::Unrecoverable`.
- [ ] Assert that the server continues to successfully load and process other valid runs in the same registry.

## 2. Task Implementation
- [ ] Implement `CheckpointStore::validate_checkpoint` to parse the `checkpoint.json` content using `serde_json::from_str`.
- [ ] Catch parsing errors and log them with sufficient detail for diagnosis.
- [ ] Ensure that when a parsing error occurs, the affected run ID is mapped to an `Unrecoverable` state.
- [ ] Implement the logic in the server's startup `load_all_runs` routine to iterate through all checkpoints and gracefully handle individual failures without stopping the entire load process.

## 3. Code Review
- [ ] Verify that the `Unrecoverable` state is correctly handled by the server's `RunManager`, preventing any further stage dispatch for that specific run.
- [ ] Ensure that other projects and runs are unaffected by a single corrupted checkpoint file.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test checkpoint_load_integrity_tests` (or equivalent) and ensure all cases pass.

## 5. Update Documentation
- [ ] Update documentation on how an operator can manually recover from an `Unrecoverable` run (e.g., by deleting the checkpoint and re-submitting).
- [ ] Record the implementation of this validation logic in the agent "memory".

## 6. Automated Verification
- [ ] Run `./do test` to ensure the new tests are counted toward traceability and all existing tests pass.
- [ ] Verify that `target/traceability.json` confirms coverage for `AC-RISK-003-02`.
