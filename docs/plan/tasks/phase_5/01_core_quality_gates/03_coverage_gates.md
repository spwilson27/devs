# Task: Coverage Aggregator & Quality Gate Reporting (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-043]

## Dependencies
- depends_on: [01_e2e_infrastructure.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_coverage_report.py` that mocks `llvm-cov` output and asserts that the aggregator correctly produces `target/coverage/report.json` according to the required schema.
- [ ] Assert that the gate IDs "QG-001" through "QG-005" are present and that their thresholds match those defined in `docs/plan/phases/phase_5.md`.

## 2. Task Implementation
- [ ] Create a Python script `.tools/aggregate_coverage.py`:
    - Executes `cargo llvm-cov --json --output-path target/coverage/raw.json`.
    - Parses the JSON output to extract coverage percentages for specific crates (Unit) and the whole project (Aggregate E2E).
    - Maps the data to the five quality gates:
        - **QG-001**: >=90% Unit coverage for core crates (`devs-core`, `devs-scheduler`, etc.).
        - **QG-002**: >=80% Aggregate E2E coverage across CLI, TUI, and MCP.
        - **QG-003**: >=50% CLI-specific E2E coverage.
        - **QG-004**: >=50% TUI-specific E2E coverage.
        - **QG-005**: >=50% MCP-specific E2E coverage.
    - Produces `target/coverage/report.json` with the schema:
        - `schema_version`: 1
        - `overall_passed`: boolean
        - `gates`: list of objects with `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`, `uncovered_lines`, `total_lines`.
- [ ] Update `./do coverage` to invoke this aggregator.

## 3. Code Review
- [ ] Verify that the aggregator can distinguish between Unit and E2E coverage (likely by running the test suites separately with different coverage output files).
- [ ] Confirm that the gate IDs "QG-001" through "QG-005" are exactly as specified.

## 4. Run Automated Tests to Verify
- [ ] Run the Python test: `pytest tests/test_coverage_report.py`.
- [ ] Run `./do coverage` and inspect the generated `target/coverage/report.json`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to explain the meaning of each quality gate and how they are computed.
- [ ] Update `docs/plan/phases/phase_5.md` to reference the canonical report location.

## 6. Automated Verification
- [ ] Validate `target/coverage/report.json` against a JSON schema (if defined).
- [ ] Verify that the `actual_pct` values accurately reflect the output of `llvm-cov`.
