# Task: Implement `./do coverage` Quality Gate Exit Logic (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-015D]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/test_do_coverage_exit.py` (or extend the existing test file for `./do` subcommands) with the following test cases:
- [ ] **Test: exit 0 on all gates passing** — Write a fixture JSON file at `target/coverage/report.json` with `"overall_passed": true` and a `"gates"` array where every gate has `"passed": true`. Invoke `./do coverage` (or the underlying coverage verification function directly). Assert exit code is 0 and stderr is empty (no failure table).
- [ ] **Test: exit non-zero on any gate failing** — Write a fixture JSON with `"overall_passed": false` and at least one gate entry like `{"gate_id": "QG-001", "passed": false, "actual_pct": 85.5, "threshold_pct": 90.0}`. Invoke `./do coverage`. Assert exit code is non-zero (specifically 1).
- [ ] **Test: stderr contains summary table with failing gates** — Using the same failing fixture, capture stderr output. Assert it contains the header `"Failing Quality Gates"` (or equivalent), and for each failing gate, assert the output contains the gate ID, the `actual_pct` value, and the `threshold_pct` value formatted in a table row.
- [ ] **Test: passing gates are NOT listed in failure table** — Fixture has 2 gates: QG-001 fails, QG-002 passes. Assert stderr contains `QG-001` but does NOT contain `QG-002`.
- [ ] **Test: malformed JSON exits non-zero with error message** — Write a corrupt file to `target/coverage/report.json`. Assert `./do coverage` exits non-zero and stderr contains an error message referencing the file path.
- [ ] **Test: missing report file exits non-zero** — Delete or don't create `target/coverage/report.json`. Assert exit non-zero and stderr contains a descriptive error.

## 2. Task Implementation
- [ ] In the `./do` script (POSIX sh), add or update the `coverage` subcommand to invoke the coverage tool chain and then call a verification step.
- [ ] Create or update a Python script (e.g., `.tools/verify_coverage_gates.py`) that:
  1. Reads `target/coverage/report.json`.
  2. Checks the top-level `"overall_passed"` boolean field.
  3. If `true`, exits 0 silently.
  4. If `false`, iterates over the `"gates"` array, filters to entries where `"passed"` is `false`, and prints to **stderr** a formatted table:
     ```
     Failing Quality Gates:
     | Gate   | Actual % | Threshold % |
     |--------|----------|-------------|
     | QG-001 |    85.5% |       90.0% |
     ```
  5. Exits with code 1 after printing.
- [ ] Handle edge cases: missing file (exit 1 with "Coverage report not found: <path>" to stderr), malformed JSON (exit 1 with parse error to stderr).
- [ ] Wire the `./do coverage` subcommand to invoke this script after the coverage collection step and propagate its exit code.

## 3. Code Review
- [ ] Verify the summary table is printed to **stderr** (file descriptor 2), not stdout.
- [ ] Verify exit code is exactly 1 (not 2 or other) on gate failure, to distinguish from infrastructure errors.
- [ ] Confirm the JSON field names (`overall_passed`, `gates`, `gate_id`, `passed`, `actual_pct`, `threshold_pct`) match the schema used by the coverage report generator.
- [ ] Ensure no `sys.exit()` or `exit` calls bypass cleanup or test teardown.

## 4. Run Automated Tests to Verify
- [ ] Run `python -m pytest tests/test_do_coverage_exit.py -v` and confirm all tests pass.
- [ ] Run `./do coverage` end-to-end in the workspace (if coverage tooling is already configured) and verify the exit code matches the report's `overall_passed` field.

## 5. Update Documentation
- [ ] Add inline comments in `.tools/verify_coverage_gates.py` documenting the expected JSON schema.
- [ ] Add a `// Covers: 2_TAS-REQ-015D` annotation in each test function.

## 6. Automated Verification
- [ ] Run `python -m pytest tests/test_do_coverage_exit.py --tb=short` and assert exit code 0.
- [ ] Run `grep -r '2_TAS-REQ-015D' tests/` and verify at least one match exists (traceability check).
