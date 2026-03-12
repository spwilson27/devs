# Task: Verify pool.exhausted Webhook and Episode Logic (Sub-Epic: 31_Risk 010 Verification)

## Covered Requirements
- [AC-RISK-010-02], [MIT-010]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook, devs-pool]

## 1. Initial Test Written
- [ ] Write an integration test in `devs-webhook/tests/pool_exhausted_integration.rs` that:
    - Sets up a `WebhookDispatcher` with a mock server endpoint.
    - Simulates the pool manager transitioning into an "Exhausted" state (all agents in a pool are simultaneously rate-limited).
    - Asserts that exactly one `pool.exhausted` webhook is delivered for that exhaustion episode.
    - Simulates a second agent being rate-limited during the *same* cooldown period and asserts that a second webhook is NOT sent.
    - Simulates an agent becoming available again (episode ends).
    - Simulates a new exhaustion event and asserts that a new `pool.exhausted` webhook is sent.

## 2. Task Implementation
- [ ] In `devs-pool`, implement "episode" tracking for pool exhaustion events.
- [ ] Ensure that `PoolState` maintains an `is_exhausted: bool` or `current_episode_id: Option<Uuid>` to prevent duplicate notifications.
- [ ] Trigger a `pool.exhausted` event only when the transition from "not all rate-limited" to "all rate-limited" occurs.
- [ ] Integrate with `devs-webhook` to dispatch the notification as per `[RISK-010-BR-003]`.
- [ ] Ensure the webhook contains the pool name and the list of affected agents.

## 3. Code Review
- [ ] Verify that the episode tracking survives individual agent status changes as long as the pool remains exhausted.
- [ ] Ensure the webhook dispatch is asynchronous and doesn't block the pool manager or scheduler.
- [ ] Confirm that `pool.exhausted` is only triggered for configured notification targets.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --test pool_exhausted_integration`.
- [ ] Run `cargo test -p devs-pool` to verify pool status transitions.

## 5. Update Documentation
- [ ] Document the `pool.exhausted` webhook payload and its deduplication behavior in `devs-webhook` documentation.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `AC-RISK-010-02` is marked as covered in `target/traceability.json`.
