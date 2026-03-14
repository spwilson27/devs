# Task: Implement Structured Output Completion Handler (Sub-Epic: 02_Stage Execution & Completion)

## Covered Requirements
- [1_PRD-REQ-011], [2_TAS-REQ-091]
- [9_PROJECT_ROADMAP-REQ-080]: `.devs_output.json` with `"success": true` (boolean) → `Completed`
- [9_PROJECT_ROADMAP-REQ-081]: `.devs_output.json` with `"success": false` (boolean) → `Failed`
- [9_PROJECT_ROADMAP-REQ-082]: `.devs_output.json` with `"success": "true"` (string) → `Failed` — string NOT accepted
- [9_PROJECT_ROADMAP-REQ-083]: `.devs_output.json` with `"success"` field absent → `Failed`
- [9_PROJECT_ROADMAP-REQ-084]: `.devs_output.json` with invalid JSON → `Failed`
- [9_PROJECT_ROADMAP-REQ-085]: `.devs_output.json` absent, stdout last line valid JSON with `"success": bool` → use stdout
- [9_PROJECT_ROADMAP-REQ-086]: `.devs_output.json` absent, stdout no valid JSON → `Failed`
- [9_PROJECT_ROADMAP-REQ-087]: `.devs_output.json` takes strict priority over stdout JSON; sources not merged

## Dependencies
- depends_on: ["01_completion_signal_types_and_exit_code_handler.md"]
- shared_components: ["devs-scheduler (Owner context — completion module)"]

## 1. Initial Test Written
- [ ] In `crates/devs-scheduler/src/completion/structured_output.rs`, create test module `tests`.
- [ ] Write `test_structured_output_from_file` — create a temp dir, write `{ "success": true, "data": { "version": "1.0" } }` to `.devs_output.json`, call the structured output handler with this working directory and a `ProcessOutput { exit_code: 0, stdout: "", .. }`. Assert `CompletionResult::Success` with `structured_output` containing the parsed JSON and `exit_code: 0`.
- [ ] Write `test_structured_output_from_stdout_last_line` — no `.devs_output.json` file exists; `ProcessOutput.stdout` ends with `\n{"success": true}\n`. Assert `CompletionResult::Success` with parsed JSON.
- [ ] Write `test_file_takes_priority_over_stdout` — both `.devs_output.json` exists (with `{"success": true, "source": "file"}`) and stdout has JSON (`{"success": true, "source": "stdout"}`). Assert the result's structured_output `source` field is `"file"`.
- [ ] Write `test_structured_output_success_false_is_failure` — JSON has `"success": false`. Assert `CompletionResult::Failed`.
- [ ] Write `test_structured_output_missing_success_field_is_failure` — JSON has no `"success"` key. Assert `CompletionResult::Failed` with error message mentioning missing `success` field.
- [ ] Write `test_structured_output_invalid_json_is_failure` — stdout contains non-JSON text, no file. Assert `CompletionResult::Failed`.
- [ ] Write `test_exit_code_always_recorded` — structured output with exit_code=42 and `"success": true`. Assert result has `exit_code: 42` (success is determined by the JSON `success` field, not exit code, but exit code is still recorded).

## 2. Task Implementation
- [ ] Implement `resolve_structured_output(working_dir: &Path, output: &ProcessOutput) -> CompletionResult` in `structured_output.rs`.
- [ ] Check for `.devs_output.json` in `working_dir` first. If it exists and is valid JSON, use it. If it exists but is invalid JSON, return `Failed` with parse error.
- [ ] If no file, attempt to parse the last non-empty line of `stdout` as JSON.
- [ ] If neither source provides valid JSON, return `Failed`.
- [ ] For valid JSON: require a top-level `"success"` field that is a boolean. `true` → `Success`, `false` → `Failed`. Missing or non-boolean `"success"` → `Failed` with descriptive error.
- [ ] Always set `exit_code` from `ProcessOutput.exit_code`.
- [ ] Wire this handler into `resolve_completion` for `CompletionSignal::StructuredOutput`.

## 3. Code Review
- [ ] Verify file I/O uses `std::fs::read_to_string` (not async) since this runs in the scheduler's blocking context or is called from sync code wrapped in `spawn_blocking`.
- [ ] Verify JSON parsing uses `serde_json::from_str` with proper error handling.
- [ ] Verify no path traversal vulnerability — `.devs_output.json` is always resolved relative to the provided `working_dir`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- structured_output` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-011` and `// Covers: 2_TAS-REQ-091` annotations to test functions.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- structured_output --no-fail-fast 2>&1 | tail -20` and verify 0 failures.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify 0 warnings.
