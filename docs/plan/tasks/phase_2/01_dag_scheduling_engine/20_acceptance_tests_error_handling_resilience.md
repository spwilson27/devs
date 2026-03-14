# Task: Acceptance Tests for Error Handling & Resilience (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-490], [2_TAS-REQ-491], [2_TAS-REQ-492], [2_TAS-REQ-493], [2_TAS-REQ-494], [2_TAS-REQ-496], [2_TAS-REQ-497], [2_TAS-REQ-498]

## Dependencies
- depends_on: ["07_checkpoint_corruption_and_disk_resilience.md", "14_validation_and_limits.md", "15_error_handling_and_recovery.md"]
- shared_components: [devs-core (consumer — error types, state machines), devs-checkpoint (consumer — checkpoint version validation), devs-scheduler (consumer — cycle detection, duplicate submission, state transitions), devs-executor (consumer — output truncation, prompt file resolution)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/acceptance_tests.rs` and `crates/devs-checkpoint/tests/acceptance_tests.rs`.
- [ ] Write integration test `test_unsupported_checkpoint_schema_version`: create a `checkpoint.json` with `"schema_version": 2`. Start server. Assert ERROR log contains `"unsupported checkpoint schema version 2"`. Assert run marked `Unrecoverable`. Assert server continues loading other runs. Annotate `// Covers: 2_TAS-REQ-490, 2_TAS-REQ-492`.
- [ ] Write integration test `test_lazy_prompt_file_resolution`: create stage with `prompt_file = "outputs/plan.md"`. Submit workflow without creating the file. Assert validation passes at submit time. Start stage execution without file. Assert stage transitions to `Failed` with `PromptFileNotFound { path: "outputs/plan.md" }`. Assert no agent process spawned. Annotate `// Covers: 2_TAS-REQ-491`.
- [ ] Write integration test `test_cycle_detection_error_format`: create workflow definition with cycle A→B→A. Call `submit_run()`. Assert gRPC error is `INVALID_ARGUMENT`. Assert error detail contains `"cycle detected"` and array `["A", "B", "A"]`. Annotate `// Covers: 2_TAS-REQ-493`.
- [ ] Write integration test `test_illegal_transition_guard`: create `StageRun` in `Running` status. Call `transition(Running → Completed)`. Assert success. Call `transition(Completed → Running)`. Assert returns `TransitionError::IllegalTransition { from: Completed, to: Running }`. Assert status remains `Completed`. Annotate `// Covers: 2_TAS-REQ-494`.
- [ ] Write integration test `test_output_truncation_1_mib_limit`: create stage that produces 2 MiB of stdout. Assert `StageOutput.stdout` is truncated to last 1,048,576 bytes. Assert `StageOutput.truncated = true`. Assert WARN log contains original stdout length. Annotate `// Covers: 2_TAS-REQ-496`.
- [ ] Write integration test `test_disk_full_checkpoint_write_recovers`: mock filesystem to return `ENOSPC` on checkpoint write. Call `save_checkpoint()`. Assert server continues running with in-memory state intact. Assert next state transition attempts another checkpoint write. Assert server does NOT exit or crash. Annotate `// Covers: 2_TAS-REQ-497`.
- [ ] Write integration test `test_duplicate_run_name_rejected`: create active `WorkflowRun` with name `"test-run"` in project A. Submit another run with same name in same project. Assert error contains `"duplicate_run_name"` and `existing_run_id`. Assert new run NOT created. Annotate `// Covers: 2_TAS-REQ-498`.
- [ ] Write integration test `test_prompt_file_created_by_prior_stage`: create workflow with stage A writing to `outputs/plan.md`, stage B with `prompt_file = "outputs/plan.md"` depends_on A. Complete stage A. Assert stage B successfully resolves prompt file at execution time (not at submit time). Annotate `// Covers: 2_TAS-REQ-491`.

## 2. Task Implementation
- [ ] Implement checkpoint schema version validation in `crates/devs-checkpoint/src/restore.rs`:
  - Parse `checkpoint.json` and extract `schema_version` field.
  - If `schema_version != 1`: log ERROR with version and path, mark run `Unrecoverable`, skip to next run.
  - Do NOT attempt to interpret other fields if version mismatch.
- [ ] Implement lazy prompt file resolution in `crates/devs-executor/src/stage.rs`:
  - Do NOT check prompt file existence at workflow validation time.
  - Check prompt file existence at stage execution time (just before agent spawn).
  - If file missing: transition stage to `Failed` with `PromptFileNotFound { path }`, no agent spawned.
- [ ] Implement cycle detection error formatting in `crates/devs-scheduler/src/submission.rs`:
  - On cycle detected during `submit_run`: return gRPC `INVALID_ARGUMENT` status.
  - Error detail must contain `"cycle detected"` and the cycle path array (e.g., `["A", "B", "A"]`).
- [ ] Implement illegal transition guard in `crates/devs-core/src/state_machine.rs`:
  - For each state machine (WorkflowRunState, StageRunState), define valid transitions.
  - On invalid transition: return `TransitionError::IllegalTransition { from, to }`.
  - Leave state unchanged on error.
- [ ] Implement output truncation in `crates/devs-executor/src/artifacts.rs`:
  - Check stdout/stderr length against 1 MiB (1,048,576 bytes) limit.
  - If exceeded: keep last 1,048,576 bytes, set `truncated: true`.
  - Log WARN with original length and truncated length.
- [ ] Implement disk-full resilience in `crates/devs-checkpoint/src/save.rs`:
  - Catch `ErrorKind::StorageFull` (or `ENOSPC`) on checkpoint write.
  - Log ERROR with details, continue running with in-memory state.
  - Retry checkpoint on next state transition.
  - Do NOT exit or crash on disk-full error.
- [ ] Implement duplicate run name rejection in `crates/devs-scheduler/src/submission.rs`:
  - Under per-project mutex, check if run name already exists in active runs.
  - If duplicate: return error with `"duplicate_run_name"` and `existing_run_id`.
  - Do NOT create new run.
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify checkpoint schema version check does NOT interpret other fields on mismatch.
- [ ] Verify prompt file resolution happens at execution time, not submit time.
- [ ] Verify cycle detection error format matches gRPC spec (INVALID_ARGUMENT, detail contains cycle path).
- [ ] Verify illegal transition guard leaves state unchanged on error.
- [ ] Verify output truncation keeps last 1 MiB (not first 1 MiB).
- [ ] Verify disk-full error does not crash server — in-memory state preserved.
- [ ] Verify duplicate run name check is atomic (under per-project mutex).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- acceptance` and verify all tests pass.
- [ ] Run `cargo test -p devs-checkpoint -- acceptance` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to checkpoint version validation explaining supported versions.
- [ ] Document lazy prompt file resolution behavior (execution time vs submit time).
- [ ] Document cycle detection error format in submission API docs.
- [ ] Document state machine transition rules and illegal transition handling.
- [ ] Document output truncation limits and behavior.
- [ ] Document disk-full resilience strategy.
- [ ] Document duplicate run name rejection mechanism.
- [ ] Ensure `cargo doc -p devs-scheduler --no-deps` and `cargo doc -p devs-checkpoint --no-deps` build without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- acceptance --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo test -p devs-checkpoint -- acceptance --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- acceptance` and verify ≥ 90% line coverage for acceptance test code.
- [ ] Run `cargo tarpaulin -p devs-checkpoint --out json -- acceptance` and verify ≥ 90% line coverage for acceptance test code.
