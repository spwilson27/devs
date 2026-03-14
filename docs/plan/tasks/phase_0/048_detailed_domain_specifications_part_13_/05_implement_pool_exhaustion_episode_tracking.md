# Task: Implement Pool Exhaustion Episode Tracking (Sub-Epic: 048_Detailed Domain Specifications (Part 13))

## Covered Requirements
- [2_TAS-REQ-115]

## Dependencies
- depends_on: [04_implement_rate_limit_cooldown.md]
- shared_components: [devs-pool (owner — creates exhaustion tracking), devs-webhook (consumer — receives PoolExhausted events)]

## 1. Initial Test Written
- [ ] Create `devs-pool/src/exhaustion.rs` (or `devs-pool/tests/exhaustion.rs`) with the following TDD tests:
- [ ] **Test `is_exhausted_initially_false`**: Create a new `AgentPool`. Assert `pool.is_exhausted()` returns `false`. Annotate with `// Covers: 2_TAS-REQ-115`.
- [ ] **Test `transitions_to_exhausted_when_all_agents_rate_limited`**: Create a pool with 2 agents. Rate-limit both. Assert `is_exhausted` transitions to `true`. Assert a `PoolExhausted` event is emitted via the event channel. Annotate with `// Covers: 2_TAS-REQ-115`.
- [ ] **Test `transitions_back_when_any_cooldown_expires`**: Create a pool with 2 rate-limited agents (pool is exhausted). Advance mock clock past the first agent's cooldown. Assert `is_exhausted` transitions back to `false`. Annotate with `// Covers: 2_TAS-REQ-115`.
- [ ] **Test `webhook_fires_at_most_once_per_episode`**: Rate-limit all agents (fires webhook). Rate-limit an already-rate-limited agent again. Assert only one `PoolExhausted` event was emitted total — the second rate-limit does not fire another webhook. Annotate with `// Covers: 2_TAS-REQ-115`.
- [ ] **Test `new_episode_fires_new_webhook`**: Rate-limit all agents (episode 1, webhook fires). Un-exhaust (cooldown expires). Rate-limit all agents again (episode 2). Assert a second `PoolExhausted` event is emitted for episode 2. Annotate with `// Covers: 2_TAS-REQ-115`.
- [ ] **Test `partial_rate_limit_does_not_fire_webhook`**: Create a pool with 3 agents. Rate-limit 2 of 3. Assert `is_exhausted` remains `false` and no `PoolExhausted` event is emitted. Annotate with `// Covers: 2_TAS-REQ-115`.
- [ ] **Test `exhaustion_only_considers_capability_matching_agents`**: Create a pool with 3 agents. Only 2 have the required capability. Rate-limit those 2. Assert `is_exhausted` is `true` for that capability request (even though the third agent is available, it doesn't match).

## 2. Task Implementation
- [ ] Add `is_exhausted: bool` field to `AgentPool` struct (not atomic — protected by the pool's `RwLock`).
- [ ] Implement exhaustion detection in the pool selection flow (integrated with task 03, step 4):
  - After filtering by capability and excluding rate-limited agents, if zero agents remain:
    - If `is_exhausted == false`: set `is_exhausted = true` and send `PoolExhausted` event via `tokio::sync::mpsc::Sender<WebhookEvent>`.
    - If `is_exhausted == true`: do nothing (already in exhaustion episode).
- [ ] Implement recovery detection:
  - When `is_available()` returns `true` for any agent (cooldown expired) and `is_exhausted == true`: set `is_exhausted = false`.
  - This check runs during `acquire_agent` flow and/or via a periodic cooldown-expiry timer.
- [ ] Define the `PoolExhausted` event variant in the webhook event enum (or consume the existing one from `devs-webhook`):
  ```rust
  WebhookEvent::PoolExhausted {
      pool_name: String,
      exhausted_at: DateTime<Utc>,
      rate_limited_agents: Vec<AgentId>,
  }
  ```
- [ ] Wire the `mpsc::Sender` into `AgentPool` at construction time, injected from the server initialization.

## 3. Code Review
- [ ] Verify that `is_exhausted` uses a simple boolean (per [2_TAS-REQ-115]) and not an atomic — the pool `RwLock` provides synchronization.
- [ ] Confirm the webhook fires exactly once per `false → true` transition and never during `true → true`.
- [ ] Ensure the `false → true → false → true` cycle correctly fires two separate webhooks (one per episode).
- [ ] Verify that the event channel send is non-blocking (`try_send` or bounded channel with backpressure handling).
- [ ] Check that exhaustion tracking is per-pool, not global across all pools.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -- exhaustion` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-pool -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add doc comments to the exhaustion tracking fields and methods explaining the episode model.
- [ ] Add `// Covers: 2_TAS-REQ-115` annotations to each test function.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-115' devs-pool/` and confirm at least 6 test functions are annotated.
- [ ] Run `./do test` and confirm the traceability report includes [2_TAS-REQ-115].
- [ ] Run `./do lint` and confirm no lint failures in the pool crate.
