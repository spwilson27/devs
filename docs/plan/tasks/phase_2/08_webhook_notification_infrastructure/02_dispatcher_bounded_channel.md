# Task: Implement WebhookDispatcher with Bounded mpsc Channel and Per-Target Tokio Tasks (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [2_TAS-REQ-045]

## Dependencies
- depends_on: ["01_event_types_and_payload.md"]
- shared_components: [devs-webhook (owner)]

## 1. Initial Test Written
- [ ] Add `tokio` (full features), `reqwest` (with `rustls-tls`, default-features = false), `tracing` to `devs-webhook/Cargo.toml` dependencies. Add `wiremock` and `tokio` (with `macros`, `rt-multi-thread`) to dev-dependencies.
- [ ] In `crates/devs-webhook/src/dispatcher.rs`, write unit tests:
  - [ ] Test that `WebhookDispatcher::new(targets: Vec<WebhookTarget>) -> Self` creates a dispatcher. `WebhookTarget` contains `url: String`, `secret: Option<String>`, `subscribed_events: Vec<EventClass>`.
  - [ ] Test that `WebhookDispatcher::send(event: WebhookEvent, payload: WebhookPayload) -> Result<()>` enqueues the event to the bounded channel without blocking (returns `Ok` immediately when channel has capacity). `// Covers: 2_TAS-REQ-045`
  - [ ] Test that when the bounded channel is full, `send()` returns an error (not a panic) so the caller (scheduler) is never blocked.
  - [ ] Test that `WebhookDispatcher` implements `Send + Sync` (compile-time check via `fn assert_send_sync<T: Send + Sync>() {}; assert_send_sync::<WebhookDispatcher>();`).
- [ ] In `crates/devs-webhook/tests/delivery_test.rs`, write integration tests using `wiremock`:
  - [ ] Start a `wiremock::MockServer`, configure a `Mock` for `POST /webhook` responding with 200.
  - [ ] Create a `WebhookDispatcher` with one target pointing to the mock server URL.
  - [ ] Send a `WebhookPayload` via `dispatcher.send()`.
  - [ ] Wait briefly (100ms) then assert the mock server received exactly 1 request.
  - [ ] Verify the received request body is valid JSON matching the `WebhookPayload` schema.
  - [ ] Verify the `Content-Type` header is `application/json`.
  - [ ] Verify the request has an `X-Devs-Signature` header when a secret is configured.
  - [ ] Verify that HMAC-SHA256 of the request body with the configured secret matches the `X-Devs-Signature` header value (hex-encoded). `// Covers: 2_TAS-REQ-045`
  - [ ] Test that when no secret is configured for a target, no `X-Devs-Signature` header is sent.
  - [ ] Test that delivery failure (mock returns 500) is logged at WARN and does not cause `send()` to return an error (delivery is async, fire-and-forget from caller's perspective).

## 2. Task Implementation
- [ ] Define `WebhookTarget` struct in `crates/devs-webhook/src/target.rs`:
  - `url: String`, `secret: Option<String>`, `subscribed_events: Vec<EventClass>`.
  - Derive `Clone`, `Debug`.
- [ ] Implement `WebhookDispatcher` in `crates/devs-webhook/src/dispatcher.rs`:
  - Field: `sender: tokio::sync::mpsc::Sender<(WebhookPayload, Vec<WebhookTarget>)>` — bounded channel (capacity 256).
  - Field: `_worker_handle: tokio::task::JoinHandle<()>` — the background dispatch loop.
  - `new(targets: Vec<WebhookTarget>) -> Self`:
    1. Create `mpsc::channel(256)`.
    2. Spawn a single Tokio task that owns the receiver. Inside this task, for each received `(payload, targets)`:
       - For each target, spawn a separate Tokio task to deliver the payload to that target (one task per target per event, satisfying "Tokio task per registered webhook target" from [2_TAS-REQ-045]).
  - `send(&self, event: &WebhookEvent, payload: WebhookPayload) -> Result<()>`:
    1. Filter `self.targets` to those whose `subscribed_events` contains the event's `event_class()`.
    2. Call `self.sender.try_send((payload, matching_targets))`. Return error if channel full.
  - `shutdown(self)`: drop sender, await worker handle.
- [ ] Implement `deliver_to_target(target: &WebhookTarget, payload_bytes: &[u8]) -> Result<()>` as a free async function:
  - Build `reqwest::Client` with `rustls-tls` and 10-second timeout per [2_TAS-REQ-045].
  - POST to `target.url` with `Content-Type: application/json`.
  - If `target.secret` is `Some(secret)`, compute HMAC-SHA256 of `payload_bytes` using `secret` as key, set `X-Devs-Signature` header to hex-encoded digest.
  - Check response status — if not 2xx, return `Err`. Log at `WARN` level with `tracing::warn!`.
- [ ] Add `hmac` and `sha2` crates to dependencies for HMAC-SHA256 computation.
- [ ] Export `dispatcher`, `target` modules from `lib.rs`.

## 3. Code Review
- [ ] Verify `reqwest` is configured with `default-features = false, features = ["rustls-tls"]` — no OpenSSL.
- [ ] Verify the bounded channel capacity (256) is a named constant, not a magic number.
- [ ] Verify delivery failures never propagate to the caller of `send()` — async delivery is fire-and-forget.
- [ ] Verify `WebhookDispatcher` can be wrapped in `Arc` for sharing across server components.
- [ ] Verify no `.unwrap()` on channel operations in non-test code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and confirm all unit and integration tests pass.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings`.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookDispatcher`, `WebhookTarget`, `send()`, and `deliver_to_target()` explaining the bounded channel, async delivery model, and HMAC signing.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-045' crates/devs-webhook/` and verify at least one match in dispatcher.rs and one in delivery_test.rs.
- [ ] Run `cargo test -p devs-webhook -- --nocapture 2>&1 | tail -1` and verify `test result: ok`.
