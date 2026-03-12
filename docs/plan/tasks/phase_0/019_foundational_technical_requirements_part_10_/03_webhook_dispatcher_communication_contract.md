# Task: Webhook Dispatcher Communication Contract (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002Q]

## Dependencies
- depends_on: [01_async_concurrency_and_lock_order_policies.md]
- shared_components: [devs-core, devs-webhook]

## 1. Initial Test Written
- [ ] Create a unit test `crates/devs-core/src/messaging/webhook_dispatcher.rs`:
  - Test the `WebhookEvent` serialization and deserialization.
  - Test that sending a `WebhookEvent` via the dispatcher's sender is non-blocking.
  - Verify that the dispatcher can handle multiple events in parallel without blocking the engine.
  - Test that the channel has a buffer of at least 1024 events (e.g. by filling it and checking for error or non-blocking behavior).

## 2. Task Implementation
- [ ] Implement `WebhookEvent` struct in `crates/devs-core/src/messaging/webhook_dispatcher.rs`:
  - Add fields for `event_id`, `event_type`, `payload`, and `occurred_at`.
  - Ensure it implements `Serialize` and `Deserialize`.
- [ ] Implement a `WebhookDispatcherHandle` that wraps `tokio::sync::mpsc::Sender<WebhookEvent>`:
  - Add a `send_event(&self, event: WebhookEvent)` method that uses `self.sender.try_send(event)` or similar to ensure non-blocking behavior.
  - Ensure the channel is created with a buffer of 1024 as per [2_TAS-REQ-002Q].
- [ ] Define a basic `WebhookDispatcher` consumer task (as a placeholder) that reads from the `Receiver`.
- [ ] Ensure that engine components use this handle to emit events without awaiting delivery.

## 3. Code Review
- [ ] Verify that the `mpsc` channel buffer is exactly 1024 as per [2_TAS-REQ-002Q].
- [ ] Ensure the sender method is indeed non-blocking.
- [ ] Check that `WebhookEvent` is robust and handles various payload types (e.g. using `serde_json::Value`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify that the webhook dispatcher messaging tests pass.
- [ ] Ensure the tests cover the non-blocking behavior of the sender.

## 5. Update Documentation
- [ ] Document the asynchronous messaging pattern for webhooks in `devs-webhook` or `devs-core`.

## 6. Automated Verification
- [ ] Run `grep -r "tokio::sync::mpsc" crates/devs-core/` and `grep -r "1024" crates/devs-core/` to verify implementation matches requirements.
- [ ] Run `grep -r "2_TAS-REQ-002Q" crates/devs-core/` for traceability.
