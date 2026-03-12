# Task: Implement `./do coverage` Report Generation (Sub-Epic: 027_Foundational Technical Requirements (Part 18))

## Covered Requirements
- [2_TAS-REQ-015C]

## Dependencies
- depends_on: [03_unit_vs_e2e_test_separation_and_serialization.md]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a mockup `target/coverage/unit_raw.json` and `target/coverage/e2e_raw.json`.
- [ ] Create a mockup script (or integrate into `./do coverage`) that parses these files.
- [ ] Run the generation and assert that `target/coverage/report.json` follows the exact schema in `[2_TAS-REQ-015C]`.
- [ ] Ensure that a gate failure (e.g., unit test coverage < 90%) results in `overall_passed: false`.

## 2. Task Implementation
- [ ] Modify the `./do coverage` command to run the sequential coverage invocations specified in `[2_TAS-REQ-015]`.
- [ ] Create a coverage report generator (e.g., a Python script or a small Rust binary) that:
    - Reads the JSON output from `cargo-llvm-cov` for each run (unit, e2e_aggregate, cli_e2e, tui_e2e, mcp_e2e).
    - Calculates the line coverage percentage for each scope.
    - Evaluates the thresholds (QG-001: 90%, QG-002: 80%, QG-003/004/005: 50%).
    - Generates `target/coverage/report.json` as specified in `[2_TAS-REQ-015C]`.
- [ ] Ensure that `report.json` is overwritten with each `./do coverage` run.
- [ ] The `./do coverage` command MUST exit non-zero if any gate fails.

## 3. Code Review
- [ ] Confirm all gates (QG-001 through QG-005) are implemented correctly.
- [ ] Verify that `actual_pct`, `delta_pct`, and `passed` are calculated accurately from the raw data.
- [ ] Ensure `generated_at` uses a standard ISO 8601 timestamp.

## 4. Run Automated Tests to Verify
- [ ] Execute `./do coverage` and inspect `target/coverage/report.json`.
- [ ] Deliberately lower coverage (e.g., by deleting a test) and verify that the corresponding gate and `overall_passed` both flip to `false`, and the script exits non-zero.

## 5. Update Documentation
- [ ] Document the coverage gates in `docs/plan/specs/2_tas.md` or a similar document.

## 6. Automated Verification
- [ ] Validate `target/coverage/report.json` against its JSON schema (if defined) or simply confirm all mandatory fields are present and correctly typed.
