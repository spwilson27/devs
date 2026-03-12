# Task: E2E Coverage Isolation & Interface Validation (Sub-Epic: 01_Core Quality Gates)

## Covered Requirements
- [3_MCP_DESIGN-REQ-044]

## Dependencies
- depends_on: [01_e2e_infrastructure.md, 03_coverage_gates.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "violation" test `tests/test_e2e_violation.rs` that imports an internal (non-public) module from `devs-core` and attempts to use it.
- [ ] Create a Python script `tests/test_e2e_linter.py` that asserts that the linter correctly identifies this violation.

## 2. Task Implementation
- [ ] Implement a custom "E2E Linter" (e.g., in Python or as a `clippy` configuration):
    - Scans `tests/e2e/` directories.
    - Verifies that imports are restricted to the crate's public interface or external client-side libraries.
    - Explicitly forbids importing modules from server-internal crates (like `devs-core`, `devs-scheduler`, `devs-pool`).
- [ ] Update the coverage aggregator (`.tools/aggregate_coverage.py`) to:
    - Run E2E tests in a clean environment without unit tests (or by using `llvm-cov` to filter by test name/path).
    - Aggregate only the code that is exercised by tests in `tests/e2e/` directories.
    - This provides the "interface-only" coverage data for QG-002 through QG-005.

## 3. Code Review
- [ ] Confirm that QG-002–QG-005 strictly reflect coverage through the external interfaces (CLI, TUI, MCP).
- [ ] Ensure that the agent cannot "cheat" the coverage gates by adding unit-like tests inside the E2E directories.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E violation test and verify the linter catches it.
- [ ] Run `./do coverage` and confirm that QG-002–QG-005 are populated based on E2E-only runs.

## 5. Update Documentation
- [ ] Update the "Testing Policy" in `docs/architecture/testing.md` (or similar) to explain the restriction on E2E test imports.
- [ ] Add this policy to the "Agent Guide" or `GEMINI.md`.

## 6. Automated Verification
- [ ] Verify that a test in `crates/devs-cli/tests/e2e/` cannot compile if it attempts to import `devs_core::internal_module`.
- [ ] Verify that `target/coverage/report.json` correctly segregates E2E coverage.
