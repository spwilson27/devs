# Task: Retry Configuration Validation (Sub-Epic: 079_Detailed Domain Specifications (Part 44))

## Covered Requirements
- [2_TAS-REQ-472], [2_TAS-REQ-473]

## Dependencies
- depends_on: ["01_control_flow_fanout_validation.md"]
- shared_components: ["devs-core"]

## 1. Initial Test Written
- [ ] In `devs-core`, create unit tests for `RetryConfig::validate` that assert:
  - `max_attempts` = 0 is rejected.
  - `max_attempts` = 21 is rejected.
  - `max_attempts` = 1 is accepted.
  - `max_attempts` = 20 is accepted.
  - `initial_delay` = 0 is rejected.
  - `initial_delay` = 1 is accepted.
  - `backoff = Exponential` with `max_delay = None` resolves to 300 seconds default.
  - `backoff = Exponential` with `max_delay = Some(N)` preserves `N`.

## 2. Task Implementation
- [ ] Update `RetryConfig::validate` to include range checks for `max_attempts` (1-20).
- [ ] Ensure `initial_delay` is at least 1 second.
- [ ] Implement logic to default `max_delay` to 300 seconds for `Exponential` backoff if it's not explicitly set.
- [ ] Ensure `ValidationError` is correctly populated on failure.

## 3. Code Review
- [ ] Verify that the `max_attempts` range is exactly 1-20 as per [2_TAS-REQ-472].
- [ ] Verify the default value and constraints for `Exponential` backoff as per [2_TAS-REQ-473].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and ensure all `RetryConfig` validation tests pass.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect that `RetryConfig` now has strict limits for `max_attempts` and `initial_delay`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` confirms coverage for [2_TAS-REQ-472] and [2_TAS-REQ-473].
