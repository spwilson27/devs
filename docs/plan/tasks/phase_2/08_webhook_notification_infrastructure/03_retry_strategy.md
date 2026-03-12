# Task: devs-webhook: Retry Strategy and Delivery (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [2_TAS-REQ-093], [2_TAS-REQ-045]

## Dependencies
- depends_on: [02_dispatcher_and_signing.md]
- shared_components: [devs-webhook]

## 1. Initial Test Written
- [ ] Write integration tests in `devs-webhook/tests/retry_tests.rs` using `wiremock` to simulate a webhook target endpoint that fails initially.
- [ ] Verify that the dispatcher retries a failed delivery up to 5 times [2_TAS-REQ-093].
- [ ] Verify that a 30-second delay occurs between each retry attempt [2_TAS-REQ-093].
- [ ] Verify that the dispatcher gives up and logs a `WARN` after 5 failed attempts [2_TAS-REQ-093].
- [ ] Verify that a successful retry (e.g., success on 3rd attempt) stops the retry cycle and records a successful delivery.
- [ ] Confirm that retry logic is asynchronous and doesn't block the dispatcher's event channel or other target tasks.

## 2. Task Implementation
- [ ] In the `WebhookDispatcher` target worker task, implement the retry loop:
  - Attempt to send the payload.
  - If the response status is not 2xx, or a network error occurs:
    - Log a `WARN`.
    - Wait for 30 seconds using `tokio::time::sleep`.
    - Re-attempt up to 4 more times (5 total attempts).
- [ ] Use a backoff mechanism that is fixed at 30 seconds [2_TAS-REQ-093].
- [ ] Ensure that even after all attempts fail, the scheduler is not blocked and no state outside `devs-webhook` is affected.
- [ ] Include a per-attempt timeout of 10 seconds [2_TAS-REQ-045].

## 3. Code Review
- [ ] Verify that `tokio::time::sleep` is used and not a blocking `std::thread::sleep`.
- [ ] Ensure the total count of attempts is correctly tracked and respects the limit of 5.
- [ ] Verify that log messages contain enough context (run_id, target URL, event type) to be useful for debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` to verify retry behavior with mock server.

## 5. Update Documentation
- [ ] Update the `devs-webhook` documentation to describe the at-least-once delivery guarantee and retry policy.

## 6. Automated Verification
- [ ] Verify that `devs-webhook/src/dispatcher.rs` contains `// Covers: 2_TAS-REQ-093`.
