# Task: Atomic Checkpoint Write Protocol (Sub-Epic: 15_Risk 002 Verification)

## Covered Requirements
- [RISK-003], [RISK-003-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-checkpoint` for `CheckpointStore`.
- [ ] The test should use a mock filesystem (or temporary directory) and simulate a successful write.
- [ ] The test should verify that the sequence of filesystem calls matches `serialize → write → fsync → rename`.
- [ ] Create a test that simulates a failure during the write phase (e.g., using a mock or a controlled error condition) and verify that the original `checkpoint.json` remains untouched.
- [ ] Create a test that verifies that if a write fails before `rename()`, the `.tmp` file is deleted or cleanup is handled.

## 2. Task Implementation
- [ ] Open `devs-checkpoint` and locate the `CheckpointStore::write` or similar persistence method.
- [ ] Update the implementation to ensure the following invariant sequence:
    1.  Serialize the run state to a JSON string or buffer using `serde_json`.
    2.  Open a temporary file named `checkpoint.json.tmp` in the run's state directory.
    3.  Write the serialized data to the `.tmp` file.
    4.  Call `fsync()` (or equivalent like `sync_all()`) on the file handle to ensure the data is committed to the physical storage media.
    5.  Close the file handle.
    6.  Use an atomic `rename()` operation (provided by `std::fs::rename`) to replace the existing `checkpoint.json` with the new `.tmp` file.
- [ ] Implement error handling for each step:
    -   If serialization fails, return the error.
    -   If write/fsync fails, attempt to delete the `.tmp` file and log `ERROR` with `event_type: "checkpoint.write_failed"`.
-   **Note:** `fsync` is critical as per `RISK-003-BR-001` to ensure durability before the rename commit point.

## 3. Code Review
- [ ] Verify that `fsync` is called on the temporary file *before* it is closed and renamed.
- [ ] Ensure that no reordering of these steps is possible in the implementation.
- [ ] Confirm that `std::fs::rename` is used, which provides atomic guarantees on most supported filesystems (ext4, NTFS, etc.).
- [ ] Verify that the `ERROR` log message includes the correct `event_type` and `run_id`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` to verify the atomic write protocol.
- [ ] Verify using trace-level logging or system-call tracing (if feasible in the environment) that `fsync` is indeed called.

## 5. Update Documentation
- [ ] Update the `devs-checkpoint` documentation to reflect the atomic write protocol as a durability guarantee.
- [ ] Update the "MIT-003" mitigation status in the project documentation.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all checkpoint-related tests pass.
- [ ] Run `.tools/verify_requirements.py` to ensure `RISK-003-BR-001` is correctly mapped and verified.
