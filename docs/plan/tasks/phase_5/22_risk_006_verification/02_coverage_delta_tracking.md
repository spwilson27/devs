# Task: GitLab CI Coverage Delta Tracking (Sub-Epic: 22_Risk 006 Verification)

## Covered Requirements
- [RISK-006-BR-003]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/22_risk_006_verification/01_coverage_gate_enforcement.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_coverage_delta.py` that:
    - Mocks the fetching of a `report.json` artifact from GitLab CI.
    - Asserts that if a baseline artifact is successfully fetched, `delta_pct` is correctly computed for each gate.
    - Asserts that if a baseline artifact is missing (e.g., 404 or no recent CI run), `delta_pct` is set to `null` and the script continues.
    - Verifies that a regression > -0.5% triggers a `WARN` log message but does not cause the script to exit non-zero.

## 2. Task Implementation
- [ ] Update the coverage orchestration script (e.g., `.tools/coverage.py`) to:
    - Add a function to download the most recent `target/coverage/report.json` artifact from GitLab CI (using the GitLab API and `CI_JOB_TOKEN` if available).
    - If a baseline is found, parse it and store it in memory.
    - After computing the current coverage, calculate `delta_pct = actual_pct (current) - actual_pct (baseline)`.
    - Update the `gates` entries in the current `target/coverage/report.json` with the computed `delta_pct`.
    - Implement a warning log if `delta_pct < -0.5` for any gate.
    - Ensure that failing to fetch a baseline (e.g., because it's a new branch or GitLab is unreachable) sets `delta_pct: null` and allows the run to proceed.

## 3. Code Review
- [ ] Verify that the delta calculation is correct for all gates.
- [ ] Ensure that the warning threshold (-0.5%) is correctly implemented and logged.
- [ ] Verify that the error handling for a missing baseline artifact is robust and does not crash the coverage run.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_coverage_delta.py`.
- [ ] Run `./do coverage` locally with a manually provided `target/coverage/report.json.baseline` and verify `delta_pct` in the output.

## 5. Update Documentation
- [ ] Reflect in documentation that per-commit coverage deltas are now tracked against the CI baseline.

## 6. Automated Verification
- [ ] Manually create a `target/coverage/report.json` with a known `delta_pct` value and verify the output log message matches the expected `WARN` or success level.
