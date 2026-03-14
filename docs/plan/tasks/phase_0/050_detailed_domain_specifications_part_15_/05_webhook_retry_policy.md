# Task: Webhook Retry Policy Implementation (Sub-Epic: 050_Detailed Domain Specifications (Part 15))

## Covered Requirements
- [2_TAS-REQ-125]

## Dependencies
- depends_on: ["04_webhook_delivery_lifecycle.md"]
- shared_components: ["devs-webhook (Consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-webhook/tests/retry_policy.rs` with the following tests:
- [ ] `test_retry_uses_fixed_5_second_backoff`: Mock HTTP server returning 500 on all attempts. Assert each retry attempt occurs approximately 5 seconds after the previous one (within tolerance).
- [ ] `test_max_10_retry_attempts`: Mock HTTP server returning 500 always. Assert exactly 10 retry attempts are made (11 total including the initial attempt), then delivery is dropped.
- [ ] `test_delivery_dropped_after_max_retries_logs_error`: After 10 retries fail, assert an ERROR-level log is emitted indicating the delivery was dropped.
- [ ] `test_successful_retry_stops_further_attempts`: Mock HTTP server returning 500 on first 3 attempts, then 200 on attempt 4. Assert only 4 total attempts are made.
- [ ] `test_retry_state_is_in_memory_only`: Assert retry queue is a simple in-memory data structure (e.g., `VecDeque` or similar). No persistence to disk or database.
- [ ] `test_pending_retries_lost_on_dispatcher_drop`: Create a dispatcher, enqueue a failed delivery for retry, then drop the dispatcher. Assert the retry is lost (not persisted anywhere).
- [ ] `test_retry_count_tracked_per_delivery`: Enqueue two different failed deliveries. Assert each tracks its own retry count independently.
- [ ] `test_retry_preserves_original_payload`: Mock HTTP server returning 500 then 200. Assert the retry sends the exact same payload as the original attempt.

## 2. Task Implementation
- [ ] In `crates/devs-webhook/src/retry.rs`, implement the retry mechanism:
  1. Define a `PendingDelivery` struct: `{ url: String, payload: String, attempt: u32, max_attempts: u32 }` where `max_attempts = 10`.
  2. On delivery failure, create a `PendingDelivery` with `attempt = 1` and enqueue it.
  3. Run a retry loop (as a spawned Tokio task) that:
     a. Sleeps for 5 seconds (fixed backoff).
     b. Dequeues pending deliveries whose backoff has elapsed.
     c. Re-attempts the HTTP POST with the same payload and 10-second timeout.
     d. On success: remove from queue, log INFO.
     e. On failure: increment `attempt`. If `attempt >= 10`, drop the delivery and log ERROR: `"Webhook delivery dropped after 10 retries: {url}"`. Otherwise, re-enqueue.
  4. The retry queue is an in-memory `VecDeque<PendingDelivery>` protected by a `Mutex`. No persistence.
- [ ] Integrate retry into `WebhookDispatcher`: on failed delivery from the lifecycle step, call `retry_queue.enqueue(pending)`.
- [ ] On `WebhookDispatcher::shutdown()`, cancel the retry task. Pending retries are lost (documented as best-effort).

## 3. Code Review
- [ ] Verify backoff is exactly 5 seconds fixed — not exponential, not configurable.
- [ ] Verify max attempts is exactly 10 — not configurable.
- [ ] Verify ERROR log is emitted after 10 failed retries, not WARN.
- [ ] Verify retry state is purely in-memory — no file I/O, no database.
- [ ] Verify the retry task is properly cancelled on dispatcher shutdown to avoid orphaned tasks.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook --test retry_policy` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `PendingDelivery` and the retry loop referencing `[2_TAS-REQ-125]`.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-webhook --test retry_policy 2>&1 | tail -1` and verify output shows `test result: ok`.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings` and verify zero warnings.
