# Task: GitLab CI Artifacts and E2E Test Isolation (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010B], [2_TAS-REQ-010E]

## Dependencies
- depends_on: ["02_gitlab_ci_foundation.md"]
- shared_components: ["Traceability & Verification Infrastructure"]

## 1. Initial Test Written
- [ ] Create a test script `tests/verify_ci_isolation.sh` that checks if `DEVS_DISCOVERY_FILE` is set when running in a CI-like environment.
- [ ] In the test, mock the environment (e.g., set `CI=true`) and verify that `./do test` or a relevant subcommand would use a unique temporary path.

## 2. Task Implementation
- [ ] Update `.gitlab-ci.yml` to include the `artifacts` section in `.presubmit_template`:
    - `when: always`.
    - `paths: ["target/coverage/report.json", "target/presubmit_timings.jsonl", "target/traceability.json"]`.
    - `expire_in: 7 days`.
- [ ] Modify the `./do` script or the E2E test suite to ensure `DEVS_DISCOVERY_FILE` is set to a unique path for every test invocation in CI.
- [ ] Ensure that even on failure, these JSON files are correctly captured.

## 3. Code Review
- [ ] Verify that the artifact paths match the specified requirement exactly.
- [ ] Ensure that `DEVS_DISCOVERY_FILE` isolation is robust and prevents port/file conflicts during parallel CI runs.

## 4. Run Automated Tests to Verify
- [ ] Run a simulated CI job and verify that the specified artifact files are generated in `target/`.
- [ ] Verify that `DEVS_DISCOVERY_FILE` is correctly being used by running two E2E tests in parallel (simulated).

## 5. Update Documentation
- [ ] Update `docs/plan/requirements.md` to reflect that CI artifact management and test isolation are complete.

## 6. Automated Verification
- [ ] Check a successful GitLab CI run and verify that the "Artifacts" section contains the three required JSON files.
- [ ] Verify that E2E tests pass consistently across all three CI platforms (Linux, macOS, Windows).
