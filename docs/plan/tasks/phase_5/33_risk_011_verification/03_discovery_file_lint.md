# Task: Add Lint for Discovery Path Isolation (Sub-Epic: 33_Risk 011 Verification)

## Covered Requirements
- [RISK-011-BR-004], [MIT-011]

## Dependencies
- depends_on: ["02_e2e_test_config.md"]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a dummy Rust test file `devs-grpc/tests/violation.rs` that explicitly uses `std::env::set_var("DEVS_DISCOVERY_FILE", "/tmp/devs-test.addr")`.
- [ ] Run `./do lint` and assert that it exits with a non-zero status.
- [ ] Verify that the lint output explicitly mentions the prohibited hardcoded path.

## 2. Task Implementation
- [ ] Identify or create a linting script used by `./do lint` (likely a python script in `.tools/`).
- [ ] Implement a regex-based search (or equivalent) across all `tests/**/*.rs` files to detect hardcoded paths for `DEVS_DISCOVERY_FILE`.
    - Example regex: `["']/(tmp|var/tmp)/devs-test\.addr["']`.
- [ ] Integrate this check into the main `./do lint` workflow.
- [ ] Ensure that existing valid tests (those using `TempDir`) do not trigger the lint.

## 3. Code Review
- [ ] Verify that the regex correctly identifies variations of hardcoded paths (e.g., both `/tmp/` and others if specified).
- [ ] Ensure the lint does not trigger for comments or documentation (if appropriate), but definitely for code setting the environment variable.
- [ ] Check that the error message is clear and points to `RISK-011-BR-004`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the clean codebase; it should pass.
- [ ] Re-introduce the `violation.rs` and verify it fails.

## 5. Update Documentation
- [ ] Update `.tools/README.md` to document the new lint rule for E2E isolation.

## 6. Automated Verification
- [ ] Verify that the `./do lint` script contains the logic for this check.
- [ ] Confirm that no existing tests are using hardcoded paths.
