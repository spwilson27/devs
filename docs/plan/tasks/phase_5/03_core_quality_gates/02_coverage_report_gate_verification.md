# Task: Coverage Report Gate Verification (Sub-Epic: 03_Core Quality Gates)

## Covered Requirements
- [AC-ROAD-P5-001]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_coverage_reporting.py` that verifies the structure of the generated `target/coverage/report.json`.
- [ ] The test should mock coverage data and verify that the reporting logic correctly calculates:
  - `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct` for each of the 5 gates (QG-001 to QG-005).
  - `overall_passed` as the logical AND of all 5 `passed` fields.

## 2. Task Implementation
- [ ] Update the `cmd_coverage` function in the `./do` script (or a specialized helper script like `.tools/coverage_report.py`) to:
  - Run unit tests and E2E tests for CLI, TUI, and MCP, capturing coverage data for each.
  - Extract coverage percentages for "core crates", "aggregate E2E", and individual interfaces.
  - Define the threshold constants for MVP (QG-001: 90%, QG-002: 80%, QG-003/004/005: 50%).
  - Generate the `target/coverage/report.json` file with the specified 5-gate structure.
- [ ] Ensure the `./do coverage` command exits with a non-zero status if `overall_passed` is false.

## 3. Code Review
- [ ] Verify that the 5 gates match the definitions in `phase_5.md` exactly.
- [ ] Ensure the `delta_pct` calculation correctly reflects the difference between `actual_pct` and `threshold_pct`.
- [ ] Check that the reporting logic is robust against missing coverage data (e.g., if a suite fails to run).

## 4. Run Automated Tests to Verify
- [ ] Run `./do coverage` in the project root.
- [ ] Confirm `target/coverage/report.json` is created and contains the expected fields.
- [ ] Verify that the output is valid JSON and matches the requirement spec.

## 5. Update Documentation
- [ ] Update `docs/plan/summaries/coverage.md` (if it exists) or create it to document the final coverage gate state.
- [ ] Update the agent's memory with instructions on how to interpret the coverage report.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and ensure `AC-ROAD-P5-001` is marked as verified by the new tests.
