# Task: Verify Mutex Synchronization and Transition Idempotency (Sub-Epic: 11_Risk 001 Verification)

## Covered Requirements
- [RISK-001], [RISK-001-BR-001], [RISK-001-BR-002], [AC-RISK-001-01], [AC-RISK-001-02]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a concurrency stress test in `devs-core` (or a dedicated integration test) that spawns 100 `tokio` tasks, each attempting to send a `stage_complete` event for the same `StageRun` ID simultaneously.
- [ ] Assert that the `StateMachine` only records exactly one `Completed` transition and that subsequent attempts return `Err(TransitionError::IllegalTransition)`.
- [ ] Verify that the recorded transition is persisted to `checkpoint.json` exactly once (no duplicate file writes or corrupt JSON).
- [ ] Implement a unit test specifically for `StateMachine::transition()` idempotency, ensuring duplicate terminal events (e.g., two `Complete` events for the same stage) return the expected error within 1ms.

## 2. Task Implementation
- [ ] Review `devs-core` state transition logic to ensure every write access to `RunState` or `StageRun` is guarded by the per-run `Arc<tokio::sync::Mutex<RunState>>`.
- [ ] Ensure `StateMachine::transition` checks the current state before applying a terminal transition; if the stage is already in a terminal state (`Completed`, `Failed`, etc.), return `Err(TransitionError::IllegalTransition)`.
- [ ] Audit all call sites of `transition()` to verify they do not "double-lock" or release the lock between checking state and applying transitions.
- [ ] Optimize the transition error path to ensure it meets the <1ms latency requirement.

## 3. Code Review
- [ ] Verify that no `StageRun.status` fields are accessible or mutable without first acquiring the `Mutex`.
- [ ] Ensure `TransitionError::IllegalTransition` is used consistently for all invalid state jumps.
- [ ] Check that `devs-checkpoint` integration is properly serialized behind the same mutex to prevent partial state writes.

## 4. Run Automated Tests to Verify
- [ ] `cargo test --package devs-core --lib transitions::tests`
- [ ] `cargo test --test concurrency_stress`

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document the mutex synchronization pattern and idempotency guarantee for state transitions.

## 6. Automated Verification
- [ ] Run `./do coverage` and ensure the new concurrency tests achieve 100% branch coverage for the state transition logic.
