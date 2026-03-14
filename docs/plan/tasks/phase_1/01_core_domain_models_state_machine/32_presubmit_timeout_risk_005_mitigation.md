# Task: Implement Presubmit Timeout Risk Mitigation (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-005-02], [MIT-005]

## Dependencies
- depends_on: ["24_roadmap_dependency_graph.md"]
- shared_components: [devs-core (Owner), ./do Entrypoint Script & CI Pipeline (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_presubmit_timeout_enforcement_900s` that asserts the `./do presubmit` command enforces a 900-second (15-minute) hard timeout
- [ ] Write test `test_presubmit_incremental_timing_data` that verifies `./do presubmit` writes incremental timing data to `target/timing.json` during execution
- [ ] Write test `test_presubmit_timeout_exit_code` that verifies timeout results in non-zero exit code with clear error message
- [ ] Write test `test_mit_005_cargo_caching` that asserts `./do setup` configures `sccache` or `cargo-cache` for compile time reduction
- [ ] Write test `test_presubmit_parallel_stages` that verifies independent presubmit stages run in parallel where possible

## 2. Task Implementation
- [ ] Define `PresubmitTimeoutSpec` struct in `crates/devs-core/src/build/presubmit.rs` with:
  - `HARD_TIMEOUT_SECONDS: u64 = 900` constant
  - `INCREMENTAL_TIMING_FILE: &str = "target/timing.json"` constant
- [ ] Define `PresubmitStage` enum with variants: `Setup`, `Format`, `Lint`, `Test`, `Coverage`, `Ci`
- [ ] Implement `PresubmitExecutor` with `run_all() -> Result<(), PresubmitError>` that:
  1. Starts a 900-second countdown timer
  2. Executes stages in dependency order (Setup → Format → Lint → Test → Coverage → Ci)
  3. Writes incremental timing data after each stage completes
  4. Aborts remaining stages if timeout exceeded
  5. Returns aggregated results
- [ ] Define `PresubmitError` enum with variants: `Timeout { elapsed_secs: u64, stage: PresubmitStage }`, `StageFailed { stage: PresubmitStage, exit_code: i32 }`, `Interrupted`
- [ ] Implement `MIT-005` mitigation: Cargo caching configuration
  - Configure `sccache` or `cargo-cache` in `./do setup`
  - Document cache warm-up procedures
  - Track cache hit rates in timing data
- [ ] Implement parallel stage execution where dependencies allow (e.g., Format and Lint can run in parallel after Setup)
- [ ] Add `pub mod presubmit;` to `crates/devs-core/src/build/mod.rs`

## 3. Code Review
- [ ] Verify timeout is enforced as a hard limit (not soft warning)
- [ ] Verify incremental timing data is written atomically (temp-file + rename)
- [ ] Verify `MIT-005` mitigation is correctly implemented per the risk matrix
- [ ] Verify parallel execution does not violate stage dependencies

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core build::presubmit` and confirm all presubmit tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Run `./do presubmit --dry-run` and verify stage execution plan is correct

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/build/presubmit.rs` explaining the 15-minute timeout rationale and MIT-005 mitigation
- [ ] Add doc comments to `PresubmitExecutor::run_all` describing stage execution order and parallelism
- [ ] Document the incremental timing data format in `target/timing.json`

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `HARD_TIMEOUT_SECONDS` constant equals 900
- [ ] Run `grep -r "RISK-005" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
