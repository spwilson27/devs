# Task: Agent Pool Manager State (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-160]

## Dependencies
- depends_on: [none]
- shared_components: ["devs-pool"]

## 1. Initial Test Written
- [ ] In `devs-pool`, write a unit test `pool_manager_tests.rs`.
- [ ] Test that `AgentPoolManager` correctly initializes multiple named pools from a `ServerConfig`.
- [ ] Verify that each pool has a `tokio::sync::Semaphore` initialized with `max_concurrent` permits.
- [ ] Test the rate-limit cooldown tracker:
    - Mark an agent as rate-limited.
    - Assert that it is in a "cooldown" state for exactly 60 seconds (mock time if possible, or use a short delay).
    - Assert that after the cooldown period, it is considered available again.
- [ ] Verify that agents in a pool are prioritized by their order: non-fallback agents first, then fallback agents.

## 2. Task Implementation
- [ ] Implement the `AgentPoolManager` struct in the `devs-pool` crate.
- [ ] Use `Arc<RwLock<PoolState>>` to hold the in-memory state of each named pool.
- [ ] Implement `AgentPool` state within the manager:
    - A `tokio::sync::Semaphore` with `max_concurrent` permits to enforce concurrency limits.
    - A `HashMap<AgentID, Instant>` (or similar) to track rate-limit cooldowns.
    - A `Vec<AgentConfig>` that is sorted to put non-fallback agents before fallback agents.
- [ ] Implement a `report_rate_limit(agent_id)` method that sets the cooldown timestamp for that agent to `Instant::now() + 60s`.

## 3. Code Review
- [ ] Confirm that semaphores are correctly used to block when `max_concurrent` is reached.
- [ ] Ensure that the ordered agent list is correctly filtered by capabilities before selection.
- [ ] Verify that no synchronous locks are held across an `.await` on the semaphore.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and ensure all pool state tests pass.

## 5. Update Documentation
- [ ] Update the `devs-pool` documentation to describe the state management and rate-limit cooldown logic.

## 6. Automated Verification
- [ ] Run a simulation where multiple threads attempt to acquire slots from a pool with `max_concurrent = 2`. Assert that at most 2 agents are active at any time.
