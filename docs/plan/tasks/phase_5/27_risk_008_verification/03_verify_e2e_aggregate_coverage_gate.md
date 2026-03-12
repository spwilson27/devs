# Task: Verify E2E Aggregate Coverage Gate (Sub-Epic: 27_Risk 008 Verification)

## Covered Requirements
- [AC-RISK-008-04]

## Dependencies
- depends_on: [01_verify_docker_e2e_ci_integration.md, 02_verify_ssh_e2e_localhost_integration.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new unit test for the coverage script in `tests/test_coverage_gate.py` that:
    - Mocks the output of a coverage run.
    - Simulates the aggregate coverage calculation (Unit + E2E).
    - Verifies that the aggregate total is compared against the 80% (QG-002) threshold.
    - Simulates a run where Docker/SSH E2E tests are skipped (detected via features or runtime flags).
    - Asserts that the gate check (pass/fail) is correctly determined even with skipped tests.

## 2. Task Implementation
- [ ] Modify `cmd_coverage()` in `./do` or the coverage aggregator:
    - Ensure it calculates the *aggregate* coverage across all crates and E2E tests.
    - Implement the logic to detect if it's running on macOS or Windows.
    - Ensure that the gate check specifically accounts for skipped Docker/SSH E2E tests by confirming that the aggregate (Unit + the remaining E2E tests) still meets the ≥80% requirement.
- [ ] Add `// Covers: AC-RISK-008-04` annotation to the aggregate logic in `./do`.
- [ ] Ensure that the coverage report explicitly highlights any skipped tests while still allowing the final status to be `Success` if the threshold is met.

## 3. Code Review
- [ ] Verify that the aggregate calculation is correct (not a simple average, but weighted by lines).
- [ ] Confirm that QG-002 (80%) is strictly enforced.
- [ ] Confirm that the skip logic for macOS and Windows matches the requirements in `AC-RISK-008-04`.

## 4. Run Automated Tests to Verify
- [ ] Run the coverage gate validator: `python3 tests/test_coverage_gate.py`.
- [ ] On a non-Linux platform (or by simulating one), run `./do coverage` and verify that the gate passes even when Docker/SSH E2E tests are skipped (assuming other coverage is high enough).

## 5. Update Documentation
- [ ] Update `GEMINI.md` to record the verification of `AC-RISK-008-04`.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and ensure `AC-RISK-008-04` is marked as verified.
