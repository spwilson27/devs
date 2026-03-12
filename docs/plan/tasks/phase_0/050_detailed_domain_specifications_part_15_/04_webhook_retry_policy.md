# Task: Implement Webhook Retry Policy (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-125]

## Dependencies
- depends_on: [03_webhook_delivery_lifecycle_and_payloads.md]
- shared_components: [devs-core, devs-webhook]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-webhook/src/retry.rs` (if not exists) for the webhook retry logic.
- [ ] Write a test that simulates a delivery failure (HTTP 500) and verifies that a retry is scheduled with a 5-second backoff.
- [ ] Write a test that verifies the maximum of 10 retry attempts before the delivery is dropped.
- [ ] Write a test verifying that after 10 failed attempts, an ERROR message is logged and the event is dropped.
- [ ] Write a test ensuring that retry state is in-memory only and is NOT persisted across server restarts.

## 2. Task Implementation
- [ ] Implement the webhook retry policy specified in [2_TAS-REQ-125]:
    - For delivery failures (non-2xx response), schedule a retry with a fixed 5-second backoff.
    - Track the number of retry attempts per delivery.
    - Limit the maximum number of retry attempts to 10.
    - If a delivery fails after 10 attempts, drop it and log an `ERROR`-level message.
- [ ] Ensure that retry state is maintained in-memory only (e.g., using a Tokio task or an internal queue).
- [ ] Confirm that server restarts clear the pending retry queue.

## 3. Code Review
- [ ] Verify that the fixed 5-second backoff is correctly implemented.
- [ ] Ensure the maximum retry count is exactly 10.
- [ ] Confirm that delivery dropping logs an `ERROR`.
- [ ] Check that retry state is indeed in-memory and NOT saved to any checkpoint or registry.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` to ensure the retry policy passes its unit tests.

## 5. Update Documentation
- [ ] Document the webhook retry policy, including the backoff duration, maximum retry count, and its in-memory nature.
- [ ] Update the `devs-webhook` module documentation to reflect the retry strategy.

## 6. Automated Verification
- [ ] Run `./do lint` to verify doc comments and formatting.
- [ ] Run `cargo clippy -p devs-webhook` to ensure code quality.
