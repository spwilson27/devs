# Task: Coverage Aggregator & Quality Gate Reporting (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-043]

## Dependencies
- depends_on: [01_e2e_infrastructure.md]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_coverage_report.py` that:
  1. Mocks `cargo-llvm-cov --json` output with sample coverage data.
  2. Invokes the coverage aggregator script.
  3. Asserts that `target/coverage/report.json` is produced with the correct schema.
  4. Verifies that gate IDs "QG-001" through "QG-005" are present.
  5. Verifies that thresholds match those defined in `docs/plan/phases/phase_5.md`:
     - QG-001: ≥90% unit coverage
     - QG-002: ≥80% aggregate E2E coverage
     - QG-003: ≥50% CLI E2E coverage
     - QG-004: ≥50% TUI E2E coverage
     - QG-005: ≥50% MCP E2E coverage
  6. Annotates with `// Covers: [3_MCP_DESIGN-REQ-043]`.
- [ ] Run the test to confirm it fails (red) before the aggregator is implemented:
  ```
  pytest tests/test_coverage_report.py -v 2>&1 | tee /tmp/coverage_test_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Create the coverage aggregator script** at `.tools/aggregate_coverage.py`:
  - Executes `cargo llvm-cov --json --output-path target/coverage/raw.json` for unit tests:
    ```
    cargo llvm-cov --workspace --json --output-path target/coverage/unit_raw.json -- --test-threads=1
    ```
  - Executes `cargo llvm-cov --json` separately for E2E tests (filtered by test path):
    ```
    cargo llvm-cov --workspace --json --output-path target/coverage/e2e_raw.json -- --test-threads=1 --skip unit
    ```
  - Parses the JSON output to extract coverage percentages per crate and per interface.
  - Maps the data to the five quality gates:
    - **QG-001**: ≥90% unit coverage for core crates (`devs-core`, `devs-scheduler`, `devs-grpc`, `devs-mcp`, `devs-server`).
    - **QG-002**: ≥80% aggregate E2E coverage across CLI, TUI, and MCP interfaces.
    - **QG-003**: ≥50% CLI-specific E2E coverage (tests in `crates/devs-cli/tests/e2e/`).
    - **QG-004**: ≥50% TUI-specific E2E coverage (tests in `crates/devs-tui/tests/e2e/`).
    - **QG-005**: ≥50% MCP-specific E2E coverage (tests in `crates/devs-mcp/tests/e2e/`).
  - Produces `target/coverage/report.json` with the exact schema:
    ```json
    {
      "schema_version": 1,
      "overall_passed": true,
      "gates": [
        {
          "gate_id": "QG-001",
          "threshold_pct": 90.0,
          "actual_pct": 92.3,
          "passed": true,
          "delta_pct": 2.3,
          "uncovered_lines": 142,
          "total_lines": 1850
        }
      ]
    }
    ```
  - Each gate entry MUST have: `gate_id`, `threshold_pct`, `actual_pct`, `passed`, `delta_pct`, `uncovered_lines`, `total_lines`.
  - `overall_passed` is `true` only if all five gates have `passed: true`.
  - Annotate with `# [3_MCP_DESIGN-REQ-043]`.

- [ ] **Update `./do coverage`** to invoke the aggregator:
  - After running `cargo llvm-cov`, invoke `.tools/aggregate_coverage.py`.
  - Ensure the report is written to `target/coverage/report.json`.
  - Exit non-zero if `overall_passed` is `false`.
  - Annotate with `# [3_MCP_DESIGN-REQ-043]`.

- [ ] **Implement coverage gap analysis guidance** in the aggregator:
  - When a gate fails, the script MUST print actionable guidance to stderr:
    ```
    Coverage gate QG-003 (CLI E2E) FAILED: actual=45.2%, threshold=50.0%, delta=-4.8%
    Uncovered lines in devs-cli: src/cli/submit.rs:42-68, src/cli/status.rs:15-30
    Recommendation: Add E2E tests for 'devs submit' and 'devs status' commands.
    ```
  - This enables the development agent to follow the [3_MCP_DESIGN-REQ-043] analysis workflow.

