# Task: DAG Dispatch Latency Verification (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-001]

## Dependencies
- depends_on: []
- shared_components: [devs-scheduler (consumer), devs-core (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/ac_p2_001_dispatch_latency.rs` with a `#[tokio::test]` that builds a DAG with three stages: `A` (no deps), `B` (depends on `A`), `C` (depends on `A`). Stages `B` and `C` are independent of each other.
- [ ] Use a mock `AgentAdapter` and mock `Executor` that immediately return success (exit code 0) when invoked, so the test isolates scheduling latency from execution time.
- [ ] Record `tokio::time::Instant::now()` immediately after signaling stage `A` as `Completed`.
- [ ] Use `tokio::time::timeout(Duration::from_millis(100), ...)` to await both `B` and `C` transitioning from `Waiting` to `Eligible` (or `Running`). The timeout is the assertion: if it fires, the test fails.
- [ ] Assert that both `B` and `C` have been dispatched (status is `Running` or beyond) within the 100ms window using monotonic `Instant` comparison, NOT wall-clock `SystemTime`.
- [ ] Add `// Covers: AC-ROAD-P2-001` annotation to the test function.

## 2. Task Implementation
- [ ] If not already present, ensure the scheduler's internal dispatch loop re-evaluates eligible stages immediately when a stage completion event is received (no polling interval that adds latency).
- [ ] Verify the scheduler uses `tokio::sync::Notify` or an equivalent wake mechanism so that the dispatch loop does not sleep between evaluations when events are pending.
- [ ] Ensure no blocking I/O (e.g., synchronous git operations, file writes) is in the critical path between "stage A completes" and "stages B/C are dispatched". Any checkpoint writes must happen asynchronously or after dispatch.

## 3. Code Review
- [ ] Confirm the test uses `tokio::time::Instant` (monotonic), not `std::time::SystemTime`.
- [ ] Confirm the test does not use `tokio::time::sleep` or `tokio::time::advance` which could mask real latency.
- [ ] Verify the mock adapter/executor does not introduce artificial delays.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test ac_p2_001_dispatch_latency -- --nocapture`
- [ ] Verify the test passes consistently (run 3 times to check for flakiness).

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-001` to the test if not already present.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-001` in a passing state.
- [ ] Run `grep -r 'AC-ROAD-P2-001' crates/` and confirm at least one test file contains the annotation.
