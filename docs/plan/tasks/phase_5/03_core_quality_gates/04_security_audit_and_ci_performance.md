# Task: Security Audit and CI Performance Verification (Sub-Epic: 03_Core Quality Gates)

## Covered Requirements
- [AC-ROAD-P5-003], [AC-ROAD-P5-005]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a unit test in `.tools/tests/test_ci_performance.py` that verifies the execution time of the `./do presubmit` command.
- [ ] The test should mock CI execution times for each stage and verify that the aggregate time for the `presubmit-linux`, `presubmit-macos`, and `presubmit-windows` jobs is within the 25-minute limit.
- [ ] For security, the test should verify that the `cargo audit` command is included in the `./do lint` or a dedicated audit step and its failure results in a non-zero exit code.

## 2. Task Implementation
- [ ] Update the `cmd_lint` or add a `cmd_audit` function in the `./do` script to:
  - Run `cargo audit --deny warnings` if the environment is a Rust project.
  - Ensure the command exits with 0 on success.
- [ ] Optimize the CI pipeline (GitLab CI configuration) to ensure jobs complete within the 25-minute timeout.
  - Check for redundant steps or heavy dependencies that can be cached.
  - Profile the execution time of each stage.
- [ ] Execute `cargo audit` manually and address any critical or high-severity vulnerabilities found in dependencies.
- [ ] Ensure the MVP release commit triggers a clean CI run across all platforms that satisfies the performance requirements.

## 3. Code Review
- [ ] Verify that `cargo audit` is actually enforcing the `--deny warnings` flag.
- [ ] Check the CI logs to confirm the completion times for all platforms.
- [ ] Ensure that no persistent "TODO: BOOTSTRAP-STUB" comments are left in the security-related code.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` (or `./do audit` if implemented separately) and ensure it passes.
- [ ] Observe the GitLab CI pipeline results for the current commit and verify the execution times.
- [ ] Verify the output of `cargo audit` in the CI logs.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to record the results of the security audit and the CI performance verification.
- [ ] Document the final CI/CD configuration and its performance baseline.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` and confirm that `AC-ROAD-P5-003` and `AC-ROAD-P5-005` are marked as verified by the new checks or the successful CI logs.
