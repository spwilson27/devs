# Task: Implement Per-Interface E2E Coverage Computation Against Full Workspace (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-015E]

## Dependencies
- depends_on: [01_do_coverage_exit_logic.md]
- shared_components: [Traceability & Coverage Infrastructure, ./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/test_interface_coverage_scope.py` with the following test cases:
- [ ] **Test: CLI coverage denominator is total workspace lines** — Provide a mock workspace with 3 crates (devs-core: 500 lines, devs-cli: 200 lines, devs-server: 300 lines = 1000 total). Provide a mock CLI coverage profile that covers 100 lines across devs-core and devs-cli. Assert QG-003 computes as `100 / 1000 = 10.0%`, NOT `100 / 200 = 50.0%`.
- [ ] **Test: TUI coverage denominator is total workspace lines** — Same mock workspace. Provide a TUI coverage profile covering 50 lines in devs-tui only. Assert QG-004 computes as `50 / 1000 = 5.0%`.
- [ ] **Test: MCP coverage denominator is total workspace lines** — Same mock. MCP profile covers 200 lines across devs-server and devs-core. Assert QG-005 = `200 / 1000 = 20.0%`.
- [ ] **Test: coverage from one suite does NOT affect another suite's metric** — CLI suite covers 100 lines. TUI suite covers 0 lines. Assert QG-003 = 10.0% and QG-004 = 0.0%. They must be independent.
- [ ] **Test: unique LLVM_PROFILE_FILE names prevent data clobbering** — Assert that the coverage collection logic assigns distinct profile file paths for CLI, TUI, and MCP test runs (e.g., `target/coverage/cli-%p-%m.profraw`, `target/coverage/tui-%p-%m.profraw`, `target/coverage/mcp-%p-%m.profraw`).

## 2. Task Implementation
- [ ] Update the coverage collection logic (in `./do coverage` and/or `.tools/ci.py`) to run three separate instrumented test invocations with distinct `LLVM_PROFILE_FILE` environment variables:
  - CLI E2E tests: `LLVM_PROFILE_FILE=target/coverage/cli-%p-%m.profraw cargo test --workspace --test '*cli*'` (or appropriate test filter)
  - TUI E2E tests: `LLVM_PROFILE_FILE=target/coverage/tui-%p-%m.profraw cargo test --workspace --test '*tui*'`
  - MCP E2E tests: `LLVM_PROFILE_FILE=target/coverage/mcp-%p-%m.profraw cargo test --workspace --test '*mcp*'`
- [ ] After each run, use `grcov` (or `llvm-cov`) to generate a per-suite coverage report in JSON format.
- [ ] Implement a Python function `compute_interface_coverage(suite_report_path: str, total_workspace_lines: int) -> float` that:
  1. Reads the suite-specific coverage JSON.
  2. Sums the lines covered across ALL crates in the report.
  3. Divides by `total_workspace_lines` (the sum of executable lines across ALL workspace crates from the full coverage run).
  4. Returns the percentage.
- [ ] Compute `total_workspace_lines` from the aggregate (all-tests) coverage report's total executable line count.
- [ ] Populate QG-003, QG-004, QG-005 in `target/coverage/report.json` with the computed values and their thresholds (50% each).

## 3. Code Review
- [ ] Verify the denominator for QG-003/004/005 is the **total executable lines across all workspace crates**, not just the crate under test.
- [ ] Verify each test suite uses a unique `LLVM_PROFILE_FILE` pattern to prevent overwriting.
- [ ] Verify the coverage computation handles the case where a suite covers lines in crates outside its "own" crate (e.g., CLI tests exercising devs-core code).
- [ ] Confirm no double-counting: each suite's numerator counts each line at most once regardless of how many tests hit it.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/test_interface_coverage_scope.py -v` and confirm all tests pass.
- [ ] Run `./do coverage` end-to-end and inspect `target/coverage/report.json` for QG-003, QG-004, QG-005 entries with correct structure.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-015E` annotations in each test function.
- [ ] Add inline comments in the coverage computation script explaining the denominator choice.

## 6. Automated Verification
- [ ] Run `python -m pytest tests/test_interface_coverage_scope.py --tb=short` and assert exit code 0.
- [ ] Run `python -c "import json; r=json.load(open('target/coverage/report.json')); assert all(g['gate_id'] in r for g in ['QG-003','QG-004','QG-005'])"` (or equivalent) to confirm the gates exist in the report.
- [ ] Run `grep -r '2_TAS-REQ-015E' tests/` and verify at least one match.
