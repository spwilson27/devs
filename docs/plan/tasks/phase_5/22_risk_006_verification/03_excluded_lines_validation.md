# Task: Excluded Lines Integrity Check (Sub-Epic: 22_Risk 006 Verification)

## Covered Requirements
- [RISK-006-BR-004]

## Dependencies
- depends_on: ["phase_5/22_risk_006_verification/01_coverage_gate_enforcement.md"]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_excluded_lines_validation.py` that:
    - Sets up a dummy Rust project with source code containing `// llvm-cov:ignore` annotations.
    - Verifies that the validation script passes when all `// llvm-cov:ignore` lines are present in `target/coverage/excluded_lines.txt`.
    - Verifies that the validation script fails when a `// llvm-cov:ignore` annotation exists in a source file but is missing from `excluded_lines.txt`.
    - Asserts that the validation script provides a clear error message indicating the missing lines.

## 2. Task Implementation
- [ ] Implement a validation script (e.g., `.tools/validate_exclusions.py`) that:
    - Recursively scans the workspace for `.rs` files.
    - Uses a regex to find all lines containing the `// llvm-cov:ignore` annotation.
    - Extracts the file path and line number for each match.
    - Verifies that each `// llvm-cov:ignore` annotation is accompanied by a justification comment on the same or preceding line.
    - Reads `target/coverage/excluded_lines.txt` and parses its content (expecting a format like `file:line`).
    - Compares the set of lines found in the source code with the set of lines listed in `excluded_lines.txt`.
    - Exits non-zero and prints an error if any line is in the source but not in the exclusion file, or if a justification comment is missing.
- [ ] Integrate this script into `./do lint`.
- [ ] Update the coverage script (`.tools/coverage.py`) to generate the initial `target/coverage/excluded_lines.txt` if necessary during coverage collection.

## 3. Code Review
- [ ] Verify that the regex for finding `// llvm-cov:ignore` is correct and does not produce false positives.
- [ ] Ensure that path resolution is handled consistently (e.g., using relative paths from the workspace root).
- [ ] Confirm that `./do lint` correctly fails when an exclusion is not properly documented in the text file.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_excluded_lines_validation.py`.
- [ ] Run `./do lint` and ensure it passes on the current codebase.

## 5. Update Documentation
- [ ] Update documentation to reflect that all `// llvm-cov:ignore` annotations must be documented in `target/coverage/excluded_lines.txt`.

## 6. Automated Verification
- [ ] Add a dummy `// llvm-cov:ignore` comment to a source file without updating `excluded_lines.txt`, then verify that `./do lint` fails as expected.
