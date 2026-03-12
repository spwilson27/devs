# Task: Domain Validation Limits (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-507], [2_TAS-REQ-508], [2_TAS-REQ-509]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-config/src/workflow/validation_tests.rs` (or similar) that attempts to validate a `FanOutConfig` with `count = 0`. Verify that the validation returns `ValidationError::FanOutLimitError`.
- [ ] Write a unit test in `devs-config/src/workflow/validation_tests.rs` (or similar) that attempts to validate a `RetryConfig` with `max_attempts = 21`. Verify that the validation returns `ValidationError::InvalidRetryCount`.
- [ ] Write a unit test in `devs-config/src/project/registry_tests.rs` (or similar) that attempts to register a `Project` with `weight = 0`. Verify that the registration returns `ValidationError::InvalidWeight`.

## 2. Task Implementation
- [ ] In `devs-config/src/workflow/validation.rs` (or `devs-core/src/domain/validation.rs` if common logic), implement a validation rule for `FanOutConfig`. If `count == 0`, return `ValidationError::FanOutLimitError`.
- [ ] In the same validation logic, implement a check for `RetryConfig.max_attempts`. If `max_attempts > 20`, return `ValidationError::InvalidRetryCount`.
- [ ] In `devs-config/src/project/registry.rs`, update the project registration logic to enforce `weight > 0`. If `weight == 0`, return `ValidationError::InvalidWeight`.
- [ ] Ensure the necessary `ValidationError` variants (`FanOutLimitError`, `InvalidRetryCount`, `InvalidWeight`) are defined in the relevant error enum.

## 3. Code Review
- [ ] Verify that all new validation errors have helpful error messages explaining the allowed ranges.
- [ ] Check if these validations can be implemented using Rust's `std::num::NonZeroU32` or similar types where appropriate to enforce validity at the type level.
- [ ] Ensure consistency between TOML/YAML parsing and programmatic builder API for these validations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify the new unit tests pass.
- [ ] Run `cargo test -p devs-core` if any shared validation logic was changed.
- [ ] Run `./do test` for full suite verification.

## 5. Update Documentation
- [ ] Update documentation for `WorkflowDefinition` and `ProjectRegistry` to reflect these mandatory limits.
- [ ] Ensure error messages are documented in the user-facing CLI documentation if applicable.

## 6. Automated Verification
- [ ] Verify that the code contains the required traceability annotations: `/// Verifies [2_TAS-REQ-507]`, `/// Verifies [2_TAS-REQ-508]`, and `/// Verifies [2_TAS-REQ-509]`.
- [ ] Run `.tools/verify_requirements.py` to ensure the new requirements are correctly mapped to tests.
