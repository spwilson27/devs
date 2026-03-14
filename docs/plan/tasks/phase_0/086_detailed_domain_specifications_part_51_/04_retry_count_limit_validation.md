# Task: Reject Retry Config with max_attempts Above Limit (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-508]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer — uses workflow validation types)]

## 1. Initial Test Written
- [ ] In workflow validation tests, create `test_retry_max_attempts_21_rejected`:
  - Build a `RetryConfig { max_attempts: 21, .. }`.
  - Run workflow validation.
  - Assert the result contains `ValidationError::InvalidRetryCount`.
- [ ] Create `test_retry_max_attempts_20_accepted`:
  - `RetryConfig { max_attempts: 20, .. }`.
  - Assert validation passes.
- [ ] Create `test_retry_max_attempts_1_accepted`:
  - `RetryConfig { max_attempts: 1, .. }`.
  - Assert validation passes.
- [ ] Create `test_retry_max_attempts_0_rejected`:
  - `RetryConfig { max_attempts: 0, .. }`.
  - Assert the result contains `ValidationError::InvalidRetryCount` (must retry at least once if retry is configured).

## 2. Task Implementation
- [ ] Add `InvalidRetryCount` variant to `ValidationError` enum if not present. Include the offending value and the allowed range in the variant fields.
- [ ] Define a constant `MAX_RETRY_ATTEMPTS: u32 = 20` in the validation module.
- [ ] In workflow/stage validation, when a stage has a `RetryConfig`, check `1 <= max_attempts <= MAX_RETRY_ATTEMPTS`. If outside this range, push `ValidationError::InvalidRetryCount { got: max_attempts, max: MAX_RETRY_ATTEMPTS }`.

## 3. Code Review
- [ ] Verify the upper bound constant is documented and not magic-numbered inline.
- [ ] Verify boundary values (0, 1, 20, 21) are all tested.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- retry` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `InvalidRetryCount` and `MAX_RETRY_ATTEMPTS` referencing [2_TAS-REQ-508].

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep for `test_retry_max_attempts_21_rejected` in output.
