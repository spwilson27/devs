# Task: Verify E2E Coverage Isolation (Sub-Epic: 21_Risk 005 Verification)

## Covered Requirements
- [RISK-006-BR-002]

## Dependencies
- depends_on: [02_verify_coverage_exclusion_constraints.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test file `tests/test_e2e_coverage_isolation.py` with the following test functions:
  - [ ] `test_unit_tests_do_not_count_toward_e2e_gates()`:
    - **Test Setup**: Create a mock coverage report JSON that simulates:
      - A Rust function `devs_cli::run_command()` covered ONLY by unit tests (`#[test]` functions calling it directly).
      - The same function NOT covered by any E2E test (no `assert_cmd` subprocess, no `TestBackend` cycle, no HTTP POST).
    - **Test Execution**: Run the coverage aggregation logic (from `.tools/aggregate_coverage.py` or equivalent) with this mock data.
    - **Assertion**: Verify the function's lines are NOT included in the numerator for QG-003 (CLI E2E), QG-004 (TUI E2E), or QG-005 (MCP E2E).
    - **Covers**: [RISK-006-BR-002], [8_RISKS-REQ-146]
  - [ ] `test_cli_e2e_coverage_requires_assert_cmd()`:
    - **Test Setup**: Identify all test files in `devs-cli/tests/` or equivalent.
    - **Test Execution**: For each test, check if it uses `assert_cmd::Command` or `std::process::Command` to spawn the CLI binary as a subprocess.
    - **Assertion**: Only tests that spawn the CLI binary count toward QG-003. Tests that call internal functions directly are excluded.
    - **Covers**: [RISK-006-BR-002], [8_RISKS-REQ-146]
  - [ ] `test_tui_e2e_coverage_requires_full_handle_event_render_cycle()`:
    - **Test Setup**: Identify all test files in `devs-tui/tests/` or equivalent.
    - **Test Execution**: For each test, check if it:
      - Creates a `TestBackend` (or equivalent mock terminal).
      - Calls `handle_event()` on the TUI application.
      - Calls `render()` and asserts on the rendered output.
    - **Assertion**: Only tests completing the full cycle count toward QG-004. Tests that call rendering functions directly without the event loop are excluded.
    - **Covers**: [RISK-006-BR-002], [8_RISKS-REQ-146]
  - [ ] `test_mcp_e2e_coverage_requires_http_post_to_running_server()`:
    - **Test Setup**: Identify all test files in `devs-mcp/tests/` or equivalent.
    - **Test Execution**: For each test, check if it:
      - Starts a real MCP server instance (listening on a test port).
      - Sends HTTP POST requests to `/mcp/v1/call` or equivalent endpoint.
      - Does NOT call server internals directly via Rust function calls.
    - **Assertion**: Only tests using HTTP requests to a running server count toward QG-005. Direct function calls are excluded.
    - **Covers**: [RISK-006-BR-002], [8_RISKS-REQ-146]

## 2. Task Implementation
- [ ] **Implement coverage isolation in `.tools/aggregate_coverage.py`**:
  ```python
  #!/usr/bin/env python3
  """
  Aggregates coverage data with strict isolation between unit and E2E tests.
  Ensures QG-003, QG-004, QG-005 are calculated ONLY from legitimate interface boundary tests.
  """
  import json, os, subprocess, sys
  from pathlib import Path

  def run_cargo_llvm_cov(profile: str, output_dir: str):
      """Run cargo llvm-cov with a specific test profile filter."""
      cmd = [
          "cargo", "llvm-cov",
          "--json",
          "--summary-only",
          f"--output-path={output_dir}/coverage_{profile}.json",
      ]
      if profile == "unit":
          cmd.append("--lib")  # Only library tests (unit tests)
      elif profile == "cli_e2e":
          cmd.extend(["--test", "cli_e2e"])  # Only CLI E2E tests
      elif profile == "tui_e2e":
          cmd.extend(["--test", "tui_e2e"])  # Only TUI E2E tests
      elif profile == "mcp_e2e":
          cmd.extend(["--test", "mcp_e2e"])  # Only MCP E2E tests
      elif profile == "e2e_aggregate":
          cmd.append("--test")  # All E2E tests
      subprocess.run(cmd, check=True)

  def calculate_gate_coverage(coverage_data: dict, gate_type: str) -> dict:
      """
      Calculate coverage for a specific gate, excluding unit-only lines.
      
      gate_type: "QG-003" (CLI E2E), "QG-004" (TUI E2E), "QG-005" (MCP E2E)
      """
      # Get E2E coverage for this gate
      e2e_cov = coverage_data.get(f"{gate_type}_e2e", {})
      unit_cov = coverage_data.get("unit", {})
      
      # Lines covered ONLY by unit tests are excluded from E2E gates
      e2e_covered_lines = set(e2e_cov.get("covered_lines", []))
      unit_only_lines = set(unit_cov.get("covered_lines", [])) - e2e_covered_lines
      
      total_lines = e2e_cov.get("total_lines", 0)
      covered_lines = len(e2e_covered_lines)
      
      return {
          "gate_id": gate_type,
          "total_lines": total_lines,
          "covered_lines": covered_lines,
          "unit_only_lines_excluded": len(unit_only_lines),
          "actual_pct": (covered_lines / total_lines * 100) if total_lines > 0 else 0.0
      }

  if __name__ == '__main__':
      output_dir = "target/coverage"
      os.makedirs(output_dir, exist_ok=True)
      
      # Run coverage for each profile separately
      profiles = ["unit", "cli_e2e", "tui_e2e", "mcp_e2e", "e2e_aggregate"]
      coverage_data = {}
      
      for profile in profiles:
          print(f"Running coverage for profile: {profile}")
          run_cargo_llvm_cov(profile, output_dir)
          with open(f"{output_dir}/coverage_{profile}.json") as f:
              coverage_data[profile] = json.load(f)
      
      # Calculate isolated gate coverage
      gates = {
          "QG-003": calculate_gate_coverage(coverage_data, "cli_e2e"),
          "QG-004": calculate_gate_coverage(coverage_data, "tui_e2e"),
          "QG-005": calculate_gate_coverage(coverage_data, "mcp_e2e"),
      }
      
      # Generate report
      report = {
          "schema_version": 1,
          "generated_at": subprocess.run(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"], capture_output=True, text=True).stdout.strip(),
          "gates": [
              {
                  "gate_id": "QG-001",
                  "scope": "unit_all_crates",
                  "threshold_pct": 90.0,
                  "actual_pct": coverage_data["unit"].get("percent", 0.0),
                  "passed": coverage_data["unit"].get("percent", 0.0) >= 90.0,
              },
              {
                  "gate_id": "QG-002",
                  "scope": "e2e_aggregate",
                  "threshold_pct": 80.0,
                  "actual_pct": coverage_data["e2e_aggregate"].get("percent", 0.0),
                  "passed": coverage_data["e2e_aggregate"].get("percent", 0.0) >= 80.0,
              },
              # Add QG-003, QG-004, QG-005 with isolated calculations
              *[
                  {
                      "gate_id": gate_id,
                      "scope": gate_data["gate_id"],
                      "threshold_pct": 50.0,
                      "actual_pct": gate_data["actual_pct"],
                      "passed": gate_data["actual_pct"] >= 50.0,
                      "unit_only_lines_excluded": gate_data["unit_only_lines_excluded"],
                  }
                  for gate_id, gate_data in gates.items()
              ],
          ],
          "overall_passed": all(g["passed"] for g in gates.values()) and \
                            coverage_data["unit"].get("percent", 0.0) >= 90.0 and \
                            coverage_data["e2e_aggregate"].get("percent", 0.0) >= 80.0,
      }
      
      with open(f"{output_dir}/report.json", "w") as f:
          json.dump(report, f, indent=2)
      
      print(f"Coverage report generated: {output_dir}/report.json")
      if not report["overall_passed"]:
          print("WARNING: Some coverage gates failed!")
          sys.exit(1)
      print("SUCCESS: All coverage gates passed!")
      sys.exit(0)
  ```
- [ ] **Update `./do coverage` to invoke the isolation-aware aggregator**:
  - Replace the existing coverage aggregation step with:
    ```bash
    coverage_aggregate() {
        echo "Aggregating coverage with unit/E2E isolation..."
        python3 .tools/aggregate_coverage.py
    }
    ```
  - Ensure the script runs AFTER all individual test profiles have been executed.
- [ ] **Create E2E test markers** for proper filtering:
  - In `devs-cli/tests/`, create `cli_e2e.rs` (or mark existing tests with `#[cfg(test_e2e_cli)]`).
  - In `devs-tui/tests/`, create `tui_e2e.rs` (or mark existing tests with `#[cfg(test_e2e_tui)]`).
  - In `devs-mcp/tests/`, create `mcp_e2e.rs` (or mark existing tests with `#[cfg(test_e2e_mcp)]`).
  - This allows `cargo llvm-cov --test <name>` to filter correctly.

## 3. Code Review
- [ ] **Verify unit test exclusion**:
  - Write a unit test in `devs-cli` that calls an internal function directly (no subprocess spawn).
  - Run `./do coverage` and check `target/coverage/report.json`.
  - Confirm the lines covered by this test do NOT increase `QG-003` `actual_pct`.
- [ ] **Verify CLI E2E inclusion**:
  - Write a test using `assert_cmd::Command::cargo_bin("devs-cli")` to spawn the CLI.
  - Run `./do coverage` and confirm the lines covered DO increase `QG-003` `actual_pct`.
- [ ] **Verify TUI E2E inclusion**:
  - Write a test using `TestBackend` with full `handle_event()` → `render()` cycle.
  - Run `./do coverage` and confirm the lines covered DO increase `QG-004` `actual_pct`.
- [ ] **Verify MCP E2E inclusion**:
  - Write a test that starts a server and sends HTTP POST to `/mcp/v1/call`.
  - Run `./do coverage` and confirm the lines covered DO increase `QG-005` `actual_pct`.
- [ ] **Verify isolation cannot be bypassed**:
  - Attempt to add a `#[test]` function in `devs-cli/tests/cli_e2e.rs` that calls internal functions without spawning the binary.
  - Confirm the coverage aggregator correctly identifies this as non-E2E and excludes it from QG-003.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite:
  ```bash
  cd /home/mrwilson/software/devs
  python3 -m pytest tests/test_e2e_coverage_isolation.py -v
  ```
- [ ] Run coverage aggregation:
  ```bash
  ./do coverage
  ```
- [ ] Inspect the coverage report:
  ```bash
  cat target/coverage/report.json | python3 -m json.tool
  # Verify:
  # - QG-003, QG-004, QG-005 have "unit_only_lines_excluded" fields
  # - overall_passed reflects all 5 gates
  ```
- [ ] Manually verify isolation:
  ```bash
  # Check that unit-only coverage is tracked separately
  cat target/coverage/coverage_unit.json | python3 -m json.tool | grep -A5 "covered_lines"
  cat target/coverage/coverage_cli_e2e.json | python3 -m json.tool | grep -A5 "covered_lines"
  # Lines in unit but not in cli_e2e should be excluded from QG-003
  ```

## 5. Update Documentation
- [ ] **Update `docs/plan/specs/8_risks_mitigation.md`**:
  - Under `[RISK-006-BR-002]`, add implementation details:
    ```markdown
    **Implementation**: Coverage isolation is enforced by `.tools/aggregate_coverage.py` which:
    1. Runs `cargo llvm-cov` separately for unit tests (`--lib`) and E2E tests (`--test cli_e2e`, `--test tui_e2e`, `--test mcp_e2e`).
    2. Calculates QG-003, QG-004, QG-005 using ONLY lines covered by their respective E2E profiles.
    3. Lines covered ONLY by unit tests are explicitly excluded from E2E gate numerators.
    4. The report includes `unit_only_lines_excluded` counts for transparency.
    ```
  - Update the coverage gate table to reflect the isolation mechanism.
- [ ] **Update `docs/coverage.md`** (if it exists) or create a new `docs/coverage-isolation.md`:
  - Document the test file naming conventions (`cli_e2e.rs`, `tui_e2e.rs`, `mcp_e2e.rs`).
  - Explain how to write tests that count toward E2E gates vs. unit gates.

## 6. Automated Verification
- [ ] **Run requirement verification script**:
  ```bash
  cd /home/mrwilson/software/devs
  python3 .tools/verify_requirements.py --requirements RISK-006-BR-002
  ```
  - Confirm `RISK-006-BR-002` shows as "verified" in the output.
- [ ] **Check traceability report**:
  ```bash
  cat target/traceability.json | python3 -m json.tool | grep -A2 -B2 "RISK-006-BR-002"
  ```
  - Verify `RISK-006-BR-002` appears in the covered requirements list.
- [ ] **Verify all five QG gates are present in report**:
  ```bash
  cat target/coverage/report.json | python3 -c "
  import json, sys
  report = json.load(sys.stdin)
  gates = {g['gate_id']: g for g in report['gates']}
  required_gates = ['QG-001', 'QG-002', 'QG-003', 'QG-004', 'QG-005']
  for gate_id in required_gates:
      if gate_id not in gates:
          print(f'ERROR: Missing gate {gate_id}')
          sys.exit(1)
      print(f\"{gate_id}: {gates[gate_id]['actual_pct']:.1f}% (threshold: {gates[gate_id]['threshold_pct']}%)\")
  print('All 5 QG gates present!')
  "
  ```
