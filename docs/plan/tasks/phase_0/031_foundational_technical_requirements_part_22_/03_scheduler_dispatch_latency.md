# Task: DAG Scheduler Event-Driven Dispatch Latency Contract (Sub-Epic: 031_Foundational Technical Requirements (Part 22))

## Covered Requirements
- [2_TAS-REQ-030B]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-core (consumer — uses WorkflowRunState, StageRunState)", "devs-scheduler (this task defines foundational dispatch latency contract for the scheduler)"]

## 1. Initial Test Written
- [ ] Create a test module `tests/scheduler_dispatch_latency.rs` with the following test cases:
  1. **`test_eligible_stage_dispatched_within_100ms`**: Set up a minimal two-stage workflow (A → B). Complete stage A programmatically by sending a `SchedulerEvent::StageCompleted` on the mpsc channel. Measure the wall-clock time between sending the completion event and stage B's `started_at` timestamp (or the dispatch callback being invoked). Assert the delta is ≤ 100ms.
  2. **`test_two_independent_stages_dispatched_concurrently`**: Workflow with stages B and C both depending on A. Complete A. Assert both B and C are dispatched (transitioned to `Running` or `Eligible` → dispatched) within 100ms of A's completion.
  3. **`test_event_driven_no_polling_delay`**: Verify the scheduler loop uses `recv().await` (not `sleep` + poll). This can be a code-level assertion or a timing test: submit a completion event and verify dispatch happens in < 10ms (well under any polling interval).
  4. **`test_dispatch_with_no_pool_slot_queues_stage`**: Complete a dependency but the pool has 0 available slots. Assert the stage transitions to `Eligible` (not `Running`) within 100ms. When a slot becomes available, it should then be dispatched.
  5. **`test_scheduler_event_channel_types`**: Assert that the `SchedulerEvent` enum includes at least `RunSubmitted`, `StageCompleted`, `StageFailed`, and `RunCancelled` variants, matching the event-driven architecture described in [2_TAS-REQ-030B].

## 2. Task Implementation
- [ ] Define a `SchedulerEvent` enum with variants: `RunSubmitted(WorkflowRun)`, `StageCompleted { run_id: RunId, stage: String }`, `StageFailed { run_id: RunId, stage: String }`, `RunCancelled { run_id: RunId }` (and others as needed).
- [ ] Implement the scheduler's core event loop as an async function that:
  1. Creates a `tokio::sync::mpsc::channel<SchedulerEvent>` with a bounded capacity.
  2. Loops on `receiver.recv().await` — **no polling, no sleep**.
  3. On `StageCompleted`: evaluates all stages whose `depends_on` list is now fully satisfied, transitions them to `Eligible`, and immediately attempts to dispatch them if a pool slot is available.
  4. Records `started_at` timestamps at dispatch time for latency verification.
- [ ] Ensure the dispatch path from event receipt to stage executor spawn has no blocking I/O, no locks held across await points, and no artificial delays.
- [ ] Add `// Covers: 2_TAS-REQ-030B` annotations to the test functions.

## 3. Code Review
- [ ] Verify the scheduler loop contains zero `tokio::time::sleep` calls and zero polling intervals.
- [ ] Verify no mutex or RwLock is held across an `.await` point in the dispatch path.
- [ ] Verify the channel is bounded (prevents unbounded memory growth under load).
- [ ] Verify the 100ms latency contract is tested with actual timing assertions, not just logical correctness.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test scheduler_dispatch_latency` and confirm all 5 tests pass.
- [ ] Run `cargo clippy --all-targets` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to the scheduler event loop explaining the 100ms dispatch latency contract and the event-driven (no-polling) design.

## 6. Automated Verification
- [ ] Run `./do test` and confirm all new tests pass.
- [ ] Grep test source for `// Covers: 2_TAS-REQ-030B` and confirm annotation exists.
