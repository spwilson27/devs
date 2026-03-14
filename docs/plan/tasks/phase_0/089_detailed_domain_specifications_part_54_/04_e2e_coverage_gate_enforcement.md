# Task: E2E Coverage Gate Enforcement for New Server Code (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-605]

## Dependencies
- depends_on: []
- shared_components: ["Traceability & Coverage Infrastructure", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a test named `test_coverage_gate_qg002_fails_without_e2e` that:
  1. Simulates or constructs a coverage report JSON where unit test coverage (QG-001) is above 90% but E2E aggregate coverage (QG-002) is below 80%.
  2. Passes this report to the coverage gate evaluation function/script.
  3. Asserts that QG-001 passes, QG-002 fails, and the overall gate returns a non-zero exit code.
- [ ] Create a test named `test_coverage_gate_qg002_passes_with_e2e` that:
  1. Constructs a coverage report where both QG-001 (≥90% unit) and QG-002 (≥80% E2E) pass.
  2. Asserts the overall gate returns exit code 0.
- [ ] Create a test named `test_do_coverage_exits_nonzero_on_qg002_failure` that:
  1. Mocks or stubs the coverage data to produce a QG-002 failure scenario.
  2. Runs the `./do coverage` logic (or its gate-checking function).
  3. Asserts the process/function exits with non-zero status.

## 2. Task Implementation
- [ ] In the coverage gate evaluation logic (within `./do coverage` or a Rust helper), implement the QG-002 check: parse `target/coverage/report.json`, extract aggregate E2E line coverage percentage, and fail if below 80%.
- [ ] Ensure `./do coverage` prints a clear diagnostic message when QG-002 fails, e.g.: `FAIL: QG-002 E2E aggregate coverage is 72.3%, required ≥80%. Add E2E tests for new server-side code paths.`
- [ ] Ensure QG-001 and QG-002 are evaluated independently — QG-001 passing must not mask a QG-002 failure.

## 3. Code Review
- [ ] Verify the gate logic reads from the canonical coverage report path (`target/coverage/report.json`).
- [ ] Verify the threshold (80%) is not hardcoded in multiple places — use a single constant or config value.
- [ ] Verify the diagnostic message identifies which gate failed and the actual vs. required percentage.

## 4. Run Automated Tests to Verify
- [ ] Run the coverage gate tests: `cargo test -- test_coverage_gate_qg002` and confirm all pass.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-605` annotation to each test function.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the new gate tests pass.
- [ ] Run `grep -r "2_TAS-REQ-605" --include="*.rs" --include="*.sh"` and confirm at least one annotation exists.
