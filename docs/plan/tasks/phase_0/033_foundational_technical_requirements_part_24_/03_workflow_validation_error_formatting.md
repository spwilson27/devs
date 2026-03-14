# Task: Workflow Validation Single-Pass Error Collection and JSON Formatting (Sub-Epic: 033_Foundational Technical Requirements (Part 24))

## Covered Requirements
- [2_TAS-REQ-086D]

## Dependencies
- depends_on: [02_grpc_error_handling_mapping.md]
- shared_components: [devs-core (consumer — uses DevsError::InputValidation variant defined in task 02)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/tests/validation_error_format.rs`, write the following tests. All annotated with `// Covers: 2_TAS-REQ-086D`.
- [ ] `test_single_validation_error_formats_as_json_array`: create `DevsError::InputValidation { errors: vec!["stage 'foo': prompt and prompt_file are mutually exclusive".into()] }`. Convert to `tonic::Status`. Assert `status.code() == Code::InvalidArgument`. Parse the message: assert it starts with `"input validation: "`. Extract the substring after `"input validation: "`, parse it as a JSON array with `serde_json::from_str::<Vec<String>>()`, and assert it equals `vec!["stage 'foo': prompt and prompt_file are mutually exclusive"]`.
- [ ] `test_multiple_validation_errors_collected_in_single_pass`: create `DevsError::InputValidation { errors: vec!["stage 'foo': prompt and prompt_file are mutually exclusive".into(), "stage 'bar': pool 'missing-pool' not found".into(), "input 'count': expected Integer, got String".into()] }`. Convert to `tonic::Status`. Parse the JSON array from the message detail. Assert the array has exactly 3 elements matching the input strings.
- [ ] `test_empty_validation_errors_still_returns_invalid_argument`: create `DevsError::InputValidation { errors: vec![] }`. Convert to status. Assert `Code::InvalidArgument`. Assert the JSON array in the message is `[]`.
- [ ] `test_validation_error_json_handles_special_characters`: create a validation error containing strings with quotes, backslashes, and unicode: `vec!["field \"name\" has \\invalid\\ chars".into(), "stage 'über': missing pool".into()]`. Convert to status. Parse the JSON array — it must round-trip correctly through `serde_json`.
- [ ] `test_validation_error_message_prefix_is_machine_stable`: for any `InputValidation` variant, assert `error.error_kind() == "input validation"`. Assert the full message starts with exactly `"input validation: "` (lowercase, no trailing spaces except the one after colon).
- [ ] `test_validation_error_detail_is_valid_json`: for any `InputValidation` variant, extract everything after `"input validation: "` and assert `serde_json::from_str::<serde_json::Value>()` succeeds and the result `.is_array()`.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/error.rs`, ensure the `DevsError::InputValidation { errors: Vec<String> }` variant's `Display` implementation formats as: `"input validation: {json_array}"` where `json_array` is produced by `serde_json::to_string(&self.errors).unwrap()`. This serializes the `Vec<String>` as a JSON array string like `["error1","error2"]`.
- [ ] Add `serde_json` as a dependency of `devs-core` (if not already present) for this serialization.
- [ ] Implement a `pub fn collect_validation_errors(errors: Vec<String>) -> DevsError` convenience constructor that returns `DevsError::InputValidation { errors }`. This is the canonical way to create multi-error validation failures.
- [ ] Ensure the `From<DevsError> for tonic::Status` (or equivalent) maps `InputValidation` to `Code::InvalidArgument` with the formatted message.
- [ ] Add a standalone validation helper function `pub fn validate_workflow_inputs(inputs: &[WorkflowInputDef], provided: &HashMap<String, serde_json::Value>) -> Result<(), DevsError>` in `devs-core` that collects all input validation errors (missing required inputs, type mismatches) into a single `InputValidation` error. This demonstrates the single-pass collection pattern.

## 3. Code Review
- [ ] Verify the JSON array is produced by `serde_json::to_string`, not hand-rolled string concatenation — this ensures proper escaping of quotes, backslashes, and unicode.
- [ ] Verify the prefix is exactly `"input validation: "` — lowercase, single space after colon.
- [ ] Verify that downstream code (workflow validation, input validation) always collects all errors before returning, never short-circuits on the first error.
- [ ] Verify `serde_json` is the only new dependency added to `devs-core` and it does not pull in heavy optional features.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` — all validation error formatting tests must pass.
- [ ] Run `cargo test -p devs-core -- validation_error` to target just these tests.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-086D` traceability annotations to all test functions.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no lint errors.
- [ ] Run `./do test` and confirm all tests pass.
