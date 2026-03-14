# Task: Stage Completion Signal Processing & Exit Code Recording (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [2_TAS-BR-015]: `exit_code` always recorded; SIGKILL → `-9`; timeout race → `null` until process exits
- [9_PROJECT_ROADMAP-REQ-080]: `.devs_output.json` exists, `"success": true` (boolean) → `Completed`
- [9_PROJECT_ROADMAP-REQ-081]: `.devs_output.json` exists, `"success": false` (boolean) → `Failed`
- [9_PROJECT_ROADMAP-REQ-082]: `.devs_output.json` exists, `"success": "true"` (string) → `Failed` — string `"true"` is NOT accepted
- [9_PROJECT_ROADMAP-REQ-083]: `.devs_output.json` exists, `"success"` field absent → `Failed`
- [9_PROJECT_ROADMAP-REQ-084]: `.devs_output.json` exists, invalid JSON → `Failed`
- [9_PROJECT_ROADMAP-REQ-085]: `.devs_output.json` absent, stdout last line is valid JSON with `"success": bool` → Use stdout JSON per rules above
- [9_PROJECT_ROADMAP-REQ-086]: `.devs_output.json` absent, stdout has no valid JSON object → `Failed`
- [9_PROJECT_ROADMAP-REQ-087]: `.devs_output.json` takes strict priority over stdout JSON. If file is present but contains invalid JSON, stage MUST be `Failed` even if stdout contains valid `"success": true`. The two sources are not merged.
- [9_PROJECT_ROADMAP-REQ-088]: `signal_completion` called on a stage already in a terminal state (`Completed`, `Failed`, `TimedOut`, `Cancelled`) MUST return error `"failed_precondition: stage is already in a terminal state"` and MUST NOT change any state.

