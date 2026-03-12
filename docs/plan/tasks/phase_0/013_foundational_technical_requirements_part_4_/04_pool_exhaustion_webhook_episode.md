# Task: Implement Pool Exhaustion Webhook Episode Tracking (Sub-Epic: 013_Foundational Technical Requirements (Part 4))

## Covered Requirements
- [2_TAS-BR-WH-003], [2_TAS-REQ-033], [2_TAS-REQ-047], [2_TAS-REQ-115]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-pool]

## 1. Initial Test Written
- [ ] In `devs-pool`, write a unit test in `src/pool.rs` (or equivalent) for `AgentPool`.
- [ ] Mock an `AgentPool` with all agents rate-limited.
- [ ] Write a test that attempts to dispatch multiple times while the pool is exhausted.
- [ ] Verify that the `PoolExhausted` event is emitted ONLY on the first attempt.
- [ ] Simulate one agent's cooldown expiring (making it available).
- [ ] Rate-limit that agent again and verify that `PoolExhausted` is emitted again (new episode).

## 2. Task Implementation
- [ ] In `devs-pool`, update the `AgentPool` struct to include an `is_exhausted` boolean flag.
- [ ] When attempting to acquire an agent and failing due to all agents being unavailable:
  - Check the current `is_exhausted` flag.
  - If `false`, set it to `true` and emit the `PoolExhausted` internal event.
  - If `true`, do nothing.
- [ ] When an agent becomes available (cooldown expires or job finishes):
  - Set `is_exhausted` to `false`.
  - Optionally emit a `PoolRecovered` internal event.
- [ ] Ensure that `devs-webhook` or the notification dispatcher correctly filters this event based on the project's subscription.

## 3. Code Review
- [ ] Confirm that `is_exhausted` is correctly reset when agents become available.
- [ ] Verify that the webhook payload includes the correct `pool_name`.
- [ ] Ensure the episode tracking works across multiple pools independently.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool` to ensure the episode tracking logic is correct.
- [ ] Run `./do test` to verify traceability annotations.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to explain how pool exhaustion episodes are tracked.

## 6. Automated Verification
- [ ] Verify the emission logic with a mock event handler in the unit test.
