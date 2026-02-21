# Task: Implement Benchmarking Engine for Quality Metrics (Sub-Epic: 15_Quality Metrics Definition)

## Covered Requirements
- [9_ROADMAP-REQ-MET-001], [9_ROADMAP-REQ-MET-003]

## 1. Initial Test Written
- [ ] Create unit tests in `tests/validation/benchmarking.test.ts` for a new `BenchmarkingSuite` class.
- [ ] Write a test `should calculate Task Autonomy Rate (TAR)` verifying it computes the ratio of autonomous vs human-intervened tasks based on agent logs in SQLite.
- [ ] Write a test `should calculate Time-to-First-Commit (TTFC)` verifying the time delta between task start and the first git commit in the `tasks` table.
- [ ] Write a test `should calculate Requirement Traceability Index (RTI)` ensuring 100% of requirements map to a test or commit using the `requirements` table.

## 2. Task Implementation
- [ ] Create `src/validation/BenchmarkingSuite.ts`.
- [ ] Implement `calculateTAR(tasks)` to iterate over SQLite task logs and compute the Task Autonomy Rate (percentage of tasks completed without `human_approval_signature` or manual edits).
- [ ] Implement `calculateTTFC(tasks)` to calculate the average and median time to first commit.
- [ ] Implement `calculateRTI(requirements, tasks)` to compute the traceability index (should evaluate to 1.0).
- [ ] Ensure all metric calculations handle edge cases like empty task lists or missing timestamps gracefully.

## 3. Code Review
- [ ] Verify that all metrics are derived deterministically from the `state.sqlite` database without external side effects or network calls.
- [ ] Check that calculations are optimized for performance so they do not block the validation phase.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/validation/benchmarking.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `docs/architecture/validation.md` to document the new `BenchmarkingSuite` and its key KPIs (TAR, TTFC, RTI).
- [ ] Update the `.agent.md` documentation to reflect the completion of the benchmarking engine.

## 6. Automated Verification
- [ ] Run a verification script `npm run verify-metrics-engine` or inspect the test output logs to confirm successful and accurate metric computation.
