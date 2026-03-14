# Task: Coverage Script Hardening & E2E Isolation (Sub-Epic: 50_Risk 023 Verification)

## Covered Requirements
- [RISK-023], [RISK-023-BR-003], [RISK-023-BR-004]

## Dependencies
- depends_on: ["01_e2e_subprocess_coverage_config.md", "02_tui_in_process_coverage.md"]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "canary" test in `.tools/tests/test_coverage_script.py` (assuming the `./do` script logic is testable).
- [ ] The test should mock a coverage run that produces no `.profraw` files for E2E subprocesses and verify that the script exits non-zero with the error: `"internal: zero .profraw files found for E2E subprocess runs"`.
- [ ] The test should mock a coverage run and verify that it invokes `cargo-llvm-cov` with separate filter sets for unit tests (`--lib`, `--bins`) and E2E tests (`--test '*_e2e*'`).

## 2. Task Implementation
- [ ] Modify the `./do coverage` implementation to use separate coverage collection passes:
    - **Pass 1 (Unit Coverage):** Run `cargo llvm-cov --all-features --workspace --lib --bins`. This pass is used for core unit test coverage gates (QG-001/002).
    - **Pass 2 (E2E Coverage):** Run `cargo llvm-cov --all-features --test '*_e2e*' --no-report`. This pass specifically targets E2E tests.
- [ ] Add post-collection logic for E2E coverage:
    - Scan `target/coverage/e2e/` (or the configured directory) for any `.profraw` files.
    - If zero files are found, print the descriptive error message and exit non-zero.
- [ ] Merge the collected data into a final aggregate report using `cargo llvm-cov report --aggregate`.
- [ ] Ensure the aggregate report gate calculations (QG-003, QG-004, QG-005) only use data from the E2E coverage pass.

## 3. Code Review
- [ ] Verify that the `--test '*_e2e*'` pattern is consistent across the entire project.
- [ ] Ensure that unit test coverage data is explicitly excluded from E2E-specific gate checks by verifying the logic used to parse the final coverage JSON.
- [ ] Check that the error message is EXACTLY as specified in [RISK-023-BR-003].

## 4. Run Automated Tests to Verify
- [ ] Run the coverage script tests: `pytest .tools/tests/test_coverage_script.py`.
- [ ] Run a manual `./do coverage` run with all E2E tests disabled and confirm it fails correctly.
- [ ] Run a full `./do coverage` run and confirm the aggregate report is generated successfully.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to document the isolated coverage collection strategy.
- [ ] Update the project "Quality Policy" (or equivalent) to reflect how E2E coverage is measured and isolated.

## 6. Automated Verification
- [ ] Run `./do coverage --json` and inspect the output. Verify that `QG-003` (CLI E2E) only counts coverage for code reachable through CLI-specific E2E tests.
- [ ] Confirm that no unit tests are being run during the `--test '*_e2e*'` pass of `cargo llvm-cov`.
