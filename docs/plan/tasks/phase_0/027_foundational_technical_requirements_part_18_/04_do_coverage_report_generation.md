# Task: Implement `./do coverage` Report Generation (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-015C]

## Dependencies
- depends_on: ["03_unit_vs_e2e_test_separation_and_serialization.md"]
- shared_components: [./do Entrypoint Script & CI Pipeline (consumer), Traceability & Coverage Infrastructure (owner of coverage report generator)]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_coverage_report.sh` with the following test cases:
  - **Test 1 — report.json schema validation**: Create mock `cargo-llvm-cov` JSON output files for each scope (unit, e2e_aggregate, e2e_cli, e2e_tui, e2e_mcp). Run the coverage report generator. Assert `target/coverage/report.json` exists and contains exactly these top-level keys: `generated_at` (string, ISO 8601), `overall_passed` (bool), `gates` (array of 5 objects).
  - **Test 2 — gate structure**: For each object in the `gates` array, assert it contains: `gate_id` (string), `description` (string), `scope` (string), `threshold_pct` (number), `actual_pct` (number), `delta_pct` (number), `passed` (bool).
  - **Test 3 — gate IDs**: Assert the `gates` array contains exactly `QG-001`, `QG-002`, `QG-003`, `QG-004`, `QG-005` (in any order).
  - **Test 4 — thresholds correct**: Assert `QG-001` has `threshold_pct: 90.0`, `QG-002` has `threshold_pct: 80.0`, `QG-003`/`QG-004`/`QG-005` each have `threshold_pct: 50.0`.
  - **Test 5 — overall_passed logic**: Provide mock data where `QG-001` has `actual_pct: 85.0` (below 90%). Assert `overall_passed` is `false` and the `QG-001` gate has `passed: false`.
  - **Test 6 — delta_pct calculation**: Provide mock data with `actual_pct: 92.3` and `threshold_pct: 90.0`. Assert `delta_pct` equals `2.3`.
  - **Test 7 — all gates pass**: Provide mock data where all gates exceed their thresholds. Assert `overall_passed` is `true` and all gates have `passed: true`.
- [ ] Use `jq` for JSON parsing and field assertions.

## 2. Task Implementation
- [ ] Create a coverage report generator script (e.g., `.tools/coverage_report.py` or `.tools/coverage_report.sh`) that:
  1. Reads the JSON output from `cargo-llvm-cov --json` for each of the 5 coverage runs (unit, e2e_aggregate, e2e_cli, e2e_tui, e2e_mcp).
  2. Extracts the line coverage percentage from each run.
  3. Constructs the `gates` array with 5 entries:
     - `QG-001`: scope `"unit"`, threshold `90.0`, description `"Unit test line coverage, all crates"`
     - `QG-002`: scope `"e2e_aggregate"`, threshold `80.0`, description `"E2E aggregate line coverage, all crates"`
     - `QG-003`: scope `"e2e_cli"`, threshold `50.0`, description `"CLI E2E line coverage"`
     - `QG-004`: scope `"e2e_tui"`, threshold `50.0`, description `"TUI E2E line coverage"`
     - `QG-005`: scope `"e2e_mcp"`, threshold `50.0`, description `"MCP E2E line coverage"`
  4. For each gate: `delta_pct = actual_pct - threshold_pct`, `passed = actual_pct >= threshold_pct`.
  5. `overall_passed = all(gate.passed for gate in gates)`.
  6. `generated_at` = current UTC time in ISO 8601 format (e.g., `2026-03-10T10:15:00Z`).
  7. Writes `target/coverage/report.json` (creating `target/coverage/` if needed).
- [ ] Integrate the generator into `./do coverage`:
  - After all 5 `cargo llvm-cov` invocations complete, run the report generator.
  - `./do coverage` MUST exit non-zero if `overall_passed` is `false`.
- [ ] The report file MUST be overwritten on each run (not appended).

## 3. Code Review
- [ ] Verify all 5 gate IDs, descriptions, scopes, and thresholds match the spec exactly.
- [ ] Verify `delta_pct` is computed as `actual - threshold` (can be negative when gate fails).
- [ ] Verify `generated_at` is a valid ISO 8601 UTC timestamp.
- [ ] Verify no extra fields are added to the JSON beyond those specified.
- [ ] Verify the report generator handles the case where a coverage run produces 0% (e.g., no E2E tests exist yet) — it should still produce a valid report with `passed: false` for those gates.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_coverage_report.sh` and confirm all 7 tests pass.
- [ ] Run `./do coverage` on the workspace and inspect `target/coverage/report.json`.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-015C` to the coverage report generator source and test file.

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_coverage_report.sh && echo "VERIFIED"` — `VERIFIED` must appear.
- [ ] Run `cat target/coverage/report.json | jq '.gates | length'` and assert the output is `5`.
- [ ] Run `cat target/coverage/report.json | jq '.gates[].gate_id'` and assert all 5 QG IDs are present.
