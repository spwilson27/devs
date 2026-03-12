# Task: Implement ShellCheck Compliance for `./do` (Sub-Epic: 35_Risk 012 Verification)

## Covered Requirements
- [RISK-012-BR-003]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test script `tests/lint/test_shellcheck.sh` that runs `shellcheck --shell=sh ./do` and asserts an exit code of 0.
- [ ] Add a failing test case to `tests/lint/test_shellcheck.sh` that creates a temporary script with bash-specific syntax (e.g., `[[ $A == $B ]]`) and verifies that `shellcheck` correctly identifies it as a failure for `sh`.

## 2. Task Implementation
- [ ] Run `shellcheck --shell=sh ./do` to identify all bash-specific syntax and POSIX compliance issues.
- [ ] Rewrite all bash-specific features in `./do` using POSIX-compliant alternatives:
    - Replace `[[ ... ]]` with `[ ... ]`.
    - Replace `local` with standard variable assignment if possible or handle scoping appropriately.
    - Replace `bash` arrays with space-separated strings or temporary files.
    - Ensure `$( ... )` and `$(( ... ))` are used correctly according to POSIX.
- [ ] Integrate `shellcheck` into the `./do lint` command. Add a step to `do`'s lint subcommand: `shellcheck --shell=sh ./do`.

## 3. Code Review
- [ ] Verify that no `bashisms` remain in the `./do` script.
- [ ] Ensure that the script still functions correctly on Linux, macOS, and Windows (via Git Bash or equivalent).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure the `shellcheck` step passes.
- [ ] Run `sh tests/lint/test_shellcheck.sh`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to note that `./do` is now strictly POSIX `sh` compliant to ensure maximum cross-platform compatibility.

## 6. Automated Verification
- [ ] Verify that `shellcheck --shell=sh ./do` exits 0.
- [ ] Check `target/traceability.json` to ensure `RISK-012-BR-003` is covered.
