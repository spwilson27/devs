# Task: Verify DAG Scheduling and Cancellation (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-001], [AC-ROAD-P2-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-scheduler, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-scheduler/tests/scheduling_verification.rs` that defines a DAG with two independent downstream stages (B and C) depending on a common prerequisite (A).
- [ ] Implement a mock for stage dispatch that records the timestamp of each dispatch.
- [ ] The test must assert that both B and C are dispatched within 100ms of A reaching the `Completed` state, using `tokio::time::timeout` and a monotonic clock.
- [ ] Create a second test in `crates/devs-checkpoint/tests/cancellation_verification.rs` that submits a run with multiple `Waiting` and `Running` stages.
- [ ] Call `cancel_run` and verify that ALL non-terminal `StageRun` records transition to `Cancelled`.
- [ ] Assert that exactly one new git commit is created in the project's checkpoint branch for the entire cancellation operation (atomic write).

## 2. Task Implementation
- [ ] Refine `DagScheduler` dispatch logic to ensure minimal latency (≤100ms) between stage completion and dependency re-evaluation.
- [ ] Ensure that `cancel_run` in `devs-core` or `devs-scheduler` triggers an atomic checkpoint update via `CheckpointStore`.
- [ ] Verify that `CheckpointStore` implementation in `devs-checkpoint` correctly batches multiple state changes into a single git commit.

## 3. Code Review
- [ ] Verify that the scheduler's tick loop or event handler does not contain blocking I/O that could delay dispatch.
- [ ] Ensure that the `CheckpointStore` commit logic is indeed atomic and doesn't leak partial states between stages.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-scheduler --test scheduling_verification`
- [ ] Execute `cargo test -p devs-checkpoint --test cancellation_verification`
- [ ] Ensure both tests pass and meet the timing/atomicity constraints.

## 5. Update Documentation
- [ ] Update `docs/plan/phases/phase_2.md` with verification results for DAG scheduling latency and cancellation atomicity.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-ROAD-P2-001] and [AC-ROAD-P2-002] as passing.
