# Task: Server Startup with Corrupted Checkpoint - Unrecoverable Run Marking (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [AC-RISK-003-02]

## Dependencies
- depends_on: ["06_checkpoint_json_validation_function.md"]
- shared_components: [devs-checkpoint, devs-core, devs-scheduler]

## 1. Initial Test Written
- [ ] Create an integration test at `devs-server/tests/corrupted_checkpoint_recovery_tests.rs`.
- [ ] Set up a test fixture with multiple workflow runs in the checkpoint directory.
- [ ] Corrupt one run's `checkpoint.json` by writing invalid JSON to it.
- [ ] Start the server and call `load_all_runs()`.
- [ ] Assert that the server starts successfully (does not panic or exit).
- [ ] Assert that the corrupted run is marked with `RunStatus::Unrecoverable`.
- [ ] Assert that all other valid runs are loaded with their correct state.
- [ ] Assert that the server can accept new workflow submissions despite the corrupted run.

## 2. Task Implementation
- [ ] Modify the server's startup routine to iterate through all project checkpoints.
- [ ] For each checkpoint, call `validate_checkpoint()` and handle errors gracefully.
- [ ] When validation fails, log an ERROR with the run_id and error details.
- [ ] Mark the affected run's state as `RunStatus::Unrecoverable` in the run registry.
- [ ] Ensure the `RunManager` or scheduler rejects any stage dispatch attempts for Unrecoverable runs.
- [ ] Continue loading remaining checkpoints without aborting the entire startup process.
- [ ] Add a method `is_unrecoverable(&self, run_id: &RunId) -> bool` to check run status.

## 3. Code Review
- [ ] Verify that a single corrupted checkpoint cannot prevent server startup.
- [ ] Ensure the Unrecoverable state is persisted so it survives server restarts.
- [ ] Check that the scheduler correctly blocks stage dispatch for Unrecoverable runs.
- [ ] Confirm that error logs provide sufficient information for manual recovery.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server --test corrupted_checkpoint_recovery_tests` and ensure all cases pass.
- [ ] Run the full server test suite to verify no regressions in startup logic.

## 5. Update Documentation
- [ ] Document the operator recovery procedure: delete corrupted `checkpoint.json` and re-submit the workflow.
- [ ] Add a troubleshooting section for "Unrecoverable run" errors.
- [ ] Update the checkpoint schema documentation to note the validation requirements.

## 6. Automated Verification
- [ ] Run `./do test` and verify traceability for `AC-RISK-003-02`.
- [ ] Confirm `target/traceability.json` shows the requirement is covered by this integration test.
