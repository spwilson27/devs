# Task: Retry Attempt Limits Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-472]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (Consumer — add validation to domain types)"]

## 1. Initial Test Written
- [ ] In the module containing `RetryConfig`, write a test module `tests::retry_attempt_limits` with these tests:
  - `test_retry_max_attempts_zero_rejected`: Set `max_attempts = 0`. Assert validation error with message indicating range 1–20.
  - `test_retry_max_attempts_21_rejected`: Set `max_attempts = 21`. Assert validation error.
  - `test_retry_max_attempts_1_accepted`: Set `max_attempts = 1`. Assert validation succeeds.
  - `test_retry_max_attempts_20_accepted`: Set `max_attempts = 20`. Assert validation succeeds.
  - `test_retry_max_attempts_10_accepted`: Set `max_attempts = 10`. Assert validation succeeds (mid-range sanity check).
- [ ] Add `// Covers: 2_TAS-REQ-472` annotation to each test.

## 2. Task Implementation
- [ ] Define `RetryConfig` with `max_attempts: u32` (and other fields like `backoff`, `initial_delay`, `max_delay`).
- [ ] Define constants: `const MIN_RETRY_ATTEMPTS: u32 = 1;` and `const MAX_RETRY_ATTEMPTS: u32 = 20;`.
- [ ] Implement `RetryConfig::validate()`: if `max_attempts < MIN_RETRY_ATTEMPTS || max_attempts > MAX_RETRY_ATTEMPTS`, return `OutOfRange { field: "max_attempts", min: 1, max: 20, actual: max_attempts }`.

## 3. Code Review
- [ ] Verify range bounds are named constants, not magic numbers.
- [ ] Verify error includes the actual invalid value for diagnostics.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- retry_attempt_limits` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment to `RetryConfig::max_attempts` field documenting the 1–20 range and referencing `2_TAS-REQ-472`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-472" crates/devs-core/` and confirm at least one match.
