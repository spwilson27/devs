# Task: Presubmit Timing & Measurement Infrastructure (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-100], [PERF-101], [PERF-102], [PERF-103], [PERF-104], [PERF-105], [PERF-106], [PERF-107], [PERF-108], [PERF-109], [PERF-110], [PERF-111], [PERF-112], [PERF-113], [PERF-114], [PERF-115]
- [AC-PERF-005], [AC-PERF-006], [AC-PERF-007]
- [AC-PERF-7-027], [AC-PERF-7-028], [AC-PERF-7-029], [AC-PERF-7-030]
- [PERF-GP-016], [PERF-GP-017], [PERF-GP-018], [PERF-GP-021]

## Dependencies
- depends_on: ["06_perf_core_infrastructure.md"]
- shared_components: [./do Entrypoint Script, devs-core]

## 1. Initial Test Written
- [ ] Create `tests/test_presubmit_timing.py` with tests that:
  1. Assert `target/presubmit_timings.jsonl` is produced by `./do presubmit` ([AC-PERF-005], [PERF-GP-021]).
  2. Assert each record has required fields: `step`, `started_at`, `elapsed_ms`, `status` ([AC-PERF-7-028]).
  3. Assert `./do presubmit` completes within 900 s or produces `_timeout_kill` record ([AC-PERF-7-027], [AC-PERF-7-030]).
  4. Assert steps exceeding budget by > 20% emit WARN to stderr ([PERF-GP-017]).
  5. Assert timing file is uploaded even on failure (GitLab CI `when: always`) ([PERF-GP-018]).
  6. Assert all latency fields use monotonic clock `u64` ms ([PERF-101]).
  7. Assert `SloViolation` events are rate-limited to 1 per 10 s window ([PERF-102]).
  8. Assert `./do presubmit` flushes each step's timing record immediately ([PERF-103]).
  9. Assert measurement boundaries are fixed per-operation ([PERF-105]–[PERF-109]).
  10. Annotate all with `# Covers:`.
- [ ] Run tests to confirm red:
  ```
  pytest tests/test_presubmit_timing.py -v 2>&1 | tee /tmp/timing_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Update `./do presubmit`** to implement timing infrastructure:
  - Start background timer subprocess writing PID to `target/.presubmit_timer.pid` for 900 s enforcement ([PERF-GP-016]).
  - Write `target/presubmit_timings.jsonl` with one record per step, flushed immediately ([PERF-103]).
  - Each record: `{"step": "test", "started_at": "<ISO8601>", "elapsed_ms": <u64>, "status": "pass|fail"}`.
  - On timeout, write `_timeout_kill` as last record ([AC-PERF-7-030]).
  - Emit WARN to stderr when step exceeds budget by > 20% ([PERF-GP-017]).
- [ ] **Implement `LatencyMeasurement` boundary definitions** ([PERF-105]–[PERF-109]):
  - Server-side boundaries: RPC handler entry → response write.
  - CLI boundaries: binary start → exit (includes gRPC dial).
  - MCP boundaries: tool handler entry → response.
  - TUI boundaries: event received → render complete.
  - Checkpoint boundaries: save call → fsync complete.
- [ ] **Implement presubmit timing record schema** ([PERF-110]–[PERF-115]):
  - `schema_version`, `run_id`, `records[]` array.
  - Each record includes `step`, `started_at`, `elapsed_ms`, `status`, optional `_timeout_kill`.
- [ ] **Update GitLab CI** to upload `target/presubmit_timings.jsonl` with `when: always` ([PERF-GP-018]).

## 3. Code Review
- [ ] Verify timing records use monotonic clock, not wall clock.
- [ ] Verify 900 s timeout is enforced via background timer, not sleep.
- [ ] Verify `// Covers:` and `# Covers:` annotations present.
- [ ] Confirm doc comments on all public items.

## 4. Run Automated Tests to Verify
- [ ] Run presubmit timing tests:
  ```
  pytest tests/test_presubmit_timing.py -v
  ```
- [ ] Run `./do presubmit` and verify timing file:
  ```
  cat target/presubmit_timings.jsonl | head -5
  ```

## 5. Update Documentation
- [ ] Document presubmit timing schema in `docs/architecture/testing.md`.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_timing.txt
  ```
