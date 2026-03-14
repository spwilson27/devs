# Task: Guiding Principles Enforcement & Regression Governance (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-GP-001], [PERF-GP-002], [PERF-GP-003], [PERF-GP-004], [PERF-GP-005], [PERF-GP-006], [PERF-GP-007], [PERF-GP-008], [PERF-GP-009], [PERF-GP-010], [PERF-GP-011], [PERF-GP-012], [PERF-GP-013], [PERF-GP-014], [PERF-GP-015], [PERF-GP-NNN]
- [PERF-NNN]
- [PERF-REG-001], [PERF-REG-002], [PERF-REG-003], [PERF-REG-004], [PERF-REG-005]
- [PERF-BR-610], [PERF-BR-611], [PERF-BR-612], [PERF-BR-613], [PERF-BR-614], [PERF-BR-615], [PERF-BR-616]

## Dependencies
- depends_on: ["06_perf_core_infrastructure.md", "07_slo_constants_and_integration_tests.md"]
- shared_components: [devs-core, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/guiding_principles.rs` with tests that:
  1. Assert SLO targets do not justify skipping validation steps ([PERF-GP-001]).
  2. Assert performance tests assert correctness, not timing alone ([PERF-GP-002]).
  3. Assert validation-failure responses still meet p99 latency ([PERF-GP-003]).
  4. Assert tests use p99 column with 50% CI variance margin ([PERF-GP-004]).
  5. Assert minimum 100 observations before computing percentiles ([PERF-GP-005]).
  6. Assert p50 is informational only; CI fails only on p99 ([PERF-GP-006]).
  7. Assert `tracing` spans are not used as performance assertions ([PERF-GP-007]).
  8. Assert measurement boundaries are fixed per-operation ([PERF-GP-008]).
  9. Assert CLI boundary is broader than server-side ([PERF-GP-009]).
  10. Assert no `get_run`/`list_runs` polling loops with sleep ([PERF-GP-010]).
  11. Assert sole permitted polling exception is cancel-run poll MCP-061 ([PERF-GP-011]).
  12. Assert TUI is event-driven, not timer-driven ([PERF-GP-012]).
  13. Assert truncation is always from the beginning ([PERF-GP-013]).
  14. Assert resource-budget violations set `truncated: true` and log WARN ([PERF-GP-014]).
  15. Assert hard limits enforced at `serde::Deserialize` time ([PERF-GP-015]).
  16. Annotate all with `// Covers:`.
- [ ] Create `tests/test_regression_governance.py` with tests that:
  1. Assert SLO tests are part of `./do presubmit` ([PERF-REG-001]).
  2. Assert `SloViolation` log events in CI are informational only ([PERF-REG-002]).
  3. Assert regression diagnostic sequence is documented ([PERF-REG-003]).
  4. Assert SLO targets in spec are immutable without formal amendment ([PERF-REG-004]).
  5. Assert 50% CI variance margin is documented as comment adjacent to each assertion ([PERF-REG-005]).
- [ ] Create `crates/devs-core/tests/peak_load.rs` with tests that:
  1. Assert all SLOs hold simultaneously at peak load ([PERF-BR-610]).
  2. Assert `LoadClassification` uses `max(per-metric)` with hysteresis ([PERF-BR-611]).
  3. Assert `LoadProfile` counters use `AtomicU32` ([PERF-BR-612]).
  4. Assert `stage_complete_tx` buffer size is 256 ([PERF-BR-613]).
  5. Assert `webhook_tx` buffer size is 1024 ([PERF-BR-614]).
  6. Assert channel sizes do not overflow at peak ([PERF-BR-615], [PERF-BR-616]).
- [ ] Run tests to confirm red.

## 2. Task Implementation
- [ ] **Implement lint rules** to enforce guiding principles:
  - No polling loops with `sleep` in non-cancel code ([PERF-GP-010]).
  - No `tracing` spans used as performance assertions ([PERF-GP-007]).
  - No timer-driven TUI updates ([PERF-GP-012]).
  - Hard limits enforced at `serde::Deserialize` time ([PERF-GP-015]).
- [ ] **Implement `LoadClassification`** and `LoadProfile` types ([PERF-BR-611], [PERF-BR-612]):
  - `LoadProfile` with `AtomicU32` counters.
  - `LoadClassification` using `max(per-metric)` with hysteresis at Peak→Elevated.
- [ ] **Configure channel buffer sizes** ([PERF-BR-613], [PERF-BR-614]):
  - `stage_complete_tx`: 256.
  - `webhook_tx`: 1024.
- [ ] **Document regression diagnostic sequence** ([PERF-REG-003]):
  - When perf test fails in CI, agent must: check `target/presubmit_timings.jsonl`, review recent commits, profile the hot path, identify root cause before any code change.
- [ ] **Implement placeholder coverage** for [PERF-NNN] and [PERF-GP-NNN] template IDs:
  - Add a design note that these are placeholder IDs for future requirements and are exempt from coverage gates.

## 3. Code Review
- [ ] Verify no polling loops exist where streaming is specified.
- [ ] Verify TUI uses event-driven rendering only.
- [ ] Verify truncation is always from the beginning (oldest content).
- [ ] Verify `// Covers:` annotations and doc comments present.

## 4. Run Automated Tests to Verify
- [ ] Run guiding principles and peak load tests:
  ```
  cargo test -p devs-core --test guiding_principles --test peak_load -- --nocapture
  ```
- [ ] Run regression governance tests:
  ```
  pytest tests/test_regression_governance.py -v
  ```

## 5. Update Documentation
- [ ] Document guiding principles in `docs/architecture/testing.md`.
- [ ] Document regression diagnostic procedure.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_principles.txt
  ```
