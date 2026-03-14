# Task: Scaffold ./do Script with Dispatcher and Basic Subcommands (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [1_PRD-BR-003], [2_TAS-REQ-014]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/do_script/test_scaffold.sh` (POSIX sh-compatible) with the following test cases:
  - Test that `./do` exists at repository root and is executable (`test -x ./do`)
  - Test that `./do` invoked with no arguments prints usage listing all 8 subcommands (`setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`) to stderr and exits non-zero
  - Test that `./do foobar` (unrecognized subcommand) prints the list of valid subcommands to stderr and exits with non-zero status ([1_PRD-BR-003])
  - Test that `./do build` invokes `cargo build --release --workspace` and exits 0 (requires Cargo workspace to exist; use stub workspace from sub-epic 001)
  - Test that `./do test` invokes `cargo test --workspace` and exits 0
  - Test that `./do format` invokes `cargo fmt --workspace` and exits 0
  - Each test should capture both stdout and stderr, assert on exit code, and grep stderr for expected subcommand list when applicable
- [ ] Add a `// Covers: 1_PRD-REQ-045` and `// Covers: 1_PRD-BR-003` annotation comment at the top of the test file

## 2. Task Implementation
- [ ] Create `./do` at repository root as a POSIX `sh`-compatible script (shebang: `#!/bin/sh`)
- [ ] Add `set -eu` at the top for strict error handling (POSIX sh does not support `pipefail`)
- [ ] Implement a `usage()` function that prints to stderr: script name, one-line description, and a list of all 8 subcommands with short descriptions matching the project description's command table
- [ ] Implement the subcommand dispatcher using a `case "$1"` statement with entries for: `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, `ci`
- [ ] Implement `build` subcommand: `cargo build --release --workspace`
- [ ] Implement `test` subcommand: `cargo test --workspace`
- [ ] Implement `format` subcommand: `cargo fmt --workspace`
- [ ] Add placeholder stubs for `setup`, `lint`, `coverage`, `presubmit`, `ci` that print "not yet implemented" to stderr and exit 1
- [ ] Add the `*)` catch-all case: call `usage` and `exit 1`
- [ ] Handle zero-arguments case: if `$#` is 0, call `usage` and `exit 1`
- [ ] Run `chmod +x ./do`

## 3. Code Review
- [ ] Verify shebang is `#!/bin/sh` (not bash) for POSIX sh compatibility per [2_TAS-REQ-010D]
- [ ] Verify no bash-isms are used (no `[[`, no `${var,,}`, no arrays, no `pipefail`)
- [ ] Verify the usage output lists exactly the 8 subcommands from [1_PRD-REQ-045]
- [ ] Verify unrecognized subcommand prints valid subcommands to stderr (not stdout) per [1_PRD-BR-003]

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_script/test_scaffold.sh` and verify all tests pass
- [ ] Run `./do build` and verify it invokes cargo build successfully
- [ ] Run `./do unknown_cmd` and verify non-zero exit and stderr contains subcommand list

## 5. Update Documentation
- [ ] Add a brief doc comment at the top of `./do` explaining its purpose and listing subcommands

## 6. Automated Verification
- [ ] Run `sh tests/do_script/test_scaffold.sh` from the repository root; verify exit code 0
- [ ] Run `./do foobar 2>&1; echo $?` and confirm non-zero exit code and stderr contains all 8 subcommand names
