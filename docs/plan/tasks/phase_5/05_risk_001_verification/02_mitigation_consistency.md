# Task: Mitigation Consistency Validation (Sub-Epic: 05_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-002]

## Dependencies
- depends_on: [01_risk_matrix_extraction.md]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Extend `tests/test_risk_matrix_validation.py` with the following new test functions:
    - [ ] `test_parse_mitigation_sections()`: Write a test that:
        - Creates a temporary Markdown file containing `### **[MIT-001]**`, `### **[MIT-002]**` section headers
        - Calls the mitigation parser function to extract all mitigation IDs
        - Asserts the extracted mitigation IDs match the expected values (e.g., `["MIT-001", "MIT-002"]`)
    - [ ] `test_detect_missing_mitigation_section()`: Write a test that:
        - Creates a temporary Markdown file with a risk matrix row referencing `MIT-999` but no corresponding `### **[MIT-999]**` section
        - Calls the validation function
        - Asserts that a `ValidationError` is raised with `"missing_mitigation_section"` in the error message
        - Asserts the error message includes the missing mitigation ID and the Risk ID that references it
    - [ ] `test_detect_mismatched_mitigation_reference()`: Write a test that:
        - Creates a temporary Markdown file where a risk row has a malformed mitigation reference (e.g., `MIT-` without a number, or `MITIGATION-001` instead of `MIT-001`)
        - Calls the validation function
        - Asserts that a `ValidationError` is raised with `"invalid_mitigation_reference"` in the error message
    - [ ] `test_complete_risk_matrix_with_mitigations_passes()`: Write a test that:
        - Creates a temporary Markdown file with:
            - A risk matrix table where each risk has a valid `MIT-NNN` reference
            - Corresponding `### **[MIT-NNN]**` sections for each reference
        - Calls the validation function
        - Asserts no exception is raised and validation returns success

## 2. Task Implementation
- [ ] Extend `.tools/validate_risk_matrix.py` with the following new components:
    - [ ] Implement `parse_mitigation_sections(markdown_content: str) -> Set[str]`:
        - Use regex to find all section headers matching the pattern `### **[MIT-NNN]**` where NNN is a number
        - Extract the mitigation ID from each header (e.g., "MIT-001")
        - Return a set of all mitigation IDs found in the document
    - [ ] Implement `extract_mitigation_references(risks: List[RiskRecord]) -> Dict[str, str]`:
        - For each risk record, extract the `mitigation_ref` field
        - Return a dict mapping `risk_id -> mitigation_ref` (e.g., `{"RISK-001": "MIT-001"}`)
    - [ ] Implement `validate_mitigation_consistency(risks: List[RiskRecord], available_mitigations: Set[str]) -> List[Dict]`:
        - For each risk, check if its `mitigation_ref` exists in `available_mitigations`
        - Return a list of mismatches with format: `{"risk_id": str, "mitigation_ref": str, "error": "missing_section"}`
    - [ ] Implement `validate_mitigation_reference_format(mitigation_ref: str) -> bool`:
        - Check that the mitigation reference matches the pattern `MIT-NNN` where NNN is 3+ digits
        - Return True if valid, False if malformed
    - [ ] Extend `validate_risk_matrix_file(file_path: str) -> Dict` to include mitigation validation:
        - After parsing risks, also parse mitigation sections
        - Call `validate_mitigation_consistency()` to check all references
        - Add mitigation errors to the errors list in the return dict
    - [ ] Update the `main()` function to report mitigation validation errors:
        - Include mitigation errors in the output
        - Ensure the script exits non-zero if mitigation validation fails

## 3. Code Review
- [ ] Verify the regex for parsing mitigation section headers handles:
    - Different header levels (###, ####, etc.) if the document uses variations
    - Whitespace variations around the `[MIT-NNN]` tag
    - Additional text after the mitigation ID in the header (e.g., `### **[MIT-001]** Description text`)
- [ ] Verify that the mitigation reference extraction from risk records correctly handles:
    - Multiple mitigation references per risk (if applicable per the spec)
    - Missing or empty mitigation references
- [ ] Ensure error messages clearly indicate:
    - Which Risk ID has the missing mitigation
    - Which mitigation section is missing
    - Where in the document the risk is defined (line number if feasible)
- [ ] Verify consistency with the risk matrix parsing from Task 01

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_matrix_validation.py -v` and ensure all tests pass (including new mitigation tests)
- [ ] Run `python .tools/validate_risk_matrix.py docs/plan/requirements/8_risks_mitigation.md` to validate the actual risk matrix
- [ ] Run `./do lint` and ensure it completes successfully (exit 0)
- [ ] Temporarily remove a `### **[MIT-NNN]**` section from a copy of the risk matrix file and verify the validator catches it
- [ ] Temporarily add a risk with a non-existent mitigation reference and verify the validator catches it

## 5. Update Documentation
- [ ] Add a comment at the top of `.tools/validate_risk_matrix.py` referencing the covered requirement: `[AC-RISK-MATRIX-002]`
- [ ] Update `.agent/MEMORY.md` or project documentation to describe:
    - The requirement for every risk to have a corresponding mitigation section
    - The format of mitigation section headers (`### **[MIT-NNN]**`)
    - How to add new mitigations when adding new risks
- [ ] Document the validation error type for mitigation violations:
    - `"missing_mitigation_section"` — triggered by AC-RISK-MATRIX-002
    - `"invalid_mitigation_reference"` — triggered by malformed references

## 6. Automated Verification
- [ ] Confirm that `./do lint` includes the mitigation validation step
- [ ] Verify that the validation script correctly validates the full `docs/plan/requirements/8_risks_mitigation.md` file
- [ ] Create a test fixture file `tests/fixtures/risk_matrix_missing_mitigation.md` with a missing mitigation section for regression testing
- [ ] Ensure the validation is integrated into the CI pipeline
