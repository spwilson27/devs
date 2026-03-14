# Task: Checkpoint JSON Validation Function Implementation (Sub-Epic: 16_Risk 003 Verification)

## Covered Requirements
- [AC-RISK-003-02], [MIT-003]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test file at `devs-checkpoint/src/checkpoint_validation_tests.rs` (or inline in the module).
- [ ] Write a test that provides a `checkpoint.json` string with invalid JSON syntax (e.g., missing closing brace, trailing comma).
- [ ] Assert that `validate_checkpoint()` returns an `Err(CheckpointError::ParseError(...))`.
- [ ] Write a test that provides valid JSON but with `schema_version: 2` (unknown version).
- [ ] Assert that validation returns `Err(CheckpointError::UnknownSchemaVersion(2))`.
- [ ] Write a test that provides valid JSON missing required fields (e.g., no `run_id` field).
- [ ] Assert that validation returns an appropriate error for missing fields.
- [ ] Write a test with deeply nested JSON (depth > 128) to verify depth limit enforcement.
- [ ] Assert that validation returns `Err(CheckpointError::DepthExceeded)`.

## 2. Task Implementation
- [ ] Create a `validate_checkpoint(data: &str) -> Result<CheckpointRecord, CheckpointError>` function in `devs-checkpoint`.
- [ ] Define a `CheckpointError` enum with variants: `ParseError(String)`, `MissingField(&'static str)`, `UnknownSchemaVersion(u64)`, `DepthExceeded`, `DeserializeError(String)`.
- [ ] Implement JSON parsing using `serde_json::from_str(data)` to get a `serde_json::Value`.
- [ ] Implement a `json_depth(&serde_json::Value) -> usize` helper function that recursively calculates nesting depth.
- [ ] Add depth check: if `json_depth(&raw) > 128`, return `Err(CheckpointError::DepthExceeded)`.
- [ ] Extract and validate `schema_version` field equals `1`.
- [ ] Use `serde_json::from_value` to deserialize into `CheckpointRecord` struct.
- [ ] Ensure all error paths preserve the original error message for debugging.

## 3. Code Review
- [ ] Verify that the validation function is pure (no side effects, deterministic).
- [ ] Ensure error messages are informative for debugging corrupted checkpoints.
- [ ] Check that the depth limit prevents stack overflow from maliciously crafted JSON.
- [ ] Confirm that the function handles empty strings and null values gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint checkpoint_validation` and ensure all validation tests pass.
- [ ] Run `cargo test -p devs-checkpoint` to verify no regressions in other checkpoint functionality.

## 5. Update Documentation
- [ ] Add doc comments to `validate_checkpoint` explaining the validation algorithm.
- [ ] Document the `CheckpointError` enum variants and when each is returned.
- [ ] Note the depth limit of 128 as a security measure against stack overflow.

## 6. Automated Verification
- [ ] Run `./do test` and verify the tests are traced to `AC-RISK-003-02` and `MIT-003`.
- [ ] Confirm `target/traceability.json` shows coverage for both requirements.
