# Task: Implement E2E Test Isolation Lint (Sub-Epic: 32_Risk 010 Verification)

## Covered Requirements
- [RISK-011]
- [RISK-011-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs_test_helper]

## 1. Initial Test Written
- [ ] Create a "broken" test file in `crates/devs-server/tests/bad_test_isolation.rs` (or similar) that:
    - Directly uses `std::process::Command::new("devs-server")` or `Command::new("devs")`.
- [ ] Add a test case to the lint script (e.g., in `.tools/lint_tests.py` or similar) that:
    - Runs the lint over the workspace.
    - Asserts that it detects the direct `Command::new` call in the "bad" test file and exits non-zero.
    - Asserts that it does NOT fail for correctly implemented tests using `devs_test_helper::start_server()`.

## 2. Task Implementation
- [ ] Update the `./do lint` script (or a script it calls) to include a new check for E2E server startup isolation:
    - Scan all `.rs` files in `tests/` directories (excluding `devs_test_helper` itself).
    - Use a regex or simple string search to find `Command::new("devs")` or `Command::new("devs-server")`.
    - Exit non-zero if any such calls are found outside the permitted helper crate.
- [ ] Ensure the lint excludes `devs_test_helper` or any crate specifically designed to wrap the server startup.

## 3. Code Review
- [ ] Confirm that the lint covers both literal strings `"devs"` and `"devs-server"`.
- [ ] Verify that the error message is clear and directs the developer to use `devs_test_helper::start_server()`.

## 4. Run Automated Tests to Verify
- [ ] Run the lint script: `./do lint`.
- [ ] Verify it fails on the "bad" test and passes after the bad test is fixed (or removed/ignored by the final commit).

## 5. Update Documentation
- [ ] Add a comment in `devs_test_helper` referencing [RISK-011-BR-001] to explain the importance of using the helper for E2E test isolation.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [RISK-011-BR-001] as covered by the lint check.
