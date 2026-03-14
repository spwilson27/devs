# Task: Implement Risk Matrix Parser & Schema Validator (Sub-Epic: 10_Risk 016 Verification)

## Covered Requirements
- [RISK-BR-019], [8_RISKS-REQ-079], [AC-RISK-MATRIX-001], [8_RISKS-REQ-081], [AC-RISK-MATRIX-002], [8_RISKS-REQ-082], [AC-RISK-MATRIX-004], [8_RISKS-REQ-084], [AC-RISK-MATRIX-005], [8_RISKS-REQ-085], [AC-RISK-MATRIX-007], [8_RISKS-REQ-087], [8_RISKS-REQ-025], [8_RISKS-REQ-026]

## Dependencies
- depends_on: []
- shared_components: [Traceability & Verification Infrastructure, devs-config]

## 1. Initial Test Written
- [ ] Create a new Python test `test_risk_matrix_validation.py` in `.tools/tests/`.
- [ ] Write a test case that mocks a markdown file with a valid Risk Assessment Matrix and asserts that the parser correctly extracts all fields.
- [ ] Write test cases for common violations:
    - Incorrect Severity Score calculation (Impact x Probability).
    - Duplicate Risk IDs.
    - Invalid Category enum values.
    - Missing matching `[MIT-NNN]` section for a risk.
- [ ] Assert that the validator returns structured error objects for each violation.

## 2. Task Implementation
- [ ] Extend `.tools/verify_requirements.py` or create a new module `.tools/workflow_lib/risk_validator.py` to handle risk matrix parsing.
- [ ] Implement `extract_risk_matrix(file_path)`:
    - Locate the table under "## 1. Risk Assessment Matrix".
    - Parse table rows into a list of dictionaries matching the schema in `[8_RISKS-REQ-023]`.
    - Handle Impact/Probability mapping to numeric values (HIGH=3, MEDIUM=2, LOW=1).
- [ ] Implement `validate_risk_matrix(risks, content)`:
    - **Severity Check:** Verify `severity_score == impact_val * probability_val`.
    - **Uniqueness Check:** Ensure `risk_id` is unique.
    - **Category Check:** Ensure category is one of Technical, Operational, Market.
    - **Mitigation Check:** Verify every `[RISK-NNN]` has a matching `[MIT-NNN]` header in the document (regex search in `content`).
- [ ] Integrate this validator into the main verification loop.

## 3. Code Review
- [ ] Verify that the parser is robust against markdown table formatting (e.g., varying whitespace).
- [ ] Ensure error messages are descriptive and include the specific Risk ID and line number.
- [ ] Confirm that `RISK-BR-019` is respected: the tool must return a non-zero exit code if any violation is found.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest .tools/tests/test_risk_matrix_validation.py`.
- [ ] Run `./do test` and ensure it now includes risk matrix validation (even if it fails initially due to existing issues in `8_risks_mitigation.md`).

## 5. Update Documentation
- [ ] Update `.tools/README.md` to document the new risk matrix validation capabilities.

## 6. Automated Verification
- [ ] Run `.venv/bin/python .tools/verify_requirements.py --verify-master` (or equivalent command) and confirm it correctly reports any intentional violations introduced in a temp file.
