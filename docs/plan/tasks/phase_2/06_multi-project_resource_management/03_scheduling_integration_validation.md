# Task: Multi-Project Scheduling Integration & Validation (Sub-Epic: 06_Multi-Project Resource Management)

## Covered Requirements
- [1_PRD-REQ-034]

## Dependencies
- depends_on: ["02_weighted_fair_queuing.md"]
- shared_components: [devs-scheduler (owner — integrates GlobalDispatcher into DagScheduler dispatch loop), devs-pool (consumer — `acquire_agent`/`release_agent`), devs-config (consumer — `ServerConfig.scheduling_policy`, `ProjectEntry.priority`, `ProjectEntry.weight`)]

## 1. Initial Test Written
- [ ] **Test: `test_scheduler_uses_global_dispatcher_strict`** (integration test in `crates/devs-scheduler/tests/` or `src/integration_tests.rs`)
  - Create a `DagScheduler` with `SchedulingPolicy::StrictPriority` and a mock `AgentPool` with `max_concurrent = 1` (only one slot).
  - Register two projects: `ProjectHigh(priority=10)` and `ProjectLow(priority=1)`.
  - Submit a workflow for each project, each with a single stage that becomes immediately eligible.
  - Assert that `ProjectHigh`'s stage is dispatched first.
  - After `ProjectHigh`'s stage completes (mock completion), assert `ProjectLow`'s stage is dispatched next.
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_scheduler_uses_global_dispatcher_wfq`** (integration test)
  - Create a `DagScheduler` with `SchedulingPolicy::WeightedFairQueuing` and mock pool with `max_concurrent = 1`.
  - Register `ProjectA(weight=2)` and `ProjectB(weight=1)`.
  - Submit 6 single-stage workflows (3 from each project) that all become eligible immediately.
  - Track dispatch order as mock pool processes them one by one.
  - Assert `ProjectA` gets ~4 dispatches and `ProjectB` gets ~2 (±1 tolerance for 6 total dispatches).
  - Annotate: `// Covers: 1_PRD-REQ-034`
- [ ] **Test: `test_cancellation_removes_from_dispatcher_queue`**
  - Enqueue stages from two projects. Cancel one project's run before dispatch occurs.
  - Assert that the cancelled stages are no longer in the dispatcher queue and are never dispatched.
- [ ] **Test: `test_project_removal_completes_active_runs`**
  - Register a project, submit a run, let one stage start executing.
  - Remove the project from the registry.
  - Assert that the in-progress stage continues to completion.
  - Assert that no NEW runs can be submitted for the removed project.
  - This validates `[3_PRD-BR-042]`.
- [ ] **Test: `test_scheduling_policy_read_from_config`**
  - Create a `ServerConfig` TOML snippet with `scheduling_policy = "strict_priority"`.
  - Parse it and assert the `DagScheduler` is initialized with `SchedulingPolicy::StrictPriority`.
  - Repeat with `scheduling_policy = "weighted_fair_queuing"`.

## 2. Task Implementation
- [ ] Modify the `DagScheduler`'s stage dispatch flow. Currently (or as designed), when the DAG engine marks a stage as `Eligible`, it directly calls `pool.acquire_agent()`. Change this:
  1. When a stage becomes `Eligible`, create a `PendingDispatch` with the project's priority/weight and the stage's `eligible_at` timestamp.
  2. Enqueue it into the `GlobalDispatcher` (which is stored as `Arc<Mutex<GlobalDispatcher>>` on the scheduler).
  3. A background `tokio::spawn` task runs the dispatch loop:
     ```rust
     loop {
         // Wait for pool availability notification (e.g., via a Notify or watch channel)
         pool_available.notified().await;
         let next = {
             let mut dispatcher = dispatcher.lock().unwrap();
             dispatcher.pick_next()
         };
         if let Some(pending) = next {
             let lease = pool.acquire_agent(&pending.pool_name, &pending.required_caps).await?;
             // Spawn stage execution with the acquired lease
             tokio::spawn(execute_stage(pending, lease));
         }
     }
     ```
  4. When a stage completes and `release_agent()` is called, notify the dispatch loop via the `pool_available` `Notify`.
- [ ] Wire `SchedulingPolicy` from `ServerConfig` to `GlobalDispatcher::new()`.
- [ ] Wire project `priority` and `weight` from `ProjectEntry` into `PendingDispatch` construction.
- [ ] On run cancellation (`cancel_run`), call `dispatcher.remove()` for all pending (not-yet-dispatched) stages of that run.
- [ ] On project removal, prevent new `submit_run` calls for that project but allow existing runs to complete (check project existence in `submit_run` validation step).

## 3. Code Review
- [ ] Verify lock acquisition order: the `GlobalDispatcher` mutex is acquired AFTER releasing any per-run state locks (consistent with the project-wide lock order: project registry → workflow runs → pool state → checkpoint, per `[2_TAS-REQ-002P]`).
- [ ] Verify the dispatch loop does not busy-spin — it awaits a `Notify` or similar async primitive.
- [ ] Verify that `pick_next()` + `acquire_agent()` is not done while holding the dispatcher lock (lock is released before the async pool call).
- [ ] Verify that the integration does not regress DAG dispatch latency (the `GlobalDispatcher.pick_next()` call should be O(N) where N = pending stages, which is fast for MVP scale).
- [ ] Check that the `PendingDispatch` lifetime is correct — no dangling references to cancelled runs.

## 4. Run Automated Tests to Verify
- [ ] Run: `cargo test -p devs-scheduler` (all tests, including unit dispatcher tests from tasks 01/02 and the new integration tests).
- [ ] Verify all tests pass.
- [ ] Run: `cargo clippy -p devs-scheduler -- -D warnings`

## 5. Update Documentation
- [ ] Add doc comments to the dispatch loop explaining the interaction between `GlobalDispatcher`, `AgentPool`, and `DagScheduler`.
- [ ] Document the `scheduling_policy` config key in `ServerConfig` doc comments.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 1_PRD-REQ-034' crates/devs-scheduler/` and verify at least 7 test functions contain the annotation (cumulative across all 3 tasks).
- [ ] Run `./do lint` and confirm zero warnings/errors.
- [ ] Run `./do test` and confirm all scheduler tests pass.
- [ ] Run `./do coverage` and verify `devs-scheduler` crate meets the 90% unit coverage threshold.
