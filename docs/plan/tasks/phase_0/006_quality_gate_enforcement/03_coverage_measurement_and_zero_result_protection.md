# Task: Coverage Measurement and Zero-Result Protection (Sub-Epic: 006_Quality Gate Enforcement)

## Covered Requirements
- [1_PRD-KPI-BR-001], [2_TAS-REQ-015], [2_TAS-REQ-015A], [2_TAS-REQ-015B], [2_TAS-REQ-015C], [2_TAS-REQ-015D], [2_TAS-REQ-015E]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell script test in `tests/test_coverage_behavior.sh` that verifies:
    - `./do coverage` executes unit, E2E, and per-interface coverage in sequence [2_TAS-REQ-015].
    - `./do coverage` fails if instrumentation produces an `actual_pct` of exactly `0.0` for any gate [1_PRD-KPI-BR-001].
    - `./do coverage` correctly generates `target/coverage/report.json` with gates QG-001 through QG-005 [2_TAS-REQ-015C].
    - `./do coverage` exits non-zero if any gate threshold is not met [2_TAS-REQ-015D].

## 2. Task Implementation
- [ ] Implement the `coverage` subcommand in the `./do` script [2_TAS-REQ-015].
- [ ] Configure `cargo-llvm-cov` to measure coverage.
- [ ] Implement unit test coverage (tests in `src/`).
- [ ] Implement E2E test coverage (tests in `tests/` directories) [2_TAS-REQ-015A].
- [ ] Implement per-interface E2E coverage for CLI, TUI, and MCP individually [2_TAS-REQ-015E].
- [ ] Ensure E2E tests run with `--test-threads 1` and `DEVS_DISCOVERY_FILE` is set to a unique path [2_TAS-REQ-015B].
- [ ] Implement the `report.json` generator in the `./do` script, documenting `generated_at`, `overall_passed`, and the gates [2_TAS-REQ-015C].
- [ ] Add the 0.0% failure check to the coverage reporter to catch instrumentation failures [1_PRD-KPI-BR-001].
- [ ] Add the gate enforcement logic to print a summary table to stderr and exit non-zero on failure [2_TAS-REQ-015D].

## 3. Code Review
- [ ] Verify that E2E tests are correctly identified by the `e2e::` name convention [2_TAS-REQ-015A].
- [ ] Ensure interface coverage is measured against the **total lines in all workspace crates** [2_TAS-REQ-015E].
- [ ] Verify that the 0.0% check is applied to *each* gate independently.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/test_coverage_behavior.sh`.
- [ ] Run `./do coverage` on the current codebase and ensure it generates the report.

## 5. Update Documentation
- [ ] Update `GEMINI.md` memory to document the coverage gate thresholds and the 0.0% failure logic.

## 6. Automated Verification
- [ ] Run `./do coverage` and inspect the generated `target/coverage/report.json` for schema conformance.
