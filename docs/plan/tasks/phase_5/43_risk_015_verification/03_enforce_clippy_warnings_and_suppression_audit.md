# Task: Clippy Warnings as Errors and Suppression Audit (Sub-Epic: 43_Risk 015 Verification)

## Covered Requirements
- [RISK-016-BR-002]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test `tests/lint/clippy_enforcement_test.sh` that introduces a non-fatal clippy warning in a temporary crate and runs `./do lint`.
- [ ] Assert that the lint command exits non-zero and that the clippy warning is treated as an error.
- [ ] Create a second test case that introduces an `#[allow(clippy::...)]` annotation without a preceding comment and runs `./do lint`.
- [ ] Assert that the lint command exits non-zero with a clear error message.

## 2. Task Implementation
- [ ] Update `./do lint` to always run `cargo clippy --workspace --all-targets -- -D warnings`.
- [ ] Implement a custom lint script (e.g., `.tools/check_clippy_suppression.py`) that scans all `.rs` files for the string `#[allow(clippy::`.
- [ ] For each match, verify that the preceding line is a comment or that the suppression itself is on the same line as a comment (e.g., `#[allow(clippy::...) // reason]`).
- [ ] Incorporate this script into the `./do lint` command.
- [ ] Ensure any existing clippy suppressions in the codebase are documented with a reason to pass the new check.

## 3. Code Review
- [ ] Ensure that clippy enforcement covers all workspace targets, including tests and benches.
- [ ] Verify that the suppression audit script handles various comment formats (e.g., `//`, `///`, `/* ... */`).
- [ ] Check that the error output provides the file name and line number for easier remediation.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes.
- [ ] Add a temporary `#[allow(clippy::all)]` without a comment and verify that `./do lint` fails as expected.

## 5. Update Documentation
- [ ] Add `// Covers: RISK-016-BR-002` to a test in `tests/traceability/clippy_lint_test.rs` that verifies both `-D warnings` and the suppression audit.
- [ ] Update `target/traceability.json` to reflect coverage for `RISK-016-BR-002`.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `RISK-016-BR-002` is covered.
- [ ] Run `./do presubmit` and confirm all lint checks pass.
