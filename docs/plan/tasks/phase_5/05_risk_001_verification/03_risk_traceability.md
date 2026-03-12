# Task: Risk Traceability & Violation Reporting (Sub-Epic: 05_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-001], [AC-RISK-MATRIX-003]

## Dependencies
- depends_on: [01_risk_matrix_extraction.md, 02_mitigation_consistency.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_risk_traceability.py` that:
    - Mocks a risk list with varying severity scores.
    - Simulates source files with `// Covers: RISK-NNN` annotations.
    - Asserts that the traceability engine correctly identifies:
        - Risks with `severity_score >= 6` that lack coverage.
        - Correctly covered risks.
    - Asserts that the `risk_matrix_violations` array is correctly populated in `target/traceability.json`.

## 2. Task Implementation
- [ ] Extend the existing traceability engine (`.tools/verify_requirements.py`) to scan for `// Covers: RISK-NNN` in source and test files.
- [ ] Integrate the risk list from Task 1 into the traceability engine.
- [ ] Verify that every risk with `severity_score >= 6` (and `status` not `Accepted`) has at least one matching annotation.
- [ ] Implement logic to generate/update `target/traceability.json` with a `risk_matrix_violations` field containing:
    - `"duplicate_risk_id"` (from Task 1)
    - `"missing_mitigation"` (from Task 2)
    - `"missing_test_coverage"` (for high-severity risks)
- [ ] Update `./do test` to fail if any `risk_matrix_violations` are present (unless explicitly accepted).

## 3. Code Review
- [ ] Verify that the risk-to-test mapping logic is robust and integrates seamlessly with the existing requirement-to-test mapping logic.
- [ ] Ensure that `Accepted` risk status is correctly handled and bypasses the coverage requirement.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_traceability.py`.
- [ ] Run `./do test` and ensure it passes on the current project state.

## 5. Update Documentation
- [ ] Document how to add risk coverage annotations in the codebase.
- [ ] Document the contents of `target/traceability.json` as it pertains to risks.

## 6. Automated Verification
- [ ] Run `./do coverage` and confirm that `target/traceability.json` exists and its structure matches the requirement.
- [ ] Temporarily remove a `// Covers: RISK-NNN` annotation for a high-severity risk and verify that `./do test` fails.
