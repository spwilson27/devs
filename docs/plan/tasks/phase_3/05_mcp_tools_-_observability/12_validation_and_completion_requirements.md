# Task: Implement validation and completion mechanism requirements (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_PRD-BR-013], [3_PRD-BR-015], [3_PRD-BR-017]

## Dependencies
- depends_on: ["04_get_stage_output_tool.md"]
- shared_components: ["devs-core (consumer)", "devs-scheduler (consumer)", "devs-executor (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/validation/env_var_test.rs`:
  - `test_env_var_key_valid_uppercase_underscore`: validate key `API_KEY`, assert passes validation
  - `test_env_var_key_valid_with_numbers`: validate key `PORT_8080`, assert passes
  - `test_env_var_key_leading_digit_rejected`: validate key `1PORT`, assert validation error (must start with letter or underscore)
  - `test_env_var_key_lowercase_rejected`: validate key `api_key`, assert validation error (lowercase not allowed)
  - `test_env_var_key_special_chars_rejected`: validate key `API-KEY`, assert validation error (hyphen not allowed)
  - `test_env_var_key_too_long_rejected`: validate key with 130 characters, assert validation error (max 128 chars after first)
  - `test_env_var_key_empty_rejected`: validate empty string, assert error

- [ ] In `crates/devs-executor/tests/stage_completion_test.rs`:
  - `test_structured_output_file_takes_precedence_over_stdout`: agent writes valid JSON to `.devs_output.json` and different JSON to stdout, assert parsed output matches file content, not stdout
  - `test_structured_output_invalid_json_in_file_fails_stage`: agent writes invalid JSON to `.devs_output.json` with exit code 0, assert stage marked Failed regardless of exit code
  - `test_structured_output_no_file_uses_stdout`: agent does not write `.devs_output.json` but writes valid JSON to stdout, assert stdout is parsed
  - `test_exit_code_always_recorded_in_stage_run`: stage completes with exit code 1, assert `StageRun.exit_code` is `Some(1)`, never null for terminal stages
  - `test_exit_code_null_only_for_non_terminal_stages`: stage in `Waiting` or `Running` status, assert `exit_code` is `null`; after completion, assert it is always populated

## 2. Task Implementation
- [ ] In `crates/devs-core/src/validation/mod.rs`, implement environment variable key validation:
  - Function `validate_env_var_key(key: &str) -> Result<(), ValidationError>` 
  - Regex pattern: `^[A-Z_][A-Z0-9_]{0,127}$`
  - Return structured error with the offending key in the message
- [ ] In `crates/devs-core/src/stage_completion.rs`, implement structured output precedence logic:
  - Check for `.devs_output.json` file first
  - If file exists, parse it; on parse error, return `CompletionError::InvalidStructuredOutput`
  - If file does not exist, fall back to stdout parsing
  - Mark stage Failed if file exists but JSON is invalid (regardless of exit code)
- [ ] In `crates/devs-core/src/domain/stage_run.rs`, ensure `exit_code` field handling:
  - `exit_code: Option<i32>` — null only for `Waiting` and `Running` states
  - On any terminal transition (Completed, Failed, Cancelled), ensure `exit_code` is populated
  - For Cancelled stages, set `exit_code` to a sentinel value (e.g., -1) or the last known exit code if available
- [ ] Update stage completion handlers in `devs-executor` to always capture and record exit codes

## 3. Code Review
- [ ] Verify regex pattern matches the spec exactly: `[A-Z_][A-Z0-9_]{0,127}`
- [ ] Verify structured output file parsing errors include the JSON parse error details
- [ ] Verify exit code is never null for terminal stages (add assertion if needed)
- [ ] Verify validation errors are collected and reported together, not one at a time

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- validation` and confirm all pass
- [ ] Run `cargo test -p devs-executor -- completion` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments to `validate_env_var_key` describing the pattern
- [ ] Add doc comments to structured output handling describing precedence rules

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
