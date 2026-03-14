# Task: SLO Edge Cases & Error Paths (Sub-Epic: 01_core_quality_gates)

## Covered Requirements
- [PERF-116], [PERF-116-EC], [PERF-117], [PERF-117-EC], [PERF-118], [PERF-118-EC], [PERF-119], [PERF-119-EC], [PERF-120], [PERF-120-EC], [PERF-121], [PERF-121-EC], [PERF-122], [PERF-122-EC], [PERF-123], [PERF-123-EC]
- [PERF-124], [PERF-125], [PERF-126], [PERF-127], [PERF-128], [PERF-129], [PERF-130], [PERF-131], [PERF-132], [PERF-133], [PERF-134], [PERF-135], [PERF-136], [PERF-137], [PERF-138], [PERF-139], [PERF-140], [PERF-141], [PERF-142], [PERF-143], [PERF-144], [PERF-145], [PERF-146], [PERF-147], [PERF-148], [PERF-149], [PERF-150], [PERF-151], [PERF-152], [PERF-153], [PERF-154], [PERF-155], [PERF-156], [PERF-157], [PERF-158], [PERF-159], [PERF-160], [PERF-161], [PERF-162], [PERF-163], [PERF-164], [PERF-165], [PERF-166], [PERF-167], [PERF-168], [PERF-169], [PERF-170], [PERF-171], [PERF-172], [PERF-173], [PERF-174], [PERF-175], [PERF-176], [PERF-177], [PERF-178], [PERF-179], [PERF-180], [PERF-181], [PERF-182], [PERF-183], [PERF-184], [PERF-185], [PERF-186], [PERF-187], [PERF-188], [PERF-189], [PERF-190], [PERF-191], [PERF-192], [PERF-193], [PERF-194], [PERF-195], [PERF-196], [PERF-197], [PERF-198], [PERF-199]

## Dependencies
- depends_on: [07_slo_constants_and_integration_tests.md, 10_grpc_mcp_scheduler_rules.md]
- shared_components: [devs-grpc, devs-mcp, devs-scheduler, devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create `crates/devs-grpc/tests/slo_edge_cases.rs` with tests that:
  1. Assert `SubmitRun` validation failures still meet p99 latency targets ([PERF-116-EC]).
  2. Assert disk-full `ENOSPC` on checkpoint write returns `Err(DiskFull)` without crash ([PERF-117-EC]).
  3. Assert gRPC event buffer overflow behavior is graceful ([PERF-118-EC]).
  4. Assert each PERF-116 through PERF-123 main SLO and their -EC error variants.
  5. Annotate all with `// Covers:`.
- [ ] Create `crates/devs-scheduler/tests/slo_extended.rs` for PERF-124 through PERF-199 requirements covering extended performance scenarios including:
  - Criterion benchmark management ([PERF-124]–[PERF-135]).
  - `regressions.jsonl` schema compliance ([PERF-136]–[PERF-145]).
  - Pool exhaustion state machine edge cases ([PERF-146]–[PERF-160]).
  - SLO violation rate-limiter state management ([PERF-161]–[PERF-175]).
  - Presubmit timing record schema validation ([PERF-176]–[PERF-185]).
  - Criterion baseline and regression detection ([PERF-186]–[PERF-199]).
  6. Annotate all with `// Covers:`.
- [ ] Run tests to confirm red:
  ```
  cargo test --workspace --test slo_edge_cases --test slo_extended -- --nocapture 2>&1 | tee /tmp/edge_cases_baseline.txt
  ```

## 2. Task Implementation
- [ ] **Implement error-path SLO tests** ([PERF-116-EC through PERF-123-EC]):
  - Validation failure responses must meet same p99 as success responses.
  - Disk-full handling returns clean error, no panic.
  - Buffer overflow handled gracefully (drop oldest, log WARN).
- [ ] **Implement Criterion benchmark management** ([PERF-124]–[PERF-135]):
  - Benchmark files in `crates/*/benches/`.
  - Baseline storage and comparison.
  - Regression detection: `delta_pct >= 10%` triggers lint failure.
  - `delta_pct < 10%` emits WARN.
  - Improvement logs INFO.
- [ ] **Implement `regressions.jsonl`** output ([PERF-136]–[PERF-145]):
  - Schema: `{"benchmark": "name", "baseline_ns": N, "current_ns": N, "delta_pct": F, "action": "fail|warn|info"}`.
- [ ] **Implement pool exhaustion state machine** edge cases ([PERF-146]–[PERF-160]):
  - Transition rules, webhook deduplication, recovery detection.
- [ ] **Implement SLO violation rate-limiter** state management ([PERF-161]–[PERF-175]):
  - Window expiration, per-operation tracking, severity escalation.
- [ ] **Implement presubmit timing** extended schema ([PERF-176]–[PERF-185]).
- [ ] **Implement Criterion regression detection** ([PERF-186]–[PERF-199]):
  - Expired suppress annotation fails lint.
  - Missing baseline emits WARN and exits 0.

## 3. Code Review
- [ ] Verify error paths return clean errors, never panic.
- [ ] Verify Criterion regression thresholds match spec.
- [ ] Verify `// Covers:` annotations present for all listed IDs.

## 4. Run Automated Tests to Verify
- [ ] Run edge case and extended tests:
  ```
  cargo test --workspace --test slo_edge_cases --test slo_extended -- --nocapture
  ```

## 5. Update Documentation
- [ ] Document error-path SLO behavior in `docs/architecture/testing.md`.
- [ ] Document Criterion regression workflow.

## 6. Automated Verification
- [ ] Confirm all requirements covered:
  ```
  ./do presubmit 2>&1 | tee /tmp/presubmit_edge_cases.txt
  ```
