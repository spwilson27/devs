# Task: Risk Matrix Extraction and Severity Score Validation (Sub-Epic: 05_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-004], [AC-RISK-MATRIX-005]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a new Python test file `tests/test_risk_matrix_validation.py` with the following test functions:
    - [ ] `test_parse_risk_matrix_table()`: Write a test that:
        - Creates a temporary Markdown file containing a risk matrix table with 3-4 sample risks in the format found in `docs/plan/requirements/8_risks_mitigation.md`
        - Calls the parser function to extract risk records (Risk ID, Impact, Probability, Severity Score, Category)
        - Asserts the extracted records match the expected values
    - [ ] `test_detect_duplicate_risk_ids()`: Write a test that:
        - Creates a temporary Markdown file with a risk matrix containing duplicate `[RISK-001]` IDs
        - Calls the validation function
        - Asserts that a `ValidationError` is raised with `"duplicate_risk_id"` in the error message
        - Asserts the validation script would exit non-zero
    - [ ] `test_validate_severity_score_calculation()`: Write a test that:
        - Creates a temporary Markdown file with a risk where Severity ≠ Impact × Probability (e.g., Impact=HIGH(3), Probability=MEDIUM(2), but Severity=5 instead of 6)
        - Calls the validation function
        - Asserts that a `ValidationError` is raised with `"severity_score_mismatch"` in the error message
        - Asserts the error message includes the Risk ID, expected score, and actual score
    - [ ] `test_valid_risk_matrix_passes_validation()`: Write a test that:
        - Creates a temporary Markdown file with a correctly formed risk matrix (unique IDs, correct math)
        - Calls the validation function
        - Asserts no exception is raised and validation returns success

## 2. Task Implementation
- [ ] Create a new Python module `.tools/validate_risk_matrix.py` with the following components:
    - [ ] Define a `@dataclass` named `RiskRecord` with fields:
        - `risk_id: str` (e.g., "RISK-001")
        - `impact: str` (e.g., "HIGH", "MEDIUM", "LOW")
        - `probability: str` (e.g., "HIGH", "MEDIUM", "LOW")
        - `severity_score: int`
        - `category: str` (e.g., "Technical", "Operational", "Market")
        - `status: str` (e.g., "Open", "Mitigated", "Accepted", "Retired")
        - `mitigation_ref: str` (e.g., "MIT-001")
    - [ ] Define impact/probability value mapping per §1.4 of the risk specification:
        - `IMPACT_VALUES = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}`
        - `PROBABILITY_VALUES = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}`
    - [ ] Implement `parse_risk_matrix_table(markdown_content: str) -> List[RiskRecord]`:
        - Use regex to find the risk matrix table section in the Markdown
        - Parse each row to extract: Risk ID, Category, Impact, Probability, Severity Score, Status, Mitigation Reference
        - Handle variations in whitespace and formatting
        - Return a list of `RiskRecord` objects
    - [ ] Implement `validate_unique_ids(risks: List[RiskRecord]) -> List[str]`:
        - Check for duplicate `risk_id` values across all records
        - Return a list of duplicate IDs found (empty list if all unique)
    - [ ] Implement `validate_severity_scores(risks: List[RiskRecord]) -> List[Dict]`:
        - For each risk, calculate expected score = `IMPACT_VALUES[impact] * PROBABILITY_VALUES[probability]`
        - Compare with the declared `severity_score` in the record
        - Return a list of mismatches with format: `{"risk_id": str, "expected": int, "actual": int}`
    - [ ] Implement `validate_risk_matrix_file(file_path: str) -> Dict`:
        - Read the Markdown file
        - Parse the risk matrix table
        - Run all validations (unique IDs, severity scores)
        - Return a dict with format: `{"valid": bool, "errors": List[str], "warnings": List[str]}`
    - [ ] Add a `main()` function for CLI invocation:
        - Accept file path as argument (default: `docs/plan/requirements/8_risks_mitigation.md`)
        - Print validation results to stdout
        - Exit 0 if valid, exit 1 if any errors found
- [ ] Update the `./do` script's `cmd_lint()` function to call the risk matrix validation:
    - Add a call to `.tools/validate_risk_matrix.py` after other lint checks
    - Ensure the lint command fails if risk matrix validation fails

## 3. Code Review
- [ ] Verify the regex patterns are robust against:
    - Different whitespace (spaces vs tabs)
    - Extra blank lines in the table
    - Variations in Markdown table formatting (alignment, column order)
- [ ] Verify the impact/probability value mapping matches the specification in §1.4 of `docs/plan/requirements/8_risks_mitigation.md` or `docs/plan/specs/8_risks_mitigation.md`
- [ ] Ensure error messages are clear and actionable, including:
    - The specific Risk ID that failed
    - The expected vs actual values
    - The line number or location in the source file (if feasible)
- [ ] Verify the code follows existing project conventions:
    - Type hints on all function signatures
    - Docstrings for all public functions
    - Consistent error handling patterns

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_matrix_validation.py -v` and ensure all tests pass
- [ ] Run `python .tools/validate_risk_matrix.py docs/plan/requirements/8_risks_mitigation.md` to validate the actual risk matrix
- [ ] Run `./do lint` and ensure it completes successfully (exit 0)
- [ ] Temporarily introduce a duplicate Risk ID in a copy of the risk matrix file and verify the validator catches it
- [ ] Temporarily introduce an incorrect severity score in a copy and verify the validator catches it

## 5. Update Documentation
- [ ] Add a comment at the top of `.tools/validate_risk_matrix.py` referencing the covered requirements: `[AC-RISK-MATRIX-004]`, `[AC-RISK-MATRIX-005]`
- [ ] Update `.agent/MEMORY.md` or project documentation to describe:
    - The risk matrix validation process
    - How to add new risks while maintaining validation compliance
    - The impact/probability scoring model from §1.4
- [ ] Document the validation error types that can appear in `risk_matrix_violations`:
    - `"duplicate_risk_id"` — triggered by AC-RISK-MATRIX-005
    - `"severity_score_mismatch"` — triggered by AC-RISK-MATRIX-004

## 6. Automated Verification
- [ ] Confirm that `./do lint` includes the risk matrix validation step by inspecting the output
- [ ] Verify that the validation script is called as part of the CI pipeline (check `.tools/ci.py` if it exists)
- [ ] Create a test fixture file `tests/fixtures/risk_matrix_invalid.md` with intentional errors for future regression testing
- [ ] Ensure the validation script can be run standalone and as part of the lint pipeline
