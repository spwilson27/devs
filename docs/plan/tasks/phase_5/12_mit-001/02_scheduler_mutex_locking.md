# Task: Implement Per-Run Mutex and Atomic Transitions in Scheduler (Sub-Epic: 12_MIT-001)

## Covered Requirements
- [MIT-001]

## Dependencies
- depends_on: [01_statemachine_idempotency.md]
- shared_components: [devs-scheduler, devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-scheduler/tests/race_condition_tests.rs` that spawns two parallel `tokio` tasks attempting to complete the SAME stage simultaneously via `stage_complete_tx`.
- [ ] Assert that one task succeeds and the other receives a `TransitionError::IllegalTransition`.
- [ ] Use `tokio::sync::Barrier` to ensure both tasks call the scheduler at exactly the same time.
- [ ] Inject a 50ms sleep inside the scheduler's transition logic (via a mock or internal hook) to simulate a long-running transition.

## 2. Task Implementation
- [ ] Modify `devs-scheduler/src/state.rs`: Replace the global `RwLock<SchedulerState>` with a structure that contains a `HashMap<Uuid, Arc<tokio::sync::Mutex<RunState>>>`.
- [ ] Update the `Scheduler` to acquire the per-run `Mutex` before calling `StateMachine::transition()` or evaluating DAG eligibility.
- [ ] Enforce the lock acquisition order specified in [MIT-001]: `SchedulerState` (read) → `RunState Mutex` (write) → `PoolState` (if needed) → `CheckpointStore`.
- [ ] Ensure that dependency resolution and state checkpointing for a single run are performed atomically while holding the per-run `Mutex`.

## 3. Code Review
- [ ] Confirm that `Mutex` guards are never held across `.await` points except where strictly necessary (e.g., `checkpoint.json` write if it's async, but TAS-REQ-002L says it's `spawn_blocking`).
- [ ] Verify that no deadlock is possible between two different runs.
- [ ] Ensure that `stage_complete_tx` processing correctly identifies the correct `RunState` and acquires its lock.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler` and verify the new race condition integration tests pass.

## 5. Update Documentation
- [ ] Update internal developer documentation in `devs-scheduler/README.md` to explain the per-run locking strategy.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure 100% requirement-to-test traceability for [MIT-001].
- [ ] Verify traceability via `target/traceability.json`.
