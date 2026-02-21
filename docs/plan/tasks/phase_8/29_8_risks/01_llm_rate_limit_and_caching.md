# Task: Implement LLM API Rate Limiting and Caching Middleware (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-120]

## 1. Initial Test Written
- [ ] Write unit tests for `LLMClientMiddleware` ensuring it correctly identifies HTTP 429 (Too Many Requests) responses.
- [ ] Write tests verifying exponential backoff logic (e.g., initial 1s delay, then 2s, 4s, up to a maximum defined threshold, with jitter added).
- [ ] Write tests for the `ResponseCache` service verifying that identical prompt/context pairs within a short timeframe return a cached response rather than calling the API.

## 2. Task Implementation
- [ ] Implement the `ExponentialBackoff` handler in the main `LLMClient` interceptor to catch 429 and 503 errors from the Gemini API and sleep appropriately before retrying.
- [ ] Introduce a local, ephemeral `QueryCache` (e.g., utilizing an LRU strategy) to store prompt/response hashes and prevent redundant API queries.
- [ ] Integrate jitter into the exponential backoff to avoid synchronized retries among parallel agents.

## 3. Code Review
- [ ] Verify that the backoff logic does not block the entire Node.js event loop (use non-blocking asynchronous `setTimeout`).
- [ ] Ensure that caching keys are strictly defined by a secure hash (SHA-256) of the full prompt, including any injected context.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite with `pnpm test:unit --filter llm-middleware` to confirm 100% pass rate.
- [ ] Execute an integration test that mocks the API returning consecutive 429s and ensures the client recovers successfully.

## 5. Update Documentation
- [ ] Update `.agent/agent-architecture.md` to reflect the newly introduced LLM request interceptor and its backoff thresholds.
- [ ] Document the structure of the caching hash keys in `docs/api-contracts.md`.

## 6. Automated Verification
- [ ] Run `pnpm run audit:requirements` script to confirm that `[8_RISKS-REQ-120]` is now marked as implemented in the project matrix.
