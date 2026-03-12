# Task: Implement Concurrency Control and Slot Management (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-021]

## Dependencies
- depends_on: [docs/plan/tasks/phase_1/07_agent_pools_routing/01_pool_models.md]
- shared_components: [devs-pool]

## 1. Initial Test Written
- [ ] Write an async test in `devs-pool` for `AgentPool::acquire_slot`.
- [ ] Set `max_concurrent = 2` for a pool.
- [ ] Concurrently (using `tokio::spawn`) attempt to acquire 3 slots.
- [ ] Assert that the first two succeed immediately and the third waits until one of the first two is released.
- [ ] Test that `max_concurrent` is correctly enforced globally for all projects sharing the same `AgentPool` instance.
- [ ] Verify that a slot is automatically released when a `SlotGuard` is dropped.

## 2. Task Implementation
- [ ] Define the `AgentPool` struct in `devs-pool`.
- [ ] Use a `tokio::sync::Semaphore` to manage the `max_concurrent` slots.
- [ ] Implement `AgentPool::acquire_slot(&self) -> Result<SlotGuard, PoolError>`.
- [ ] `SlotGuard` should:
    - Hold a `SemaphorePermit`.
    - Be `Send` and `Sync` to allow movement between tasks.
    - Implement `Drop` to release the permit.
- [ ] Ensure that `AgentPool` is initialized with the correct `max_concurrent` from `PoolConfig`.

## 3. Code Review
- [ ] Verify that the semaphore is never dropped or recreated during the lifetime of the `AgentPool`.
- [ ] Ensure that a slot acquisition cannot be deadlocked (semaphore permits are limited by `max_concurrent`).
- [ ] Check that [3_PRD-BR-024] is satisfied: `max_concurrent` is a hard limit.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and verify `AgentPool` concurrency tests pass.

## 5. Update Documentation
- [ ] Document the use of `SlotGuard` and the concurrency limit in the `devs-pool` module-level documentation.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./tools/verify_requirements.py` to ensure [1_PRD-REQ-021] is covered.