## 3. Code Review
- [ ] Verify that the aggregator can distinguish between unit and E2E coverage by running test suites separately with different `cargo llvm-cov` invocations.
- [ ] Confirm that the gate IDs "QG-001" through "QG-005" are exactly as specified in `phase_5.md`.
- [ ] Verify that `delta_pct` is calculated as `actual_pct - threshold_pct` (positive delta = passing).
- [ ] Ensure that `uncovered_lines` and `total_lines` are accurate counts from the `llvm-cov` output.
- [ ] Confirm all public functions have doc comments.
- [ ] Verify `// Covers: [3_MCP_DESIGN-REQ-043]` annotations are present in test files.

## 4. Run Automated Tests to Verify
- [ ] Run the Python test:
  ```
  pytest tests/test_coverage_report.py -v
  ```
  The test must pass (green) — meaning the aggregator produces the correct schema.
- [ ] Run `./do coverage` and inspect the generated `target/coverage/report.json`:
  ```
  ./do coverage 2>&1 | tee /tmp/coverage_run.txt
  cat target/coverage/report.json | python3 -m json.tool
  ```
- [ ] Verify that the report contains all five gates:
  ```
  python3 -c "import json; d=json.load(open('target/coverage/report.json')); assert len(d['gates'])==5; print('OK: 5 gates present')"
  ```
- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids 3_MCP_DESIGN-REQ-043
  ```
  Must exit 0 and report `3_MCP_DESIGN-REQ-043` as "covered".

## 5. Update Documentation
- [ ] Add a section to `GEMINI.md` titled "Coverage Gap Analysis" explaining:
  - When a coverage gate fails, the agent MUST read `target/coverage/report.json` via the filesystem MCP.
  - The agent MUST identify which gate failed and its `actual_pct`, `threshold_pct`, and `delta_pct`.
  - For E2E interface gates (QG-003/QG-004/QG-005), the agent MUST identify which interface (CLI/TUI/MCP) is below threshold.
  - The agent MUST read `target/coverage/lcov.info` or per-file coverage data to identify specific uncovered lines.
  - The agent MUST prioritize writing tests that cover the largest contiguous uncovered regions in engine crates.
- [ ] Update `docs/architecture/testing.md` to document the coverage gate structure and thresholds.
- [ ] In `docs/plan/phases/phase_5.md`, update the entry for `[3_MCP_DESIGN-REQ-043]`:
  ```
  - [3_MCP_DESIGN-REQ-043]: Covered by `.tools/aggregate_coverage.py` and `tests/test_coverage_report.py`
  ```

## 6. Automated Verification
- [ ] Confirm the requirement is covered in the traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_coverage.txt
  grep "3_MCP_DESIGN-REQ-043" /tmp/presubmit_coverage.txt
  ```
  The ID must appear as `COVERED`.
- [ ] Validate `target/coverage/report.json` schema:
  ```
  python3 -c "
  import json
  d = json.load(open('target/coverage/report.json'))
  assert d['schema_version'] == 1
  assert 'overall_passed' in d
  assert len(d['gates']) == 5
  gate_ids = {g['gate_id'] for g in d['gates']}
  assert gate_ids == {'QG-001', 'QG-002', 'QG-003', 'QG-004', 'QG-005'}
  for g in d['gates']:
      assert all(k in g for k in ['threshold_pct', 'actual_pct', 'passed', 'delta_pct', 'uncovered_lines', 'total_lines'])
  print('OK: Schema validated')
  "
  ```
- [ ] Verify that the `actual_pct` values accurately reflect the output of `llvm-cov` by spot-checking one crate:
  ```
  cargo llvm-cov --package devs-core --json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'devs-core: {d[\"data\"][0][\"totals\"][\"lines\"][\"percent\"]}%')"
  ```
