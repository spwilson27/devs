# Task: Phase 2 Coverage Quality Gate (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-008]

## Dependencies
- depends_on: ["01_dag_dispatch_latency_verification.md", "02_cancel_run_atomic_checkpoint.md", "03_cycle_detection_validation.md", "04_workflow_snapshot_immutability.md", "05_pool_exhausted_webhook_deduplication.md", "06_ssrf_protection_validation.md", "07_weighted_fair_queuing_ratio.md"]
- shared_components: [devs-scheduler (consumer), devs-webhook (consumer), Traceability & Coverage Infrastructure (consumer)]

## 1. Initial Test Written
- [ ] No new test code is needed for this task. This task validates that the cumulative test suites for `devs-scheduler` and `devs-webhook` achieve ≥90% line coverage as measured by `./do coverage`.
- [ ] If coverage is below 90% for either crate, identify uncovered lines by examining `target/coverage/report.json` (or the HTML report) and write targeted unit tests to cover the gaps.
- [ ] Any gap-filling tests should be placed in the appropriate crate's `tests/` or `src/` (inline `#[cfg(test)]` modules) and annotated with `// Covers:` for the requirement they exercise.

## 2. Task Implementation
- [ ] Run `./do coverage` and examine `target/coverage/report.json` for per-crate line coverage percentages.
- [ ] If `devs-scheduler` is below 90%, identify the uncovered modules/functions and write tests targeting them. Common gaps include error paths, edge cases in fan-out merge, timeout enforcement, and retry backoff calculations.
- [ ] If `devs-webhook` is below 90%, identify uncovered areas such as retry logic edge cases, channel-full behavior, and malformed payload handling.
- [ ] Re-run `./do coverage` after adding gap-filling tests and verify both crates meet ≥90%.

## 3. Code Review
- [ ] Verify that gap-filling tests are meaningful (test real behavior, not trivial getters/setters).
- [ ] Ensure no `#[cfg(not(tarpaulin_include))]` or equivalent coverage exclusions were added to inflate the numbers.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do coverage` and verify the output reports ≥90% for both `devs-scheduler` and `devs-webhook`.
- [ ] Execute `./do test` and verify all tests pass (including newly added gap-filling tests).

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-008` annotation to the coverage gate validation test or script that asserts the 90% threshold.

## 6. Automated Verification
- [ ] Run `./do presubmit` end-to-end and verify it passes, including QG-001 for both `devs-scheduler` and `devs-webhook`.
- [ ] Confirm `target/traceability.json` includes `AC-ROAD-P2-008` and all other `AC-ROAD-P2-*` requirements are present and passing.
