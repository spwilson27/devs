# Task: Implement model provider failover and state-preserving retry logic (Sub-Epic: 26_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-081]

## 1. Initial Test Written
- [ ] Create `tests/phase_8/26_8_risks/test_05_model_failover.py` that:
  - Mocks the primary model client to raise network errors (connection/refused/5xx) for the first N calls and verifies that `ModelProviderManager` falls back to a secondary provider and replays the original request payload to the secondary provider.
  - Asserts that the request payload (context + history) provided to the secondary provider is byte-for-byte identical to the original request (use deep equality checks on JSON payloads).
  - Asserts that telemetry records which provider was chosen and that the failure count and timestamps are recorded in provider health metadata.

## 2. Task Implementation
- [ ] Implement `ModelProviderManager` under `src/agent/model` with:
  - `register_providers(providers: List[ProviderConfig])`:
    - Maintains priority list and provider configuration (endpoint, credentials, healthcheck endpoint).
  - `send_request(request_payload: dict) -> Response`:
    - Attempts to send to the highest-priority healthy provider.
    - On network errors / 5xx / timeouts, atomically record failure in an in-memory sliding-window counter and attempt the next provider.
    - Preserve request payload immutably (clone before sending) so retries send identical bytes.
  - Healthcheck and backoff logic:
    - Periodic healthchecks (configurable interval) and exponential backoff with jitter on failure.
    - Sliding window threshold (e.g., 5 failures in 10 minutes) triggers failover and hides provider from selection until healthy.
  - Telemetry integration:
    - Record provider choice, latency, response code, and retry counts to the repository telemetry sink.
- [ ] Add integration tests that use a local mock server for primary/secondary providers and validate failover behavior.

## 3. Code Review
- [ ] Ensure retry behavior is idempotent and request payloads are not mutated between retries.
- [ ] Verify credentials are accessed securely (no secrets in logs) and that provider selection metrics are recorded for debugging.

## 4. Run Automated Tests to Verify
- [ ] Run the model failover unit tests and the local mock integration tests: `pytest tests/phase_8/26_8_risks::test_05_model_failover.py` and confirm failover occurs within expected retry bounds.

## 5. Update Documentation
- [ ] Add `docs/model_failover.md` detailing configuration format for providers, healthcheck thresholds, failure-window semantics, and how to add a new provider to the system.

## 6. Automated Verification
- [ ] Add a CI chaos-test job that repeatedly injects 5xx errors into the primary provider for a short window and asserts that the system falls back to the secondary provider and preserves request payload and task context; fail the job on misbehavior.
