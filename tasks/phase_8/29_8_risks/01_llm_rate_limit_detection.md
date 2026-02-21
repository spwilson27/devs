# Task: Implement LLM API Rate Limit Detection (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-120]

## 1. Initial Test Written
- [ ] Create a unit test file at tests/llm/rate-limit.spec.ts that mocks the LLM HTTP client (the module used to call external LLM APIs). The test must:
  - Mock a 429 HTTP response with a `Retry-After` header and a JSON body similar to OpenAI/Gemini rate-limit responses.
  - Import the new wrapper function (to be implemented) from src/lib/llm/client.ts and assert that calling it with the mocked response rejects with a `RateLimitError` instance.
  - Assert that the thrown error contains a `retryAfter` numeric property parsed from the header and the original response body available at `error.response`.
  - Use Jest and run the test with `npm test -- tests/llm/rate-limit.spec.ts`.

## 2. Task Implementation
- [ ] Implement `src/lib/llm/errors.ts` exporting `class RateLimitError extends Error { retryAfter?: number; response?: any; }`.
- [ ] Implement `src/lib/llm/client.ts` with a typed `LLMClient` wrapper function `callLLM(payload, options)` that:
  - Delegates to the underlying HTTP client (fetch/axios/OpenAI SDK) but normalizes errors.
  - Detects 429 responses and throws `new RateLimitError(message)` with `retryAfter` parsed from `Retry-After` header (support both seconds and HTTP-date formats) and attaches raw `response`.
  - Exposes a boolean helper `isRateLimitError(err)`.
- [ ] Add a minimal config at `config/llm.json` documenting default retry headers and recommended behavior.
- [ ] Add TypeScript types or JSDoc so tests can import and assert typings.

## 3. Code Review
- [ ] Verify errors are not swallowed; RateLimitError must preserve original response for debugging.
- [ ] Ensure parsing of `Retry-After` handles both numeric seconds and HTTP-date formats and falls back to a safe default.
- [ ] Ensure no API keys or secrets are hard-coded; client reads credentials from environment variables or a secure keychain integration.
- [ ] Ensure unit tests cover both 429 and non-429 error paths and achieve high statement coverage for the new files.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- tests/llm/rate-limit.spec.ts` and ensure the new test passes.
- [ ] Optionally run `npm run test:ci` if available to run full suite.

## 5. Update Documentation
- [ ] Add `docs/risks/llm-rate-limit.md` describing the behavior: detection, parsed `retryAfter`, how callers should react, and sample code using `callLLM`.
- [ ] Add a short entry to the project's risk index `docs/risks/README.md` mapping 8_RISKS-REQ-120 to this implementation.

## 6. Automated Verification
- [ ] Add a CI job step or a script `scripts/verify-llm-rate-limit.sh` that runs the single test and exits non-zero on failure; CI must invoke this step in the LLM-related pipeline.
- [ ] Add a lightweight runtime check `node -e "require('./src/lib/llm/client').isRateLimitError(new Error()) || process.exit(0)"` as part of the script to validate the helper exists.
