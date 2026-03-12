# Task: Webhook HTTP POST Delivery Envelope (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086F]

## Dependencies
- depends_on: [none]
- shared_components: [devs-webhook, devs-core]

## 1. Initial Test Written
- [ ] In `devs-webhook`, create unit tests to verify the serialization of the webhook payload envelope.
- [ ] Test that the payload contains all required fields: `event`, `timestamp`, `project_id`, `run_id`, `stage_name`, `data`, and `truncated`.
- [ ] Test the addition of custom headers: `Content-Type: application/json`, `X-Devs-Event`, `X-Devs-Delivery`, and `X-Devs-Signature` (if applicable).
- [ ] Verify that the payload is correctly structured as defined in [2_TAS-REQ-046] and [2_TAS-REQ-124].

## 2. Task Implementation
- [ ] Implement the `WebhookPayload` struct in `devs-webhook` or `devs-core`.
- [ ] Implement the delivery logic in `devs-webhook` that constructs the HTTP POST request with the specified headers.
- [ ] Ensure the headers `X-Devs-Event` (the event type) and `X-Devs-Delivery` (a delivery UUID) are added to the request.
- [ ] Implement the standardized envelope for the `data` field based on the event type as per [2_TAS-REQ-124].

## 3. Code Review
- [ ] Verify that the webhook delivery uses `reqwest` with the `rustls-tls` feature only.
- [ ] Verify that the payload size enforcement (64 KiB) and truncation logic from [2_TAS-REQ-046] are correctly applied.
- [ ] Ensure that the implementation adheres to the delivery lifecycle in [2_TAS-REQ-123].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook`.
- [ ] Ensure all webhook delivery tests pass.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect the implementation of the webhook HTTP POST delivery envelope and headers.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure doc comments and code quality standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086F] to the new tests.
