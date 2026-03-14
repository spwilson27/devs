# Task: DAG Dispatch Latency Goal Verification (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [GOAL-001]: Parallel dispatch within 100 ms of dependency completion. A unit test annotated `// Covers: GOAL-001` submits a 2-stage DAG with no shared dependencies and asserts that both stages are dispatched within 100 ms of each other (monotonic clock). Measurement begins at `StateMachine::transition()` returning `Ok(())` for the dependency's terminal `Completed` transition and ends at the `execvp`/`CreateProcess` syscall for the spawned agent subprocess.

## Dependencies
- depends_on: ["02_parallel_stage_dispatch_engine.md"]
- shared_components: [devs-core (consumer — state machine transition timestamps), devs-executor (consumer — agent spawn instrumentation)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/tests/dispatch_latency_tests.rs`.
- [ ] Write unit test `test_goal001_two_independent_stages_dispatch_within_100ms`: construct a DAG with root stage R and two independent stages A, B (both depend only on R). Complete R. Measure wall-clock time from `StateMachine::transition()` returning `Ok(())` for R's `Completed` transition to both A and B being dispatched (agent spawn initiated). Assert total latency < 100ms using `tokio::time::Instant` (monotonic clock). Annotate `// Covers: GOAL-001`.
- [ ] Write unit test `test_goal001_wide_fanout_50_stages`: construct DAG with 1 root and 50 stages depending on root. Complete root. Assert all 50 stages dispatched within 100ms of root completion. Annotate `// Covers: GOAL-001`.
- [ ] Write unit test `test_goal001_deep_chain_latency`: construct linear DAG with 10 stages. Measure per-hop dispatch latency (time from stage N completing to stage N+1 being dispatched). Assert each hop < 100ms. Annotate `// Covers: GOAL-001`.
- [ ] Write unit test `test_goal001_measurement_uses_monotonic_clock`: verify the test infrastructure uses `Instant` (monotonic), not `SystemTime` (wall clock), to avoid clock skew false positives. Annotate `// Covers: GOAL-001`.

## 2. Task Implementation
- [ ] Add dispatch latency instrumentation to the `Dispatcher`:
  - Record `Instant::now()` at the moment `StateMachine::transition()` returns `Ok(())` for a `Completed` transition.
  - Record `Instant::now()` at the moment each newly-eligible stage's agent spawn is initiated.
  - Compute and log the delta as `dispatch_latency_ms`.
- [ ] Expose dispatch latency metrics via a method `Dispatcher::last_dispatch_latencies() -> Vec<(String, Duration)>` for test assertion.
- [ ] Ensure the dispatch loop does not introduce unnecessary delays between transition completion and eligible stage detection (no sleeps, no lock contention in the hot path).
- [ ] Use `tokio::time::Instant` for all measurements — never `std::time::SystemTime`.

## 3. Code Review
- [ ] Verify latency measurement starts at state machine transition completion, not at some earlier point.
- [ ] Verify latency measurement ends at agent spawn initiation, not at agent process exit.
- [ ] Verify monotonic clock is used throughout — no `SystemTime` usage in measurement code.
- [ ] Verify the 50-stage wide fanout test actually spawns stages in parallel (not sequentially).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- dispatch_latency` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to the dispatch latency instrumentation explaining the measurement boundaries.
- [ ] Reference GOAL-001 and PERF-001 in the doc comments.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- dispatch_latency --format=json 2>&1 | grep '"passed"'` and confirm all test cases passed.
- [ ] Specifically verify `test_goal001_two_independent_stages_dispatch_within_100ms` passes — this is the canonical GOAL-001 verification test.
