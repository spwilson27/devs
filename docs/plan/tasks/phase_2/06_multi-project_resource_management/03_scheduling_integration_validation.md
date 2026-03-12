# Task: Multi-Project Scheduling Integration & Validation (Sub-Epic: 06_Multi-Project Resource Management)

## Covered Requirements
- [1_PRD-REQ-034]

## Dependencies
- depends_on: [02_weighted_fair_queuing.md]
- shared_components: [devs-scheduler, devs-pool, devs-config]

## 1. Initial Test Written
- [ ] Create an E2E test that starts the `devs` server with two registered projects.
- [ ] In strict priority mode, submit workflows from both projects.
- [ ] Verify that the higher-priority project's stages are always dispatched first if there is competition for pool slots [AC-3-031].
- [ ] Create a second E2E test using weighted fair queuing mode.
- [ ] Verify that the dispatch distribution reflects the weights [AC-3-032].
- [ ] Create a test for project removal: if a project is removed, ensure existing runs still complete [AC-3-034].

## 2. Task Implementation
- [ ] Connect the `GlobalDispatcher` to the `DagScheduler` (or the server's lifecycle manager).
- [ ] When a `DagScheduler` identifies a stage as `Eligible`, it must now `enqueue` it in the `GlobalDispatcher` instead of directly calling `AgentPool::acquire`.
- [ ] Implement a background task in the `GlobalDispatcher` or `Server` that:
    - [ ] Waits for both: 1) The queue to be non-empty, and 2) The `AgentPool` to have a free slot.
    - [ ] Calls `GlobalDispatcher::pick_next()` to select the next stage.
    - [ ] Dispatches the stage by calling `pool.acquire()` and then spawning the agent.
- [ ] Read the `scheduling_policy` from the `ServerConfig` (set in `devs.toml`) and pass it to the dispatcher.
- [ ] Ensure `max_concurrent` is correctly respected at the pool level across all projects.
- [ ] Verify that project registration with `weight = 0` is rejected with a structured error [AC-3-033].

## 3. Code Review
- [ ] Ensure there are no deadlocks between the scheduler's per-run state and the global dispatcher.
- [ ] Check that the `GlobalDispatcher` correctly handles run cancellation by removing affected stages from the queue.
- [ ] Verify that the integration doesn't introduce performance regressions in stage dispatch.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E tests: `cargo test -p devs-e2e --test multi_project_scheduling`.
- [ ] Verify 100% pass rate for all multi-project scenarios.

## 5. Update Documentation
- [ ] Add the multi-project scheduling policy to the `devs` user guide.
- [ ] Document how to configure project priorities and weights in the project registry.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: 1_PRD-REQ-034` should be present in the tests.
- [ ] Run `./do lint` and `./do coverage` to ensure quality gates are met.
