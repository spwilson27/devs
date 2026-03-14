# Task: TUI In-Process Coverage Enforcement (Sub-Epic: 50_Risk 023 Verification)

## Covered Requirements
- [RISK-023-BR-002]

## Dependencies
- depends_on: ["01_e2e_subprocess_coverage_config.md"]
- shared_components: [devs-grpc, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a "canary" TUI test in `crates/devs-tui/tests/e2e/ui_interaction.rs` (or equivalent location).
- [ ] The test should use `ratatui::backend::TestBackend` to simulate TUI interaction and verify that a specific module in `devs-tui` is called.
- [ ] Assert that the test is running in the same process (no subprocess spawn) and that coverage is naturally collected by `cargo llvm-cov` during a standard run without any environment variable modification.

## 2. Task Implementation
- [ ] Ensure `TuiWrapper` in `crates/devs-test-utils` is strictly defined to initialize the TUI logic in the current process using `ratatui::Terminal::with_backend(TestBackend::new(...))`.
- [ ] Prohibit the use of `std::process::Command` to spawn the `devs-tui` binary within any test target that is intended for coverage collection.
- [ ] Implement an architectural lint (e.g., in `tests/e2e/mod.rs`) that fails if `devs-tui` binary is detected as being spawned in a subprocess for coverage-enabled tests.

## 3. Code Review
- [ ] Verify that TUI E2E tests are linked against the `devs-tui` library, not just the binary.
- [ ] Ensure that `TestBackend` is used correctly to capture UI snapshots and state transitions for coverage attribution.

## 4. Run Automated Tests to Verify
- [ ] Run the TUI E2E tests: `cargo test -p devs-tui --test ui_interaction`.
- [ ] Verify that coverage for `crates/devs-tui/src/` is correctly reported in the aggregate coverage report.

## 5. Update Documentation
- [ ] Update documentation to explicitly forbid spawning the TUI binary for E2E tests when coverage is required.
- [ ] Update agent memory to reflect that TUI tests must run in-process for reliable coverage.

## 6. Automated Verification
- [ ] Run `./do coverage --tui` and verify that the coverage report for `devs-tui` is non-empty and reflects actual UI interaction paths.
- [ ] Check for any `std::process::Command::new("devs-tui")` calls in the test codebase and verify they are NOT in a coverage-critical path.
