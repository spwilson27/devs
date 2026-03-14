# Task: Verify ShellCheck Compliance for `./do` (Sub-Epic: 36_Risk 012 Verification)

## Covered Requirements
- [AC-RISK-012-01]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test script `tests/lint/test_shellcheck_failure.sh` that:
    - Creates a temporary copy of `./do`.
    - Appends a bashism like `[[ $A == $B ]]` to the temporary copy.
    - Runs `shellcheck --shell=sh` on the temporary file.
    - Asserts that it exits non-zero and reports a syntax error (e.g., SC2039 or equivalent for bashisms in sh).

## 2. Task Implementation
- [ ] Ensure `shellcheck` is installed (as part of `./do setup`).
- [ ] Verify that `./do lint` includes the `shellcheck --shell=sh ./do` command.
- [ ] Run `./do lint` and ensure it passes on the current `./do` script.
- [ ] Verify that the `presubmit-linux` CI job correctly executes this lint step.

## 3. Code Review
- [ ] Verify that the `shellcheck` command is invoked with `--shell=sh` to enforce POSIX compliance.
- [ ] Ensure the output of `shellcheck` is visible in CI logs to help debugging any future failures.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/lint/test_shellcheck_failure.sh`.
- [ ] Run `./do lint` and ensure it passes.

## 5. Update Documentation
- [ ] Document in `.agent/MEMORY.md` under the "Brittle Areas" section that `./do` must remain POSIX `sh` compliant and that `shellcheck` enforces this.

## 6. Automated Verification
- [ ] Run `shellcheck --shell=sh ./do` and verify it exits 0.
- [ ] Verify requirement traceability: `// Covers: AC-RISK-012-01` in the `./do` script or a relevant test file.
