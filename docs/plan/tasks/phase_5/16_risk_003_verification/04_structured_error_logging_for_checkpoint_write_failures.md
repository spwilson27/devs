# Task: Structured ERROR Logging for Checkpoint Write Failures (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [RISK-003-BR-003], [AC-RISK-003-01]

## Dependencies
- depends_on: [03_mock_checkpoint_store_for_testing.md]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a test at `devs-checkpoint/tests/structured_logging_tests.rs` that captures log output during a checkpoint write failure.
- [ ] Assert that when `StorageFull` error occurs, an ERROR-level log entry is emitted.
- [ ] Assert that the log entry contains `event_type: "checkpoint.write_failed"` as a structured field.
- [ ] Assert that the log entry contains the `run_id` field with the correct run identifier.
- [ ] Assert that the log entry contains an `error` field with the error message.
- [ ] Use a test logger or caplog fixture to capture and inspect structured log fields.

## 2. Task Implementation
- [ ] Identify the location in `CheckpointStore::write_checkpoint` where I/O errors are handled.
- [ ] Add structured logging using the project's logging framework (e.g., `tracing::error!` or `log::error!`).
- [ ] Ensure the log includes: `event_type = "checkpoint.write_failed"`, `run_id`, and `error` fields.
- [ ] Verify that the error is logged but NOT propagated as a fatal error (server continues).
- [ ] Ensure the logging does not panic or cause side effects beyond writing the log entry.

## 3. Code Review
- [ ] Verify that the structured log format matches the project's logging conventions.
- [ ] Ensure the `run_id` is correctly interpolated from the run context.
- [ ] Check that no sensitive information is leaked in the error message.
- [ ] Confirm that the server continues execution after logging (no early return that would halt processing).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint --test structured_logging_tests` and verify all assertions pass.
- [ ] Run the full test suite to ensure no regressions in other checkpoint tests.

## 5. Update Documentation
- [ ] Document the structured log format for `checkpoint.write_failed` events in the checkpoint module's README.
- [ ] Add the event type to any central logging documentation or event registry.

## 6. Automated Verification
- [ ] Run `./do test` and confirm traceability annotations are detected.
- [ ] Verify `target/traceability.json` shows coverage for both `RISK-003-BR-003` and `AC-RISK-003-01`.
