# Task: Global Dispatcher Infrastructure & Strict Priority Scheduling (Sub-Epic: 06_Multi-Project Resource Management)

## Covered Requirements
- [1_PRD-REQ-034]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler (owner — new module added), devs-pool (consumer — `acquire_agent` API), devs-config (consumer — `SchedulingPolicy` from `ServerConfig`), devs-core (consumer — `ProjectId`, `StageRunId`, `BoundedString`)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/src/dispatcher/tests.rs` (or `mod tests` inside `dispatcher.rs`).
- [ ] **Test: `test_strict_priority_dispatches_higher_priority_first`**
  - Set up three projects: `ProjectA(priority=10)`, `ProjectB(priority=5)`, `ProjectC(priority=1)`.
  - Enqueue one `PendingDispatch` from each project into a `GlobalDispatcher` configured with `SchedulingPolicy::StrictPriority`.
  - Call `pick_next()` three times.
  - Assert the order is `ProjectA`, `ProjectB`, `ProjectC`.
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_strict_priority_fifo_tiebreak_equal_priority`**
  - Set up two projects both with `priority=5`.
  - Enqueue `StageX` from `ProjectA` at `eligible_at = T`, then `StageY` from `ProjectB` at `eligible_at = T+1ms`.
  - Call `pick_next()` twice.
  - Assert order is `StageX` then `StageY` (FIFO by `eligible_at`).
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_strict_priority_starvation_permitted`**
  - Set up `ProjectHigh(priority=10)` and `ProjectLow(priority=1)`.
  - Continuously enqueue stages from both. Call `pick_next()` 20 times, each time re-enqueuing a new stage from `ProjectHigh`.
  - Assert that `ProjectLow` never gets dispatched while `ProjectHigh` has pending stages.
  - This validates `[3_PRD-BR-040]` (starvation of lower-priority is acceptable in strict mode).
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_pick_next_returns_none_on_empty_queue`**
  - Create an empty `GlobalDispatcher`. Call `pick_next()`. Assert `None`.
- [ ] **Test: `test_enqueue_and_remove_on_cancel`**
  - Enqueue 3 stages. Remove one by `StageRunId`. Call `pick_next()` repeatedly. Assert the removed stage is never returned.

## 2. Task Implementation
- [ ] Create `crates/devs-scheduler/src/dispatcher.rs` module (add `mod dispatcher;` to `lib.rs`).
- [ ] Define `SchedulingPolicy` enum in `devs-scheduler` (or re-export from `devs-core` if it's already defined there):
  ```rust
  #[derive(Debug, Clone, Copy, PartialEq, Eq)]
  pub enum SchedulingPolicy {
      StrictPriority,
      WeightedFairQueuing,
  }
  ```
- [ ] Define `PendingDispatch` struct:
  ```rust
  pub struct PendingDispatch {
      pub stage_run_id: StageRunId,
      pub run_id: RunId,
      pub project_id: ProjectId,
      pub priority: u32,
      pub weight: u32,
      pub eligible_at: Instant,
  }
  ```
- [ ] Define `GlobalDispatcher` struct:
  ```rust
  pub struct GlobalDispatcher {
      queue: Vec<PendingDispatch>,
      policy: SchedulingPolicy,
  }
  ```
  Note: The `GlobalDispatcher` itself is NOT `Send+Sync` — it will be wrapped in `Arc<Mutex<GlobalDispatcher>>` by the caller (the server/scheduler integration layer in task 03). This task only implements the pure scheduling logic.
- [ ] Implement `GlobalDispatcher::new(policy: SchedulingPolicy) -> Self`.
- [ ] Implement `GlobalDispatcher::enqueue(&mut self, item: PendingDispatch)` — appends to `queue`.
- [ ] Implement `GlobalDispatcher::remove(&mut self, stage_run_id: &StageRunId) -> bool` — removes a stage from the queue (for cancellation). Returns `true` if found and removed.
- [ ] Implement `GlobalDispatcher::pick_next(&mut self) -> Option<PendingDispatch>` for `StrictPriority`:
  - Sort candidates: primary key = `priority` descending, secondary key = `eligible_at` ascending.
  - Remove and return the first element after sorting.
  - If queue is empty, return `None`.
- [ ] For `WeightedFairQueuing`, this task adds a `todo!()` branch — task 02 will implement it.
- [ ] Implement `GlobalDispatcher::len(&self) -> usize` and `GlobalDispatcher::is_empty(&self) -> bool` utility methods.
- [ ] Add doc comments to all public types and methods with `///` doc comments explaining the scheduling contract.

## 3. Code Review
- [ ] Verify that higher integer priority = higher scheduling priority (matching PRD definition).
- [ ] Verify that `pick_next` does not hold any async locks — it's a pure synchronous method operating on owned data.
- [ ] Verify that `remove()` correctly handles the case where the `stage_run_id` is not found (returns `false`, no panic).
- [ ] Verify that the `PendingDispatch` struct does not contain any cloneable heavy data (e.g., no `String` prompts — only IDs and metadata).
- [ ] Ensure no `unwrap()` or `expect()` calls in non-test code.

## 4. Run Automated Tests to Verify
- [ ] Run: `cargo test -p devs-scheduler -- dispatcher`
- [ ] Verify all 5 tests pass.
- [ ] Run: `cargo clippy -p devs-scheduler -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comments to `GlobalDispatcher`, `PendingDispatch`, and `SchedulingPolicy` explaining multi-project scheduling behavior.
- [ ] No separate README or markdown files needed.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-034' crates/devs-scheduler/src/dispatcher` and verify at least 3 test functions contain the annotation.
- [ ] Run `./do lint` and confirm zero warnings/errors.
- [ ] Run `./do test` and confirm the dispatcher tests appear in output with PASS status.
