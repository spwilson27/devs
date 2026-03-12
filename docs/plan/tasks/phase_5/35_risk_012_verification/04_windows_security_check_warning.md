# Task: Implement Windows Security Check Warning (Sub-Epic: 35_Risk 012 Verification)

## Covered Requirements
- [RISK-012-BR-005], [MIT-012]

## Dependencies
- depends_on: [none]
- shared_components: [devs-cli, devs-core]

## 1. Initial Test Written
- [ ] Create a Windows-only test in `crates/devs-cli/tests/security_check_test.rs` (using `#[cfg(windows)]`) that executes `devs security-check --format json` and asserts that the JSON output contains an entry with `"check_id": "SEC-FILE-PERM-WINDOWS"` and `"status": "warn"`.
- [ ] Verify that the `remediation` string matches the exact requirement text: `"File permissions not enforced on Windows; use OS-level ACLs or restrict server deployment to Unix systems"`.
- [ ] Ensure that `devs security-check` still returns exit code 0 when this warning is present (since it's a `warn`, not an `error`).

## 2. Task Implementation
- [ ] In `devs-cli/src/commands/security_check.rs`, implement a platform-specific check for file permission enforcement.
- [ ] For Windows builds, add a `SecurityCheck` result that specifically addresses the lack of standard POSIX file permission support.
- [ ] Define the `SEC-FILE-PERM-WINDOWS` constant in `devs-core/src/security.rs`.
- [ ] Ensure the remediation message is stored in the `SecurityCheck` response object.

## 3. Code Review
- [ ] Verify that this check ONLY triggers on Windows (`#[cfg(windows)]`).
- [ ] Ensure the status is indeed `warn` and not `pass` or `error`.
- [ ] Check that the remediation text is exactly as specified in `RISK-012-BR-005`.

## 4. Run Automated Tests to Verify
- [ ] On a Windows environment, run `cargo test -p devs-cli --test security_check_test`.
- [ ] Verify that the `presubmit-windows` CI job correctly executes this test.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to document the `SEC-FILE-PERM-WINDOWS` warning as an accepted cross-platform limitation.

## 6. Automated Verification
- [ ] Verify that `target/traceability.json` reports 100% coverage for requirement `RISK-012-BR-005`.
- [ ] Check CI logs for `presubmit-windows` to confirm the presence of the `warn` event.
