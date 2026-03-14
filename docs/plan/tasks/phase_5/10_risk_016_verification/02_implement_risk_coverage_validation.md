# Task: Implement Risk Coverage & Status Filter Logic (Sub-Epic: 10_Risk 016 Verification)

## Covered Requirements
- [RISK-BR-020], [8_RISKS-REQ-080], [AC-RISK-MATRIX-003], [8_RISKS-REQ-083], [8_RISKS-REQ-027], [AC-RISK-MATRIX-009], [8_RISKS-REQ-089], [RISK-BR-002], [RISK-BR-006], [8_RISKS-REQ-032], [8_RISKS-REQ-036], [8_RISKS-REQ-037]

## Dependencies
- depends_on: ["01_implement_risk_matrix_parser.md"]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a new Python test case in `.tools/tests/test_risk_matrix_validation.py` for coverage verification.
- [ ] Mock a set of source files with `// Covers: RISK-001` annotations.
- [ ] Assert that a risk with `severity_score >= 6` and `status: Open` triggers a `missing_covering_test` violation if its annotation is missing.
- [ ] Assert that a risk with `status: Retired` or `status: Accepted` does NOT trigger a `missing_covering_test` violation even if its score is >= 6.
- [ ] Assert that a `Market` risk with `severity_score <= 4` does NOT require a covering test.

## 2. Task Implementation
- [ ] Extend the risk validator logic to scan all `.rs` files for `// Covers: RISK-NNN` annotations (reusing existing requirement scanning logic).
- [ ] Implement `check_risk_coverage(risks, annotations)`:
    - For each risk in the matrix:
        - Identify if it should have a covering test: `severity_score >= 6 AND status NOT IN ('Retired', 'Accepted')`.
        - Note: `Technical` and `Operational` risks with score >= 6 must be covered.
        - Check if `risk_id` exists in the collected `annotations`.
        - If missing and required, add a `missing_covering_test` violation.
- [ ] Update `target/traceability.json` to include a `risk_matrix_violations` array.
- [ ] Ensure `overall_passed` in the JSON is false if there are any risk violations.

## 3. Code Review
- [ ] Verify that the coverage check correctly handles multiple annotations for the same risk.
- [ ] Ensure that `Accepted` risks require a documented ADR reference in the `status` field (manual check or regex for `ADR-NNNN`).
- [ ] Confirm that `RISK-BR-006` is satisfied: regressions in covering tests should be immediately reflected in `traceability.json`.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_matrix_validation.py`.
- [ ] Run `./do test` and check `target/traceability.json` for correct risk violation reporting.

## 5. Update Documentation
- [ ] Document the risk coverage requirements (score >= 6, status-based exclusions) in the internal developer guide.

## 6. Automated Verification
- [ ] Create a temporary risk in `8_risks_mitigation.md` with score 9 and status `Open`.
- [ ] Run the validator and verify it reports a `missing_covering_test`.
- [ ] Add `// Covers: RISK-TEMP` to a dummy test file.
- [ ] Re-run the validator and verify the violation is gone.
- [ ] Delete the temporary risk and test annotation.
