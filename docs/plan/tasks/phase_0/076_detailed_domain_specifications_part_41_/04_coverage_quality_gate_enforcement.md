# Task: Enforce Coverage Quality Gate Exit Codes (Sub-Epic: 076_Detailed Domain Specifications (Part 41))

## Covered Requirements
- [2_TAS-REQ-458]

## Dependencies
- depends_on: [03_coverage_report_schema.md]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] **Test case 1 — gate failure causes non-zero exit**: Temporarily override the QG-001 threshold to `99.9%` (artificially high so it will fail). Run `./do coverage`. Assert:
  - Exit code is non-zero.
  - `target/coverage/report.json` has `overall_passed: false`.
  - The QG-001 entry has `passed: false`.
  - stderr contains a human-readable message identifying which gate(s) failed and by how much.
- [ ] **Test case 2 — all gates pass**: With realistic thresholds and sufficient test coverage, run `./do coverage`. Assert exit code is 0 and `overall_passed` is `true`.
- [ ] **Test case 3 — multiple gate failures**: Override thresholds for QG-001 and QG-003 to impossibly high values. Run `./do coverage`. Assert both gates show `passed: false` and the exit code is non-zero. Verify stderr lists both failing gates.

## 2. Task Implementation
- [ ] In the coverage reporter (from task 03), after computing all gate results:
  1. Set `overall_passed = all(gate.passed for gate in gates)`.
  2. If `overall_passed` is `false`, print to stderr a summary table of failing gates:
     ```
     COVERAGE GATE FAILURE:
       QG-001 (Unit test line coverage): 85.2% < 90.0% (delta: -4.8%)
     ```
  3. Exit with code 1 if `overall_passed` is `false`.
- [ ] Ensure `./do coverage` propagates the non-zero exit code from the coverage reporter.
- [ ] The threshold override mechanism for testing should use an environment variable (e.g., `DEVS_QG001_THRESHOLD=99.9`) so tests can inject artificially high thresholds without modifying source code.

## 3. Code Review
- [ ] Verify the exit code logic: non-zero if ANY gate fails, zero only if ALL gates pass.
- [ ] Confirm that the JSON report is written even when gates fail (so CI can archive it for inspection).
- [ ] Verify the environment variable override is only used for testing and cannot silently lower thresholds in production.

## 4. Run Automated Tests to Verify
- [ ] Run the gate enforcement tests and confirm all pass.
- [ ] Run `DEVS_QG001_THRESHOLD=99.9 ./do coverage` and confirm it exits non-zero.

## 5. Update Documentation
- [ ] No additional documentation required.

## 6. Automated Verification
- [ ] Run `DEVS_QG001_THRESHOLD=99.9 ./do coverage; echo "exit=$?"` and confirm exit code is non-zero.
- [ ] Run `./do coverage; echo "exit=$?"` with default thresholds and confirm exit code is 0 (assuming tests meet coverage).
