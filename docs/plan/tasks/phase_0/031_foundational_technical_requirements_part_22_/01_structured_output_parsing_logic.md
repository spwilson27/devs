# Task: Structured Output File Parsing and Status Resolution (Sub-Epic: 031_Foundational Technical Requirements (Part 22))

## Covered Requirements
- [2_TAS-REQ-024A], [2_TAS-REQ-024B], [2_TAS-REQ-024C]

## Dependencies
- depends_on: []
- shared_components: ["devs-core (consumer — uses domain types like StageStatus)"]

## 1. Initial Test Written
- [ ] Create a test module `tests/structured_output_parsing.rs` (or in the appropriate crate's unit test module) with the following test cases, all written before any implementation:
  1. **`test_devs_output_json_valid_success_true`**: Given a `.devs_output.json` file containing `{"success": true, "output": {"key": "val"}, "message": "ok"}`, assert stage resolves to `StageStatus::Completed` and `output.structured` equals the parsed JSON object.
  2. **`test_devs_output_json_valid_success_false`**: Given `.devs_output.json` with `{"success": false, "message": "failed"}`, assert stage resolves to `StageStatus::Failed` and `output.structured` equals the parsed JSON.
  3. **`test_devs_output_json_invalid_json`**: Given `.devs_output.json` containing `{not valid json`, assert stage resolves to `StageStatus::Failed` and `output.structured` is `None`.
  4. **`test_devs_output_json_absent_stdout_valid_success_true`**: No `.devs_output.json`; stdout ends with `{"success": true, "data": 42}`. Assert `StageStatus::Completed` and `output.structured` equals parsed JSON from stdout.
  5. **`test_devs_output_json_absent_stdout_valid_success_false`**: No `.devs_output.json`; stdout ends with `{"success": false}`. Assert `StageStatus::Failed` and `output.structured` equals parsed JSON.
  6. **`test_devs_output_json_absent_stdout_no_json`**: No `.devs_output.json`; stdout is `"hello world\n"`. Assert `StageStatus::Failed` and `output.structured` is `None`.
  7. **`test_devs_output_json_success_string_not_bool`**: `.devs_output.json` contains `{"success": "true"}`. Assert `StageStatus::Failed` — string `"true"` is not a valid boolean per [2_TAS-REQ-024C].
  8. **`test_devs_output_json_precedence_over_stdout`**: Both `.devs_output.json` (with `success: true`) and stdout trailing JSON (with `success: false`) exist. Assert the file takes absolute precedence: `StageStatus::Completed`.
  9. **`test_devs_output_json_success_missing_key`**: `.devs_output.json` is valid JSON `{"output": {}}` but lacks `"success"` key. Assert `StageStatus::Failed`.
  10. **`test_stdout_trailing_json_extraction`**: Stdout is `"some log output\n{\"success\": true}\n"`. Assert the trailing JSON object is correctly extracted and parsed.

## 2. Task Implementation
- [ ] Define a `StructuredOutputResult` struct with fields: `status: StageStatus`, `structured: Option<serde_json::Value>`.
- [ ] Implement a function `resolve_structured_output(working_dir: &Path, stdout: &str) -> StructuredOutputResult` that:
  1. Checks if `working_dir/.devs_output.json` exists. If yes, reads and parses it. If the file exists, it takes **absolute precedence** over stdout ([2_TAS-REQ-024A]).
  2. If the file does not exist, attempts to extract a trailing JSON object from `stdout` (scan backwards for the last `{...}` block).
  3. Applies the parsing rules table from [2_TAS-REQ-024B]: valid JSON with boolean `success: true` → Completed; `success: false` → Failed; invalid JSON or missing file+stdout → Failed with `structured = None`.
  4. Enforces [2_TAS-REQ-024C]: the `"success"` key must be a JSON boolean (`serde_json::Value::Bool`). If it is a string, number, or any other type, treat as Failed.
- [ ] Add `// Covers: 2_TAS-REQ-024A`, `// Covers: 2_TAS-REQ-024B`, `// Covers: 2_TAS-REQ-024C` annotations to the respective test functions.

## 3. Code Review
- [ ] Verify no `unwrap()` or `expect()` on file I/O — all errors are handled gracefully and result in `Failed` status.
- [ ] Verify the trailing JSON extraction from stdout is robust: handles multiple JSON objects (picks the last one), handles JSON embedded in log noise.
- [ ] Verify the `success` field type check is strict: only `serde_json::Value::Bool(true)` yields Completed.
- [ ] Verify the function is pure (takes `&Path` and `&str`, no side effects beyond file read) and easily testable.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test structured_output_parsing` and confirm all 10 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `resolve_structured_output` explaining the precedence rules and the parsing table.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new tests appear in output and pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-024A`, `// Covers: 2_TAS-REQ-024B`, `// Covers: 2_TAS-REQ-024C` and confirm each annotation exists at least once.
