# Task: Agent Pool Manager State (Sub-Epic: 057_Detailed Domain Specifications (Part 22))

## Covered Requirements
- [2_TAS-REQ-160]

## Dependencies
- depends_on: ["none"]
- shared_components: ["devs-pool (consumer — this task defines domain-level specifications and tests for the pool manager state; the devs-pool crate is owned by Phase 1)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/pool/manager.rs` (or `crates/devs-pool/src/manager.rs` if the crate already exists) with a `#[cfg(test)] mod tests` block.
- [ ] **Test: `test_pool_manager_initializes_from_config`** — Given a config with two pools ("primary" with max_concurrent=4, "secondary" with max_concurrent=2), construct `AgentPoolManager`. Assert:
  - `manager.get_pool("primary")` returns `Some(pool)` with `max_concurrent == 4`.
  - `manager.get_pool("secondary")` returns `Some(pool)` with `max_concurrent == 2`.
  - `manager.get_pool("nonexistent")` returns `None`.
- [ ] **Test: `test_semaphore_permits_match_max_concurrent`** — For a pool with `max_concurrent = 3`, acquire 3 agent leases. Assert:
  - All 3 acquisitions succeed immediately.
  - A 4th acquisition does NOT complete within 50ms (use `tokio::time::timeout`).
  - Release one lease, then assert the 4th acquisition succeeds.
- [ ] **Test: `test_rate_limit_cooldown_60_seconds`** — Mark agent "claude-1" as rate-limited via `report_rate_limit`. Assert:
  - Immediately after, `is_agent_available("claude-1")` returns `false`.
  - After advancing time by 59 seconds (using `tokio::time::pause()` + `tokio::time::advance()`), still `false`.
  - After advancing by 1 more second (total 60s), `is_agent_available("claude-1")` returns `true`.
- [ ] **Test: `test_agent_ordering_non_fallback_first`** — Pool with agents: [A (fallback=true), B (fallback=false), C (fallback=false)]. Assert `get_ordered_agents()` returns `[B, C, A]`.
- [ ] **Test: `test_capability_filtering`** — Pool with agents: [A (caps=["code-gen"]), B (caps=["code-gen", "review"]), C (caps=["review"])]. Request agents with required cap "review". Assert only B and C are returned, in their priority order.
- [ ] **Test: `test_pool_exhausted_event_emitted`** — All agents in a pool are either at max concurrency or rate-limited. Attempt to acquire. Assert a `PoolExhausted` event is sent on the event channel.
- [ ] **Test: `test_pool_exhausted_fires_once_per_episode`** — After the first `PoolExhausted` event, attempt to acquire again while still exhausted. Assert no duplicate event is emitted. Release an agent and re-exhaust. Assert a new event IS emitted (new episode).

## 2. Task Implementation
- [ ] Define `AgentPoolManager` struct:
  ```rust
  pub struct AgentPoolManager {
      pools: HashMap<String, AgentPool>,
      event_tx: tokio::sync::mpsc::Sender<PoolEvent>,
  }
  ```
- [ ] Define `AgentPool` struct:
  ```rust
  struct AgentPool {
      semaphore: Arc<tokio::sync::Semaphore>,
      max_concurrent: usize,
      agents: Vec<AgentEntry>,  // sorted: non-fallback first, then fallback
      cooldowns: RwLock<HashMap<String, tokio::time::Instant>>,
      exhausted_episode_active: AtomicBool,
  }
  ```
- [ ] Define `AgentEntry`: `{ id: String, tool: String, capabilities: Vec<String>, fallback: bool }`.
- [ ] Implement `AgentPoolManager::new(configs: Vec<PoolConfig>, event_tx: Sender<PoolEvent>) -> Self`:
  - For each `PoolConfig`, create an `AgentPool` with semaphore permits = `max_concurrent`.
  - Sort agents: non-fallback first (preserving config order within each group), then fallback agents.
- [ ] Implement `acquire_agent(pool: &str, required_caps: &[&str]) -> Result<AgentLease, PoolError>`:
  - Filter agents by required capabilities (agent must have ALL required caps).
  - Skip agents currently in cooldown (check `Instant::now() >= cooldown_until`).
  - Try to acquire a semaphore permit.
  - If no agent is available and no permit can be acquired, emit `PoolExhausted` (once per episode) and return `Err(PoolError::Exhausted)`.
- [ ] Implement `release_agent(lease: AgentLease)`: drop the semaphore permit, reset `exhausted_episode_active` to `false`.
- [ ] Implement `report_rate_limit(agent_id: &str, pool: &str)`: insert `Instant::now() + Duration::from_secs(60)` into the cooldowns map.
- [ ] Define `AgentLease` struct holding the semaphore permit (via `OwnedSemaphorePermit`) and agent metadata.
- [ ] Define `PoolEvent` enum: `PoolExhausted { pool: String, timestamp: DateTime<Utc> }`.

## 3. Code Review
- [ ] Verify `tokio::sync::Semaphore` is used (not `std::sync::Semaphore`) — this is critical for async compatibility.
- [ ] Confirm no `RwLock` is held across `.await` points — acquire lock, read/write, drop, then await.
- [ ] Ensure the `exhausted_episode_active` flag is reset in `release_agent` so new episodes can fire.
- [ ] Verify capability filtering is an AND operation (agent must have ALL required caps).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- pool::manager` (or `cargo test -p devs-pool`) and ensure all 7 tests pass.
- [ ] Run `cargo clippy` on the relevant crate with `-D warnings`.

## 5. Update Documentation
- [ ] Add doc comments to `AgentPoolManager`, `acquire_agent`, `release_agent`, and `report_rate_limit`.
- [ ] Add `// Covers: 2_TAS-REQ-160` annotations to each test function.

## 6. Automated Verification
- [ ] Run all pool tests and assert 0 failures.
- [ ] Run `grep -c "Covers: 2_TAS-REQ-160"` on the test file and assert count >= 5.
