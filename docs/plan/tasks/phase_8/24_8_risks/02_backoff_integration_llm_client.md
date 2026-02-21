# Task: Integrate jittered backoff into LLM API client (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-030]

## 1. Initial Test Written
- [ ] Create an integration test at tests/integration/llm-backoff.spec.ts that stubs the HTTP/LLM client to return 429 on the first N attempts and 200 on the subsequent attempt. Use Vitest fake timers (vi.useFakeTimers) and mock computeBackoff to deterministic values to assert retry timing.
  - Test scenario A: API returns 429 twice then 200; expect the client to retry twice and finally resolve with 200.
  - Test scenario B: Non-retryable 4xx (e.g., 401) should not trigger retries.

## 2. Task Implementation
- [ ] Update the central LLM client wrapper (e.g., src/lib/llmClient.ts or equivalent) to call computeBackoff(attempt) on 429 responses and await sleep(delay) between retries.
  - Retry only on 429 and transient network errors (ECONNRESET, ETIMEDOUT). Do not retry on 4xx besides 429 or on 5xx that are non-idempotent unless explicitly configured.
  - Make backoff configurable via environment (LLM_BACKOFF_BASE_MS, LLM_BACKOFF_MAX_MS) and allow disabling with LLM_BACKOFF_ENABLED=false.

## 3. Code Review
- [ ] Verify retry policy is limited to intended error classes, that retry attempts are bounded (e.g., max 6 attempts), and that logging captures attempt counts and delay used. Confirm no synchronous sleeps and that fake timers are used for tests.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/integration/llm-backoff.spec.ts --run and ensure all integration tests pass.

## 5. Update Documentation
- [ ] Update docs/architecture.md or docs/risks/backoff.md to document where backoff is applied (LLM client), configuration keys, and the retry policy semantics.

## 6. Automated Verification
- [ ] Run the test suite and additionally run an end-to-end script that calls the LLM client against a local mock server that simulates 429 then 200 responses; assert the call completes successfully and that logs show retry attempts.
