# Task: Implement Rate Limit Handling with Exponential Backoff and State Preservation (Sub-Epic: 02_AI Model Integration and Tiered Orchestration)

## Covered Requirements
- [TAS-026]

## 1. Initial Test Written
- [ ] Create `src/ai/retry/__tests__/retry-policy.test.ts`.
- [ ] Write a unit test that asserts `withExponentialBackoff(fn)` returns the resolved value on a first-attempt success without any delay.
- [ ] Write a unit test that asserts when `fn` throws an HTTP 429 error on the first attempt and succeeds on the second, `withExponentialBackoff` retries exactly once and returns the resolved value.
- [ ] Write a unit test that asserts the delay before the second attempt is approximately `initialDelayMs * 2^0` (first retry), and before the third attempt is approximately `initialDelayMs * 2^1` (second retry). Use `jest.useFakeTimers()` to control time.
- [ ] Write a unit test that asserts jitter is applied so that the actual delay is within `[baseDelay, baseDelay * 1.5]` (or the configured jitter range).
- [ ] Write a unit test that asserts when `fn` exhausts all `maxRetries` attempts, `withExponentialBackoff` throws a `MaxRetriesExceededError` containing the last error as `cause`.
- [ ] Write a unit test that asserts non-429/non-503 errors (e.g., a `TypeError`) are **not** retried and are rethrown immediately.
- [ ] Write a unit test verifying that `state` passed into `withExponentialBackoff` is preserved across retries (a reference to a mutable state object is not reset between attempts).
- [ ] Write a unit test that asserts `maxRetries` defaults to `5` when not provided.
- [ ] Write a unit test that asserts `initialDelayMs` defaults to `1000` when not provided.

## 2. Task Implementation
- [ ] Create `src/ai/retry/retry-policy.ts`.
- [ ] Define and export `RetryOptions` interface: `{ maxRetries?: number; initialDelayMs?: number; maxDelayMs?: number; jitterFactor?: number; retryableStatusCodes?: number[]; }`.
- [ ] Define and export `withExponentialBackoff<T>(fn: () => Promise<T>, options?: RetryOptions, state?: Record<string, unknown>): Promise<T>`.
  - Default `maxRetries` to `5`.
  - Default `initialDelayMs` to `1000`.
  - Default `maxDelayMs` to `30000`.
  - Default `jitterFactor` to `0.5` (adds up to 50% random jitter atop the base delay).
  - Default `retryableStatusCodes` to `[429, 503]`.
- [ ] On each attempt, call `fn()`. If it resolves, return immediately.
- [ ] On rejection, inspect the error for an HTTP status code (check `error.status`, `error.statusCode`, or `error.response?.status`). If the code is not in `retryableStatusCodes`, rethrow immediately without consuming a retry.
- [ ] If retryable and retries remain, compute delay: `Math.min(initialDelayMs * 2^attemptIndex, maxDelayMs) * (1 + Math.random() * jitterFactor)`, then `await sleep(delay)`.
- [ ] After exhausting all retries, throw `MaxRetriesExceededError` with `{ cause: lastError, attempts: maxRetries + 1 }`.
- [ ] Create `src/ai/retry/errors.ts` defining `MaxRetriesExceededError extends Error` with `cause: unknown` and `attempts: number` fields.
- [ ] Create `src/ai/retry/index.ts` re-exporting everything.
- [ ] Integrate `withExponentialBackoff` into `GeminiClient.complete()` and `GeminiClient.stream()` (from Task 01) by wrapping the SDK call. Pass the active call's mutable context object as `state` so callers can inspect retry count.
- [ ] Annotate `withExponentialBackoff` with a JSDoc comment referencing `[TAS-026]`.

## 3. Code Review
- [ ] Verify the delay computation uses `Math.min(…, maxDelayMs)` to cap maximum wait time — prevent unbounded waits.
- [ ] Verify jitter uses `Math.random()` not a deterministic value, so sequential retries don't produce identical delays.
- [ ] Confirm that `state` is passed **by reference** and is never cloned or reassigned inside `withExponentialBackoff`.
- [ ] Confirm no `setTimeout` is called without `clearTimeout` if `withExponentialBackoff`'s promise is abandoned (use `AbortSignal` or a cancellation token if the calling context supports it).
- [ ] Confirm non-retryable errors escape immediately (no extra wait cycles).
- [ ] Confirm `[TAS-026]` is referenced in the JSDoc of `withExponentialBackoff`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/ai/retry/__tests__/retry-policy.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `retry-policy.ts`.
- [ ] Run `npx jest src/ai/gemini/__tests__/gemini-client.test.ts` to confirm the integration of `withExponentialBackoff` inside `GeminiClient` doesn't break existing tests.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.

## 5. Update Documentation
- [ ] Add a section "Rate Limit Handling" to `docs/ai/models.md` describing `withExponentialBackoff`, its configuration options, default values, retryable status codes, and jitter strategy, referencing `[TAS-026]`.
- [ ] Update the ADR created in Task 01 (or create a new ADR `adr-0XX-rate-limit-backoff.md`) documenting the exponential backoff strategy selection and the decision to treat only 429/503 as retryable.

## 6. Automated Verification
- [ ] Run `npx jest src/ai/retry/__tests__/retry-policy.test.ts --json --outputFile=test-results/retry-policy.json` and assert `"numFailedTests": 0`.
- [ ] Run `npx tsc --noEmit` and assert exit code `0`.
- [ ] Run `grep -r "TAS-026" src/ai/retry/retry-policy.ts` and assert a match exists.
