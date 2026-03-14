# Task: Performance Measurement Core Infrastructure (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-DEP-001], [PERF-DEP-002], [PERF-DEP-003], [PERF-DEP-004]
- [AC-PERF-001], [AC-PERF-002], [AC-PERF-003], [AC-PERF-004], [AC-PERF-008], [AC-PERF-009]
- [PERF-GP-019], [PERF-GP-020]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/perf_infra.rs` with tests that:
  1. Assert `devs_core::perf::LatencyMeasurement` exists and is constructible.
  2. Assert `devs_core::perf::MeasurementBoundary` has exactly 7 variants via exhaustive match (`GrpcGetRun`, `GrpcListRuns`, `GrpcSubmitRun`, `GrpcStreamRunEvents`, `McpReadTool`, `McpWriteTool`, `CliCommand`).
  3. Assert `LatencyMeasurement::elapsed_ms()` returns a `u64` using monotonic `std::time::Instant` (not `chrono`).
  4. Assert `SLO_*_P99_MS` constants are exported as `pub const u64` values from `devs_core::perf`.
  5. Assert `#![deny(unsafe_code)]` is active in `devs-core` (compile-time check).
  6. Assert `SloViolation` rate-limiter emits exactly 1 event for 100 violations within 10 s, then exactly 1 more after window expires ([AC-PERF-004]).
  7. Assert no `.rs` file outside `perf.rs` contains inline numeric SLO literals — delegate to lint ([AC-PERF-008]).
  8. Assert `LatencyMeasurement` is constructed immediately before the operation ([PERF-GP-019]).
  9. Annotate all with `// Covers: [PERF-DEP-001], [PERF-DEP-002], [AC-PERF-001]` etc.
- [ ] Run tests to confirm they fail (red):
  ```
  cargo test -p devs-core --test perf_infra -- --nocapture 2>&1 | tee /tmp/perf_infra_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Create `crates/devs-core/src/perf.rs`** ([PERF-DEP-001]):
  - Define `LatencyMeasurement` struct wrapping `std::time::Instant` ([PERF-GP-020], [AC-PERF-009]).
  - Define `MeasurementBoundary` enum with exactly 7 variants ([AC-PERF-003]).
  - Define all `SLO_*_P99_MS` constants as `pub const u64` ([PERF-DEP-002]).
  - Implement `SloViolationRateLimiter` that emits at most 1 event per 10-second window per `(operation, boundary)` pair ([AC-PERF-004]).
  - Ensure `#![deny(unsafe_code)]` in the crate root ([AC-PERF-002]).
  - Annotate with `// Covers:` for each requirement.

- [ ] **Update `./do lint`** to enforce no inline SLO literals ([AC-PERF-008]):
  - Add a check that greps for numeric literals matching SLO values in `.rs` files outside `perf.rs`.
  - Add a check that greps for `sleep` calls with duration < 1000ms inside loops in test files.

- [ ] **Document dependency ordering** ([PERF-DEP-001], [PERF-DEP-003], [PERF-DEP-004]):
  - Add doc comments to `perf.rs` stating it must be implemented before any other crate adds performance instrumentation.
  - Document that any change to tokio runtime mode requires full SLO test re-run.
  - Document that any `Arc<RwLock<SchedulerState>>` locking change requires regression proof.

## 3. Code Review
- [ ] Verify `perf.rs` has `#![deny(unsafe_code)]` active ([AC-PERF-002]).
- [ ] Verify `MeasurementBoundary` has exactly 7 variants with exhaustive match enforcement ([AC-PERF-003]).
- [ ] Verify all SLO constants match the values in the performance spec table.
- [ ] Verify `LatencyMeasurement::elapsed_ms()` uses `std::time::Instant`, not `chrono::Utc::now()` ([PERF-GP-020]).
- [ ] Confirm all public symbols have doc comments.
- [ ] Verify `// Covers:` annotations present for all listed requirement IDs.

## 4. Run Automated Tests to Verify
- [ ] Run the perf infra tests:
  ```
  cargo test -p devs-core --test perf_infra -- --nocapture
  ```
- [ ] Run traceability verification:
  ```
  python3 .tools/verify_requirements.py --ids PERF-DEP-001,PERF-DEP-002,AC-PERF-001,AC-PERF-002,AC-PERF-003
  ```

## 5. Update Documentation
- [ ] Add doc comments to all public items in `perf.rs`.
- [ ] Update `docs/architecture/testing.md` with a "Performance Measurement" section explaining `LatencyMeasurement` usage.

## 6. Automated Verification
- [ ] Confirm all requirements covered in traceability report:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_perf_core.txt
  ```
- [ ] Verify no inline SLO literals exist outside `perf.rs`:
  ```
  ./do lint 2>&1 | grep "SLO literal"
  ```
