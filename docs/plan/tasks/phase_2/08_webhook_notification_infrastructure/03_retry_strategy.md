# Task: Implement Fixed-Interval Retry with 5 Attempts and 30s Delay (Sub-Epic: 08_Webhook Notification Infrastructure)

## Covered Requirements
- [2_TAS-REQ-093]

## Dependencies
- depends_on: ["02_dispatcher_bounded_channel.md"]
- shared_components: [devs-webhook (owner)]

## 1. Initial Test Written
- [ ] In `crates/devs-webhook/tests/retry_test.rs`, write integration tests using `wiremock`:
  - [ ] **Test: successful on first attempt** — mock returns 200. Verify exactly 1 request received. `// Covers: 2_TAS-REQ-093`
  - [ ] **Test: successful on 3rd attempt** — mock returns 500 for first 2 requests, then 200. Verify exactly 3 requests received and the payload was delivered.
  - [ ] **Test: all 5 attempts fail** — mock returns 500 for all requests. Verify exactly 5 requests received. Verify no panic and no error propagated to the scheduler.
  - [ ] **Test: retry respects 30s delay** — use `tokio::time::pause()` (from `tokio::time` test utilities) to advance time. Verify that between each retry attempt, approximately 30 seconds elapse. Configure mock to fail first 2 attempts. After first attempt, advance time by 29s — verify no second request yet. Advance by 1 more second — verify second request arrives. `// Covers: 2_TAS-REQ-093`
  - [ ] **Test: network error triggers retry** — mock server is shut down after first request (or use `wiremock` to simulate connection refused). Verify that the dispatcher retries rather than giving up immediately.
  - [ ] **Test: payload truncation before retry** — send a payload with `data` exceeding 64 KiB. Verify the request body received by the mock is <= 65536 bytes and `"truncated": true` is present. `// Covers: 2_TAS-REQ-093`
  - [ ] **Test: concurrent delivery isolation** — configure two webhook targets. First target's mock always returns 500. Second target's mock returns 200. Verify the second target receives delivery immediately while the first target retries independently without blocking the second.
- [ ] In `crates/devs-webhook/src/dispatcher.rs`, write unit tests:
  - [ ] Test that the retry configuration constants are correct: `MAX_ATTEMPTS = 5`, `RETRY_DELAY_SECS = 30`, `PER_ATTEMPT_TIMEOUT_SECS = 10`.

## 2. Task Implementation
- [ ] In `crates/devs-webhook/src/dispatcher.rs`, define constants:
  ```rust
  const MAX_ATTEMPTS: u32 = 5;
  const RETRY_DELAY: Duration = Duration::from_secs(30);
  const PER_ATTEMPT_TIMEOUT: Duration = Duration::from_secs(10);
  ```
- [ ] Refactor `deliver_to_target()` to wrap the HTTP POST in a retry loop:
  ```rust
  async fn deliver_with_retry(target: &WebhookTarget, payload_bytes: Vec<u8>) {
      let client = reqwest::Client::builder()
          .use_rustls_tls()
          .timeout(PER_ATTEMPT_TIMEOUT)
          .build()
          .expect("Failed to build HTTP client");

      for attempt in 1..=MAX_ATTEMPTS {
          match deliver_once(&client, target, &payload_bytes).await {
              Ok(()) => {
                  tracing::debug!(target_url = %target.url, attempt, "Webhook delivered successfully");
                  return;
              }
              Err(e) => {
                  tracing::warn!(
                      target_url = %target.url,
                      attempt,
                      max_attempts = MAX_ATTEMPTS,
                      error = %e,
                      "Webhook delivery failed"
                  );
                  if attempt < MAX_ATTEMPTS {
                      tokio::time::sleep(RETRY_DELAY).await;
                  }
              }
          }
      }
      tracing::warn!(
          target_url = %target.url,
          "Webhook delivery abandoned after {} attempts", MAX_ATTEMPTS
      );
  }
  ```
- [ ] Extract `deliver_once(client, target, payload_bytes) -> Result<()>` as a separate function for testability — performs the single HTTP POST with HMAC signing and status check.
- [ ] Update the per-target Tokio task (spawned in task 02) to call `deliver_with_retry()` instead of `deliver_to_target()`.
- [ ] Ensure `WebhookPayload::to_json_bytes()` is called once before entering the retry loop — the same (possibly truncated) bytes are reused for all attempts.

## 3. Code Review
- [ ] Verify `tokio::time::sleep` is used, never `std::thread::sleep`.
- [ ] Verify the retry loop runs inside the per-target Tokio task, not on the dispatcher's main channel reader task — channel processing is never blocked by retries.
- [ ] Verify log messages include `target_url`, `attempt` number, and error details for debugging.
- [ ] Verify that after all 5 attempts fail, the function returns normally (no panic, no error propagation).
- [ ] Verify the `reqwest::Client` is reused across retry attempts within a single delivery (not reconstructed each time).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-webhook` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-webhook -- -D warnings`.

## 5. Update Documentation
- [ ] Add doc comments to `deliver_with_retry()` and the retry constants explaining the at-least-once delivery guarantee, fixed 30s interval, and 5-attempt maximum.

## 6. Automated Verification
- [ ] Run `grep -r 'Covers: 2_TAS-REQ-093' crates/devs-webhook/` and verify at least one match in retry_test.rs.
- [ ] Run `cargo test -p devs-webhook -- --nocapture 2>&1 | tail -1` and verify `test result: ok`.
