# Task: Verify Fan-out Cancellation and Active Count Accuracy (Sub-Epic: 47_Risk 021 Verification)

## Covered Requirements
- [AC-RISK-021-02], [AC-RISK-021-06]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool, devs-scheduler, devs-grpc]

## 1. Initial Test Written
- [ ] Create an integration test `tests/risk_021_cancellation_test.rs`.
- [ ] The test should:
    - Register a project and a workflow with a large fan-out (e.g., 20 agents).
    - Configure a pool with `max_concurrent = 2`.
    - Submit the run.
    - Verify via `get_pool_state` (using `devs-grpc` or `devs-core` pool methods) that `active_count` is 2 and `queued_count` is 18.
    - Cancel the run via `WorkflowService::CancelRun`.
    - Assert that `queued_count` decreases to 0 within 15 seconds.
    - Throughout the execution (before cancellation), poll `active_count` to ensure it reflects only currently spawning/running agents.

## 2. Task Implementation
- [ ] Ensure the `DagScheduler` correctly handles cancellation for fan-out stages by draining the eligibility queue for that stage.
- [ ] Verify that `PoolManager` (in `devs-pool`) correctly decrements `queued_count` when a stage is cancelled before it acquires a permit.
- [ ] Ensure `active_count` in `PoolState` is updated atomically when an agent process is spawned and when it terminates (including via SIGTERM on cancellation).

## 3. Code Review
- [ ] Verify that the cancellation logic in `FanOutManager` properly propagates the signal to all sub-agents.
- [ ] Check that `get_pool_state` does not double-count agents in transition.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test risk_021_cancellation_test`.
- [ ] Ensure the test passes consistently under load.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_5/47_risk_021_verification/01_verify_cancellation.md` with any implementation details found during development.

## 6. Automated Verification
- [ ] Run `./do coverage` and ensure `risk_021_cancellation_test.rs` covers the relevant lines in `devs-scheduler` and `devs-pool`.
- [ ] Verify traceability using `./tools/verify_requirements.py`.
