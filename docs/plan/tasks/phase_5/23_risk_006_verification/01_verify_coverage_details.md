# Task: Verify Coverage Delta and Uncovered Line Accuracy (Sub-Epic: 23_Risk 006 Verification)

## Covered Requirements
- [AC-RISK-006-03], [AC-RISK-006-04]

## Dependencies
- depends_on: [docs/plan/tasks/phase_5/22_risk_006_verification/01_coverage_gate_enforcement.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_coverage_report_details.py` that:
    - Mocks a baseline `target/coverage/report.json` with specific coverage values (e.g., QG-001 = 90.0%).
    - Runs the coverage orchestration script with mocked `cargo-llvm-cov` JSON output representing a new run (e.g., QG-001 = 92.5%).
    - Asserts that the generated `report.json` contains `"delta_pct": 2.5` for QG-001.
    - Mocks a scenario where a gate fails and `cargo-llvm-cov` identifies uncovered regions.
    - Verifies that `uncovered_lines` in `report.json` contains the correct file paths and line numbers.
    - Asserts that the paths in `uncovered_lines` are relative to the workspace root and exist in the mock filesystem.

## 2. Task Implementation
- [ ] Update the coverage report generation logic (likely in `.tools/coverage.py` or `.tools/ci.py` if used as a backend for `./do coverage`) to:
    - Implement the delta calculation: `actual_pct (current) - actual_pct (baseline)`.
    - Ensure `delta_pct` is always non-null when a baseline is successfully retrieved (per [AC-RISK-006-03]).
    - Refine the parsing of `cargo-llvm-cov --format=json` output to extract the `uncovered_lines` list for any failing gate.
    - Ensure `uncovered_lines` entries point to "real source locations" by validating that the file exists and the line number is within the file's bounds (per [AC-RISK-006-04]).
    - Update `target/coverage/report.json` to include these detailed results.

## 3. Code Review
- [ ] Verify that the delta calculation correctly handles both positive and negative coverage changes.
- [ ] Ensure that `uncovered_lines` does not include files that are explicitly excluded from coverage (e.g., generated code).
- [ ] Confirm that the report generation does not crash if `cargo-llvm-cov` output is malformed or missing expected fields.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_coverage_report_details.py`.
- [ ] Run `./do coverage` in a local environment and manually verify that `target/coverage/report.json` reflects the expected delta if a baseline exists.

## 5. Update Documentation
- [ ] Update the internal "Developer Guide" on coverage reporting to explain how `delta_pct` is calculated and how to use the `uncovered_lines` list for debugging.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that the `target/coverage/report.json` file is produced and satisfies the schema and content requirements for [AC-RISK-006-03] and [AC-RISK-006-04].
