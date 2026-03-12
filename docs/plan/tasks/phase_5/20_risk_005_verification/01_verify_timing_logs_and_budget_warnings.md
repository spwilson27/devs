# Task: Verify Presubmit Timing Logs and Budget Monitoring (Sub-Epic: 20_Risk 005 Verification)

## Covered Requirements
- [AC-RISK-005-01], [RISK-005-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new E2E test in `tests/test_presubmit_metrics.py` that invokes `./do presubmit`.
- [ ] Mock the internal steps of `./do presubmit` (e.g., using environment variables to control mock behavior if `./do` supports it, or by creating a temporary "slow" mock command).
- [ ] Verify that after a successful `./do presubmit` run, the file `target/presubmit_timings.jsonl` exists and contains exactly one JSON object per executed step.
- [ ] Create a test case where a step is configured to exceed its budget by 25% (e.g., `budget_ms=1000`, `duration_ms=1250`).
- [ ] Assert that the corresponding entry in `timings.jsonl` has `"over_budget": true`.
- [ ] Assert that a `WARN` message containing the step name and "over budget" is emitted to stderr.
- [ ] Assert that `./do presubmit` still exits with code 0 (success) despite the over-budget step.

## 2. Task Implementation
- [ ] Ensure `./do presubmit` correctly identifies and calculates the budget for each step using the allocation table in `[MIT-005]`.
- [ ] Verify the logic that calculates `over_budget`: `duration_ms > (budget_ms * 1.2)`.
- [ ] Ensure the `WARN` message is printed to stderr immediately after the over-budget step completes.
- [ ] Verify that `target/presubmit_timings.jsonl` is written incrementally (one line per step) and flushed to disk.

## 3. Code Review
- [ ] Verify that the `over_budget` flag does NOT accidentally trigger a non-zero exit code.
- [ ] Ensure that `budget_ms` values are consistent with the technical specification for each platform (Linux, macOS, Windows).
- [ ] Confirm that JSON lines are valid and can be parsed by standard tools.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_presubmit_metrics.py`.
- [ ] Verify that all assertions pass.

## 5. Update Documentation
- [ ] Update `target/presubmit_timings.jsonl` schema documentation if necessary.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure `[AC-RISK-005-01]` and `[RISK-005-BR-004]` are covered by the new tests.
