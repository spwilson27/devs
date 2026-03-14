# Task: Parallel Stage Dispatch Engine (Sub-Epic: 01_DAG Scheduling Engine)

## Covered Requirements
- [1_PRD-REQ-005]: Stages with no unmet dependencies are scheduled to run in parallel automatically. The scheduler does not require explicit parallelism declarations beyond the `depends_on` structure.

## Dependencies
- depends_on: ["01_dag_data_structure_and_cycle_detection.md"]
- shared_components: [devs-core (consumer — state machine enums for WorkflowRunState/StageRunState), devs-pool (consumer — `acquire_agent`/`release_agent` for agent acquisition), devs-executor (consumer — `run_agent` for stage execution)]

## 1. Initial Test Written
- [ ] Create `crates/devs-scheduler/src/dispatch.rs` and `crates/devs-scheduler/tests/dispatch_tests.rs`.
- [ ] Write unit test `test_parallel_dispatch_independent_stages`: define a DAG with stages A, B, C that all have no dependencies. Create a `Dispatcher` with a mock pool/executor. Call `dispatch_eligible()`. Assert all three stages are dispatched concurrently (track dispatch timestamps using `tokio::time::Instant`; all three must be dispatched within 1ms of each other).
- [ ] Write unit test `test_sequential_dispatch_chain`: DAG with A→B→C. Assert only A is dispatched initially. Simulate A completing, assert B is dispatched. Simulate B completing, assert C is dispatched.
- [ ] Write unit test `test_diamond_parallel_dispatch`: DAG A→{B,C}→D. Assert A dispatched first. Simulate A completing, assert B and C dispatched in parallel (both dispatched within 1ms). Simulate B and C completing, assert D dispatched.
- [ ] Write unit test `test_dispatch_latency_under_100ms`: create a 50-stage wide DAG (all depending on single root). Complete root stage. Measure wall-clock time from root completion event to all 50 stages being dispatched. Assert < 100ms. Use `tokio::time::Instant::now()` for monotonic measurement. Annotate with `// Covers: 1_PRD-REQ-005`.
- [ ] Write unit test `test_partial_completion_does_not_dispatch_blocked`: DAG A→{B,C}→D. Complete A and B but not C. Assert D is NOT dispatched (C still pending).
- [ ] Write unit test `test_no_double_dispatch`: complete A, verify B is dispatched exactly once (not re-dispatched on subsequent `dispatch_eligible` calls).
- [ ] Write unit test `test_failed_stage_blocks_dependents`: A→B. Simulate A failing. Assert B is never dispatched (remains in Waiting state).

## 2. Task Implementation
- [ ] Define `Dispatcher` struct in `crates/devs-scheduler/src/dispatch.rs` containing:
  - `dag: DagGraph` — the DAG structure from task 01.
  - `stage_states: HashMap<String, StageRunState>` — current state of each stage.
  - `dispatched: HashSet<String>` — stages already dispatched (prevents double-dispatch).
- [ ] Implement `Dispatcher::new(dag: DagGraph) -> Self` initializing all stages to `StageRunState::Waiting`.
- [ ] Implement `Dispatcher::dispatch_eligible(&mut self) -> Vec<String>`:
  - Call `dag.eligible_stages()` with the set of completed stages.
  - Filter out stages already in `dispatched`.
  - For each newly eligible stage: transition state to `Eligible`, add to `dispatched`, collect into result vec.
  - Return the list of stages to dispatch.
- [ ] Implement `Dispatcher::mark_completed(&mut self, stage: &str) -> Vec<String>`:
  - Transition stage state to `Completed`.
  - Call `dispatch_eligible()` to find and return newly dispatchable stages.
- [ ] Implement `Dispatcher::mark_failed(&mut self, stage: &str)`:
  - Transition stage state to `Failed`.
  - Do NOT call dispatch_eligible — failed dependencies block downstream stages permanently (until retry logic in a separate sub-epic handles this).
- [ ] Implement async `Dispatcher::run_dispatch_loop(self, pool: Arc<dyn PoolService>, executor: Arc<dyn ExecutorService>)`:
  - Spawn each dispatchable stage as a `tokio::spawn` task.
  - Each task: acquire agent from pool, run agent via executor, process completion, call `mark_completed` or `mark_failed`, triggering cascading dispatch.
  - Use `tokio::sync::mpsc` channel for stage completion events flowing back to the dispatch loop.
- [ ] Add `// Covers: 1_PRD-REQ-005` annotation to all test functions.

## 3. Code Review
- [ ] Verify `dispatch_eligible` is O(V) per call (iterates stages once).
- [ ] Verify no stage can be dispatched twice (double-dispatch guard).
- [ ] Verify failed stages propagate correctly — dependents never become eligible.
- [ ] Verify dispatch loop does not hold locks during agent execution (lock acquired briefly to read/write state, then released before spawning).
- [ ] Verify mock pool/executor traits are defined in `#[cfg(test)]` module, not in production code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- dispatch` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `Dispatcher`, `dispatch_eligible`, `mark_completed`, `mark_failed`, and `run_dispatch_loop`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-scheduler -- dispatch --format=json 2>&1 | grep '"passed"'` and confirm all test cases passed.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- dispatch` and verify ≥ 90% line coverage for `dispatch.rs`.
- [ ] Specifically verify `test_dispatch_latency_under_100ms` passes — this is the performance gate from `[2_PRD-BR-004]` (related to `1_PRD-REQ-005`).
