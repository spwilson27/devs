# Task: DAG Dispatch Latency Targets (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-001], [PERF-001-BR-001], [PERF-001-BR-002], [PERF-001-BR-003]
- [PERF-002], [PERF-002-BR-001], [PERF-002-BR-002], [PERF-002-BR-003], [PERF-002-BR-004]
- [PERF-003], [PERF-003-BR-001], [PERF-003-BR-002], [PERF-003-BR-003]
- [PERF-004], [PERF-004-BR-001], [PERF-004-BR-002], [PERF-004-BR-003], [PERF-004-BR-004]
- [PERF-005], [PERF-005-BR-001], [PERF-005-BR-002], [PERF-005-BR-003], [PERF-005-BR-004]

## Dependencies
- depends_on: [06_perf_core_infrastructure.md]
- shared_components: [devs-core, devs-scheduler, devs-pool, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/dispatch_latency.rs` with tests that:
  1. Assert DAG dispatch of a newly eligible stage completes within 100 ms of `StateMachine::transition()` returning `Ok(())` when a semaphore slot is immediately available ([PERF-001], [PERF-001-BR-001]).
  2. Assert the 100 ms budget applies only to `tempdir` execution environments ([PERF-001-BR-002]).
  3. Assert burst test confirms no queueing when slots are available ([PERF-001-BR-003]).
  4. Assert `SubmitRun` validation pipeline completes within budget ([PERF-002] + BR sub-rules).
  5. Assert checkpoint write for a 256-stage workflow completes within p99 < 500 ms ([PERF-003] + BR sub-rules).
  6. Assert `CancelRun` cascade completes within budget ([PERF-004] + BR sub-rules).
  7. Assert `StreamRunEvents` first event latency is within budget ([PERF-005] + BR sub-rules).
  8. Each test collects ≥ 100 observations and uses `SLO_*_P99_MS` constants.
  9. Annotate all with `// Covers:` for each requirement.
- [ ] Run tests to confirm they fail (red):
  ```
  cargo test -p devs-scheduler --test dispatch_latency -- --nocapture 2>&1 | tee /tmp/dispatch_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement dispatch latency measurement** in the scheduler:
  - Instrument `StateMachine::transition()` with `LatencyMeasurement` from `devs-core::perf`.
  - Emit `scheduler.dispatch_slow` WARN when dispatch exceeds 100 ms.
- [ ] **Implement per-requirement integration tests** with ≥ 100 observations each.
- [ ] **Implement burst test** ([PERF-001-BR-003]): submit multiple stages simultaneously with available slots, verify no queueing delays.
- [ ] **Implement environment-specific exclusion** ([PERF-001-BR-002]): docker/remote startup time excluded from the 100 ms budget.
- [ ] **Implement `SubmitRun` validation pipeline** timing ([PERF-002]):
  - All 7 validation steps complete before acquiring write lock ([PERF-002-BR-001]).
- [ ] **Implement checkpoint write** timing ([PERF-003]): 256-stage workflow within 500 ms p99.
- [ ] **Implement `CancelRun` cascade** timing ([PERF-004]): fan-out via `tokio::sync::oneshot` sends.
- [ ] **Implement `StreamRunEvents` first event** timing ([PERF-005]).

## 3. Code Review
- [ ] Verify all latency measurements use `LatencyMeasurement` from `devs-core::perf`.
- [ ] Verify environment-specific exclusions are correctly applied.
- [ ] Verify `// Covers:` annotations present for all listed requirement IDs.
- [ ] Confirm all public symbols have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run dispatch latency tests:
  ```
  cargo test -p devs-scheduler --test dispatch_latency -- --nocapture
  ```
- [ ] Run traceability verification for PERF-001 through PERF-005 and all BR sub-rules.

## 5. Update Documentation
- [ ] Document dispatch latency measurement approach in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_dispatch.txt
  ```
