# Task: Implement CI Pipeline Risk Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-024-01], [AC-RISK-024-03], [AC-RISK-024-04], [MIT-024]

## Dependencies
- depends_on: ["24_roadmap_dependency_graph.md", "32_presubmit_timeout_risk_005_mitigation.md"]
- shared_components: [devs-core (Owner), ./do Entrypoint Script & CI Pipeline (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_gitlab_ci_pipeline_availability_monitor` that asserts a health check mechanism exists for GitLab CI availability
- [ ] Write test `test_gitlab_ci_fallback_local_presubmit` that verifies when CI is unavailable, local presubmit can still gate commits
- [ ] Write test `test_ci_pipeline_cache_warmup` that asserts CI pipeline uses cached dependencies to reduce runtime
- [ ] Write test `test_ci_pipeline_retry_on_transient_failure` that verifies CI jobs retry on transient failures (network, rate limits)
- [ ] Write test `test_mit_024_fallback_documented` that asserts the fallback activation record exists in `docs/adr/` documenting CI unavailability procedures

## 2. Task Implementation
- [ ] Define `CiPipelineSpec` struct in `crates/devs-core/src/ci/pipeline.rs` with:
  - `SUPPORTED_RUNNERS: &[&str] = &["linux", "macos", "windows"]` constant
  - `MAX_JOB_RUNTIME_SECS: u64 = 3600` constant
  - `RETRY_COUNT: u32 = 2` constant for transient failures
- [ ] Define `CiAvailabilityMonitor` struct with:
  - `last_successful_run: Option<DateTime<Utc>>`
  - `consecutive_failures: u32`
  - `is_available(&self) -> bool` — returns false after N consecutive failures
  - `report_success(&mut self)` and `report_failure(&mut self)` methods
- [ ] Implement `MIT-024` mitigation: CI fallback to local presubmit
  - When CI unavailable, developers can run `./do presubmit` locally
  - Local presubmit results can be submitted for merge approval
  - Document fallback procedures in ADR
- [ ] Define `CiFallbackActivationRecord` struct documenting:
  - Risk ID: `RISK-024`
  - Fallback trigger condition: CI unavailable for > N hours
  - Fallback behavior: Local presubmit gates commits
  - ADR file path: `docs/adr/NNNN-fallback-ci-unavailable.md`
- [ ] Define `CiCacheConfig` struct with:
  - `cache_dependencies: bool = true`
  - `cache_target_directory: bool = true`
  - `cache_key_prefix: String` — based on lockfile hash
- [ ] Add `pub mod pipeline;` to `crates/devs-core/src/ci/mod.rs`

## 3. Code Review
- [ ] Verify CI availability monitor tracks consecutive failures
- [ ] Verify fallback to local presubmit is documented and functional
- [ ] Verify `MIT-024` mitigation is correctly implemented per the risk matrix
- [ ] Verify CI retry logic handles transient failures correctly

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core ci::pipeline` and confirm all CI tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Verify `docs/adr/NNNN-fallback-ci-unavailable.md` exists with correct content

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/ci/pipeline.rs` explaining the CI unavailability risk and MIT-024 mitigation
- [ ] Add doc comments to `CiAvailabilityMonitor` describing failure tracking semantics
- [ ] Document the fallback activation record format and procedures

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `CiPipelineSpec::RETRY_COUNT` equals 2
- [ ] Run `grep -r "RISK-024" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
