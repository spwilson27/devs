# Task: Mitigation Consistency Check (Sub-Epic: 05_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-002]

## Dependencies
- depends_on: [01_risk_matrix_extraction.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Add a new test case to `tests/test_risk_matrix_validation.py` (or a new file) that:
    - Defines a risk matrix where some rows lack matching `MIT-NNN` sections.
    - Asserts that the validation script correctly identifies and reports these missing mitigations.
    - Asserts that a correctly formed matrix with matching mitigations passes validation.

## 2. Task Implementation
- [ ] Extend the validation script (e.g., `.tools/validate_risk_matrix.py`) to:
    - Parse `docs/plan/requirements/8_risks_mitigation.md` for `### **[MIT-NNN]**` headers.
    - For every Risk ID extracted in Task 1, find its mitigation tag (e.g., `MIT-001`) from its row in the `Description` field.
    - Verify that a section `### **[MIT-NNN]**` exists for that tag.
    - Exit non-zero and print clear error messages on missing mitigations.

## 3. Code Review
- [ ] Ensure the regex for parsing `### **[MIT-NNN]**` headers is accurate and handles different header levels if necessary.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_matrix_validation.py`.
- [ ] Run `./do lint` and ensure it passes on the current requirements document.

## 5. Update Documentation
- [ ] Update agent memory with the requirement for mitigation consistency between the risk matrix and its detailed sections.

## 6. Automated Verification
- [ ] Verify that the script correctly flags a missing `[MIT-NNN]` section when a dummy risk with a non-existent mitigation is added temporarily to the Markdown.
