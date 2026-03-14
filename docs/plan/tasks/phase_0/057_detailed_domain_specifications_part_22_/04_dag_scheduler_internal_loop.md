# Task: DAG Scheduler Internal Loop (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-157]

## Dependencies
- depends_on: ["02_dag_cycle_detection.md", "03_agent_pool_manager_state.md", "01_checkpoint_git_orphan_branch.md"]
- shared_components: ["devs-scheduler (consumer — defines domain-level loop specification and tests; devs-scheduler crate is owned by Phase 2)", "devs-core", "devs-pool", "devs-checkpoint"]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/scheduler/loop_spec.rs` (or `crates/devs-scheduler/src/loop_tests.rs`) with a `#[cfg(test)] mod tests` block.
- [ ] Define mock/fake implementations:
  - `FakeCheckpointStore` implementing a `CheckpointStore` trait — stores checkpoints in a `Vec<CheckpointRecord>` in memory.
  - `FakePoolManager` — returns agent leases immediately from an internal counter; configurable to simulate exhaustion.
  - `FakeStageExecutor` — completes stages after a configurable delay, returning a configurable `CompletionResult`.
- [ ] **Test: `test_submission_sets_root_stages_eligible`** — Submit a workflow with stages A (no deps), B (depends_on A), C (depends_on A). Assert:
  - `WorkflowRun` is created with all stages initially `Waiting`.
  - After submission processing, stage A transitions to `Eligible`.
  - Stages B and C remain `Waiting`.
  - A checkpoint is saved after the submission.
- [ ] **Test: `test_eligible_stage_dispatched_on_pool_slot`** — With stage A `Eligible` and a pool slot available, the scheduler transitions A to `Running` and spawns a `StageExecutor` task. Assert:
  - A's status is `Running` with a non-null `started_at` timestamp.
  - The `FakePoolManager` recorded one `acquire_agent` call.
  - A checkpoint is saved after the dispatch.
- [ ] **Test: `test_stage_completion_enables_dependents`** — Stage A completes successfully. Assert:
  - A's status is `Completed` with a non-null `completed_at`.
  - Stages B and C (which depend only on A) transition to `Eligible`.
  - A checkpoint is saved.
- [ ] **Test: `test_stage_failure_does_not_enable_dependents`** — Stage A fails. Assert:
  - A's status is `Failed`.
  - Stages B and C remain `Waiting` (they are never made eligible).
  - The workflow run status transitions to `Failed`.
- [ ] **Test: `test_cancel_signal_stops_running_stages`** — Submit and start a workflow. While stage A is `Running`, send a `CancelRun` signal. Assert:
  - A's status transitions to `Cancelled`.
  - All `Waiting`/`Eligible` stages transition to `Cancelled`.
  - The workflow run status is `Cancelled`.
  - A checkpoint is saved.
- [ ] **Test: `test_pause_and_resume`** — Pause a running workflow. Assert stages in `Eligible` are frozen (not dispatched). Resume. Assert `Eligible` stages are now dispatchable again.
- [ ] **Test: `test_all_stages_complete_marks_run_complete`** — A 3-stage linear workflow (A->B->C) completes all stages successfully. Assert the `WorkflowRun` status transitions to `Completed`.
- [ ] **Test: `test_snapshot_saved_on_submission`** — On run submission, assert that `FakeCheckpointStore` received a `snapshot_definition` call before the first checkpoint.

## 2. Task Implementation
- [ ] Define `SchedulerEvent` enum:
  ```rust
  enum SchedulerEvent {
      RunSubmitted { run: WorkflowRun },
      StageCompleted { run_id: RunId, stage: String, result: CompletionResult },
      PoolSlotAvailable { pool: String },
      ControlSignal { run_id: RunId, signal: ControlSignal },
  }
  ```
- [ ] Define `ControlSignal` enum: `Cancel`, `Pause`, `Resume`.
- [ ] Implement `DagScheduler` struct:
  ```rust
  pub struct DagScheduler {
      runs: HashMap<RunId, WorkflowRun>,
      event_rx: mpsc::Receiver<SchedulerEvent>,
      event_tx: mpsc::Sender<SchedulerEvent>,
      checkpoint_store: Box<dyn CheckpointStore>,
      pool_manager: Arc<AgentPoolManager>,
      webhook_tx: mpsc::Sender<WebhookEvent>,
  }
  ```
- [ ] Implement `DagScheduler::run(&mut self)` as an async loop using `tokio::select!`:
  - Match on `self.event_rx.recv()`.
  - For each event variant, call the corresponding handler method.
- [ ] Implement handler: `handle_submission(&mut self, run: WorkflowRun)`:
  1. Validate workflow via `validate_workflow` (from task 02).
  2. Snapshot the definition via `checkpoint_store.snapshot_definition()`.
  3. Insert run into `self.runs`.
  4. Set all stages with empty `depends_on` to `Eligible`.
  5. Save checkpoint.
  6. Emit `RunStarted` webhook event.
- [ ] Implement handler: `handle_pool_slot(&mut self, pool: &str)`:
  1. Select highest-priority project's eligible stage for this pool.
  2. Transition stage to `Running`, record `started_at = Utc::now()`.
  3. Spawn stage executor as a Tokio task.
  4. Save checkpoint.
  5. Emit `StageStarted` webhook event.
- [ ] Implement handler: `handle_stage_completed(&mut self, run_id, stage, result)`:
  1. Transition stage to `Completed` or `Failed` based on result.
  2. Record `completed_at = Utc::now()`.
  3. If successful: scan all stages whose `depends_on` are now all `Completed`; transition them to `Eligible`.
  4. If all stages terminal: transition run to `Completed` or `Failed`.
  5. Save checkpoint.
  6. Emit `StageCompleted`/`StageFailed` and potentially `RunCompleted`/`RunFailed` webhook events.
- [ ] Implement handler: `handle_control_signal(&mut self, run_id, signal)`:
  - `Cancel`: transition all non-terminal stages to `Cancelled`, run to `Cancelled`.
  - `Pause`: mark run as `Paused`, freeze eligible stage dispatch.
  - `Resume`: mark run as `Running`, re-evaluate eligible stages.
  - Save checkpoint after each.

## 3. Code Review
- [ ] Verify the scheduler loop is purely event-driven — no `sleep`, no polling intervals, no busy-wait.
- [ ] Confirm checkpoint is saved BEFORE any webhook event is emitted (crash safety: state is persisted before external notification).
- [ ] Ensure `WorkflowRun` state transitions are valid — e.g., cannot go from `Completed` back to `Running`.
- [ ] Verify the scheduler does not hold locks across `.await` points.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` on the crate containing the scheduler loop tests and ensure all 8 tests pass.
- [ ] Run `cargo clippy` with `-D warnings`.

## 5. Update Documentation
- [ ] Add doc comments to `DagScheduler`, each handler method, and `SchedulerEvent`.
- [ ] Add `// Covers: 2_TAS-REQ-157` annotations to each test function.

## 6. Automated Verification
- [ ] Run all scheduler tests and assert 0 failures.
- [ ] Run `grep -c "Covers: 2_TAS-REQ-157"` on the test file and assert count >= 6.
