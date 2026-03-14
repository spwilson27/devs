# Task: Implement Pool Exhaustion Detection and Episode Tracking (Sub-Epic: 09_Pool Events & Monitoring)

## Covered Requirements
- [2_TAS-REQ-033], [2_TAS-REQ-047]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool (consumer — add exhaustion tracking to existing pool), devs-core (consumer — use domain event types)]

## 1. Initial Test Written
- [ ] In `crates/devs-pool/src/exhaustion.rs` (or a `tests/` submodule), write the following unit tests annotated with `// Covers: 2_TAS-REQ-033` and `// Covers: 2_TAS-REQ-047`:
- [ ] **`test_exhaustion_episode_fires_once_on_all_agents_unavailable`**: Create an `ExhaustionTracker` for a pool with 3 agents. Mark agents 1, 2, 3 as rate-limited (cooldown) in sequence. Assert that the tracker returns `Some(PoolExhaustedEvent)` only on the transition when the *last* agent becomes unavailable (the 3rd call), and `None` for agents 1 and 2.
- [ ] **`test_exhaustion_episode_does_not_refire_while_exhausted`**: After all agents are marked unavailable and the event has fired, mark an additional agent as unavailable again (redundant). Assert that no second event is emitted.
- [ ] **`test_exhaustion_episode_resets_on_agent_recovery`**: After an exhaustion episode fires, call `mark_agent_available(agent_1)`. Assert that `is_exhausted()` returns `false`. Then mark all agents unavailable again. Assert a *new* `PoolExhaustedEvent` is emitted (second episode).
- [ ] **`test_no_exhaustion_when_some_agents_available`**: With 3 agents, mark only 2 as rate-limited. Assert no exhaustion event fires and `is_exhausted()` returns `false`.
- [ ] **`test_exhaustion_event_contains_pool_name_and_timestamp`**: Assert the emitted `PoolExhaustedEvent` struct contains the pool name (`BoundedString`) and a `DateTime<Utc>` timestamp.

## 2. Task Implementation
- [ ] Define `PoolExhaustedEvent` struct in `devs-pool` (or re-export from `devs-core` if the type is needed cross-crate):
  ```rust
  pub struct PoolExhaustedEvent {
      pub pool_name: String,
      pub timestamp: DateTime<Utc>,
  }
  ```
- [ ] Define `ExhaustionTracker` struct within `devs-pool`:
  ```rust
  pub(crate) struct ExhaustionTracker {
      is_exhausted: bool,
  }
  ```
  With methods:
  - `fn check_exhaustion(&mut self, total_agents: usize, unavailable_agents: usize, pool_name: &str) -> Option<PoolExhaustedEvent>` — returns `Some` only on the `false → true` transition when `unavailable_agents == total_agents && total_agents > 0`.
  - `fn mark_recovery(&mut self)` — sets `is_exhausted = false`.
  - `fn is_exhausted(&self) -> bool`.
- [ ] Integrate `ExhaustionTracker` into the existing `AgentPool` struct (from `devs-pool` shared component). On every `report_rate_limit` call, recompute the count of unavailable agents and call `check_exhaustion`. On every `release_agent` call (or cooldown expiry check), call `mark_recovery` if at least one agent is now available.
- [ ] Add a `tokio::sync::mpsc::UnboundedSender<PoolExhaustedEvent>` field to `AgentPool` (injected at construction). When `check_exhaustion` returns `Some`, send the event on this channel. The receiver is consumed by the webhook integration task (task 02).
- [ ] Ensure the exhaustion check considers only agents that match the pool (not capability-filtered subsets) — capability mismatch is a `PoolError::UnsatisfiedCapability`, not exhaustion.

## 3. Code Review
- [ ] Verify "at most once per episode" invariant: no code path can emit two events without an intervening `mark_recovery`.
- [ ] Verify the tracker is only evaluated against the *total* pool agent count, not a capability-filtered subset.
- [ ] Confirm that `ExhaustionTracker` is `Send + Sync` (no `Rc`, no `RefCell`).
- [ ] Ensure all public types have doc comments (project lint policy).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- exhaustion` and confirm all 5 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `ExhaustionTracker` and `PoolExhaustedEvent` explaining the episode semantics.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `devs-pool` tests pass.
- [ ] Verify `// Covers: 2_TAS-REQ-033` and `// Covers: 2_TAS-REQ-047` annotations are present in test code.
