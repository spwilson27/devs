# Task: Scheduler Event Loop and Latency Contract in `devs-scheduler` (Sub-Epic: 031_Foundational Technical Requirements (Part 22))

## Covered Requirements
- [2_TAS-REQ-030B]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-core]

## 1. Initial Test Written
- [ ] Create an integration/unit test in `devs-scheduler/src/latency_test.rs` that measures dispatch latency:
    - [ ] Initialize the `DagScheduler` with a mock pool and mock project.
    - [ ] Submit a workflow with two stages (A depends on B).
    - [ ] Emit a `StageResult` for stage B.
    - [ ] Record the `completed_at` timestamp for stage B.
    - [ ] Measure the time until the `DagScheduler` emits a `DispatchStage` event for stage A.
    - [ ] Assert that the duration is < 100 ms as required by [2_TAS-REQ-030B].

## 2. Task Implementation
- [ ] Implement the `SchedulerEvent` enum in `devs-scheduler`.
- [ ] Create the core scheduler task using `tokio::spawn`.
- [ ] Use `tokio::sync::mpsc` for sending events into the scheduler's event loop.
- [ ] Ensure the scheduler loop:
    - [ ] Processes events immediately upon receipt.
    - [ ] Evaluates stage eligibility and dispatches to the pool without blocking the loop.
    - [ ] Uses asynchronous non-blocking I/O for all internal operations.
- [ ] Optimize the in-memory graph traversal to ensure it stays well within the 100ms budget.

## 3. Code Review
- [ ] Verify that the scheduler loop uses no polling (`sleep`, `interval`, etc.) and is purely event-driven.
- [ ] Ensure that the dispatch logic for eligible stages is highly efficient (e.g. constant or logarithmic time on node count).
- [ ] Confirm that `started_at` timestamps for newly dispatched stages are accurately recorded relative to the dependency completion.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler --lib latency_test` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the event-driven architecture of the scheduler and the 100ms latency guarantee in `devs-scheduler/README.md`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm that all scheduler tests pass.
- [ ] Verify [2_TAS-REQ-030B] mapping in the traceability report from `./do coverage` or `.tools/verify_requirements.py`.
