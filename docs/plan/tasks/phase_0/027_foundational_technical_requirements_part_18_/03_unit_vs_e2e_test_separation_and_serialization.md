# Task: Unit vs E2E Test Separation and Serialization (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-015A], [2_TAS-REQ-015B]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a test suite `tests/e2e/test_isolation.rs` where two tests both attempt to start a mock `devs` server.
- [ ] If run in parallel (`--test-threads 4`), these tests should fail due to port/discovery file conflicts.
- [ ] If run serially (`--test-threads 1`), these tests should pass if they use unique discovery files.
- [ ] Write a test utility in a `devs_test_helper` crate that provides a unique path for `DEVS_DISCOVERY_FILE`.

## 2. Task Implementation
- [ ] Standardize the naming convention for E2E tests:
    - All E2E tests MUST be in `tests/` directories.
    - All E2E test functions MUST be prefixed with `e2e::` (e.g., `e2e::cli::test_submit_run`).
- [ ] Modify the `./do test` and `./do coverage` commands:
    - Use filtered test names for E2E runs: `$(cargo test --workspace --list 2>/dev/null | grep "e2e::" | awk -F: '{print $1}')`.
    - Always pass `--test-threads 1` to `cargo test` and `cargo llvm-cov` for E2E tests.
- [ ] Implement a helper (e.g., in a `devs_test_helper` crate) to be used by all E2E tests that starts a server:
    - This helper MUST set the `DEVS_DISCOVERY_FILE` environment variable to a unique temporary file path for the duration of the test.
    - Use the `tempfile` crate for generating these paths.

## 3. Code Review
- [ ] Ensure that all tests in `tests/` are indeed prefixed with `e2e::`.
- [ ] Verify that `src/` does not contain tests that exercise the full system (should be unit tests only).
- [ ] Check the `DEVS_DISCOVERY_FILE` isolation logic for robustness across parallel test executions in CI.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do test` and confirm that E2E tests are correctly identified and run serially.
- [ ] Verify that multiple E2E tests can run without environment variable or server port conflicts.

## 5. Update Documentation
- [ ] Add guidelines for writing E2E tests, focusing on the naming convention and the use of the `DEVS_DISCOVERY_FILE` helper.

## 6. Automated Verification
- [ ] Run `./do test` and inspect the command line output to ensure `grep "e2e::"` is correctly filtering tests and `--test-threads 1` is applied to those runs.
