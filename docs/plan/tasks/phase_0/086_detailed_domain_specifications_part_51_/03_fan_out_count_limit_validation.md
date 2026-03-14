# Task: Reject Fan-Out Config with Count Zero (Sub-Epic: 086_Detailed Domain Specifications (Part 51))

## Covered Requirements
- [2_TAS-REQ-507]

## Dependencies
- depends_on: ["none"]
- shared_components: [devs-core (consumer — uses workflow validation types)]

## 1. Initial Test Written
- [ ] In workflow validation tests (e.g., `crates/devs-core/src/workflow/validation/tests.rs`), create `test_fan_out_count_zero_rejected`:
  - Build a `FanOutConfig { count: 0, .. }`.
  - Run workflow validation.
  - Assert the result contains `ValidationError::FanOutLimitError`.
- [ ] Create `test_fan_out_count_one_accepted`:
  - `FanOutConfig { count: 1, .. }`.
  - Assert validation passes (no `FanOutLimitError`).
- [ ] Create `test_fan_out_count_max_accepted`:
  - Use a reasonable upper bound (e.g., `count: 100`).
  - Assert validation passes.

## 2. Task Implementation
- [ ] Add `FanOutLimitError` variant to `ValidationError` enum if not present, with a message like `"fan_out count must be >= 1, got 0"`.
- [ ] In workflow/stage validation logic, when a stage has a `FanOutConfig`, check that `count >= 1`. If `count == 0`, push `ValidationError::FanOutLimitError` into the error collection.
- [ ] This check should be part of the single-pass validation that collects all errors.

## 3. Code Review
- [ ] Verify `FanOutLimitError` is collected (not returned early) so other validation errors are also reported.
- [ ] Verify the variant includes the offending count value for diagnostics.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- fan_out` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comment on `FanOutLimitError` variant referencing [2_TAS-REQ-507].

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures. Grep for `test_fan_out_count_zero_rejected` in output.
