# Task: `./do` script validation and E2E test serialization (Sub-Epic: 077_Detailed Domain Specifications (Part 42))

## Covered Requirements
- [2_TAS-REQ-460], [2_TAS-REQ-464]

## Dependencies
- depends_on: ["003_developer_entrypoint_script/01_scaffold_do_script.md"]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a shell script test `tests/test_do_validation.sh` that:
    - Verifies `./do foobar` (an unknown command) exits with a non-zero exit code.
    - Verifies the stderr output of `./do foobar` contains the string "Valid commands: setup, build, test, lint, format, coverage, presubmit, ci".
- [ ] Create a mock E2E test in a new crate `crates/devs-e2e-tests` (or using existing `tests/` if applicable) that would fail if run in parallel (e.g., by trying to bind to a fixed port).
- [ ] Create a test script `tests/test_e2e_serialization.sh` that:
    - Runs `./do test` or `./do coverage` and verifies (via `ps` or by mocking `cargo`) that the cargo invocation for E2E tests includes `--test-threads 1`.

## 2. Task Implementation
- [ ] Modify the `./do` script's unknown subcommand handler (the `*` case in the `case` statement).
- [ ] Update the handler to print `Valid commands: setup, build, test, lint, format, coverage, presubmit, ci` to stderr before exiting with code 1.
- [ ] Locate the logic for `test` and `coverage` subcommands in `./do`.
- [ ] Update these subcommands to identify E2E tests (e.g., tests in the `tests/` directory or crates with `e2e` in their name).
- [ ] For these specific tests, append `--test-threads 1` to the `cargo test` or `cargo llvm-cov` invocation.
- [ ] Ensure that other unit tests still run in parallel (default cargo behavior) to maintain performance.

## 3. Code Review
- [ ] Verify that the "Valid commands" string in `./do` exactly matches the requirement [2_TAS-REQ-460].
- [ ] Verify that the E2E serialization doesn't accidentally serialize all tests in the workspace.
- [ ] Ensure `set -e` is still respected throughout the script.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/test_do_validation.sh`.
- [ ] Run `bash tests/test_e2e_serialization.sh`.
- [ ] Run `./do test` and verify all tests pass.

## 5. Update Documentation
- [ ] Update the `README.md` or `./do` help output to reflect the strict argument validation.

## 6. Automated Verification
- [ ] Execute `./do invalid_command 2>&1 | grep "Valid commands"` and verify exit code is 1.
- [ ] Execute `grep "\-\-test-threads 1" ./do` to verify the serialization logic is present.
