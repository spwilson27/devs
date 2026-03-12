# Task: Verify Strict Priority Scheduling with Fan-out Completion (Sub-Epic: 47_Risk 021 Verification)

## Covered Requirements
- [AC-RISK-021-03]

## Dependencies
- depends_on: [01_verify_cancellation.md]
- shared_components: [devs-pool, devs-scheduler, devs-grpc]

## 1. Initial Test Written
- [ ] Create an integration test `tests/risk_021_priority_test.rs`.
- [ ] The test should:
    - Register Project A (low priority, e.g., weight 1) and Project B (high priority, e.g., weight 10).
    - Set the server scheduling policy to `StrictPriority`.
    - Configure a pool with `max_concurrent = 1`.
    - Submit a run for Project A with a fan-out of 2 sub-agents.
    - Submit a run for Project B with a single stage.
    - Wait for the first sub-agent of Project A to finish.
    - Verify that Project B's stage starts *before* Project A's second sub-agent starts.
    - Measure the time from A's first sub-agent completion to B's stage starting; verify it's within 100ms.

## 2. Task Implementation
- [ ] Ensure `DagScheduler` (in `devs-scheduler`) re-evaluates project priority queues every time a pool slot is freed.
- [ ] Implement strict priority logic where high-priority project eligibility queues are always drained before lower-priority queues.
- [ ] Optimize the scheduling loop to meet the 100ms requirement.

## 3. Code Review
- [ ] Check for starvation of lower-priority projects (it's acceptable in strict mode).
- [ ] Verify that sub-agents from a single fan-out stage correctly re-enter the priority queue upon completion of their peers.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test risk_021_priority_test`.
- [ ] Verify with multiple repetitions to ensure timing consistency.

## 5. Update Documentation
- [ ] Update `target/traceability.json` to reflect that `AC-RISK-021-03` is covered by this test.

## 6. Automated Verification
- [ ] Run `./do coverage` and ensure `risk_021_priority_test.rs` achieves 100% coverage of the priority scheduling logic in `devs-scheduler`.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
