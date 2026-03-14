# Task: Resilient Checkpoint Loading on Startup (Sub-Epic: 081_Detailed Domain Specifications (Part 46))

## Covered Requirements
- [2_TAS-REQ-483]

## Dependencies
- depends_on: []
- shared_components: ["devs-checkpoint", "devs-scheduler"]

## 1. Initial Test Written
- [ ] Create a test module `tests::resilient_checkpoint_loading` in the checkpoint or scheduler crate.
- [ ] `test_malformed_json_skipped_others_loaded` — Write two checkpoint files: one valid, one with malformed JSON (e.g., truncated). Call the checkpoint loader. Assert the valid run is loaded and the malformed one is skipped (not present in the returned runs).
- [ ] `test_unknown_schema_version_skipped` — Write a checkpoint with `"schema_version": 999`. Assert it is skipped.
- [ ] `test_missing_required_field_skipped` — Write a checkpoint JSON missing a required field (e.g., `run_id`). Assert it is skipped.
- [ ] `test_error_logged_for_corrupt_checkpoint` — Use a log capture mechanism (e.g., `tracing-test` or `tracing_subscriber` with an in-memory layer). Load a corrupt checkpoint. Assert an `ERROR`-level log line is emitted containing the file path and a description of the parse error.
- [ ] `test_unrecoverable_runs_exposed_via_list` — After loading with one corrupt checkpoint, call the equivalent of `list_runs`. Assert the corrupt run appears with `status = "Unrecoverable"` and an `error` field describing the parse failure.
- [ ] `test_all_corrupt_still_starts` — Write only corrupt checkpoint files. Assert the loader returns successfully with zero recovered runs (does not panic or abort).

## 2. Task Implementation
- [ ] In the checkpoint restore path (`restore_checkpoints` or equivalent):
  1. Iterate over all `checkpoint.json` files found in the project's `.devs/` directory.
  2. For each file, attempt to deserialize. On failure (serde error, unknown schema version, missing fields):
     a. Log at `ERROR` level: `"Failed to load checkpoint {path}: {error}"`.
     b. Record the run ID (extracted from the directory name or file path) and the error message in an `unrecoverable_runs` list.
     c. Continue to the next file.
  3. Return both the successfully loaded runs and the unrecoverable run entries.
- [ ] Define an `UnrecoverableRun` struct with fields: `run_id: String`, `path: PathBuf`, `error: String`.
- [ ] In the `list_runs` response path, merge unrecoverable runs into the output with `status = "Unrecoverable"` and the `error` field populated.

## 3. Code Review
- [ ] Verify a single corrupt checkpoint does not prevent loading of other valid checkpoints.
- [ ] Verify the error log includes both the file path and the parse error message.
- [ ] Verify unrecoverable runs are surfaced through `list_runs`, not silently dropped.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test resilient_checkpoint_loading` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `restore_checkpoints` describing the resilience behavior and the `Unrecoverable` status.

## 6. Automated Verification
- [ ] Run `cargo test resilient_checkpoint_loading -- --nocapture` and verify zero failures.
