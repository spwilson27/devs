# Task: DAG Engine - Scheduler Core & Parallel Dispatch (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-004]: Workflow DAG Scheduling (Stage becomes eligible when all dependencies complete).
- [1_PRD-REQ-005]: Automatic Parallel Stage Scheduling (No unmet dependencies run in parallel).
- [2_TAS-REQ-030B]: Scheduler Dispatch Latency (100 ms max dispatch time).
- [2_TAS-REQ-112]: Scheduler Event Loop Invariants.

## Dependencies
- depends_on: [01_dag_topological_sort.md]
- shared_components: [devs-core, devs-scheduler, devs-executor]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-scheduler/src/scheduler.rs` (or equivalent) for `Scheduler`.
- [ ] Test 1: Given a DAG with parallel branches, both branches are dispatched concurrently.
- [ ] Test 2: A dependent stage is NOT dispatched until all its dependencies reach `Completed`.
- [ ] Test 3: If a dependency fails, downstream stages are transitioned to `Cancelled` (2_TAS-REQ-112.3).
- [ ] Test 4: Verify dispatch latency is within 100 ms (measured in the scheduler loop, not E2E).
- [ ] Test 5: Duplicate completion events for the same stage are idempotent (2_TAS-REQ-112.4).

## 2. Task Implementation
- [ ] Implement the `Scheduler` event loop using `tokio::sync::mpsc`.
- [ ] Store `WorkflowRun` and `StageRun` instances in `Arc<RwLock<SchedulerState>>` (2_TAS-REQ-002O).
- [ ] Define `process_event(event: SchedulerEvent)` to handle stage completion, failure, and run submission.
- [ ] Implement the eligibility re-evaluation logic (2_TAS-REQ-112.1, 2_TAS-REQ-112.2).
- [ ] Ensure `dispatch()` transitions stages from `Eligible` to `Running` and hands them to `StageExecutor`.

## 3. Code Review
- [ ] Verify lock acquisition order: `SchedulerState` -> `PoolState` -> `CheckpointStore` (2_TAS-REQ-002P).
- [ ] Ensure no blocking I/O occurs in the main scheduler loop (use `spawn_blocking` or separate tasks).
- [ ] Check for 100 ms latency compliance using `std::time::Instant`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` and ensure all scheduler core tests pass.

## 5. Update Documentation
- [ ] Document the `Scheduler` event loop architecture in the `devs-scheduler` library docs.

## 6. Automated Verification
- [ ] Run `./do test` to verify 100% requirement-to-test traceability for [1_PRD-REQ-005] and [2_TAS-REQ-030B].
