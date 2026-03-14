# Task: Scheduler Dispatch Latency (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-158]

## Dependencies
- depends_on: ["04_dag_scheduler_internal_loop.md"]
- shared_components: ["devs-scheduler (consumer — defines latency specification and tests)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/scheduler/latency_tests.rs` (or equivalent) with `#[cfg(test)] mod tests`.
- [ ] Reuse the `FakeCheckpointStore`, `FakePoolManager`, and `FakeStageExecutor` from task 04.
- [ ] Configure `FakeStageExecutor` to complete stages instantly (zero artificial delay) so that measured latency reflects only scheduler overhead.
- [ ] **Test: `test_dispatch_latency_under_100ms`** — Create a 2-stage workflow: A (no deps) -> B (depends_on A). Run the scheduler. Instrument timestamps:
  - Record `completed_at` for stage A (set by the scheduler when it processes A's completion).
  - Record `started_at` for stage B (set by the scheduler when it dispatches B).
  - Assert `B.started_at - A.completed_at < Duration::from_millis(100)`.
  - Use `tokio::time::Instant` for high-resolution timing within the test.
- [ ] **Test: `test_dispatch_latency_parallel_dependents`** — Create a workflow: A -> [B, C] (B and C both depend on A). Assert:
  - Both `B.started_at` and `C.started_at` are within 100ms of `A.completed_at`.
  - B and C are dispatched in the same scheduler loop iteration (i.e., both become `Running` before the next event is processed).
- [ ] **Test: `test_dispatch_latency_10_stage_chain`** — Create a 10-stage linear chain: S1 -> S2 -> ... -> S10. Run the full workflow. Compute the cumulative dispatch overhead: `sum(S[i+1].started_at - S[i].completed_at)` for i in 1..9. Assert total overhead < 1000ms (100ms per hop * 9 hops, with generous margin).
- [ ] **Test: `test_no_polling_delay_in_loop`** — Inspect the scheduler source (or test behaviorally): submit a workflow and assert the first eligible stage is dispatched within 10ms of submission processing (proving no sleep/poll interval exists).
- [ ] **Test: `test_checkpoint_does_not_block_dispatch`** — Configure `FakeCheckpointStore` to add a 50ms delay to `save_checkpoint`. Assert the dispatch latency from A's completion to B's `started_at` is still under 100ms. This validates that checkpointing is either async or does not block the dispatch path. (If the architecture requires checkpointing before dispatch, this test documents that constraint — adjust the 100ms budget accordingly and document the design decision.)

## 2. Task Implementation
- [ ] Ensure the `DagScheduler::run()` loop (from task 04) processes `StageCompleted` events synchronously within the loop iteration — no deferral to a separate task for dependency evaluation.
- [ ] In `handle_stage_completed`, after transitioning the completed stage:
  1. Immediately scan dependents and transition eligible ones.
  2. For each newly `Eligible` stage, attempt `pool_manager.try_acquire_agent()` (non-blocking). If a slot is available, transition to `Running` and spawn the executor within the same handler call.
  3. This ensures zero polling delay between completion and dispatch.
- [ ] Use `tokio::sync::Semaphore::try_acquire_owned()` (non-blocking) for the fast path. If it fails (pool full), the stage remains `Eligible` and will be dispatched when a `PoolSlotAvailable` event arrives.
- [ ] Add `started_at` and `completed_at` fields to the `StageRun` struct using `chrono::DateTime<Utc>` (for persistence) and capture them at the exact moment of state transition.
- [ ] Ensure no I/O operations (disk, network) occur between the dependency evaluation and the dispatch of the new stage. Checkpoint saving can happen after dispatch if needed to meet the latency target.

## 3. Code Review
- [ ] Verify there are no `tokio::time::sleep` or `tokio::time::interval` calls in the scheduler's hot path.
- [ ] Confirm that `handle_stage_completed` evaluates dependents and dispatches them inline, not via a separate channel round-trip.
- [ ] Check that `try_acquire_owned()` is used (not the blocking `acquire()`) for the fast dispatch path.
- [ ] Verify timestamps use `Utc::now()` at the precise transition point, not at some later processing step.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` on the scheduler crate and ensure all 5 latency tests pass.
- [ ] Run these tests with `--release` to verify latency under optimized builds as well.

## 5. Update Documentation
- [ ] Add a doc comment on the dispatch path explaining the 100ms latency guarantee and the design choices that enable it (inline dependency evaluation, non-blocking semaphore, no polling).
- [ ] Add `// Covers: 2_TAS-REQ-158` annotations to each test function.

## 6. Automated Verification
- [ ] Run `cargo test -- latency --nocapture 2>&1 | grep "test result"` and assert 0 failures.
- [ ] Run `grep -c "Covers: 2_TAS-REQ-158"` on the test file and assert count >= 4.
