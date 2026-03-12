# Task: Scheduler Dispatch Latency (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-158]

## Dependencies
- depends_on: ["04_dag_scheduler_internal_loop.md"]
- shared_components: ["devs-scheduler"]

## 1. Initial Test Written
- [ ] In `devs-scheduler`, create a benchmark or a timing-aware test in `scheduler_latency_tests.rs`.
- [ ] Setup a scenario with two stages: A and B, where B depends on A.
- [ ] Ensure the pool has slots available for both.
- [ ] Start the scheduler and submit the run.
- [ ] Capture the `completed_at` timestamp for stage A and the `started_at` timestamp for stage B.
- [ ] Assert that `started_at - completed_at <= 100ms`.
- [ ] Run this test 100 times to verify consistency.

## 2. Task Implementation
- [ ] Ensure the `DagScheduler` event loop is purely event-driven and does not contain any `tokio::time::sleep` or polling intervals.
- [ ] Optimize the internal state transition logic and dependency resolution to ensure minimum latency.
- [ ] Verify that the `started_at` and `completed_at` timestamps are captured using `std::time::SystemTime` or `chrono::Utc`.
- [ ] Ensure that slot acquisition from `AgentPoolManager` is efficient and does not introduce blocking delays (using `tokio::sync::Semaphore`).

## 3. Code Review
- [ ] Verify that no unnecessary I/O (like reading from disk or a real git repository) happens inside the latency-critical path of the scheduler loop.
- [ ] Confirm that all required data for the next stage's dispatch is pre-calculated or quickly accessible in memory.
- [ ] Check for any potential contention on shared state locks that could cause delays.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` and ensure the latency tests pass.

## 5. Update Documentation
- [ ] Document the 100ms dispatch latency guarantee in the `devs-scheduler` README.md.

## 6. Automated Verification
- [ ] Run a specialized test that executes a 10-stage linear dependency chain (A -> B -> ... -> J) and verify the total dispatch overhead (sum of `started_at(i) - completed_at(i-1)`) is below 1 second.
