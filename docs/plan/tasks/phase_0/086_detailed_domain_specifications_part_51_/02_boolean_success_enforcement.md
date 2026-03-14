# Task: Reject String "true" in Structured Output Success Field (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-506]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer — uses stage completion parsing types)]

## 1. Initial Test Written
- [ ] In the structured output parsing module (e.g., `crates/devs-core/src/completion/tests.rs`), create `test_string_true_success_field_fails_stage`:
  - Construct a `.devs_output.json` payload: `{"success": "true", "data": {}}`.
  - Parse it through the structured output parser.
  - Assert the result transitions the stage to `Failed` with an error indicating `success` must be a boolean, not a string.
- [ ] Create `test_boolean_true_success_field_succeeds`:
  - Payload: `{"success": true, "data": {}}`.
  - Assert the stage transitions to `Completed`.
- [ ] Create `test_string_false_success_field_fails_stage`:
  - Payload: `{"success": "false", "data": {}}`.
  - Assert the stage transitions to `Failed` (same enforcement — string not boolean).
- [ ] Create `test_boolean_false_success_field_marks_failed`:
  - Payload: `{"success": false, "data": {}}`.
  - Assert the stage transitions to `Failed` (valid boolean, but value is false).

## 2. Task Implementation
- [ ] In the structured output parser, when extracting the `success` field from `.devs_output.json`, use strict JSON type checking: if `serde_json::Value::is_string()` is true for the `success` field, return an error / mark stage as `Failed` with a message like `"'success' field must be a JSON boolean, got string"`.
- [ ] Only accept `Value::Bool(true)` as success. `Value::Bool(false)` is a valid parse but marks stage as failed. Any other type for `success` is a parse error → stage `Failed`.

## 3. Code Review
- [ ] Verify strict type checking — no implicit coercion from `"true"` string to boolean.
- [ ] Verify error message is clear and actionable for the user.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- success` and confirm all four tests pass.

## 5. Update Documentation
- [ ] Add doc comment on the success field parsing logic referencing [2_TAS-REQ-506].

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep for `test_string_true_success_field_fails_stage` in output.
