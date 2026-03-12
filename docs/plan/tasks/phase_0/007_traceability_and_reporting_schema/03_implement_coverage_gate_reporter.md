# Task: Implement Coverage Gate Reporter (Sub-Epic: 007_Traceability and Reporting Schema)

## Covered Requirements
- [2_TAS-REQ-081]

## Dependencies
- depends_on: [none]
- shared_components: [Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_coverage_reporter.py` that:
    - Provides a mock `cargo-llvm-cov` JSON output.
    - Verifies the reporter correctly identifies unit, E2E, and per-interface coverage.
    - Verifies that the reporter generates `target/coverage/report.json` matching the schema in [2_TAS-REQ-081].
    - Verifies that it fails (overall_passed: false) if any scope falls below its threshold (90% unit, 80% E2E, 50% interface).

## 2. Task Implementation
- [ ] Implement `.tools/coverage_reporter.py`.
- [ ] Define the threshold constants for each scope (Unit: 90%, E2E: 80%, Interface: 50%).
- [ ] Parse the `cargo-llvm-cov` JSON format and extract the relevant `actual_pct` for each scope.
- [ ] Implement the gate logic and `report.json` generation.
- [ ] Update `./do` script's `cmd_coverage()` to call this reporter after `cargo llvm-cov` runs.

## 3. Code Review
- [ ] Verify that the `delta_pct` is correctly calculated as `actual_pct - threshold_pct`.
- [ ] Ensure that `overall_passed` is only true if ALL gates pass.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_coverage_reporter.py`.

## 5. Update Documentation
- [ ] Document the coverage quality gates and the resulting report schema in `.tools/README.md`.

## 6. Automated Verification
- [ ] Verify the existence and content of `target/coverage/report.json` after running `./do coverage`.
