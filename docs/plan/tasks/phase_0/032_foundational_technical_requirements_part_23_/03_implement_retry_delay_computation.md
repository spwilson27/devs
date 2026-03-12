# Task: Implement Retry Delay Computation logic (Sub-Epic: 032_Foundational Technical Requirements (Part 23))

## Covered Requirements
- [2_TAS-REQ-033B]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test for `compute_retry_delay` in `devs-core/src/retry.rs` (or equivalent).
- [ ] Verify `Fixed` backoff: `initial_delay` is returned regardless of attempt number.
- [ ] Verify `Exponential` backoff: `min(initial^attempt, max)` is returned for several attempts.
- [ ] Verify `Linear` backoff: `initial * attempt` capped at `max` is returned.
- [ ] Verify default `max_delay` of 300s is used when not specified.

## 2. Task Implementation
- [ ] Implement a `RetryBackoff` enum in `devs-core` representing the three types (Fixed, Exponential, Linear).
- [ ] Implement the `compute_retry_delay` function.
- [ ] Ensure that it uses `u32` for attempts and returns a `std::time::Duration`.
- [ ] Handle potential overflow in exponential calculation (though `initial^attempt` should be within range for reasonable retry counts).
- [ ] Ensure that rate-limit events do NOT increment the attempt count as per [2_TAS-REQ-033B] (this is more of a scheduler-level requirement but should be noted in the implementation of the retry logic).

## 3. Code Review
- [ ] Verify that the `Exponential` backoff uses the correct formula: `initial^attempt`.
- [ ] Ensure that `max_delay` is applied correctly as a cap for both Exponential and Linear modes.
- [ ] Confirm that `initial_delay` is used as the base for all calculations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` to verify all retry delay algorithms.

## 5. Update Documentation
- [ ] Update doc comments for the retry computation logic.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure compliance and traceability.
