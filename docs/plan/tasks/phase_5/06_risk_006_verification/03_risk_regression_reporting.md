# Task: Risk Regression Traceability (Sub-Epic: 06_Risk 006 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-009]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/05_risk_001_verification/03_risk_traceability.md, 02_risk_schema_validation.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_risk_regression.py` that:
    - Mocks a risk list where some risks are marked `Mitigated` in the Markdown source.
    - Simulates test execution results where a covering test for a `Mitigated` risk fails.
    - Asserts that the traceability engine correctly:
        - Detects the regression.
        - Reports the risk as `Open` (or similar failing status) in the generated `target/traceability.json`.
        - Includes the regression details in the `risk_matrix_violations` array.

## 2. Task Implementation
- [ ] Extend the traceability engine (`.tools/verify_requirements.py`) to:
    - Read the `status` field for each risk from the Markdown source (`8_risks_mitigation.md`).
    - Integrate the results of covering tests for each risk.
    - Implement logic to detect when a risk is marked `Mitigated` in the Markdown but its covering test is failing.
    - When this condition is met, ensure `target/traceability.json` reflects that the risk is effectively `Open` or "Regression detected".
    - Populate the `risk_matrix_violations` array with a clear indication of the regression (e.g., `{"type": "regression_detected", "risk_id": "RISK-001"}`).
    - Ensure the `./do test` invocation that detected the failure also produces the updated traceability report with the regression.

## 3. Code Review
- [ ] Verify that the regression detection logic correctly handles all possible test result states (pass, fail, skip).
- [ ] Ensure that `traceability.json` correctly distinguishes between "never mitigated" (missing test) and "regression" (failing test for previously mitigated risk).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_regression.py`.
- [ ] Run `./do test` and ensure it passes on the current project state.

## 5. Update Documentation
- [ ] Document the risk regression detection behavior and how it is reported in the traceability output.

## 6. Automated Verification
- [ ] For a risk marked `Mitigated` in `8_risks_mitigation.md`, temporarily cause its covering test to fail and verify that `./do test` exits non-zero and `target/traceability.json` contains a `regression_detected` violation.
