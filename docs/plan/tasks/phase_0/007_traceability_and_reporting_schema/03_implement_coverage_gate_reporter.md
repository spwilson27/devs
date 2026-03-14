# Task: Implement Coverage Gate Reporter and ./do coverage Integration (Sub-Epic: 007_Traceability and Reporting Schema)

## Covered Requirements
- [2_TAS-REQ-081]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (owner — coverage report schema)]

## 1. Initial Test Written
- [ ] Create `tests/test_coverage_reporter.py` with the following test cases:
  - **test_generates_valid_schema**: Provide mock `cargo-llvm-cov --json` output. Assert `target/coverage/report.json` matches the exact schema from [2_TAS-REQ-081]:
    ```json
    {
      "gates": [
        {"gate_id": "QG-001", "scope": "unit", "threshold_pct": 90.0, "actual_pct": 92.3, "passed": true, "delta_pct": 2.3}
      ],
      "overall_passed": true
    }
    ```
  - **test_all_five_gates_present**: Assert the report always contains exactly 5 gates: QG-001 (unit 90%), QG-002 (E2E aggregate 80%), QG-003 (CLI E2E 50%), QG-004 (TUI E2E 50%), QG-005 (MCP E2E 50%).
  - **test_gate_passes_at_threshold**: Unit coverage at exactly 90.0% → QG-001 `passed: true`, `delta_pct: 0.0`.
  - **test_gate_fails_below_threshold**: Unit coverage at 89.9% → QG-001 `passed: false`, `delta_pct: -0.1`.
  - **test_overall_passed_requires_all_gates**: 4 gates pass, 1 fails → `overall_passed: false`.
  - **test_delta_pct_calculation**: `actual_pct: 95.5`, `threshold_pct: 90.0` → `delta_pct: 5.5`. `actual_pct: 45.0`, `threshold_pct: 50.0` → `delta_pct: -5.0`.
  - **test_parses_cargo_llvm_cov_json**: Provide a realistic `cargo-llvm-cov --json` output fixture. Assert the reporter correctly extracts the line coverage percentage.
  - **test_separate_unit_and_e2e_invocations**: The reporter accepts two separate coverage JSON inputs (one for unit tests via `cargo test --lib`, one for E2E via `cargo test --test '*'`). Assert they map to the correct gate scopes.
  - **test_output_directory_created**: If `target/coverage/` does not exist, the reporter creates it.

## 2. Task Implementation
- [ ] Create `.tools/coverage_reporter.py` with:
  - Constants: `GATES = [("QG-001", "unit", 90.0), ("QG-002", "e2e_aggregate", 80.0), ("QG-003", "e2e_cli", 50.0), ("QG-004", "e2e_tui", 50.0), ("QG-005", "e2e_mcp", 50.0)]`.
  - `parse_llvm_cov_json(path: str) -> float`: Read `cargo-llvm-cov --json` output file. Extract `data[0].totals.lines.percent` as the line coverage percentage.
  - `generate_report(coverage_map: dict[str, float]) -> dict`: For each gate, look up `actual_pct` from `coverage_map` keyed by scope name. Calculate `delta_pct = round(actual_pct - threshold_pct, 1)`. Set `passed = actual_pct >= threshold_pct`. Set `overall_passed` to `all(gate["passed"] for gate in gates)`.
  - `main()`: Accept arguments: `--unit-cov <path>` (unit coverage JSON), `--e2e-cov <path>` (aggregate E2E coverage JSON), `--cli-cov <path>`, `--tui-cov <path>`, `--mcp-cov <path>` (per-interface E2E coverage JSONs). Parse each, build `coverage_map`, generate report, write to `target/coverage/report.json` with 2-space indent. Exit 1 if `overall_passed` is false.
- [ ] Integrate into `./do` script: In `cmd_coverage()`:
  1. Run `cargo llvm-cov --json --output-path target/coverage/unit.json -- --lib` for unit tests.
  2. Run `cargo llvm-cov --json --output-path target/coverage/e2e.json -- --test '*'` for E2E tests.
  3. Run per-interface E2E coverage: `cargo llvm-cov --json --output-path target/coverage/e2e_cli.json --package devs-cli -- --test '*'` (and similarly for `devs-tui`, `devs-mcp`).
  4. Invoke `python3 .tools/coverage_reporter.py --unit-cov target/coverage/unit.json --e2e-cov target/coverage/e2e.json --cli-cov target/coverage/e2e_cli.json --tui-cov target/coverage/e2e_tui.json --mcp-cov target/coverage/e2e_mcp.json`.
  5. If the reporter exits non-zero, `./do coverage` must also exit non-zero.
- [ ] Handle missing coverage files gracefully: if a `--*-cov` path does not exist (e.g., crate not yet created), set `actual_pct: 0.0` for that gate and log a warning to stderr.

## 3. Code Review
- [ ] Verify `delta_pct` uses `round(value, 1)` for clean display.
- [ ] Verify gate thresholds match exactly: QG-001=90%, QG-002=80%, QG-003/004/005=50%.
- [ ] Ensure `overall_passed` is a boolean, not a truthy value.
- [ ] JSON output must be deterministic (gates always in QG-001..QG-005 order).

## 4. Run Automated Tests to Verify
- [ ] Run `python3 -m pytest tests/test_coverage_reporter.py -v` and confirm all 9 tests pass.

## 5. Update Documentation
- [ ] Add inline docstrings to all public functions in `coverage_reporter.py`.
- [ ] Document the `target/coverage/report.json` schema in a comment at the top of the reporter file referencing [2_TAS-REQ-081].

## 6. Automated Verification
- [ ] Create a mock `cargo-llvm-cov` JSON fixture, run the reporter against it, and validate the output: `python3 -c "import json; d=json.load(open('target/coverage/report.json')); assert len(d['gates'])==5; assert all(k in d['gates'][0] for k in ['gate_id','scope','threshold_pct','actual_pct','passed','delta_pct']); print('Schema valid')"`.
