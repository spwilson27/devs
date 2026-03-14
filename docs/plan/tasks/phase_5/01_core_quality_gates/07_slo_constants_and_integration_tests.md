# Task: SLO Constants & Latency Integration Tests (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-006], [PERF-007], [PERF-008], [PERF-009], [PERF-010], [PERF-011], [PERF-012], [PERF-013], [PERF-014], [PERF-015], [PERF-016], [PERF-017], [PERF-018], [PERF-019], [PERF-020], [PERF-021], [PERF-022], [PERF-023], [PERF-024], [PERF-025], [PERF-026], [PERF-027], [PERF-028], [PERF-029], [PERF-030], [PERF-031], [PERF-032], [PERF-033]
- [PERF-SLO-BR-001], [PERF-SLO-BR-002], [PERF-SLO-BR-003], [PERF-SLO-BR-004], [PERF-SLO-BR-005]
- [AC-PERF-SLO-001], [AC-PERF-SLO-002], [AC-PERF-SLO-003], [AC-PERF-SLO-004], [AC-PERF-SLO-005], [AC-PERF-SLO-006], [AC-PERF-SLO-007], [AC-PERF-SLO-008], [AC-PERF-SLO-009], [AC-PERF-SLO-010], [AC-PERF-SLO-011], [AC-PERF-SLO-012], [AC-PERF-SLO-013], [AC-PERF-SLO-014], [AC-PERF-SLO-015], [AC-PERF-SLO-016], [AC-PERF-SLO-017], [AC-PERF-SLO-018], [AC-PERF-SLO-019], [AC-PERF-SLO-020]

## Dependencies
- depends_on: [06_perf_core_infrastructure.md, 01_e2e_infrastructure.md]
- shared_components: [devs-core, devs-grpc, devs-mcp, devs-cli, devs-scheduler]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/slo_latency.rs` with integration tests that:
  1. For each gRPC RPC (GetRun, ListRuns, SubmitRun, CancelRun, StreamRunEvents, StreamLogs, WatchPoolState, GetInfo), collect ≥ 100 observations and assert p99 < `SLO_*_P99_MS` × 1.5 (50% CI margin) ([PERF-SLO-BR-001], [AC-PERF-SLO-004], [AC-PERF-SLO-005]).
  2. For operations with both latency and throughput SLOs, assert throughput is sustained while meeting latency ([PERF-SLO-BR-002]).
  3. Assert `SloViolation` is emitted when p99 exceeds the SLO threshold ([AC-PERF-SLO-007]).
  4. Assert hard limits (e.g., TUI render 16 ms) are enforced via `debug_assert!` ([PERF-SLO-BR-005], [AC-PERF-SLO-010]).
  5. Annotate each test with `// Covers: [PERF-NNN]` for the specific SLO row.
- [ ] Create `crates/devs-mcp/tests/slo_mcp_latency.rs` for MCP tool call latency SLOs.
- [ ] Create `crates/devs-cli/tests/slo_cli_latency.rs` for CLI command latency SLOs.
- [ ] Run tests to confirm they fail (red):
  ```
  cargo test -p devs-grpc --test slo_latency -- --nocapture 2>&1 | tee /tmp/slo_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Verify `SLO_*_P99_MS` constants** match the performance spec table for all 28 SLO rows (PERF-006 through PERF-033) ([AC-PERF-SLO-001]).
- [ ] **Implement integration test for each SLO row** ([AC-PERF-SLO-002]):
  - Each test uses the `SLO_*_P99_MS` constant from `devs-core::perf`, not inline literals ([AC-PERF-SLO-003]).
  - Each test collects ≥ 100 observations ([AC-PERF-SLO-005]).
  - p99 assertion uses 50% CI variance margin ([AC-PERF-SLO-004]).
  - Tests importing constants reference them as `devs_core::perf::SLO_*_P99_MS`.
  - Document the 50% margin as a comment adjacent to each assertion ([AC-PERF-SLO-006]).
- [ ] **Implement dual-SLO tests** for operations with both latency and throughput targets ([PERF-SLO-BR-002], [AC-PERF-SLO-008]).
- [ ] **Implement `SloViolation` emission** for p99 breaches ([AC-PERF-SLO-007]):
  - Consecutive window tracking: ≥ 3 windows → `severity = "critical"` ([PERF-SLO-BR-003]).
  - Rate-limiting per `(operation, boundary)` pair ([AC-PERF-SLO-009]).
- [ ] **Implement `debug_assert!`** enforcement for hard-limit SLOs ([PERF-SLO-BR-005], [AC-PERF-SLO-010]).
- [ ] **Verify `cargo doc` passes** for all SLO constants ([AC-PERF-SLO-011]).
- [ ] **Document SLO regression policy** ([PERF-SLO-BR-004]): p99 increase > 10% is a breaking change.

## 3. Code Review
- [ ] Verify each SLO constant matches the spec table value.
- [ ] Verify each integration test collects ≥ 100 observations.
- [ ] Verify 50% margin comment is adjacent to each assertion.
- [ ] Verify `// Covers:` annotations present for all listed requirement IDs.
- [ ] Confirm all public symbols have doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run all SLO tests:
  ```
  cargo test --workspace --test slo_latency --test slo_mcp_latency --test slo_cli_latency -- --nocapture
  ```
- [ ] Run traceability verification for all PERF-006 through PERF-033 and AC-PERF-SLO-* IDs.

## 5. Update Documentation
- [ ] Add SLO table reference to `docs/architecture/testing.md`.
- [ ] Document the 50% CI margin rationale.

## 6. Automated Verification
- [ ] Confirm all requirements covered in traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_slo.txt
  ```
