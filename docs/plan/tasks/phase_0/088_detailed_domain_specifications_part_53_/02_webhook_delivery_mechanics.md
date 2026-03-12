# Task: Webhook Dispatcher Mechanics (Sub-Epic: 088_Detailed Domain Specifications (Part 53))

## Covered Requirements
- [2_TAS-REQ-515], [2_TAS-REQ-516]

## Dependencies
- depends_on: [01_webhook_config_validation.md]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] Create unit tests in `devs-webhook` for `WebhookDispatcher`.
- [ ] Test cases must include:
    - Asynchronous delivery: verify that calling `dispatch` returns immediately (non-blocking).
    - Queue limit: verify that if more than 1024 items are dispatched without being consumed, subsequent notifications are dropped and a `WARN` is logged.
    - Deduplication: verify that if both `"state.changed"` and a specific event (e.g. `"run.failed"`) are configured for the same target, only one POST is delivered for the transition.

## 2. Task Implementation
- [ ] Initialize the `devs-webhook` library crate.
- [ ] Implement `WebhookDispatcher` which contains an mpsc channel (bounded at 1024) to the delivery workers.
- [ ] Implement the delivery worker which reads events from the channel and performs HTTP POSTs (using `reqwest`).
- [ ] Implement the deduplication logic in the dispatcher's `dispatch` method to ensure that a single state transition results in at most one POST per target URL.
- [ ] Use `tracing` to log a `WARN` when the channel is full and an event is dropped.

## 3. Code Review
- [ ] Verify that the `dispatch` method does not use any `.await` points that would block the caller (the scheduler).
- [ ] Check that the deduplication logic correctly handles the `"state.changed"` blanket event.
- [ ] Ensure that HTTP clients are pooled for efficiency and obey the `timeout_secs` per webhook entry.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and ensure all tests pass.

## 5. Update Documentation
- [ ] Record the implementation of non-blocking delivery and deduplication in `GEMINI.md`.

## 6. Automated Verification
- [ ] Verify that `./do test` passes and `target/traceability.json` shows [2_TAS-REQ-515] and [2_TAS-REQ-516] as covered.
