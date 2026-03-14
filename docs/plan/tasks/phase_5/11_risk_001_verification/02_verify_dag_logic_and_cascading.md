# Task: Verify Atomic DAG Eligibility and Failure Cascading (Sub-Epic: 11_Risk 001 Verification)

## Covered Requirements
- [RISK-001], [RISK-001-BR-003], [RISK-001-BR-004], [AC-RISK-001-03], [AC-RISK-001-05]

## Dependencies
- depends_on: ["01_verify_statemachine_concurrency.md"]
- shared_components: [devs-core, devs-scheduler, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a unit test for a fan-out stage with `count=64` in `devs-scheduler`. Assert that it produces exactly 64 sub-`StageRun` records and exactly 1 parent `StageRun` transition.
- [ ] Implement a cascading failure test: Define a DAG with `Stage A -> Stage B`. Mock `Stage A` to return a `Failed` result.
- [ ] Assert that `Stage B` (and all its downstream dependants) is transitioned to `Cancelled` in the same atomic `checkpoint.json` write as `Stage A`'s failure.
- [ ] Write a test that verifies that eligibility evaluation (determining next stages) happens immediately after a stage completion *before* the run mutex is released.

## 2. Task Implementation
- [ ] In `devs-scheduler`, wrap the stage completion transition and subsequent dependency evaluation inside a single `tokio::sync::MutexGuard` scope for the `WorkflowRun`.
- [ ] Implement `StageRun` status validation for `depends_on`: only `Completed` satisfies the prerequisite.
- [ ] If a stage finishes with `Failed`, `TimedOut`, or `Cancelled`, perform a depth-first or breadth-first traversal of all downstream `Waiting` stages and transition them to `Cancelled`.
- [ ] Ensure the entire set of transitions (the failure and the cancellations) is written to `checkpoint.json` as a single atomic operation.

## 3. Code Review
- [ ] Verify that no "lost eligibility" windows exist by ensuring the lock is never dropped between `transition()` and `evaluate_eligibility()`.
- [ ] Ensure that only `Completed` stages trigger downstream `Eligible` transitions.
- [ ] Check fan-out logic to ensure sub-stage tracking is consistent with the parent's terminal state.

## 4. Run Automated Tests to Verify
- [ ] `cargo test --package devs-scheduler --lib scheduler::tests`
- [ ] `cargo test --test dag_logic_cascade`

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to document the atomic DAG eligibility evaluation pattern and cascading cancellation behavior.

## 6. Automated Verification
- [ ] Validate `checkpoint.json` structure after a cascading failure to ensure all expected cancellations are present and no "orphaned" `Waiting` stages remain.
