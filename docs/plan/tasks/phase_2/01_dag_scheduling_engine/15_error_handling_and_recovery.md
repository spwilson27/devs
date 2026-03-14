# Task: Error Handling & Recovery (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-272], [2_TAS-REQ-273], [2_TAS-REQ-274], [2_TAS-REQ-499], [2_TAS-REQ-500], [2_TAS-REQ-501], [2_TAS-REQ-502], [2_TAS-REQ-503], [2_TAS-REQ-504]

Note: Some requirements ([2_TAS-REQ-501] through [2_TAS-REQ-504]) are also covered in task 14 (Validation & Limits) — this task focuses on the runtime error handling and recovery aspects.

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md", "02_parallel_stage_dispatch_engine.md"]
- shared_components: [devs-core (owner — error types), devs-checkpoint (consumer — checkpoint recovery), devs-scheduler (consumer — template resolution, slug generation)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/error_handling_tests.rs` and `crates/devs-checkpoint/tests/recovery_tests.rs`.
- [ ] Write unit test `test_template_error_fails_before_agent_spawn`: create stage with template `{{unknown_var}}`. Call `prepare_stage()`. Assert stage transitions to `Failed` without spawning agent process. Annotate `// Covers: 2_TAS-REQ-272`.
- [ ] Write unit test `test_template_unknown_variable_error`: create stage with template `{{stage.X.output.field}}` where X doesn't exist. Assert `TemplateResolver` returns `Err(TemplateError::UnknownVariable { expr: "stage.X.output.field" })`. Assert stage output contains error message. Annotate `// Covers: 2_TAS-REQ-274`.
- [ ] Write unit test `test_template_no_structured_output_error`: create stage with template `{{stage.X.output.field}}` where X used `exit_code` completion. Assert stage fails with `TemplateError::NoStructuredOutput` before agent spawn. Annotate `// Covers: 2_TAS-REQ-272`.
- [ ] Write unit test `test_slug_collision_atomic_check`: spawn two `submit_run` calls simultaneously with same run name for same project. Assert exactly one succeeds, other returns `ALREADY_EXISTS`. Assert no duplicate runs created. Use per-project mutex. Annotate `// Covers: 2_TAS-REQ-273`.
- [ ] Write unit test `test_missing_prompt_file_fails_without_agent_spawn`: create stage with `prompt_file = "outputs/plan.md"` that doesn't exist. Call `execute_stage()`. Assert stage transitions to `Failed` with `PromptFileNotFound` error, no agent spawned. Annotate `// Covers: 2_TAS-REQ-499`.
- [ ] Write unit test `test_missing_snapshot_partial_recovery`: create two runs, delete snapshot for one. Restart server. Assert run without snapshot: stages with template refs fail with `MissingSnapshot`, stages without template refs still execute. Annotate `// Covers: 2_TAS-REQ-500`.
- [ ] Write unit test `test_context_file_truncation`: create stage output that would exceed 10 MiB. Assert `stdout`/`stderr` truncated proportionally, `truncated: true` set, WARN log emitted. Annotate `// Covers: 2_TAS-REQ-502`.
- [ ] Write unit test `test_prohibited_env_key_rejected_at_validation`: create stage with `env = {"DEVS_LISTEN": "127.0.0.1:9000"}`. Assert validation returns `ValidationError::ProhibitedEnvKey`. Annotate `// Covers: 2_TAS-REQ-503`.
- [ ] Write unit test `test_snapshot_overwrite_rejected`: create `WorkflowRun` with `definition_snapshot` already set. Call `set_snapshot()` again. Assert `ImmutableSnapshotError` returned, original snapshot unchanged. Annotate `// Covers: 2_TAS-REQ-504`.
- [ ] Write integration test `test_corrupt_checkpoint_one_project_recovers_others`: create two projects, corrupt checkpoint for project A. Start server. Assert project B's runs recovered successfully, project A's runs marked `Unrecoverable` with ERROR logged. Annotate `// Covers: 2_TAS-REQ-500`.
- [ ] Write integration test `test_partial_checkpoint_recovery`: create run with corrupt `checkpoint.json` and another with valid checkpoint in same project. Start server. Assert valid run recovered, corrupt run marked `Unrecoverable`, both visible via `list_runs`. Annotate `// Covers: 2_TAS-REQ-500`.

## 2. Task Implementation
- [ ] Implement template error fail-fast in `crates/devs-scheduler/src/template.rs`:
  - `TemplateResolver::resolve(template: &str, context: &TemplateContext) -> Result<String, TemplateError>`.
  - Check all `{{variable}}` expressions before agent spawn.
  - Return `TemplateError::UnknownVariable { expr: String }` for unknowns.
  - Return `TemplateError::NoStructuredOutput` when referencing output from `exit_code` completion stage.
  - Stage transitions to `Failed` immediately on template error (no agent spawned).
- [ ] Implement atomic slug collision check in `crates/devs-scheduler/src/submission.rs`:
  - Per-project mutex (`Arc<Mutex<HashMap<ProjectId, Mutex<()>>>>`).
  - Acquire mutex before checking slug existence.
  - Check and create run under same mutex hold (no TOCTOU race).
  - Return `ALREADY_EXISTS` on collision.
- [ ] Implement missing prompt file handling in `crates/devs-executor/src/stage.rs`:
  - Check prompt file exists before spawning agent.
  - Return `PromptFileNotFound` error if missing.
  - Stage transitions to `Failed` without agent spawn.
- [ ] Implement missing snapshot recovery in `crates/devs-checkpoint/src/restore.rs`:
  - For each run, check `workflow_snapshot.json` exists.
  - If missing: mark run with `MissingSnapshot` error.
  - Stages without template refs can still execute.
  - Stages with template refs fail immediately.
- [ ] Implement context file size limit in `crates/devs-executor/src/artifacts.rs`:
  - Check total context file size ≤ 10 MiB.
  - If exceeded: truncate `stdout`/`stderr` proportionally.
  - Set `truncated: true` in stage output.
  - Log WARN with details.
- [ ] Implement prohibited env key check in `crates/devs-config/src/validation.rs`:
  - Reject any `DEVS_*` keys in stage env configuration.
  - Return `ValidationError::ProhibitedEnvKey`.
- [ ] Implement snapshot immutability in `crates/devs-scheduler/src/run.rs`:
  - Check `definition_snapshot.is_some()` before setting.
  - Return `ImmutableSnapshotError` if already set.
  - Leave existing snapshot unchanged.
- [ ] Define error types in `crates/devs-core/src/error.rs`:
  - `TemplateError::UnknownVariable { expr: String }`.
  - `TemplateError::NoStructuredOutput { stage: String }`.
  - `PromptFileNotFound { path: PathBuf }`.
  - `MissingSnapshot { run_id: String }`.
  - `ImmutableSnapshotError { run_id: String }`.
  - `ProhibitedEnvKey { key: String }`.
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify template errors fail before agent spawn (no wasted agent calls).
- [ ] Verify slug collision check is atomic (no TOCTOU race).
- [ ] Verify missing prompt file does not spawn agent.
- [ ] Verify missing snapshot allows partial recovery (stages without template refs).
- [ ] Verify context file truncation is proportional across fields.
- [ ] Verify snapshot immutability is enforced at API boundary.
- [ ] Verify per-project mutex does not cause deadlocks (consistent acquisition order).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- error_handling` and verify all tests pass.
- [ ] Run `cargo test -p devs-checkpoint -- recovery` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.
- [ ] Run `cargo clippy -p devs-checkpoint -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `TemplateResolver`, `TemplateError`, and all error types.
- [ ] Document the fail-fast behavior for template errors.
- [ ] Document the atomic slug collision check mechanism.
- [ ] Document the partial recovery behavior for missing snapshots.
- [ ] Ensure `cargo doc -p devs-scheduler --no-deps` and `cargo doc -p devs-checkpoint --no-deps` build without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- error_handling --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo test -p devs-checkpoint -- recovery --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- error_handling` and verify ≥ 90% line coverage.
- [ ] Run `cargo tarpaulin -p devs-checkpoint --out json -- recovery` and verify ≥ 90% line coverage.
