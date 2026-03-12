# Task: Implement Multi-Error Config Validation (Sub-Epic: 015_Foundational Technical Requirements (Part 6))

## Covered Requirements
- [2_TAS-REQ-001H]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-config/src/validation_tests.rs` (or equivalent) that:
    - Provides a `devs.toml` configuration with multiple invalid fields (e.g., invalid port, missing required field, out-of-range value).
    - Calls the configuration validation method.
    - Asserts that ALL validation errors are returned in a single pass.
    - Verifies that the validation does not stop at the first error.

## 2. Task Implementation
- [ ] Implement a `ConfigError` enum in `devs-config/src/error.rs` that can represent various validation failures.
- [ ] Create a `ValidationResult` struct or a `MultiError` trait in `devs-core/src/validation.rs` that can accumulate multiple errors.
- [ ] Update the `ServerConfig::validate()` method in `devs-config/src/lib.rs` to:
    - Perform all validation checks in a single pass.
    - Accumulate each error into a `Vec<ConfigError>`.
    - If the vector is not empty, return a composite error containing all elements.
- [ ] In `devs-server/src/main.rs`, implement the reporting logic:
    - When `ServerConfig::load()` fails, iterate over all errors.
    - Print each error to `stderr` with the prefix `ERROR: ` followed by the error message, one per line.
    - Ensure the server exits with a non-zero code BEFORE any port binding attempt.

## 3. Code Review
- [ ] Ensure that the error output format is exactly as specified: `ERROR: <message>` on a new line.
- [ ] Confirm that the validation logic is exhaustive and doesn't skip checks.
- [ ] Verify that the `devs-server` entrypoint correctly handles the multi-error response.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and ensure the validation tests pass.
- [ ] Use a temporary `devs.toml` with multiple errors and run `cargo run --bin devs` to verify the `stderr` output.

## 5. Update Documentation
- [ ] Add a comment in `devs-config/src/lib.rs` linking to `[2_TAS-REQ-001H]` and explaining the single-pass validation requirement.

## 6. Automated Verification
- [ ] Run a shell script `tests/verify_error_reporting.sh` that:
    - Injects a multi-error `devs.toml`.
    - Captures the `stderr` output of `devs-server`.
    - Uses `grep` to count the number of lines starting with `ERROR:`.
    - Asserts the count matches the number of injected errors.
