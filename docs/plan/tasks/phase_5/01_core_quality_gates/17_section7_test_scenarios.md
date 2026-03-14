# Task: Section 7 Structured Test Scenarios (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [AC-PERF-7-001], [AC-PERF-7-002], [AC-PERF-7-003], [AC-PERF-7-004], [AC-PERF-7-005], [AC-PERF-7-006], [AC-PERF-7-007], [AC-PERF-7-008], [AC-PERF-7-009], [AC-PERF-7-010], [AC-PERF-7-011], [AC-PERF-7-012], [AC-PERF-7-013], [AC-PERF-7-014], [AC-PERF-7-015], [AC-PERF-7-016], [AC-PERF-7-017], [AC-PERF-7-018], [AC-PERF-7-019], [AC-PERF-7-020], [AC-PERF-7-021], [AC-PERF-7-022], [AC-PERF-7-023], [AC-PERF-7-024], [AC-PERF-7-025], [AC-PERF-7-026]
- [AC-PERF-7-031], [AC-PERF-7-032], [AC-PERF-7-033], [AC-PERF-7-034], [AC-PERF-7-035], [AC-PERF-7-036], [AC-PERF-7-037], [AC-PERF-7-038]

## Dependencies
- depends_on: ["01_e2e_infrastructure.md", "07_slo_constants_and_integration_tests.md", "08_dispatch_latency_targets.md", "10_grpc_mcp_scheduler_rules.md"]
- shared_components: [devs-grpc, devs-mcp, devs-scheduler, devs-checkpoint, devs-core, devs-pool]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/section7_scenarios.rs` with tests that:
  1. Assert `SubmitRun` p99 < 2000 ms with ≥ 100 observations ([AC-PERF-7-001]).
  2. Assert fan-out dispatch latency within SLO ([AC-PERF-7-002]).
  3. Assert `CancelRun` cascade timing ([AC-PERF-7-003]).
  4. Assert MCP read tool latencies ([AC-PERF-7-004]–[AC-PERF-7-008]).
  5. Assert MCP write tool latencies ([AC-PERF-7-009]–[AC-PERF-7-012]).
  6. Assert context file construction timing ([AC-PERF-7-013]–[AC-PERF-7-016]).
  7. Annotate all with `// Covers:`.
- [ ] Create `crates/devs-grpc/tests/section7_load.rs` for load test scenarios:
  1. Assert 50 concurrent gRPC clients handled ([AC-PERF-7-017]).
  2. Assert 64 simultaneous MCP connections ([AC-PERF-7-018]).
  3. Assert 65th connection gets HTTP 503 within 100 ms ([AC-PERF-7-019]).
  4. Assert released connection allows next request within 500 ms ([AC-PERF-7-020]).
  5. Assert concurrent stream management ([AC-PERF-7-021]–[AC-PERF-7-023]).
- [ ] Create `crates/devs-scheduler/tests/section7_logs.rs`:
  1. Assert `stream_logs` delivers 10000 lines within 10000 ms with gap-free sequence numbers ([AC-PERF-7-024]).
  2. Assert `LogBuffer` with 15000 pushes at capacity 10000 shows correct state ([AC-PERF-7-025]–[AC-PERF-7-026]).
- [ ] Create `crates/devs-checkpoint/tests/section7_checkpoint.rs`:
  1. Assert atomic write completes within 500 ms ([AC-PERF-7-031]).
  2. Assert disk-full causes `Err(DiskFull)` without crash ([AC-PERF-7-032]).
  3. Assert concurrent checkpoint writes are serialized ([AC-PERF-7-033]).
- [ ] Create `crates/devs-core/tests/section7_regression.rs`:
  1. Assert Criterion regression event at `delta_pct=10.0` ([AC-PERF-7-034]).
  2. Assert no event at `delta_pct=9.99` ([AC-PERF-7-035]).
  3. Assert improvement logs INFO ([AC-PERF-7-036]).
  4. Assert lint exits non-zero for regression ([AC-PERF-7-037]).
  5. Assert expired suppress annotation fails lint ([AC-PERF-7-038]).
- [ ] Run tests to confirm red:
  ```
  cargo test --workspace --test section7_scenarios --test section7_load --test section7_logs --test section7_checkpoint --test section7_regression -- --nocapture 2>&1 | tee /tmp/section7_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement SLO test scenarios** ([AC-PERF-7-001]–[AC-PERF-7-016]):
  - Each scenario is an integration test with ≥ 100 observations.
  - Uses `SLO_*_P99_MS` constants with 50% margin.
  - Asserts both correctness and timing.
- [ ] **Implement load test scenarios** ([AC-PERF-7-017]–[AC-PERF-7-023]):
  - Spawn concurrent gRPC/MCP clients using `tokio::spawn`.
  - Verify correct behavior under concurrent load.
  - Verify connection limits and graceful rejection.
- [ ] **Implement log streaming scenarios** ([AC-PERF-7-024]–[AC-PERF-7-026]):
  - Stream 10000 log lines and verify gap-free sequence numbers.
  - Push 15000 lines to capacity-10000 buffer and verify oldest evicted.
- [ ] **Implement checkpoint scenarios** ([AC-PERF-7-031]–[AC-PERF-7-033]):
  - Atomic write timing.
  - Disk-full error handling (mock filesystem or use tmpfs quota).
  - Concurrent write serialization verification.
- [ ] **Implement regression detection scenarios** ([AC-PERF-7-034]–[AC-PERF-7-038]):
  - Criterion integration with mock baseline data.
  - Threshold boundary testing at 10.0% and 9.99%.
  - Suppress annotation expiration.

## 3. Code Review
- [ ] Verify each scenario matches its spec description exactly.
- [ ] Verify load tests clean up spawned tasks.
- [ ] Verify `// Covers:` annotations present for all listed IDs.

## 4. Run Automated Tests to Verify
- [ ] Run all section 7 tests:
  ```
  cargo test --workspace --test "section7_*" -- --nocapture
  ```

## 5. Update Documentation
- [ ] Document section 7 test scenario patterns in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_section7.txt
  ```
