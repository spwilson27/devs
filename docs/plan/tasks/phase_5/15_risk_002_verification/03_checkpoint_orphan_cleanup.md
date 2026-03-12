# Task: Startup Orphaned Checkpoint Cleanup (Sub-Epic: 15_Risk 002 Verification)

## Covered Requirements
- [RISK-003-BR-002]

## Dependencies
- depends_on: [02_atomic_checkpoint_write.md]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-core` that mocks the server startup sequence.
- [ ] The test should create one or more `checkpoint.json.tmp` files in a run directory within a mock workspace.
- [ ] The test should verify that when `load_all_runs` (or its equivalent startup logic) is called, these orphaned `.tmp` files are successfully deleted.
- [ ] The test should verify that a `WARN` level log is emitted for each deleted orphan.
- [ ] Create a test where an orphan exists but deletion fails (e.g., due to permissions) and verify that the server still completes the startup and proceeds to read the valid `checkpoint.json`.

## 2. Task Implementation
- [ ] Locate the server's run loading entry point, typically `load_all_runs` in `devs-core` or `devs-checkpoint`.
- [ ] Update the `load_all_runs` implementation to perform an initial scan phase:
    1.  Iterate through all run directories in the project's checkpoint storage area.
    2.  Check for the presence of files named `checkpoint.json.tmp`.
    3.  For each `checkpoint.json.tmp` file found:
        -   Attempt to delete it using `std::fs::remove_file`.
        -   Emit a `WARN` log message: `event_type: "checkpoint.orphan_cleaned"`, `run_id: "<id>"`, `path: "<path>"`.
    4.  Log any failure to delete an orphan but do NOT return an error (startup should proceed).
- [ ] Ensure that this cleanup step occurs *before* the server attempts to read and deserialize any `checkpoint.json` files to avoid processing inconsistent state.

## 3. Code Review
- [ ] Verify that the cleanup logic is robust and does not crash the server on I/O errors.
- [ ] Confirm that only files with the exact `.tmp` extension are targeted for deletion.
- [ ] Ensure that the `WARN` log follows the correct telemetry format established for the project.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and `cargo test -p devs-checkpoint` to verify the orphan cleanup sequence.
- [ ] Manually simulate a crash (e.g., by creating a `.tmp` file and killing the server) to verify the recovery behavior.

## 5. Update Documentation
- [ ] Document the orphan cleanup behavior in the server startup logs and internal developer guides.
- [ ] Update the RISK-003 mitigation status in the project documentation.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all startup and checkpoint-related tests pass.
- [ ] Run `.tools/verify_requirements.py` to ensure `RISK-003-BR-002` is correctly mapped and verified.
