# Task: GitLab CI Job Timeout Configuration (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010A]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] In the project's CI validation test suite (e.g., `tests/ci_config_test.rs` or a shell-based test under `tests/ci/`), write a test that parses `.gitlab-ci.yml` and asserts that every job definition includes a `timeout:` key with value `25 minutes` (or `25m`). If no `.gitlab-ci.yml` exists yet, the test should fail with a clear message indicating the file is missing.
- [ ] Write a test that verifies the `./do presubmit` command enforces a 900-second (15-minute) hard timeout. This can be a unit test for the timeout logic or a shell test that invokes `./do presubmit` with a `--dry-run` flag and asserts the timeout value is set to 900 seconds.
- [ ] Write a test that verifies the two-tier timeout relationship: the CI job timeout (25 min) exceeds the `./do presubmit` timeout (15 min) by at least 5 minutes, parsed from the CI config and the `./do` script respectively.

## 2. Task Implementation
- [ ] In `.gitlab-ci.yml`, set `timeout: 25 minutes` at the job level for all presubmit/CI jobs. If a shared job template (e.g., `.presubmit_template`) is used, set the timeout there so all platform jobs inherit it.
- [ ] In the `./do` script, ensure the `presubmit` subcommand sets a 900-second hard timeout (e.g., using `timeout 900 ...` or a background watchdog that kills child processes after 900 seconds). On timeout expiry, all child processes must be killed and the script must exit with a non-zero status code.
- [ ] Add a comment in `.gitlab-ci.yml` near the timeout value explaining the two-tier relationship: "`25 min CI timeout provides 10 min buffer beyond 15 min ./do presubmit timeout`".

## 3. Code Review
- [ ] Verify the timeout value is 25 minutes exactly, not 25m or 1500s (use the format GitLab expects).
- [ ] Verify the `./do presubmit` timeout is exactly 900 seconds and uses POSIX-compatible mechanisms (no bash-specific constructs).
- [ ] Verify that on timeout, child process cleanup is reliable (uses `kill` on the process group, not just the immediate child).

## 4. Run Automated Tests to Verify
- [ ] Run the CI config validation tests and confirm they pass.
- [ ] Run `./do lint` to ensure the CI configuration is valid.

## 5. Update Documentation
- [ ] Add inline comments in `.gitlab-ci.yml` and `./do` explaining the timeout architecture.

## 6. Automated Verification
- [ ] Run `grep -q 'timeout.*25' .gitlab-ci.yml && echo "PASS" || echo "FAIL"` to verify the CI timeout is present.
- [ ] Run `grep -q '900' ./do && echo "PASS" || echo "FAIL"` to verify the presubmit timeout constant is present in the script.
