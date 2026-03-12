# Task: Integrate Pool Exhaustion with Webhook Dispatcher (Sub-Epic: 09_Pool Events & Monitoring)

## Covered Requirements
- [2_TAS-REQ-033], [2_TAS-REQ-047]

## Dependencies
- depends_on: [01_pool_exhaustion_tracking.md]
- shared_components: [devs-pool, devs-webhook, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test that starts a server (or a mock orchestrator) with the `AgentPool` and the `WebhookDispatcher`.
- [ ] The test should trigger a pool exhaustion event and verify that a `PoolExhausted` event is sent into the `WebhookDispatcher`'s `mpsc` channel ([2_TAS-REQ-002Q]).
- [ ] The test should verify that the payload follows the schema defined in [2_TAS-REQ-124].

## 2. Task Implementation
- [ ] Update the `ServerState` or the server's main loop to wire the `AgentPool`'s exhaustion events to the `WebhookDispatcher`'s input channel.
- [ ] Implement the `WebhookEvent` serialization for the `pool.exhausted` event type, including the `pool_name` and the current timestamp ([2_TAS-REQ-124]).
- [ ] Ensure that the `WebhookDispatcher` only sends notifications for `pool.exhausted` to projects that have subscribed to this event type in their project registry configuration ([2_TAS-REQ-107]).
- [ ] Implement the logic to prevent multiple firings for the same episode in the dispatcher if necessary (though this should already be handled by the pool's emission logic).

## 3. Code Review
- [ ] Verify that the event payload does not exceed 64 KiB (though it should be small) and that the truncation logic in `devs-webhook` handles it if it did ([2_TAS-REQ-046], [2_TAS-REQ-093]).
- [ ] Confirm that `DEVS_LISTEN` and other server internal environment variables are NOT included in any payload.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and any integration tests in `tests/` that cover webhook delivery.

## 5. Update Documentation
- [ ] Update the server configuration documentation to specify how to subscribe to `pool.exhausted` webhook events.

## 6. Automated Verification
- [ ] Run `./do test --package devs-webhook` and ensure all tests pass with 100% requirement traceability for `2_TAS-REQ-047`.