## Dependencies
- depends_on: ["02_parallel_stage_dispatch_engine.md"]
- shared_components: [devs-core (consumer — StageRunState enum, state machine transitions), devs-executor (consumer — ProcessOutput with exit code), devs-adapters (consumer — agent process output)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/src/completion.rs` and `crates/devs-scheduler/tests/completion_tests.rs`.
- [ ] Write unit test `test_exit_code_always_recorded_on_success`: stage completes with exit code 0 via `exit_code` mechanism. Assert `StageRun.exit_code == Some(0)`. Annotate `// Covers: 2_TAS-BR-015`.
- [ ] Write unit test `test_exit_code_always_recorded_on_failure`: stage fails with exit code 1. Assert `StageRun.exit_code == Some(1)`.
- [ ] Write unit test `test_exit_code_recorded_with_structured_output`: stage uses `structured_output` completion with exit code 0 and valid `.devs_output.json`. Assert `StageRun.exit_code == Some(0)` — exit code recorded regardless of completion mechanism. Annotate `// Covers: 2_TAS-BR-015`.
- [ ] Write unit test `test_exit_code_sigkill_maps_to_neg9`: process killed by SIGKILL (signal 9). Assert `StageRun.exit_code == Some(-9)`. Annotate `// Covers: 2_TAS-BR-015`.
- [ ] Write unit test `test_exit_code_timeout_race_null_until_exit`: stage times out but process hasn't exited yet. Assert `StageRun.exit_code == None` until process exits, then assert it is populated. Annotate `// Covers: 2_TAS-BR-015`.
- [ ] Write unit test `test_structured_output_file_success_true`: create `.devs_output.json` with `{"success": true}`. Assert stage outcome is `Completed`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-080`.
- [ ] Write unit test `test_structured_output_file_success_false`: `.devs_output.json` with `{"success": false}`. Assert outcome is `Failed`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-081`.
- [ ] Write unit test `test_structured_output_string_true_rejected`: `.devs_output.json` with `{"success": "true"}`. Assert outcome is `Failed` — string not accepted. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-082`.
- [ ] Write unit test `test_structured_output_success_field_absent`: `.devs_output.json` with `{"result": "ok"}` (no `success` field). Assert outcome is `Failed`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-083`.
- [ ] Write unit test `test_structured_output_invalid_json`: `.devs_output.json` with `{invalid json`. Assert outcome is `Failed`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-084`.
- [ ] Write unit test `test_stdout_fallback_when_file_absent`: no `.devs_output.json`, stdout last line is `{"success": true}`. Assert outcome is `Completed`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-085`.
- [ ] Write unit test `test_stdout_no_valid_json_failed`: no `.devs_output.json`, stdout has no valid JSON object on last line. Assert outcome is `Failed`. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-086`.
- [ ] Write unit test `test_file_priority_over_stdout`: `.devs_output.json` exists with invalid JSON, stdout has `{"success": true}`. Assert outcome is `Failed` — file takes strict priority, sources not merged. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-087`.
- [ ] Write unit test `test_signal_completion_on_terminal_state_rejected`: stage is in `Completed` state. Call `signal_completion`. Assert returns error containing `"failed_precondition: stage is already in a terminal state"`. Assert state unchanged. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-088`.
- [ ] Write unit test `test_signal_completion_on_failed_state_rejected`: same test but stage is in `Failed` state. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-088`.
- [ ] Write unit test `test_signal_completion_on_timed_out_rejected`: stage is in `TimedOut` state. Assert same error. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-088`.
- [ ] Write unit test `test_signal_completion_on_cancelled_rejected`: stage is in `Cancelled` state. Assert same error. Annotate `// Covers: 9_PROJECT_ROADMAP-REQ-088`.

## 2. Task Implementation
- [ ] Define `CompletionProcessor` struct in `crates/devs-scheduler/src/completion.rs` encapsulating completion signal evaluation logic.
- [ ] Implement `CompletionProcessor::evaluate_exit_code(output: &ProcessOutput) -> StageOutcome`:
  - Map exit code 0 → `Completed`, non-zero → `Failed`.
  - On SIGKILL (signal 9 on Unix), record exit code as `-9`.
- [ ] Implement `CompletionProcessor::evaluate_structured_output(working_dir: &Path, stdout: &str) -> StageOutcome`:
  - Check for `.devs_output.json` in `working_dir`. If present:
    - Parse as JSON. If invalid JSON → `Failed`.
    - Check for `"success"` field. If absent → `Failed`.
    - Check `"success"` is a boolean `true` → `Completed`. Boolean `false` → `Failed`.
    - String `"true"` or any non-boolean value → `Failed`.
  - If `.devs_output.json` absent, fall back to stdout:
    - Parse last non-empty line of stdout as JSON.
    - Apply same `"success"` boolean rules.
    - If no valid JSON object on last line → `Failed`.
- [ ] Implement `CompletionProcessor::evaluate_mcp_signal(result: &CompletionResult) -> StageOutcome` for MCP tool call completion.
- [ ] Implement `CompletionProcessor::record_exit_code(stage_run: &mut StageRun, output: &ProcessOutput)`:
  - Always populate `stage_run.exit_code` from process output regardless of completion mechanism.
  - If process was killed by signal, map signal number to negative exit code.
  - If timeout race (process not yet exited), set `exit_code = None`; update when process exits.
- [ ] Implement `signal_completion(run_id: &RunId, stage: &str, result: CompletionResult) -> Result<(), SchedulerError>`:
  - Acquire per-run mutex.
  - Check if stage is in terminal state (`Completed`, `Failed`, `TimedOut`, `Cancelled`).
  - If terminal, return `Err(SchedulerError::FailedPrecondition("stage is already in a terminal state"))`.
  - Otherwise, process the completion result and transition state.
- [ ] Define `StageOutcome` enum: `Completed { output: Option<serde_json::Value> }`, `Failed { reason: String }`.

## 3. Code Review
- [ ] Verify `.devs_output.json` file is checked BEFORE stdout — strict priority rule enforced.
- [ ] Verify string `"true"` is explicitly rejected as a non-boolean type.
- [ ] Verify exit code is recorded in ALL code paths (exit_code, structured_output, mcp_tool_call).
- [ ] Verify signal_completion terminal state check is atomic with state transition (under per-run mutex).
- [ ] Verify no `unwrap()` calls on JSON parsing — all errors produce `Failed` outcome.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- completion` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `CompletionProcessor`, `evaluate_structured_output`, `signal_completion`, and `StageOutcome`.
- [ ] Document the `.devs_output.json` priority rules in the module-level doc comment.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- completion --format=json 2>&1 | grep '"passed"'` and confirm all test cases passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- completion` and verify ≥ 90% line coverage for `completion.rs`.
