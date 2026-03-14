# Task: Pool Config Validation and Executor Cleanup Verification Tests (Sub-Epic: 10_Phase 1 Acceptance Criteria)

## Covered Requirements
- [AC-ROAD-P1-006], [AC-ROAD-P1-008]

## Dependencies
- depends_on: ["01_phase_0_dependency_verification.md"]
- shared_components: ["devs-pool", "devs-executor", "devs-config"]

## 1. Initial Test Written
- [ ] In `crates/devs-pool/tests/config_validation.rs` (or `crates/devs-config/tests/pool_validation.rs`), write test `test_single_provider_pool_rejected`: (1) construct a `PoolConfig` with 3 agents all having `tool = "claude"`, (2) call `validate()`, (3) assert `Err`, (4) assert error message contains `"claude"`. Annotate with `// Covers: AC-ROAD-P1-006`.
- [ ] Write `test_multi_provider_pool_accepted` with agents using `"claude"` and `"gemini"`, assert validation passes.
- [ ] In `crates/devs-executor/tests/cleanup.rs`, write test `test_cleanup_runs_after_nonzero_exit`: (1) create a `TempDir` as the working directory for a `WorkingEnvironment`, (2) simulate or mock an agent process exiting with code 1, (3) call `cleanup(env)`, (4) assert `!working_dir_path.exists()`. Annotate with `// Covers: AC-ROAD-P1-008`.
- [ ] Write `test_cleanup_runs_after_zero_exit` confirming cleanup also removes the directory on success.

## 2. Task Implementation
- [ ] Add validation to `PoolConfig::validate()`: count distinct `tool` values across agents. If only one distinct value, return `ConfigError` with message: `"pool '<name>' has all agents using tool '<tool>'; at least two different tools required for fallback"`.
- [ ] In `devs-executor`, ensure `cleanup(env)` is called unconditionally after `run_agent` returns — whether success or error. Use a pattern like: `let result = run_agent(...); cleanup(&env)?; result` or a `Drop`-based guard.
- [ ] `cleanup` for `tempdir` target: `std::fs::remove_dir_all(path)`. For Docker: `docker rm -f <container>`. For SSH: `ssh <host> rm -rf <path>`.

## 3. Code Review
- [ ] Verify pool validation error message specifically names the duplicated tool string.
- [ ] Verify executor cleanup test uses real `TempDir` (not mock) to confirm filesystem deletion.
- [ ] Verify cleanup runs on both success and failure code paths.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and confirm tests pass.
- [ ] Run `cargo test -p devs-executor --test cleanup` and confirm tests pass.

## 5. Update Documentation
- [ ] Add doc comments on `PoolConfig::validate()` explaining single-provider rejection.
- [ ] Add doc comments on `cleanup()` explaining unconditional execution guarantee.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` maps `AC-ROAD-P1-006` and `AC-ROAD-P1-008`.
- [ ] Run `grep -r "AC-ROAD-P1-006\|AC-ROAD-P1-008" crates/` and confirm matches.
