# Task: Implement Interface-Specific E2E Coverage Computation (Sub-Epic: 028_Foundational Technical Requirements (Part 19))

## Covered Requirements
- [2_TAS-REQ-015E]

## Dependencies
- depends_on: [01_do_coverage_exit_logic.md]
- shared_components: [Traceability & Verification Infrastructure, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a Python test `tests/test_interface_coverage_computation.py` that verifies the logic for isolating coverage by test suite.
- [ ] Mock raw `llvm-cov` output for different test runs (CLI, TUI, MCP) and verify they are correctly aggregated against the **total lines in all workspace crates**.
- [ ] Ensure that a line covered in the MCP test suite but NOT in the TUI test suite correctly impacts the MCP E2E coverage metric (QG-005) positively, but not the TUI metric (QG-004).

## 2. Task Implementation
- [ ] Update the coverage collection logic in `.tools/ci.py` to support "tagged" or "labeled" coverage profiles.
- [ ] Configure `llvm-cov` (via `grcov` or similar) to generate separate profile data for:
  - CLI tests (e.g., `pytest -m cli` or `cargo test -p devs-cli`)
  - TUI tests (e.g., `pytest -m tui` or `cargo test -p devs-tui`)
  - MCP tests (e.g., `pytest -m mcp` or `cargo test -p devs-mcp-bridge`)
- [ ] Implement a computation step that takes these separate profiles and calculates line coverage as a ratio against the **total system codebase** (not just the crate being tested).
- [ ] Integrate these metrics (QG-003, QG-004, QG-005) into the final coverage report JSON.

## 3. Code Review
- [ ] Verify that the denominator for these ratios is indeed the **sum of all executable lines in the entire workspace**.
- [ ] Ensure that the collection process doesn't overwrite coverage data from other suites (use unique `LLVM_PROFILE_FILE` names).
- [ ] Confirm that the implementation is efficient and doesn't double-count lines when multiple test suites are run.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_interface_coverage_computation.py`.
- [ ] Run `./do coverage` and verify that the report JSON contains QG-003, QG-004, and QG-005 with the correct logic.

## 5. Update Documentation
- [ ] Update `.tools/README.md` to explain how per-interface coverage is computed and what it represents.

## 6. Automated Verification
- [ ] Inspect the generated `coverage.json` and verify the values for QG-003, QG-004, and QG-005 are calculated using the full system denominator.
