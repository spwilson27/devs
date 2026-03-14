# Task: Implement DAG Scheduler Race Condition Mitigation (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [MIT-001], [RISK-001], [RISK-001-BR-001], [RISK-001-BR-002], [RISK-001-BR-003], [RISK-001-BR-004]

## Dependencies
- depends_on: ["01_status_state_machines.md", "02_run_models_cascade_cancellation.md", "23_race_condition_concurrency_safety.md"]
- shared_components: [devs-core (Owner), devs-scheduler (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_per_run_mutex_locking` that spawns 100 concurrent `stage_complete` events for the same run and verifies exactly one transition is recorded per event
- [ ] Write test `test_state_machine_idempotent_terminal_events` that calls `StateMachine::transition()` with a duplicate terminal event and verifies `Err(TransitionError::IllegalTransition)` is returned within 1ms without modifying state
- [ ] Write test `test_dag_eligibility_within_mutex_lock` that verifies DAG eligibility evaluation occurs within the same per-run mutex lock acquisition as the preceding `stage_complete` transition
- [ ] Write test `test_failed_dependency_cascades_cancelled` that marks a dependency stage as `Failed` and verifies all downstream `Waiting` stages transition to `Cancelled` in the same atomic checkpoint write
- [ ] Write test `test_only_completed_satisfies_dependency` that verifies only `Completed` (not `Failed`, `TimedOut`, or `Cancelled`) `StageRun` status satisfies a `depends_on` prerequisite
- [ ] Write test `test_cascade_cancelled_transitive_fan_out` that verifies cascade cancellation propagates through transitive fan-out dependencies

## 2. Task Implementation
- [ ] Define `RunMutexGuard` type alias in `crates/devs-core/src/scheduler/concurrency.rs` as `Arc<tokio::sync::Mutex<RunState>>` for per-run mutual exclusion
- [ ] Define `RunState` struct containing:
  - `workflow_run: WorkflowRun`
  - `stage_runs: HashMap<StageId, StageRun>`
  - `pending_events: Vec<StageEvent>`
- [ ] Implement `MIT-001` mitigation: Per-run mutex locking for all state transitions
  - All `WorkflowRun` and `StageRun` transitions must hold `RunMutexGuard`
  - Reads/writes to `StageRun.status` outside the lock are prohibited
  - DAG eligibility evaluation occurs within the same lock acquisition
- [ ] Implement `RISK-001-BR-001` business rule: Per-run mutex requirement
  - Define `acquire_run_lock(run_id: &RunId) -> Result<RunMutexGuard, LockError>` 
  - Document that all state transitions must occur within the lock
- [ ] Implement `RISK-001-BR-002` business rule: Idempotent terminal transitions
  - `StateMachine::transition()` returns `Err(TransitionError::IllegalTransition)` for duplicate terminal events
  - No state modification or checkpoint write on duplicate terminal events
- [ ] Implement `RISK-001-BR-003` business rule: DAG eligibility within mutex
  - `evaluate_dag_eligibility(run_state: &mut RunState, completed_stage: &StageId) -> Vec<StageId>` runs within the lock
  - No separate lock acquisition for dependency evaluation
- [ ] Implement `RISK-001-BR-004` business rule: Completed-only dependency satisfaction
  - `satisfies_dependency(stage: &StageRun) -> bool` returns true only for `Completed` status
  - `Failed`, `TimedOut`, `Cancelled` do not satisfy dependencies
  - Cascade `Cancelled` to downstream `Waiting` stages for non-successful terminal states
- [ ] Add `pub mod concurrency;` to `crates/devs-core/src/scheduler/mod.rs`

## 3. Code Review
- [ ] Verify all state transitions hold the per-run mutex
- [ ] Verify DAG eligibility evaluation is atomic with stage completion
- [ ] Verify `MIT-001` mitigation is correctly implemented per the risk matrix
- [ ] Verify all business rules (RISK-001-BR-001 through BR-004) are enforced

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core scheduler::concurrency` and confirm all concurrency tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Run `cargo test --workspace -- scheduler --test-threads 8` and verify no data races

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/scheduler/concurrency.rs` explaining the race condition risk and MIT-001 mitigation
- [ ] Add doc comments to `RunMutexGuard` describing the per-run mutual exclusion requirement
- [ ] Document each business rule (RISK-001-BR-001 through BR-004) with the security rationale

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `RunMutexGuard` uses `tokio::sync::Mutex` (not `std::sync::Mutex`)
- [ ] Run `grep -r "RISK-001" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
