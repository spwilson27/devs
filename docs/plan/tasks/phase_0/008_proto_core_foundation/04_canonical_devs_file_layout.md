# Task: Define Canonical .devs/ File Layout Types in devs-core (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-016]

## Dependencies
- depends_on: [03_devs_core_domain_types.md]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Create `devs-core/tests/file_layout_test.rs` with tests:
  - `test_run_dir_path()`: Verify `DevsLayout::run_dir("run-123")` returns `.devs/runs/run-123/`
  - `test_workflow_snapshot_path()`: Verify `DevsLayout::workflow_snapshot("run-123")` returns `.devs/runs/run-123/workflow_snapshot.json`
  - `test_checkpoint_path()`: Verify `DevsLayout::checkpoint("run-123")` returns `.devs/runs/run-123/checkpoint.json`
  - `test_stage_attempt_dir()`: Verify `DevsLayout::stage_attempt_dir("run-123", "plan", 1)` returns `.devs/runs/run-123/stages/plan/attempt_1/`
  - `test_structured_output_path()`: Verify `DevsLayout::structured_output("run-123", "plan", 1)` returns `.devs/runs/run-123/stages/plan/attempt_1/structured_output.json`
  - `test_context_path()`: Verify `DevsLayout::context("run-123", "plan", 1)` returns `.devs/runs/run-123/stages/plan/attempt_1/context.json`
  - `test_log_dir()`: Verify `DevsLayout::log_dir("run-123", "plan", 1)` returns `.devs/logs/run-123/plan/attempt_1/`
  - `test_stdout_log_path()`: Verify `DevsLayout::stdout_log("run-123", "plan", 1)` returns `.devs/logs/run-123/plan/attempt_1/stdout.log`
  - `test_stderr_log_path()`: Verify `DevsLayout::stderr_log("run-123", "plan", 1)` returns `.devs/logs/run-123/plan/attempt_1/stderr.log`
  - `test_paths_relative_to_project_root()`: All paths returned are relative (no leading `/`)
  - `test_attempt_number_zero_rejected()`: Attempt number 0 returns an error (attempts are 1-indexed)

## 2. Task Implementation
- [ ] Create `devs-core/src/layout.rs` implementing:
  - `pub struct DevsLayout;` — stateless utility struct providing path construction
  - All methods return `PathBuf` (relative to project root):
    - `pub fn run_dir(run_id: &str) -> PathBuf`
    - `pub fn workflow_snapshot(run_id: &str) -> PathBuf`
    - `pub fn checkpoint(run_id: &str) -> PathBuf`
    - `pub fn stage_attempt_dir(run_id: &str, stage_name: &str, attempt: u32) -> PathBuf`
    - `pub fn structured_output(run_id: &str, stage_name: &str, attempt: u32) -> PathBuf`
    - `pub fn context(run_id: &str, stage_name: &str, attempt: u32) -> PathBuf`
    - `pub fn log_dir(run_id: &str, stage_name: &str, attempt: u32) -> PathBuf`
    - `pub fn stdout_log(run_id: &str, stage_name: &str, attempt: u32) -> PathBuf`
    - `pub fn stderr_log(run_id: &str, stage_name: &str, attempt: u32) -> PathBuf`
  - All paths follow the canonical layout from REQ-016 exactly:
    ```
    .devs/
      runs/<run-id>/
        workflow_snapshot.json
        checkpoint.json
        stages/<stage-name>/attempt_<N>/
          structured_output.json
          context.json
      logs/<run-id>/<stage-name>/attempt_<N>/
        stdout.log
        stderr.log
    ```
- [ ] Re-export `DevsLayout` from `devs-core/src/lib.rs`

## 3. Code Review
- [ ] Verify all paths exactly match the canonical layout in REQ-016
- [ ] Verify paths are relative (no absolute path construction)
- [ ] Verify path separators use `PathBuf` (cross-platform compatible)
- [ ] Verify no `unwrap()` or `panic!()` in path construction (except attempt=0 validation)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test file_layout_test` and verify all tests pass

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-016` annotation to all file layout test functions
- [ ] Add doc comments to `DevsLayout` struct and all public methods referencing the canonical layout

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-016' devs-core/tests/` and confirm matches
