# Task: Risk Matrix Extraction and Validation (Sub-Epic: 05_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-004], [AC-RISK-MATRIX-005]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_risk_matrix_validation.py` that:
    - Defines a sample Markdown risk matrix with intentional errors (duplicate IDs, incorrect math).
    - Asserts that the validation script correctly identifies and reports these errors.
    - Asserts that a correctly formed matrix passes validation.

## 2. Task Implementation
- [ ] Create or update a validation script (e.g., `.tools/validate_risk_matrix.py`) to:
    - Parse `docs/plan/requirements/8_risks_mitigation.md` using regex to extract table rows from `Description` fields.
    - Extract: Risk ID, Impact, Probability, and Severity Score.
    - Check for duplicate Risk IDs across the document.
    - Recalculate Severity Score as `Impact * Probability` (based on mapping HIGH=3, MEDIUM=2, LOW=1 or similar as defined in §1.4).
    - Exit non-zero and print clear error messages on violations.
- [ ] Update `./do lint` to include a call to this validation script.

## 3. Code Review
- [ ] Verify the regex for parsing the Markdown table is robust against whitespace and formatting variations.
- [ ] Ensure the Impact/Probability to numeric mapping matches the specification in §1.4 of the requirements.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_matrix_validation.py`.
- [ ] Run `./do lint` and ensure it passes on the current `docs/plan/requirements/8_risks_mitigation.md`.

## 5. Update Documentation
- [ ] Document the risk matrix validation logic in the `docs/` or agent memory.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` (if applicable) or ensure the lint command is part of the CI pipeline.
