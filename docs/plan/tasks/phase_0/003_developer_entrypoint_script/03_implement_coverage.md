# Task: Implement `coverage` measurement sequence (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [2_TAS-REQ-015]

## Dependencies
- depends_on: [02_implement_setup_and_lint.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Add a shell script test `tests/test_do_script_coverage.sh` that:
    - Verifies `./do coverage` executes the unit test coverage first.
    - Verifies `./do coverage` executes the E2E test coverage second.
    - Verifies `./do coverage` executes the per-interface coverage third ([2_TAS-REQ-015]).
    - Verifies `./do coverage` produces `target/coverage/report.json`.

## 2. Task Implementation
- [ ] Implement `./do coverage` subcommand with `cargo-llvm-cov`:
    - Sequence 1: `cargo llvm-cov --workspace --lcov --output-path lcov_unit.info` (unit tests).
    - Sequence 2: `cargo llvm-cov --workspace --test "*" --lcov --output-path lcov_e2e.info` (integration/E2E tests).
    - Sequence 3: Individual per-interface runs (CLI, TUI, MCP) and merge the results.
- [ ] Merge all coverage data and generate a final report in `target/coverage/report.json`.
- [ ] Implement a zero-coverage failure detection ([1_PRD-KPI-BR-001]): if `actual_pct` is `0.0`, exit with code 1.

## 3. Code Review
- [ ] Verify the coverage sequence follows [2_TAS-REQ-015] exactly.
- [ ] Verify the output report format matches [2_TAS-REQ-081].
- [ ] Verify that instrumentation failures (0.0% coverage) are correctly caught.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/test_do_script_coverage.sh`.
- [ ] Verify `target/coverage/report.json` contains a non-zero coverage percentage if tests exist.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to document the sequential coverage measurement and the zero-coverage failure policy.

## 6. Automated Verification
- [ ] Verify that `./do coverage` completes with exit code 0 if tests are passing.
- [ ] Verify the existence of `target/coverage/report.json` after running.
