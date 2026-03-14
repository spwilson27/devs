# Task: Implement ./do coverage with Quality Gates and Zero-Result Protection (Sub-Epic: 006_Quality Gate Enforcement)

## Covered Requirements
- [1_PRD-KPI-BR-001], [2_TAS-REQ-015]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer — the `./do` script skeleton must exist; this task implements the `coverage` subcommand), Traceability & Coverage Infrastructure (consumer — this task implements the coverage gates QG-001 through QG-005 that the infrastructure defines)]

## 1. Initial Test Written
- [ ] Create `tests/test_coverage_gate.sh` (POSIX sh) with the following test cases:
  - **Test 1 — sequence enforcement**: Verify `./do coverage` runs unit coverage, then E2E coverage, then per-interface E2E coverage in that order [2_TAS-REQ-015]. Instrument by checking the order of output lines.
  - **Test 2 — zero-result instrumentation failure**: Mock/simulate a coverage run that produces `actual_pct: 0.0` for one gate. Verify `./do coverage` exits non-zero and stderr contains "instrumentation failure" or equivalent [1_PRD-KPI-BR-001].
  - **Test 3 — report.json generation**: After a successful `./do coverage` run, verify `target/coverage/report.json` exists and contains: `generated_at` (ISO 8601), `overall_passed` (boolean), and a `gates` array with entries for QG-001 through QG-005, each having `gate_id`, `description`, `threshold_pct`, `actual_pct`, and `passed`.
  - **Test 4 — gate failure exit code**: Set a gate threshold that the stub workspace cannot meet, verify `./do coverage` exits non-zero.
  - **Test 5 — stub workspace baseline**: On the stub workspace (Phase 0), `./do coverage` should execute without crashing. It may report low coverage but must not report instrumentation failure if tests exist.
- [ ] Add `# Covers: 1_PRD-KPI-BR-001, 2_TAS-REQ-015` comment at the top of the test file

## 2. Task Implementation
- [ ] Implement the `coverage` subcommand in the `./do` script following the exact sequence from [2_TAS-REQ-015]:
  1. **Unit test coverage**: Run `cargo llvm-cov --workspace --lib --no-report` (or equivalent) to measure coverage of `#[test]` in `src/` files
  2. **E2E test coverage**: Run `cargo llvm-cov --workspace --test '*' --no-report -- --test-threads 1` with `DEVS_DISCOVERY_FILE` set to a unique temp path for E2E isolation
  3. **Per-interface E2E coverage**: Run coverage for CLI tests (`e2e::cli::*`), TUI tests (`e2e::tui::*`), and MCP tests (`e2e::mcp::*`) individually using `--test` name filters
- [ ] After all coverage runs, generate the combined report: `cargo llvm-cov report --json > target/coverage/report_raw.json`
- [ ] Implement a report processor (shell script or small Rust helper) that:
  - Reads the raw coverage JSON
  - Computes per-gate percentages for QG-001 (90% unit), QG-002 (80% E2E aggregate), QG-003 (50% CLI E2E), QG-004 (50% TUI E2E), QG-005 (50% MCP E2E)
  - Writes `target/coverage/report.json` with `generated_at`, `overall_passed`, and `gates[]` array
- [ ] Implement zero-result protection [1_PRD-KPI-BR-001]: if any gate's `actual_pct` is exactly `0.0`, set `overall_passed = false`, print `"ERROR: Instrumentation failure — gate <gate_id> produced 0.0% coverage"` to stderr, and exit non-zero
- [ ] Implement gate threshold enforcement: print a summary table to stderr showing each gate's threshold vs actual, mark PASS/FAIL, and exit non-zero if any gate fails
- [ ] Ensure `target/coverage/` directory is created if it doesn't exist

## 3. Code Review
- [ ] Verify the zero-result check is applied to **each** gate independently (not just the aggregate)
- [ ] Verify E2E tests run with `--test-threads 1` to prevent server port conflicts
- [ ] Verify the `report.json` schema matches the spec (correct field names, types)
- [ ] Verify no coverage data is silently discarded — all runs contribute to the final report
- [ ] Confirm the coverage subcommand does not depend on any tools not installed by `./do setup`

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_coverage_gate.sh` and confirm all test cases pass
- [ ] Run `./do coverage` on the current workspace and inspect `target/coverage/report.json`

## 5. Update Documentation
- [ ] Add doc comments to any new public items introduced
- [ ] Document the five quality gates (QG-001 through QG-005) with their thresholds in a comment block at the top of the coverage section in `./do`

## 6. Automated Verification
- [ ] Run `./do coverage` and verify exit code matches expectation (0 if gates pass, non-zero otherwise)
- [ ] Verify `target/coverage/report.json` exists and is valid JSON: `python3 -c "import json; json.load(open('target/coverage/report.json'))"`
- [ ] Verify the `gates` array has exactly 5 entries with correct `gate_id` values (QG-001 through QG-005)
