# Task: Implement Rate-Limit Cooldown Tracking and Pool Exhaustion Events (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-019], [1_PRD-REQ-020], [1_PRD-REQ-021], [1_PRD-REQ-033]

## Dependencies
- depends_on: [01_pool_models.md, 02_routing_logic.md, 03_concurrency_control.md, 04_pool_registry.md]
- shared_components: [devs-pool (create — exhaustion/rate-limit integration), Shared State & Concurrency Patterns (consume — mpsc channel pattern)]

## 1. Initial Test Written
- [ ] In `crates/devs-pool/src/pool.rs`, write the following tests:
  - `test_report_rate_limit_sets_cooldown`: Call `pool.report_rate_limit("claude", cooldown_until)`. Assert `pool.agents()[0].cooldown_until() == Some(cooldown_until)`.
  - `test_expired_cooldown_clears_automatically`: Set `cooldown_until` to 1 second ago on agent. Call `select_agent`. Assert the agent IS selected (cooldown expired and was cleared).
  - `test_pool_exhausted_event_fires_once_per_episode`: Create pool with 1 agent. Mark it rate-limited. Attach a `tokio::sync::mpsc::Receiver` to the pool's event channel. Call `select_agent` — expect `PoolExhausted` error and 1 event on the channel. Call `select_agent` again — expect `PoolExhausted` error but NO additional event (once-per-episode). Clear the cooldown. Call `select_agent` successfully. Mark rate-limited again. Call `select_agent` — expect a NEW `PoolExhausted` event (new episode).
  - `test_acquire_agent_combines_routing_and_concurrency`: Create pool with `max_concurrent = 1` and 2 agents with `["code-gen"]`. Call `acquire_agent(["code-gen"])`. Assert it returns an `AgentLease` containing the selected agent and a `SlotGuard`. Verify `available_slots() == 0`. Drop the lease. Verify `available_slots() == 1`.
  - `test_acquire_agent_rate_limited_primary_falls_back`: Pool with primary agent A and fallback agent B, both `["code-gen"]`. Rate-limit A. Call `acquire_agent(["code-gen"])`. Assert B is selected.

## 2. Task Implementation
- [ ] Add a `pool_exhausted_tx: Option<tokio::sync::mpsc::Sender<PoolExhaustedEvent>>` field to `AgentPool`. Initialize via `AgentPool::with_event_channel(config, tx)`.
- [ ] Define `PoolExhaustedEvent`:
  ```rust
  /// Fired when all agents in a pool become unavailable (rate-limited or errored).
  /// Fired once per exhaustion episode — not on every failed selection.
  pub struct PoolExhaustedEvent {
      pub pool_name: String,
      pub timestamp: DateTime<Utc>,
  }
  ```
- [ ] Add an `exhausted_episode_active: bool` field to `AgentPool` to track whether we're in an active exhaustion episode.
- [ ] In `select_agent`, when returning `PoolError::PoolExhausted`:
  - If `!self.exhausted_episode_active`, set it to `true` and send a `PoolExhaustedEvent` on the channel.
  - If already active, do not send another event.
- [ ] When `select_agent` succeeds after an exhaustion episode, set `exhausted_episode_active = false` (episode ended).
- [ ] Implement `AgentPool::acquire_agent(&self, required_tags: &[String]) -> Result<AgentLease, PoolError>` that combines routing + concurrency:
  1. Call `select_agent(required_tags)` to find the best agent.
  2. Call `acquire_slot()` to obtain a semaphore permit.
  3. Return `AgentLease { agent: selected_agent_info, slot: SlotGuard }`.
- [ ] Define `AgentLease`:
  ```rust
  /// Represents an acquired agent slot. Dropping the lease releases
  /// the concurrency permit back to the pool.
  pub struct AgentLease {
      pub agent_tool: String,
      pub agent_capabilities: BTreeSet<String>,
      _slot: SlotGuard,
  }
  ```
- [ ] Wrap mutable pool state (`agents`, `exhausted_episode_active`) in `tokio::sync::RwLock` so that `report_rate_limit` and `select_agent` can be called concurrently from multiple tasks.

## 3. Code Review
- [ ] Verify the once-per-episode invariant: `PoolExhaustedEvent` is sent at most once between the pool becoming fully unavailable and an agent becoming available again.
- [ ] Verify `AgentLease` drops the `SlotGuard` (and thus the semaphore permit) when dropped — no manual release needed.
- [ ] Verify `acquire_agent` does not hold the `RwLock` write guard across the semaphore `.await` point (would deadlock).
- [ ] Verify rate-limit cooldown timestamps use `DateTime<Utc>` (survives server restarts if persisted).
- [ ] Verify the event channel is bounded (from Shared State & Concurrency Patterns).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` and verify all tests pass (including the 5 new tests from this task and all prior tasks).

## 5. Update Documentation
- [ ] Add doc comments on `PoolExhaustedEvent` explaining the once-per-episode semantics.
- [ ] Add doc comments on `AgentLease` explaining RAII slot management.
- [ ] Add `// Covers: 1_PRD-REQ-019`, `// Covers: 1_PRD-REQ-020`, `// Covers: 1_PRD-REQ-021`, `// Covers: 1_PRD-REQ-033` annotations to relevant test functions.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./do lint` and ensure no warnings.
- [ ] Verify all 4 requirement IDs have `// Covers:` annotations in `crates/devs-pool/` via grep.
