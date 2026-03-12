# Task: E2E Test Requirement for New Server-Side Code (Sub-Epic: 089_Detailed Domain Specifications (Part 54))

## Covered Requirements
- [2_TAS-REQ-605]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written
- [ ] Create a "mock failure" test case for the `./do coverage` script.
- [ ] Simulate a scenario where unit test coverage is above 90% but aggregate E2E coverage drops below 80% (e.g., by adding new server code without an E2E test).
- [ ] Verify that `./do coverage` correctly identifies the coverage gap and exits with a non-zero code.

## 2. Task Implementation
- [ ] Implement coverage measurement logic in the `./do coverage` script that separately calculates aggregate E2E coverage.
- [ ] Add a quality gate check (QG-002) to the coverage script that enforces the 80% E2E aggregate threshold.
- [ ] Ensure that the script reports the exact percentage of E2E coverage and identifies the delta if the threshold is not met.
- [ ] Integrate this check into the `./do presubmit` command to gate all commits.
- [ ] Ensure that server-side code paths are correctly identified in the coverage report.

## 3. Code Review
- [ ] Verify that the E2E coverage calculation includes all three interfaces (TUI, CLI, MCP).
- [ ] Confirm that the 80% aggregate threshold is correctly implemented as a hard failure in the script.
- [ ] Check that the error message clearly instructs the developer to add E2E tests for new server code.

## 4. Run Automated Tests to Verify
- [ ] Run `./do coverage` and verify it produces a correct report.
- [ ] Intentionally reduce E2E coverage below 80% and confirm a non-zero exit code.
- [ ] Restore coverage and confirm a zero exit code.

## 5. Update Documentation
- [ ] Update `docs/development_standards.md` to reflect the 80% E2E aggregate coverage requirement for server-side code.
- [ ] Update the documentation for the `./do coverage` command.

## 6. Automated Verification
- [ ] Check that the CI pipeline configuration includes the `./do coverage` check and that it is a gating step for the build process.
