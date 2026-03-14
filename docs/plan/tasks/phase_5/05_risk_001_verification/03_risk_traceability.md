# Task: Risk Traceability & Violation Reporting (Sub-Epic: 05_Risk 001 Verification)

## Covered Requirements
- [AC-RISK-MATRIX-001], [AC-RISK-MATRIX-003]

## Dependencies
- depends_on: [01_risk_matrix_extraction.md, 02_mitigation_consistency.md]
- shared_components: [./do Entrypoint Script, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create a new Python test file `tests/test_risk_traceability.py` with the following test functions:
    - [ ] `test_scan_covers_annotations()`: Write a test that:
        - Creates temporary Python source files with `// Covers: RISK-001`, `// Covers: RISK-002` annotations
        - Calls the annotation scanner function to extract all risk coverage annotations
        - Asserts the extracted risk IDs match the expected values (e.g., `{"RISK-001", "RISK-002"}`)
    - [ ] `test_detect_missing_coverage_for_high_severity_risk()`: Write a test that:
        - Creates a mock risk list with a risk having `severity_score = 6` (or higher)
        - Creates temporary source files WITHOUT any `// Covers: RISK-NNN` annotation for that risk
        - Calls the traceability validation function
        - Asserts that a `ValidationError` is raised with `"missing_test_coverage"` in the error message
        - Asserts the error message includes the Risk ID and its severity score
    - [ ] `test_accepted_risk_bypasses_coverage_requirement()`: Write a test that:
        - Creates a mock risk list with a risk having `severity_score = 8` and `status = "Accepted"`
        - Creates temporary source files WITHOUT any `// Covers: RISK-NNN` annotation for that risk
        - Calls the traceability validation function
        - Asserts NO exception is raised (accepted risks bypass coverage requirement)
        - Asserts the risk is not included in violations
    - [ ] `test_retired_risk_bypasses_coverage_requirement()`: Write a test that:
        - Creates a mock risk list with a risk having `severity_score = 7` and `status = "Retired"`
        - Creates temporary source files WITHOUT any `// Covers: RISK-NNN` annotation for that risk
        - Calls the traceability validation function
        - Asserts NO exception is raised (retired risks bypass coverage requirement)
    - [ ] `test_covered_high_severity_risk_passes()`: Write a test that:
        - Creates a mock risk list with a risk having `severity_score = 6`
        - Creates temporary source files WITH a `// Covers: RISK-NNN` annotation for that risk
        - Calls the traceability validation function
        - Asserts no exception is raised and validation returns success
    - [ ] `test_low_severity_risk_without_coverage_passes()`: Write a test that:
        - Creates a mock risk list with a risk having `severity_score = 4` (below threshold)
        - Creates temporary source files WITHOUT any `// Covers: RISK-NNN` annotation for that risk
        - Calls the traceability validation function
        - Asserts no exception is raised (low severity risks don't require coverage)
    - [ ] `test_generate_traceability_json()`: Write a test that:
        - Creates a mock risk list with various risks (some covered, some not, some accepted)
        - Calls the traceability engine to generate `target/traceability.json`
        - Asserts the JSON file is created with the correct structure:
            - `risk_matrix_violations` array containing violations for uncovered high-severity risks
            - Each violation has format: `{"type": "missing_test_coverage", "risk_id": "RISK-NNN", "severity_score": int}`
        - Asserts the file is valid JSON and can be parsed

## 2. Task Implementation
- [ ] Extend `.tools/verify_requirements.py` with the following new components:
    - [ ] Add a new regex pattern for risk coverage annotations:
        - `RISK_COVERS_REGEX = re.compile(r"//\s*Covers:\s*(RISK-[A-Z0-9_-]+)")`
        - This matches comments like `// Covers: RISK-001` in test files
    - [ ] Implement `scan_risk_coverage_annotations(file_paths: List[str]) -> Dict[str, Set[str]]`:
        - Scan each file for `// Covers: RISK-NNN` annotations
        - Return a dict mapping `file_path -> set of risk IDs` found in that file
        - Aggregate to get a global set of all covered risk IDs
    - [ ] Implement `validate_risk_traceability(risks: List[RiskRecord], covered_risks: Set[str]) -> List[Dict]`:
        - For each risk with `severity_score >= 6`:
            - Skip if `status` is `"Accepted"` or `"Retired"`
            - Check if the risk ID is in `covered_risks`
            - If not covered, add to violations list with format: `{"type": "missing_test_coverage", "risk_id": str, "severity_score": int, "status": str}`
        - Return the violations list
    - [ ] Implement `generate_traceability_json(violations: List[Dict], output_path: str)`:
        - Create the `target/` directory if it doesn't exist
        - Build a dict with structure:
            ```json
            {
                "risk_matrix_violations": [...],
                "covered_risks": [...],
                "uncovered_high_severity_risks": [...],
                "generated_at": "ISO-8601 timestamp"
            }
            ```
        - Write to `target/traceability.json` with proper JSON formatting
    - [ ] Extend `validate_risk_matrix_file(file_path: str) -> Dict` to include traceability validation:
        - After validating risks and mitigations, call `validate_risk_traceability()`
        - Add traceability violations to the errors list
        - Call `generate_traceability_json()` to write the output
    - [ ] Update the `main()` function to:
        - Accept a `--generate-traceability` flag to output `target/traceability.json`
        - Report traceability violations in the output
        - Exit non-zero if any `missing_test_coverage` violations are found

- [ ] Extend `.tools/validate_risk_matrix.py` to integrate with traceability:
    - [ ] Add a function `get_all_python_test_files() -> List[str]`:
        - Recursively find all `.py` files in `tests/` and `.tools/tests/` directories
        - Return a list of file paths
    - [ ] Add a function `get_all_rust_source_files() -> List[str]`:
        - Recursively find all `.rs` files in `crates/` directory
        - Return a list of file paths
    - [ ] Update the validation pipeline to:
        - Call `scan_risk_coverage_annotations()` on all source files
        - Pass the covered risks set to `validate_risk_traceability()`
        - Include traceability violations in the final report

- [ ] Update the `./do` script:
    - [ ] Extend `cmd_test()` to:
        - After running pytest, call the traceability validation
        - Generate `target/traceability.json`
        - Exit non-zero if `risk_matrix_violations` array is non-empty (unless explicitly allowed)
    - [ ] Add a helper function `check_traceability_violations()` that:
        - Reads `target/traceability.json`
        - Checks if `risk_matrix_violations` is empty
        - Returns exit code 1 if violations exist

## 3. Code Review
- [ ] Verify the annotation regex correctly matches:
    - `// Covers: RISK-001` (standard format)
    - `// Covers: RISK-001-A` (with suffix)
    - Multiple annotations on the same line (if applicable)
    - Annotations in both Python (`.py`) and Rust (`.rs`) files
- [ ] Verify that accepted risks with `severity_score >= 6` require a justification comment in the ADR document per [RISK-BR-020]:
    - Check that the `status` field contains a reference to an ADR (e.g., `status = "Accepted (see docs/adr/0XXX-risk-001-acceptance.md)"`)
    - Optionally validate that the referenced ADR file exists
- [ ] Ensure the `target/traceability.json` structure matches the expected schema:
    - `risk_matrix_violations` is an array
    - Each violation has a `type` field with value `"missing_test_coverage"`, `"duplicate_risk_id"`, or `"missing_mitigation_section"`
- [ ] Verify that the severity threshold (>= 6) is correctly applied
- [ ] Ensure error messages clearly indicate:
    - Which high-severity risks lack coverage
    - What their severity scores are
    - Which test files should contain the coverage annotation

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_risk_traceability.py -v` and ensure all tests pass
- [ ] Run `python .tools/validate_risk_matrix.py docs/plan/requirements/8_risks_mitigation.md --generate-traceability` to validate and generate traceability JSON
- [ ] Run `./do test` and ensure it:
    - Runs all pytest tests
    - Generates `target/traceability.json`
    - Exits 0 if no violations, exits 1 if violations exist
- [ ] Temporarily remove a `// Covers: RISK-NNN` annotation for a high-severity risk and verify that `./do test` fails
- [ ] Verify that `target/traceability.json` is created and contains the expected structure
- [ ] Add a `// Covers: RISK-NNN` annotation for an uncovered high-severity risk and verify the violation is resolved

## 5. Update Documentation
- [ ] Add a comment at the top of `.tools/verify_requirements.py` referencing the covered requirements: `[AC-RISK-MATRIX-001]`, `[AC-RISK-MATRIX-003]`
- [ ] Update `.agent/MEMORY.md` or project documentation to describe:
    - How to add risk coverage annotations to test files
    - The severity threshold (>= 6) for requiring coverage
    - The process for accepting a high-severity risk without coverage (requires ADR documentation)
    - The structure of `target/traceability.json`
- [ ] Document the validation error types for traceability violations:
    - `"missing_test_coverage"` — triggered by AC-RISK-MATRIX-003
    - How this integrates with the broader `risk_matrix_violations` array for AC-RISK-MATRIX-001
- [ ] Create a documentation file `docs/risk-coverage.md` explaining:
    - Why risk coverage is important
    - How to write tests that cover risks
    - How to annotate tests with `// Covers: RISK-NNN`
    - How to verify coverage via `./do test`

## 6. Automated Verification
- [ ] Confirm that `./do test` generates `target/traceability.json` on every run
- [ ] Verify that `target/traceability.json` has `risk_matrix_violations` array empty when all high-severity risks are covered
- [ ] Verify that the CI pipeline (`.tools/ci.py`) includes the traceability check
- [ ] Create a test fixture with a high-severity risk lacking coverage and verify the full pipeline catches it:
    - Modify a copy of the risk matrix to add a high-severity risk
    - Run `./do test` and verify it fails
    - Add the coverage annotation and verify it passes
- [ ] Ensure the traceability report is included in CI artifacts for review
