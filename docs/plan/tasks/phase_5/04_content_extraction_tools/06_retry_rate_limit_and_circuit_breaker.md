# Task: Implement ContentExtractor Retry, Rate-Limit Handling, and Circuit Breaker (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/tools/content_extractor/__tests__/resilient_extractor.test.ts`.
- [ ] Write a test that `ResilientExtractor` wraps any `IContentExtractor` and calls the inner extractor's `extract` method.
- [ ] Write a test that when the inner extractor fails on the first attempt but succeeds on the second, `ResilientExtractor.extract()` returns the successful result (retry logic).
- [ ] Write a test that the retry waits an exponential backoff interval between attempts: mock `setTimeout` and assert the delay doubles each retry (base 1000ms → 2000ms → 4000ms).
- [ ] Write a test that after 3 failed attempts (configurable as `maxRetries`), `ResilientExtractor.extract()` throws `ExtractionFailedError` with the last error as `cause`.
- [ ] Write a test that when the inner extractor throws an error with a `status: 429` (rate limit), the retry backoff is multiplied by 2× the normal rate (rate-limit-specific backoff).
- [ ] Write a test that `ResilientExtractor` implements the circuit-breaker pattern: after `failureThreshold` (default 5) consecutive failures across different URLs, further calls immediately throw `CircuitOpenError` without calling the inner extractor.
- [ ] Write a test that after `resetTimeout` milliseconds (default 60000) the circuit closes and calls are forwarded to the inner extractor again.
- [ ] Write a test that a successful call resets the consecutive failure counter.

## 2. Task Implementation
- [ ] Create `src/tools/content_extractor/resilient_extractor.ts`:
  - Export `ResilientExtractorOptions` interface: `{ maxRetries?: number; baseDelayMs?: number; failureThreshold?: number; resetTimeoutMs?: number }`.
  - Export `CircuitOpenError extends Error` (also add to `errors.ts`).
  - Export `ResilientExtractor` class implementing `IContentExtractor`.
  - Constructor: `constructor(inner: IContentExtractor, options?: ResilientExtractorOptions)`. Defaults: `maxRetries=3`, `baseDelayMs=1000`, `failureThreshold=5`, `resetTimeoutMs=60000`.
  - Maintain internal state: `consecutiveFailures: number`, `circuitOpenedAt: Date | null`.
  - `extract(url, options)`:
    1. If circuit is open and `Date.now() - circuitOpenedAt.getTime() < resetTimeoutMs`, throw `CircuitOpenError`.
    2. If circuit is open and timeout has elapsed, reset state (half-open probe).
    3. Attempt `inner.extract(url, options)` up to `maxRetries` times.
    4. On success: reset `consecutiveFailures` to 0, return result.
    5. On failure: increment `consecutiveFailures`. If `error.status === 429`, multiply delay by 2. Compute delay as `baseDelayMs * 2^attempt`. Wait then retry.
    6. After all retries exhausted: if `consecutiveFailures >= failureThreshold`, set `circuitOpenedAt = new Date()`. Throw `ExtractionFailedError`.
- [ ] Update `ContentExtractorFactory.create()` to wrap the returned adapter in a `ResilientExtractor` with default options.
- [ ] Export `CircuitOpenError` from `src/tools/content_extractor/index.ts`.

## 3. Code Review
- [ ] Verify that `ResilientExtractor` is a pure decorator — it has zero knowledge of Firecrawl or Jina internals.
- [ ] Verify that the exponential backoff implementation uses `2 ** attempt` (not `Math.pow`) for clarity.
- [ ] Verify that `circuitOpenedAt` is a private field and circuit state is not exposed publicly except via a `getCircuitState(): 'closed' | 'open' | 'half-open'` method for observability.
- [ ] Verify that `maxRetries`, `failureThreshold`, and `resetTimeoutMs` are validated in the constructor (must be positive integers) and throw `RangeError` if invalid.
- [ ] Verify that `setTimeout` is abstracted behind a `private readonly sleep: (ms: number) => Promise<void>` injectable for testability.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/tools/content_extractor/__tests__/resilient_extractor.test.ts --coverage` and confirm all tests pass with ≥95% branch coverage on `resilient_extractor.ts`.
- [ ] Run `npx jest src/tools/content_extractor/ --coverage` and confirm no regressions across the entire module.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Update `src/tools/content_extractor/content_extractor.agent.md` with a section `### Resilience & Circuit Breaker` documenting:
  - Default retry configuration (`maxRetries=3`, `baseDelayMs=1000`).
  - Circuit breaker thresholds (`failureThreshold=5`, `resetTimeoutMs=60000`).
  - `CircuitOpenError` and when it is thrown.
  - How to customize via `ResilientExtractorOptions`.
- [ ] Document `CircuitOpenError` in `errors.ts` with a JSDoc comment explaining the circuit-breaker pattern.

## 6. Automated Verification
- [ ] Run `npx jest src/tools/content_extractor/__tests__/resilient_extractor.test.ts --json --outputFile=/tmp/resilient_results.json && node -e "const r=require('/tmp/resilient_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `npx jest src/tools/content_extractor/ --coverage --coverageThreshold='{"global":{"branches":90}}'` and confirm threshold is met.
- [ ] Run `npm run lint src/tools/content_extractor/resilient_extractor.ts` and confirm zero errors.
