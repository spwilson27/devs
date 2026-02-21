# Task: Failover Detection and Automatic Provider Switching Logic (Sub-Epic: 12_Model Failover and Provider Handling)

## Covered Requirements
- [8_RISKS-REQ-081]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/FailoverManager.test.ts`, write unit tests covering:
  - `FailoverManager.executeWithFailover(fn)` calls `fn` with the first available provider and returns the result on success.
  - When `fn` throws an `RateLimitError`, `FailoverManager` retries with the next provider in `PROVIDER_PRIORITY` order.
  - When `fn` throws a `ServiceUnavailableError` (HTTP 503), `FailoverManager` retries with the next provider.
  - When all providers are exhausted, `FailoverManager` throws `AllProvidersExhaustedError` containing a `failureLog: ProviderFailure[]` array with `{ providerName, error, timestamp }` for each attempt.
  - `FailoverManager` emits a `'provider:switch'` event (EventEmitter) before each provider switch, containing `{ from: string; to: string; reason: string }`.
  - `FailoverManager` does NOT retry on `AuthenticationError` (HTTP 401) — it skips that provider permanently and marks it `available: false` in the `ProviderRegistry`.
  - Exponential backoff between retries: mock `setTimeout` and assert delay doubles each attempt (base 1000ms, max 16000ms).
- [ ] In `src/llm/__tests__/FailoverManager.integration.test.ts`, write an integration test using `nock` to simulate:
  - Gemini endpoint returning HTTP 429 twice, then Claude endpoint returning HTTP 200 with a valid response.
  - Assert the final response comes from Claude and that two `'provider:switch'` events were emitted.

## 2. Task Implementation
- [ ] Create `src/llm/FailoverManager.ts`:
  - Extends `EventEmitter`.
  - Constructor accepts `registry: ProviderRegistry` and `options: { backoffBaseMs?: number; backoffMaxMs?: number }`.
  - Implement `async executeWithFailover<T>(fn: (provider: ProviderConfig) => Promise<T>): Promise<T>`:
    - Iterates `registry.getAvailableProviders()`.
    - Wraps each `fn(provider)` call in a try/catch.
    - On `RateLimitError` or `ServiceUnavailableError`: logs the failure, emits `'provider:switch'`, applies exponential backoff, then tries the next provider.
    - On `AuthenticationError`: calls `registry.markUnavailable(provider.name)`, logs, and moves to next provider without backoff.
    - On success: resolves immediately.
    - If all fail: throws `AllProvidersExhaustedError` with `failureLog`.
- [ ] Create `src/llm/errors.ts` exporting typed error classes:
  - `RateLimitError` (wraps HTTP 429), `ServiceUnavailableError` (wraps HTTP 503), `AuthenticationError` (wraps HTTP 401), `AllProvidersExhaustedError` (with `failureLog: ProviderFailure[]`).
  - `ProviderFailure` interface: `{ providerName: string; error: Error; timestamp: Date }`.
- [ ] Add `markUnavailable(name: string): void` to `ProviderRegistry` that sets `available: false` for the named provider.
- [ ] Implement `exponentialBackoff(attempt: number, baseMs: number, maxMs: number): Promise<void>` utility in `src/llm/backoff.ts`.

## 3. Code Review
- [ ] Verify that `FailoverManager` is fully decoupled from concrete HTTP clients — it only receives a `fn` callback, making it transport-agnostic.
- [ ] Confirm that `AllProvidersExhaustedError` includes the full `failureLog` to aid debugging and audit trails.
- [ ] Check that `'provider:switch'` events are emitted synchronously before the backoff delay (so listeners can log immediately).
- [ ] Ensure `markUnavailable` in `ProviderRegistry` is idempotent.
- [ ] Verify no unhandled promise rejections are possible within `executeWithFailover`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/FailoverManager"` and confirm all tests pass.
- [ ] Run `npm run lint -- src/llm/` and confirm 0 errors.
- [ ] Run `npm run typecheck` and confirm 0 TypeScript errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/llm-providers.md` with a "Failover Strategy" section documenting: retry conditions, exhaustion behavior, backoff parameters, and the `'provider:switch'` event payload schema.
- [ ] Add changelog entry: `feat(llm): implement FailoverManager with exponential backoff and provider-switch events`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="src/llm/__tests__/FailoverManager" --coverageThreshold='{"global":{"branches":85,"lines":90}}'` and confirm thresholds are met.
- [ ] Execute the integration test in isolation with `npm test -- --testPathPattern="FailoverManager.integration"` against the `nock` HTTP mocks and confirm it passes without network calls.
