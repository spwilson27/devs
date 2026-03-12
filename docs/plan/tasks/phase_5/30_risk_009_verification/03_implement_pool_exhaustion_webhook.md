# Task: Implement Pool Exhaustion Webhook Episodes (Sub-Epic: 30_Risk 009 Verification)

## Covered Requirements
- [RISK-010-BR-003]

## Dependencies
- depends_on: [02_implement_rate_limit_logic.md]
- shared_components: [devs-webhook, devs-pool]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-webhook/src/tests.rs` (or `devs-pool/src/tests.rs`) that:
    - Sets up a mock pool with 2 agents.
    - Simulates the first agent becoming rate-limited (No webhook fired).
    - Simulates the second agent becoming rate-limited (Webhook `pool.exhausted` MUST fire).
    - Simulates a third rate-limit report while both are still limited (No second webhook fired).
    - Simulates one agent's cooldown expiring (making it available).
    - Simulates the same agent hitting a rate limit again before a successful dispatch (No second webhook fired).
    - Simulates a successful dispatch, then a new exhaustion (Second `pool.exhausted` webhook MUST fire).
- [ ] Assert that the webhook payload contains the pool ID and a list of all rate-limited agents.

## 2. Task Implementation
- [ ] **devs-pool**:
    - Update `PoolState` to track `exhaustion_episode_id` (a UUID or timestamp).
    - Implement logic to start a new episode when *all* agents are unavailable.
    - Implement logic to end an episode when at least *one* agent becomes available AND a successful dispatch occurs (as per BR-003).
    - Trigger an event (e.g., `PoolExhaustedEvent`) when a *new* episode starts.
- [ ] **devs-webhook**:
    - Subscribe to `PoolExhaustedEvent` and dispatch the `pool.exhausted` webhook.
    - Ensure the signature and payload follow the standard project webhook format.

## 3. Code Review
- [ ] Confirm that "episode" boundaries are correctly managed and don't cause notification storms.
- [ ] Verify that the "successful dispatch" requirement for ending an episode is implemented to prevent flapping if an agent becomes available but immediately hits another rate limit.
- [ ] Ensure that all project configurations (with different pool names) are correctly handled.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-pool -p devs-webhook` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add the `pool.exhausted` webhook event to the official `devs` documentation.

## 6. Automated Verification
- [ ] Run the traceability tool: `python3 .tools/verify_requirements.py --req RISK-010-BR-003`.
