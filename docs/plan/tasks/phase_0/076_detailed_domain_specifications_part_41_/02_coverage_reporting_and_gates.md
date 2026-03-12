# Task: Implement Coverage Reporting and Quality Gate Enforcement (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-457], [2_TAS-REQ-458]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new test `tests/test_coverage_gates.py`.
- [ ] Mock the output of a coverage tool (e.g., `pytest --cov --cov-report=json`).
- [ ] Write a test that parses this mock output and generates a `target/coverage/report.json`.
- [ ] Verify that:
    - `target/coverage/report.json` contains exactly five gate entries (QG-001 through QG-005).
    - If any gate's coverage is below its threshold, `overall_passed` is `false` and the tool exits non-zero.
    - If all gates are above thresholds, `overall_passed` is `true` and the tool exits 0.

## 2. Task Implementation
- [ ] Create or update a Python script (e.g., `.tools/coverage_reporter.py`) to process coverage data and enforce quality gates.
- [ ] Define the constants for the five quality gates as specified in the project roadmap and requirements:
    - **QG-001** (Unit Tests): ≥ 90.0%
    - **QG-002** (E2E Aggregate): ≥ 80.0%
    - **QG-003** (CLI E2E): ≥ 50.0%
    - **QG-004** (TUI E2E): ≥ 50.0%
    - **QG-005** (MCP E2E): ≥ 50.0%
- [ ] The report JSON `target/coverage/report.json` must follow this schema for each gate:
    ```json
    {
      "gate_id": "QG-00X",
      "threshold_pct": 90.0,
      "actual_pct": 92.5,
      "passed": true,
      "delta_pct": 2.5
    }
    ```
- [ ] Implement the `overall_passed` field as the logical AND of all five gates.
- [ ] Update `./do coverage` in the `./do` script:
    - Run `pytest` with coverage instrumentation.
    - Invoke the new `coverage_reporter.py` to generate the report and enforce gates.
    - Ensure the exit code of `./do coverage` is non-zero if any gate fails.

## 3. Code Review
- [ ] Verify that E2E coverage is correctly isolated from unit coverage where required (e.g., by matching test file patterns like `*_e2e.rs`).
- [ ] Ensure `delta_pct` is correctly calculated as `actual_pct - threshold_pct`.

## 4. Run Automated Tests to Verify
- [ ] Run `python3 tests/test_coverage_gates.py`.
- [ ] Run `./do coverage` and verify `target/coverage/report.json` is created and schema-valid.

## 5. Update Documentation
- [ ] No documentation update required beyond task confirmation.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that `target/coverage/report.json` has exactly five gate entries.
- [ ] Artificially lower a threshold in the reporter code and verify `./do coverage` fails with a non-zero exit code.
