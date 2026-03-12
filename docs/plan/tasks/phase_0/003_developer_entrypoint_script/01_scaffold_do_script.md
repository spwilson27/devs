# Task: Scaffold `./do` script with basic subcommands (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [1_PRD-BR-003], [2_TAS-REQ-014]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/test_do_script_basics.sh` that:
    - Verifies `./do` exists and is executable.
    - Verifies `./do` with no arguments prints usage to stderr and exits non-zero.
    - Verifies `./do invalid-cmd` prints usage to stderr and exits with code 1 ([1_PRD-BR-003]).
    - Verifies `./do build --dry-run` (or similar) exits with 0 (once implemented).

## 2. Task Implementation
- [ ] Create the `./do` bash script at the repository root.
- [ ] Implement a `usage()` function that lists all required subcommands: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`.
- [ ] Implement a subcommand dispatcher using a `case` statement.
- [ ] Implement stub subcommands for `build`, `test`, and `format`:
    - `build`: Runs `cargo build --release --workspace`.
    - `test`: Runs `cargo test --workspace`.
    - `format`: Runs `cargo fmt --workspace`.
- [ ] Ensure the script exits non-zero if any command fails.
- [ ] Add unknown subcommand handling: print usage to stderr and `exit 1`.

## 3. Code Review
- [ ] Verify shebang is `#!/usr/bin/env bash`.
- [ ] Verify `set -euo pipefail` is used for robust error handling.
- [ ] Verify usage output matches the requirement specification exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/test_do_script_basics.sh`.
- [ ] Run `./do build`, `./do test`, `./do format` and verify they invoke the correct cargo commands.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or `MEMORY.md` to reflect that the `./do` script is initialized.

## 6. Automated Verification
- [ ] Verify that running `./do unknown` returns exit code 1 and contains "usage" in stderr.
