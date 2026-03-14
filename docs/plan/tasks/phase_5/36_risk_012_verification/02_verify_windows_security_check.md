# Task: Verify Windows CI Permission Warning and CLI Security Check (Sub-Epic: 36_Risk 012 Verification)

## Covered Requirements
- [AC-RISK-012-02], [AC-RISK-012-03]

## Dependencies
- depends_on: []
- shared_components: [devs-cli]

## 1. Initial Test Written
- [ ] Create an E2E test `tests/e2e/test_windows_security_check.py` (or Rust equivalent) that:
    - On Windows: Executes `devs security-check --format json`.
    - Asserts that the JSON contains an entry with `"check_id": "SEC-FILE-PERM-WINDOWS"` and `"status": "warn"`.
    - Verifies the `remediation` string matches exactly: `"File permissions not enforced on Windows; use OS-level ACLs or restrict server deployment to Unix systems"`.
- [ ] Create a CI log analyzer script `.tools/verify_ci_warn_count.py` that:
    - Scans a provided CI log file.
    - Counts occurrences of `SEC-FILE-PERM-WINDOWS` or the specific permission warning log line.
    - Asserts that the count matches the number of calls to `set_secure_file()` and `set_secure_dir()` in the codebase.

## 2. Task Implementation
- [ ] Implement the `devs security-check` logic in `devs-cli` for Windows as specified.
- [ ] Update the `set_secure_file()` and `set_secure_dir()` implementations in `devs-checkpoint` (or relevant crate) to emit a `WARN` log event on Windows.
- [ ] Configure the `presubmit-windows` job in `gitlab-ci.yml` to run the log analyzer script as a post-test step.

## 3. Code Review
- [ ] Verify that the security check correctly reports `warn` on Windows and doesn't fail the command.
- [ ] Ensure the log analyzer script is robust against different CI runner configurations.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` on Windows.
- [ ] Run `.tools/verify_ci_warn_count.py` against a local test run log.

## 5. Update Documentation
- [ ] Document in `.agent/MEMORY.md` under the "Brittle Areas" section the accepted limitation of file permissions on Windows.

## 6. Automated Verification
- [ ] Verify `target/traceability.json` shows `AC-RISK-012-02` and `AC-RISK-012-03` as covered.
- [ ] Verify that `presubmit-windows` job passes in the CI pipeline.
