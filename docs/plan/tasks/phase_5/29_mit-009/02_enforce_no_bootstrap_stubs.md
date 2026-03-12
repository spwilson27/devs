# Task: Enforce No Bootstrap Stubs (Sub-Epic: 29_MIT-009)

## Covered Requirements
- [AC-RISK-009-04]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/scripts/test_bootstrap_lint.sh` that:
    - Creates a temporary file with a `// TODO: BOOTSTRAP-STUB` comment.
    - Runs the updated `./do lint` and asserts it exits with a non-zero code.
    - Removes the temporary file and runs `./do lint` again, asserting it exits with 0 (if no other lint errors exist).

## 2. Task Implementation
- [ ] Update the `./do` script's `lint` subcommand to include a check for "BOOTSTRAP-STUB".
- [ ] Implement the check using `grep -rn "BOOTSTRAP-STUB" crates/` or a similar recursive grep.
- [ ] Ensure the script exits with code 1 if any occurrences are found and prints the file paths and line numbers to stderr.
- [ ] Scan the entire workspace and replace all `// TODO: BOOTSTRAP-STUB` with real implementations or standard `TODO` comments if they are genuinely post-MVP. (Note: Per requirement, they MUST be zero to pass).

## 3. Code Review
- [ ] Confirm that the grep pattern correctly identifies all `// TODO: BOOTSTRAP-STUB` variations.
- [ ] Verify that the lint script correctly reports failure to the CI environment.
- [ ] Ensure that no accidental `BOOTSTRAP-STUB` strings are left in comments or code.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes (after all stubs are removed).
- [ ] Run `bash tests/scripts/test_bootstrap_lint.sh` and ensure it correctly identifies failures.

## 5. Update Documentation
- [ ] Document that bootstrap stubs are now prohibited and will cause build failures.

## 6. Automated Verification
- [ ] Run `./do test` and check `target/traceability.json` to ensure `AC-RISK-009-04` is marked as covered and passed.
