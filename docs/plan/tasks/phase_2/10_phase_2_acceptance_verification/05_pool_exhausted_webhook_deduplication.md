# Task: Pool Exhausted Webhook Deduplication Verification (Sub-Epic: 10_Phase 2 Acceptance Verification)

## Covered Requirements
- [AC-ROAD-P2-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-pool (consumer), devs-webhook (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-webhook/tests/ac_p2_005_pool_exhausted_dedup.rs` with a `#[tokio::test]`:
  1. Set up a pool with 2 agents.
  2. Set up a `WebhookDispatcher` with a `tokio::sync::mpsc::channel` receiver to capture emitted events.
  3. Call `report_rate_limit(agent_1, cooldown_until)` — pool is not yet exhausted (1 agent remaining).
  4. Call `report_rate_limit(agent_2, cooldown_until)` — pool is now exhausted. Expect one `PoolExhausted` event.
  5. Call `report_rate_limit(agent_1, later_cooldown)` again — pool is still exhausted. No additional event should fire.
  6. Call `report_rate_limit(agent_2, later_cooldown)` again — still exhausted. No additional event.
  7. Drain the event channel and assert exactly ONE `PoolExhausted` event was received total.
- [ ] Add a second test that verifies a NEW `PoolExhausted` event fires after the episode ends (an agent becomes available again) and then all agents become rate-limited again.
- [ ] Add `// Covers: AC-ROAD-P2-005` annotation.

## 2. Task Implementation
- [ ] Verify the pool tracks an `exhaustion_episode_active: bool` flag (or equivalent) that is set to `true` when the first `PoolExhausted` event is emitted and reset to `false` when any agent becomes available.
- [ ] Ensure `report_rate_limit` only emits `PoolExhausted` via the webhook channel when transitioning from "at least one agent available" to "zero agents available" (edge-triggered, not level-triggered).

## 3. Code Review
- [ ] Confirm the episode tracking flag is protected by the pool's lock and updated atomically with the rate-limit state.
- [ ] Verify no race condition exists where two concurrent `report_rate_limit` calls could both see the pool as newly exhausted and emit duplicate events.

## 4. Run Automated Tests to Verify
- [ ] Execute `cargo test -p devs-webhook --test ac_p2_005_pool_exhausted_dedup -- --nocapture`

## 5. Update Documentation
- [ ] Add `// Covers: AC-ROAD-P2-005` to all relevant tests.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes `AC-ROAD-P2-005`.
