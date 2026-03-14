# Task: Webhook Delivery Lifecycle Logic (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-123]

## Dependencies
- depends_on: ["03_webhook_event_types_and_payloads.md"]
- shared_components: ["devs-webhook (Consumer)", "devs-config (Consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-webhook/tests/delivery_lifecycle.rs` with the following tests:
- [ ] `test_event_skipped_when_project_has_no_webhook_targets`: Emit an event for a project with no webhook config. Assert no HTTP request is made.
- [ ] `test_event_skipped_when_type_not_in_subscription`: Configure a webhook target subscribed only to `run.started`. Emit `stage.completed`. Assert no HTTP request is made.
- [ ] `test_event_delivered_when_type_matches_subscription`: Configure a target subscribed to `run.started`. Emit `RunStarted`. Assert HTTP POST is made to the target URL.
- [ ] `test_payload_serialized_as_json`: Use a mock HTTP server. Assert the POST body is valid JSON matching `WebhookEnvelope` schema.
- [ ] `test_payload_truncation_when_over_64kib`: Construct a `WebhookEvent` whose serialized data field exceeds 64 KiB. Assert the delivered payload has `truncated: true` and total size is ≤ 64 KiB.
- [ ] `test_payload_not_truncated_when_under_64kib`: Construct a normal-sized event. Assert `truncated: false`.
- [ ] `test_successful_delivery_logs_info`: Use a mock HTTP server returning 200. Assert INFO-level log is emitted containing "delivered".
- [ ] `test_failed_delivery_logs_warn`: Use a mock HTTP server returning 500. Assert WARN-level log is emitted containing "failed".
- [ ] `test_delivery_timeout_is_10_seconds`: Use a mock HTTP server that delays >10s. Assert the delivery times out and is marked as failed.
- [ ] `test_failed_delivery_schedules_retry_after_5s`: Use a mock HTTP server returning 500. Assert retry is scheduled. On second call (after 5s delay), return 200. Assert delivery succeeds.

## 2. Task Implementation
- [ ] In `crates/devs-webhook/src/dispatcher.rs`, implement the delivery lifecycle in `WebhookDispatcher::deliver(event: WebhookEvent, project: &ProjectRef)`:
  1. Look up project webhook targets from config. If none, return early.
  2. For each target, check if `event.event_type()` is in the target's subscribed event types. If not, skip.
  3. Serialize the event into a `WebhookEnvelope` JSON payload.
  4. Check if serialized payload > 64 KiB. If yes, truncate the `data` field and set `truncated = true`.
  5. POST to target URL using `reqwest::Client` with a 10-second timeout.
  6. If response is HTTP 2xx, log at INFO level: `"Webhook delivered: {event_type} to {url}"`.
  7. If response is not HTTP 2xx (or timeout/network error), log at WARN level: `"Webhook delivery failed: {event_type} to {url}: {status}"`. Enqueue for retry.
- [ ] Implement the 64 KiB truncation logic: measure serialized `data` field size; if over limit, replace with a truncated summary string and set `truncated: true` on the envelope.
- [ ] Use `reqwest::Client` with `timeout(Duration::from_secs(10))` for each delivery attempt.

## 3. Code Review
- [ ] Verify the 8-step lifecycle matches the requirement exactly in order.
- [ ] Verify 64 KiB threshold is checked on the full payload, not just the data field.
- [ ] Verify timeout is exactly 10 seconds, not configurable.
- [ ] Verify log levels are correct: INFO for success, WARN for failure.
- [ ] Verify failed deliveries are enqueued for retry (not retried inline).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --test delivery_lifecycle` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `WebhookDispatcher::deliver()` referencing `[2_TAS-REQ-123]`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-webhook --test delivery_lifecycle 2>&1 | tail -1` and verify output shows `test result: ok`.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings` and verify zero warnings.
