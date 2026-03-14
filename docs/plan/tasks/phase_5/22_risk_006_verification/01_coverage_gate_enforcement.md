# Task: Coverage Gate Enforcement & Report Generation (Sub-Epic: 22_Risk 006 Verification)

## Covered Requirements
- [AC-RISK-006-01], [AC-RISK-006-02], [MIT-006]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test suite `tests/test_coverage_gates.py` that:
    - Mocks the output of `cargo-llvm-cov` to simulate both passing and failing coverage results for all 5 gates (QG-001–QG-005).
    - Verifies that the coverage script correctly identifies a failing gate.
    - Verifies that a `target/coverage/report.json` is generated with the correct schema when the script runs.
    - Asserts that `uncovered_lines` is populated for any failing gate.
    - Asserts that the script returns a non-zero exit code if any gate fails.

## 2. Task Implementation
- [ ] Implement or update a coverage orchestration script (e.g., `.tools/coverage.py`) that:
    - Defines the 5 mandatory gates:
        - QG-001: Unit tests, all crates (≥ 90.0% line).
        - QG-002: E2E aggregate (≥ 80.0% line).
        - QG-003: CLI E2E only (≥ 50.0% line).
        - QG-004: TUI E2E only (≥ 50.0% line).
        - QG-005: MCP E2E only (≥ 50.0% line).
    - Invokes `cargo-llvm-cov` with the appropriate flags for each gate (e.g., `--lib` for QG-001, `--test '*_e2e*'` for QG-002).
    - Parses the output to extract `actual_pct` and identifies any `uncovered_lines`.
    - Generates `target/coverage/report.json` with the schema:
        ```json
        {
          "schema_version": 1,
          "generated_at": "...",
          "overall_passed": true/false,
          "gates": [
            {
              "gate_id": "QG-NNN",
              "scope": "...",
              "threshold_pct": 0.0,
              "actual_pct": 0.0,
              "passed": true/false,
              "delta_pct": null,
              "uncovered_lines": [{"file": "...", "line": N}],
              "total_lines": 0,
              "covered_lines": 0
            }
          ]
        }
        ```
    - Ensures that `./do coverage` invokes this script.
    - Causes `./do coverage` to exit non-zero if any gate fails its threshold.

## 3. Code Review
- [ ] Verify that the script correctly distinguishes between unit test coverage and E2E coverage by using the appropriate `cargo-llvm-cov` flags.
- [ ] Ensure that the JSON report matches the specified schema exactly.
- [ ] Confirm that `uncovered_lines` extraction from the coverage report is accurate and handles multiple files.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_coverage_gates.py`.
- [ ] Run `./do coverage` in the workspace and verify that it produces `target/coverage/report.json` and exits correctly based on current coverage.

## 5. Update Documentation
- [ ] Update documentation to reflect that coverage gates are now enforced and that `report.json` is generated for every coverage run.

## 6. Automated Verification
- [ ] Run `./do coverage` and verify that the exit code is non-zero if any gate is failing.
- [ ] Inspect `target/coverage/report.json` to confirm it contains all 5 gates.
