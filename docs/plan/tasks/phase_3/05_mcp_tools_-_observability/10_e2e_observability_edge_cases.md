# Task: E2E tests for observability debug edge cases (Sub-Epic: 05_MCP Tools - Observability)

## Covered Requirements
- [3_MCP_DESIGN-REQ-EC-OBS-DBG-004], [3_MCP_DESIGN-REQ-EC-OBS-DBG-005], [3_MCP_DESIGN-REQ-EC-OBS-DBG-006]

## Dependencies
- depends_on: ["04_get_stage_output_tool.md", "05_stream_logs_tool.md"]
- shared_components: ["devs-mcp (consumer)", "Traceability & Coverage Infrastructure (consumer)", "./do Entrypoint Script & CI Pipeline (consumer)"]

## 1. Initial Test Written
- [ ] In `crates/devs-mcp/tests/e2e/observability_edge_cases.rs`:
  - `test_server_config_error_no_discovery_file` (EC-OBS-DBG-004): start a `devs-server` process with an intentionally invalid `devs.toml` (e.g., missing required field). Set `DEVS_DISCOVERY_FILE` to a unique temp path. Poll the discovery file path for up to 5 seconds. Assert the file never appears. Assert the test fails with message `"server did not write discovery file within 5 s; check stderr for config errors"`. Read the server process's stderr and assert it contains the config validation error. Do NOT attempt to connect via MCP.
  - `test_cli_e2e_coverage_gap_identified` (EC-OBS-DBG-005): this is a verification test for the coverage infrastructure. Run `./do coverage` on a subset of CLI tests. Parse `target/coverage/report.json`. Assert the `QG-003` entry exists and has `passed` and `delta_pct` fields. This test validates that the coverage report format supports the agent workflow described in the requirement (identifying CLI handlers not exercised by E2E tests).
  - `test_tui_snapshot_diff_workflow` (EC-OBS-DBG-006): create a TUI snapshot test that produces a known `.txt` snapshot via `insta`. Deliberately modify the TUI rendering to change the layout. Run the snapshot test and assert it fails, producing a `.txt.new` file. Assert both `.txt` and `.txt.new` files exist and are readable. Compute a diff between them. Accept the new snapshot by replacing `.txt` with `.txt.new` content. Re-run the test and assert it passes. (This validates the agent workflow for handling snapshot changes.)

## 2. Task Implementation
- [ ] Implement a test helper `poll_discovery_file(path: &Path, timeout: Duration) -> Result<String, String>` that polls every 100ms and returns the file contents or an error message matching EC-OBS-DBG-004's required format
- [ ] Implement a test helper `parse_coverage_report(path: &Path) -> CoverageReport` that deserializes `target/coverage/report.json` and provides typed access to quality gate results (QG-001 through QG-005)
- [ ] Implement the TUI snapshot acceptance helper that automates the `.txt` → `.txt.new` replacement workflow described in EC-OBS-DBG-006
- [ ] All E2E tests use `DEVS_DISCOVERY_FILE` set to unique temp paths for isolation

## 3. Code Review
- [ ] Verify test helpers are reusable across other E2E test suites
- [ ] Verify the discovery file polling helper has a configurable timeout, not a hardcoded sleep
- [ ] Verify the TUI snapshot test cleans up `.txt.new` files after acceptance

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp -- e2e::observability_edge_cases` and confirm all pass

## 5. Update Documentation
- [ ] Add doc comments to test helper functions describing their purpose and the requirements they support

## 6. Automated Verification
- [ ] Run `./do test` and verify no regressions
- [ ] Verify `// Covers:` annotations are present for all three requirement IDs in the test source
