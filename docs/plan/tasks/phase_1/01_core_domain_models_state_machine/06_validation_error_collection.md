# Task: Implement Validation Error Collection Framework (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [2_TAS-REQ-032]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Create test module `validation_tests` in `crates/devs-core/`
- [ ] Write `test_validation_collects_multiple_errors` that runs validation on a definition with 3 distinct errors and asserts all 3 are returned in the error list
- [ ] Write `test_validation_returns_errors_in_fixed_order` that introduces errors detectable at different validation stages and asserts the returned errors are ordered by validation phase (not random)
- [ ] Write `test_validation_no_partial_success` that provides input with both valid and invalid fields and asserts the result is `Err` (not a partial success)
- [ ] Write `test_validation_empty_errors_on_valid_input` that validates a correct definition and asserts `Ok(())`
- [ ] Write `test_validation_error_display` that asserts each validation error variant has a meaningful `Display` message

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/validation.rs`
- [ ] Define `ValidationError` enum with variants representing different validation failure types (e.g., `EmptyName`, `InvalidCharacters { field: String, value: String }`, `DuplicateStage { name: String }`, `CyclicDependency { cycle: Vec<String> }`, `MissingDependency { stage: String, missing: String }`, etc.)
- [ ] Implement `Display` and `std::error::Error` for `ValidationError`
- [ ] Define `ValidationResult = Result<(), Vec<ValidationError>>` type alias
- [ ] Implement a `ValidationCollector` struct with:
  - `new() -> Self`
  - `add_error(&mut self, error: ValidationError)`
  - `has_errors(&self) -> bool`
  - `into_result(self) -> ValidationResult` — returns `Ok(())` if empty, `Err(errors)` if non-empty
- [ ] Add `pub mod validation;` to `crates/devs-core/src/lib.rs`
- [ ] Add doc comments referencing [2_TAS-REQ-032]: "validation collects ALL errors before returning; partial-success is not permitted"

## 3. Code Review
- [ ] Verify `ValidationCollector` never short-circuits — it always collects all errors
- [ ] Verify `ValidationError` variants cover the major categories needed by workflow validation
- [ ] Verify no runtime dependencies added

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- validation` and verify all tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comments explaining the collect-all-errors-then-return pattern

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- validation --nocapture 2>&1 | tail -5` and confirm "test result: ok"
