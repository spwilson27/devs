# Task: Enhanced Risk Table & Summary Validation (Sub-Epic: 06_Risk 006 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-006], [AC-RISK-MATRIX-007], [AC-RISK-MATRIX-010]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/05_risk_001_verification/01_risk_matrix_extraction.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_risk_matrix_enhanced_validation.py` that:
    - Defines a sample Markdown document with a risk matrix and a summary table.
    - Asserts that the validation script correctly identifies:
        - Risks with invalid categories (not Technical, Operational, or Market).
        - Risks referencing non-existent fallback IDs (not defined in §5).
        - Summary tables where the `risk_count_by_category` does not match the actual matrix counts.
    - Asserts that a correctly formed document with matching fallbacks and accurate summary counts passes validation.

## 2. Task Implementation
- [ ] Extend the validation script (e.g., `.tools/validate_risk_matrix.py`) to:
    - Parse `docs/plan/requirements/8_risks_mitigation.md` for `### **[FB-NNN]**` headers in §5 (Fallbacks).
    - Extract the category from each risk matrix row and verify it is one of `Technical`, `Operational`, or `Market`.
    - For every risk referencing a fallback ID (e.g., `FB-001`), verify that a corresponding definition exists in §5.
    - Parse the `risk_count_by_category` summary table in §1.3.
    - Recompute the counts of risks by category from the parsed matrix.
    - Compare the recomputed counts with the values in the §1.3 table.
    - Exit non-zero and print clear error messages on any mismatch or invalid value.
- [ ] Ensure `./do lint` includes these enhanced checks.

## 3. Code Review
- [ ] Verify that the regex for parsing the summary table in §1.3 is robust and handles different table formatting styles.
- [ ] Ensure that fallback ID matching is case-sensitive and accounts for all IDs defined in the fallback section.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_matrix_enhanced_validation.py`.
- [ ] Run `./do lint` and ensure it passes on the current `docs/plan/requirements/8_risks_mitigation.md`.

## 5. Update Documentation
- [ ] Update the project documentation to reflect that risk categories and fallback IDs are now strictly validated during the linting process.

## 6. Automated Verification
- [ ] Temporarily change a risk category to an invalid value (e.g., `Financial`) and verify that `./do lint` fails.
- [ ] Temporarily change a count in the §1.3 summary table and verify that `./do lint` fails.
