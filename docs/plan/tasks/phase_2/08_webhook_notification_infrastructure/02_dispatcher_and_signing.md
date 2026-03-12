# Task: devs-webhook: Webhook Dispatcher and Signing (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [2_TAS-REQ-045]

## Dependencies
- depends_on: [01_event_types_and_payload.md]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] Write integration tests in `devs-webhook/tests/delivery_tests.rs` using `wiremock` to simulate a webhook target endpoint.
- [ ] Verify that a `WebhookDispatcher` successfully sends a `WebhookPayload` to a target URL.
- [ ] Verify that the outgoing HTTP POST request contains a `X-Devs-Signature` header (HMAC-SHA256).
- [ ] Verify the signature matches a locally calculated HMAC-SHA256 of the JSON body using a shared secret.
- [ ] Verify that each webhook target is served by an independent Tokio task.

## 2. Task Implementation
- [ ] Implement `WebhookDispatcher` in `devs-webhook/src/dispatcher.rs`.
- [ ] Use `reqwest` with `rustls-tls` exclusively for HTTP delivery [2_TAS-REQ-006].
- [ ] Configure the client with a 10-second timeout per attempt [2_TAS-REQ-045].
- [ ] Implement a `spawn_target_worker` method that starts a `tokio::task` for a specific target URL and secret.
- [ ] Implement HMAC-SHA256 signing of the JSON payload. The signature should be placed in the `X-Devs-Signature` header.
- [ ] Use a `tokio::sync::mpsc::channel` per worker to receive events to be dispatched.
- [ ] Ensure that delivery failures (e.g., non-2xx status, network error) are logged at `WARN` level and do not panic or affect the caller.

## 3. Code Review
- [ ] Verify that `reqwest` uses `rustls-tls` only.
- [ ] Ensure the signing logic uses the raw JSON body to prevent issues with field ordering differences between signing and sending.
- [ ] Check for proper resource cleanup when a dispatcher is dropped.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` to verify dispatcher logic and integration with wiremock.

## 5. Update Documentation
- [ ] Document the signature header and HMAC algorithm in `devs-webhook/README.md`.

## 6. Automated Verification
- [ ] Verify that `devs-webhook/src/dispatcher.rs` contains `// Covers: 2_TAS-REQ-045`.
