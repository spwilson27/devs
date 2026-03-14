# Task: Checkpoint Corruption Recovery & Disk-Full Resilience (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [2_TAS-BR-019]: Corrupt `checkpoint.json` → log `ERROR`, skip run, mark `Unrecoverable`, continue. `load_all_runs` calls `validate_checkpoint(run_id)` which parses `checkpoint.json` with `serde_json` and verifies `schema_version == 1` and all required fields present. Corruption → run status set to `Unrecoverable`; server continues.
- [2_TAS-BR-022]: Disk-full during checkpoint write → log `ERROR`, delete `.tmp`, continue; retry on next transition; server MUST NOT crash. Catch `ErrorKind::StorageFull`, delete `.tmp`, log `ERROR`, continue.

## Dependencies
- depends_on: ["02_parallel_stage_dispatch_engine.md"]
- shared_components: [devs-checkpoint (consumer — save_checkpoint, restore_checkpoints), devs-core (consumer — WorkflowRunState, error types)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/checkpoint_resilience_tests.rs`.
- [ ] Write unit test `test_corrupt_checkpoint_marked_unrecoverable`: create a `.devs/` directory with a `checkpoint.json` containing invalid JSON. Call `restore_checkpoints()`. Assert the run is loaded with status `Unrecoverable`. Assert an `ERROR` log entry is emitted (use `tracing_test` or log capture). Annotate `// Covers: 2_TAS-BR-019`.
- [ ] Write unit test `test_corrupt_checkpoint_missing_schema_version`: `checkpoint.json` is valid JSON but missing `schema_version` field. Assert run marked `Unrecoverable`. Annotate `// Covers: 2_TAS-BR-019`.
- [ ] Write unit test `test_corrupt_checkpoint_wrong_schema_version`: `checkpoint.json` has `schema_version: 2` (unsupported). Assert run marked `Unrecoverable`. Annotate `// Covers: 2_TAS-BR-019`.
- [ ] Write unit test `test_corrupt_checkpoint_missing_required_fields`: valid JSON with `schema_version: 1` but missing required fields (e.g., `run_id`). Assert run marked `Unrecoverable`. Annotate `// Covers: 2_TAS-BR-019`.
- [ ] Write unit test `test_corrupt_checkpoint_does_not_block_other_runs`: two runs in `.devs/`, one corrupt, one valid. Assert `restore_checkpoints()` returns the valid run successfully and marks the corrupt one as `Unrecoverable`. Server continues loading. Annotate `// Covers: 2_TAS-BR-019`.
- [ ] Write unit test `test_disk_full_checkpoint_write_recovers`: mock filesystem to return `ErrorKind::StorageFull` on write. Call `save_checkpoint()`. Assert it returns an error but does NOT panic. Assert `.tmp` file is deleted. Assert `ERROR` log emitted. Annotate `// Covers: 2_TAS-BR-022`.
- [ ] Write unit test `test_disk_full_retry_on_next_transition`: after disk-full failure, simulate disk space becoming available. Trigger next state transition. Assert checkpoint write succeeds on retry. Annotate `// Covers: 2_TAS-BR-022`.
- [ ] Write unit test `test_disk_full_server_does_not_crash`: call `save_checkpoint()` with disk-full condition. Assert the function returns `Err`, not a panic. Assert the scheduler dispatch loop continues processing other stages. Annotate `// Covers: 2_TAS-BR-022`.

## 2. Task Implementation
- [ ] Implement `validate_checkpoint(data: &[u8]) -> Result<WorkflowRun, CheckpointError>` in the scheduler's checkpoint integration layer:
  - Parse with `serde_json::from_slice`. On parse failure → `CheckpointError::CorruptJson`.
  - Verify `schema_version == 1`. On mismatch → `CheckpointError::UnsupportedSchema`.
  - Verify all required fields present (`run_id`, `workflow_name`, `state`, `stages`). On missing → `CheckpointError::MissingField`.
- [ ] Modify `restore_checkpoints` integration (or wrapper in scheduler) to:
  - Call `validate_checkpoint` for each run directory.
  - On `CheckpointError` → log `ERROR` with run ID and error details, set run status to `Unrecoverable`, skip to next run.
  - Continue processing remaining runs — never abort the loop.
- [ ] Add `Unrecoverable` variant to `WorkflowRunState` enum in `devs-core` if not already present.
- [ ] Implement disk-full resilience in the checkpoint save path:
  - Wrap `git2` write operations in error handling that catches `ErrorKind::StorageFull` (or equivalent git2 error class).
  - On disk-full: delete any `.tmp` files created during the write, log `ERROR`, return `Err(CheckpointError::DiskFull)`.
  - Do NOT panic or propagate the error as a fatal crash.
- [ ] Ensure the scheduler dispatch loop catches checkpoint save errors gracefully and continues dispatching other stages.

## 3. Code Review
- [ ] Verify `restore_checkpoints` never aborts on a single corrupt run — all runs are attempted.
- [ ] Verify `.tmp` file cleanup is in a `finally`/drop guard so it runs even on unexpected errors.
- [ ] Verify `Unrecoverable` runs are not re-dispatched or retried.
- [ ] Verify disk-full error path does not hold any locks during cleanup.
- [ ] Verify ERROR log messages include the run ID and specific error detail for debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- checkpoint_resilience` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `validate_checkpoint` explaining the validation rules and `Unrecoverable` outcome.
- [ ] Document the disk-full recovery strategy in the module doc comment.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- checkpoint_resilience --format=json 2>&1 | grep '"passed"'` and confirm all test cases passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- checkpoint_resilience` and verify ≥ 90% line coverage for the checkpoint resilience code.
