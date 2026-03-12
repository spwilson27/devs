# Task: POSIX Compliance for the `./do` Script (Sub-Epic: 024_Foundational Technical Requirements (Part 15))

## Covered Requirements
- [2_TAS-REQ-010D]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/test_do_posix_compliance.sh` that checks the shebang of `./do`.
- [ ] In the test, use `grep '^#!/bin/sh$' ./do` to ensure the correct shebang is present.
- [ ] In the test, use a tool like `checkbashisms` (if available in the environment) to scan `./do` for bash-specific syntax.
- [ ] Ensure the test fails if `./do` contains `[[`, `local` (without proper sh-usage), or bash arrays.

## 2. Task Implementation
- [ ] Update the shebang of `./do` to `#!/bin/sh`.
- [ ] Refactor any bash-specific syntax to POSIX `sh` equivalents:
    - Replace `[[ ... ]]` with `[ ... ]`.
    - Replace `function name() { ... }` with `name() { ... }`.
    - Ensure all variable expansions and command substitutions are POSIX-compliant.
    - If `local` is used, ensure it's compatible with common `sh` implementations (like `dash`) or remove it if unnecessary.
- [ ] Ensure the script remains functional on Linux, macOS, and Git Bash on Windows.

## 3. Code Review
- [ ] Verify that no `bash`-isms are present in the script.
- [ ] Ensure the script is well-commented and follows the standardized subcommand structure.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_do_posix_compliance.sh`.
- [ ] Run `./do lint` and ensure it doesn't break due to shell syntax issues.

## 5. Update Documentation
- [ ] Update the developer documentation in `README.md` or `docs/` to confirm that `./do` is POSIX `sh` compliant and suitable for Git Bash.

## 6. Automated Verification
- [ ] Run the CI pipeline locally or use a tool to verify the script runs correctly under `dash` (the common `sh` on Debian/Ubuntu).
