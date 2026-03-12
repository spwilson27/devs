# Task: Control Flow and Fan-Out Configuration Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-470], [2_TAS-REQ-471]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create unit tests for `StageDefinition::validate` that assert:
  - An error is returned if both `fan_out` and `branch` are non-none.
  - An error is returned if both `fan_out` and `branch` are none (if applicable, but REQ-470 specifically says "both" is the issue).
- [ ] Create unit tests for `FanOutConfig::validate` that assert:
  - An error is returned if both `count` and `input_list` are none.
  - An error is returned if both `count` and `input_list` are some.
  - An error is returned if `count` is 0.
  - An error is returned if `count` is 65.
  - An error is returned if `input_list` is empty.
  - An error is returned if `input_list` has 65 elements.
  - Success is returned for `count` in range 1-64.
  - Success is returned for `input_list` with 1-64 elements.

## 2. Task Implementation
- [ ] Implement the `validate` method (or update the existing one) on `StageDefinition`.
- [ ] Add a check to ensure `self.fan_out.is_some() && self.branch.is_some()` is false.
- [ ] Implement or update `FanOutConfig` to ensure `count` and `input_list` are mutually exclusive.
- [ ] Add range checks for `count` (1-64) and length checks for `input_list` (1-64).
- [ ] Ensure `ValidationError` (from `devs-core`) is used to report these issues.

## 3. Code Review
- [ ] Verify that the validation logic is exhaustive and matches the specifications in [2_TAS-REQ-470] and [2_TAS-REQ-471].
- [ ] Ensure error messages are clear and follow the established pattern for `ValidationError`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all validation tests pass.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect that `fan_out` and `branch` are now mutually exclusive and `FanOutConfig` has strict limits.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` confirms coverage for [2_TAS-REQ-470] and [2_TAS-REQ-471].
