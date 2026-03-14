# Task: Webhook Dispatcher Channel Contract (Sub-Epic: 019_Foundational Technical Requirements (Part 10))

## Covered Requirements
- [2_TAS-REQ-002Q]

## Dependencies
- depends_on: ["01_async_rwlock_mutex_policy_enforcement.md"]
- shared_components: [devs-core (Owner — WebhookEvent type and channel contract defined here), devs-webhook (Consumer — will use these types in Phase 2)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/webhook.rs` (new module), write a unit test `test_webhook_channel_buffer_at_least_1024` that creates a `webhook_channel()` and asserts the returned channel has capacity >= 1024 by sending 1024 events without blocking.
- [ ] Write a unit test `test_webhook_send_returns_immediately` that creates a `webhook_channel()`, sends a `WebhookEvent::RunStarted` variant, and asserts the send completes without awaiting any receiver consumption (non-blocking fire-and-forget). Measure that the send takes < 1ms.
- [ ] Write a unit test `test_webhook_receiver_gets_all_events` that creates a `webhook_channel()`, sends 5 different `WebhookEvent` variants through the sender, then receives all 5 from the receiver and asserts they match in order.
- [ ] Write a unit test `test_webhook_event_variants_exhaustive` that pattern-matches on `WebhookEvent` covering all 8 required variants: `RunStarted`, `RunCompleted`, `RunFailed`, `StageStarted`, `StageCompleted`, `StageFailed`, `PoolExhausted`, `StateChanged`. This test ensures the enum is complete.
- [ ] Write a unit test `test_webhook_channel_sender_is_clone` that clones the sender and sends from both clones, receiving both events on the single receiver.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/webhook.rs` module with:
  - `pub const WEBHOOK_CHANNEL_BUFFER: usize = 1024;`
  - `pub enum WebhookEvent { RunStarted { run_id: RunId }, RunCompleted { run_id: RunId }, RunFailed { run_id: RunId, error: String }, StageStarted { run_id: RunId, stage: String }, StageCompleted { run_id: RunId, stage: String }, StageFailed { run_id: RunId, stage: String, error: String }, PoolExhausted { pool: String }, StateChanged { description: String } }` — derive `Debug, Clone`.
  - `pub type WebhookSender = tokio::sync::mpsc::Sender<WebhookEvent>;`
  - `pub type WebhookReceiver = tokio::sync::mpsc::Receiver<WebhookEvent>;`
  - `pub fn webhook_channel() -> (WebhookSender, WebhookReceiver)` that calls `tokio::sync::mpsc::channel(WEBHOOK_CHANNEL_BUFFER)`.
  - Module-level doc comment: "The Webhook Dispatcher operates on a dedicated `tokio::sync::mpsc` channel with a buffer of at least 1024 events. Engine components send `WebhookEvent` messages and immediately return without awaiting delivery. The dispatcher task consumes events independently."
- [ ] Add `pub mod webhook;` to `crates/devs-core/src/lib.rs`.
- [ ] Ensure `WebhookEvent` derives `Debug` and `Clone` for testability and multi-consumer scenarios.

## 3. Code Review
- [ ] Verify `WEBHOOK_CHANNEL_BUFFER` is >= 1024 as required.
- [ ] Verify `WebhookEvent` has exactly the 8 variants specified in the requirements.
- [ ] Verify `webhook_channel()` uses `tokio::sync::mpsc::channel` (bounded), not `unbounded_channel`.
- [ ] Verify senders can be cloned (mpsc::Sender is Clone by default) so multiple engine components can send.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- webhook` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-002Q` annotation to each test function.
- [ ] Ensure module-level doc comment on `webhook.rs` references [2_TAS-REQ-002Q].

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- webhook 2>&1 | grep -E "test result: ok"` to confirm tests pass.
- [ ] Run `grep -r "Covers: 2_TAS-REQ-002Q" crates/devs-core/` to confirm traceability annotations exist.
