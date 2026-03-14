# Task: Weighted Fair Queuing Ratio Verification (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-007]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/ac_p2_007_weighted_fair_queuing.rs` with a `#[tokio::test]`:
  1. Configure the multi-project scheduler with two projects: `ProjectA` (weight=3) and `ProjectB` (weight=1).
  2. Submit enough pending work for both projects to keep the queue busy for 100 dispatches.
  3. Use a mock pool with a single agent slot so dispatches are serialized.
  4. Run the scheduler's dispatch loop for exactly 100 consecutive dispatch decisions.
  5. Count how many dispatches went to `ProjectA` vs `ProjectB`.
  6. Assert the ratio is within ±10% of 3:1, meaning `ProjectA` gets between 67 and 82 dispatches (75 ± 7.5, rounded) and `ProjectB` gets the remainder.
- [ ] Add a second test with weights `5:5` (equal) and verify approximately 50:50 ratio ±10%.
- [ ] Add `// Covers: AC-ROAD-P2-007` annotation.

## 2. Task Implementation
- [ ] Verify the weighted fair queuing implementation uses a deficit-based or stride-based algorithm that provides proportional allocation over time.
- [ ] Ensure the implementation is deterministic given the same sequence of requests (no random jitter that could cause flaky tests).
- [ ] If the implementation uses floating-point arithmetic, verify precision is sufficient for the ±10% tolerance over 100 dispatches.

## 3. Code Review
- [ ] Confirm the scheduler correctly resets or carries forward deficit/stride counters so that fairness holds over arbitrary dispatch windows.
- [ ] Verify that weights of 0 are rejected at config validation time (division by zero protection).

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test ac_p2_007_weighted_fair_queuing -- --nocapture`

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-007` to all weighted fair queuing test functions.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-007`.
