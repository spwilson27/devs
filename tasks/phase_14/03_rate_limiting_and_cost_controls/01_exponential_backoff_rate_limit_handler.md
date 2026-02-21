# Task: Implement Exponential Backoff Rate Limit Handler (Sub-Epic: 03_Rate Limiting and Cost Controls)

## Covered Requirements
- [1_PRD-REQ-CON-001], [8_RISKS-REQ-120]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/rate-limit/__tests__/RateLimitHandler.test.ts`.
- [ ] Write a unit test verifying that when an LLM API call returns HTTP 429, the handler retries the call with an initial delay of ~2 seconds (±10% jitter).
- [ ] Write a unit test verifying that successive 429 responses cause the delay to double on each retry (base 2s, max 60s cap). Assert at least 5 retry cycles.
- [ ] Write a unit test verifying that jitter is applied: each retry delay must differ from an exact power-of-two multiple by a random offset within ±10% of the computed delay.
- [ ] Write a unit test verifying that after a configurable `maxRetries` limit (default 8) is exceeded, the handler throws a `RateLimitExhaustedError`.
- [ ] Write a unit test verifying that non-429 errors (e.g., 500, network timeout) are NOT retried by this handler and propagate immediately.
- [ ] Write a unit test verifying that requests tagged as `priority: 'critical'` (e.g., reasoning agent calls) are placed at the front of a pending-retry queue and are retried before `priority: 'normal'` requests.
- [ ] Write an integration test that mounts a mock Gemini API server (using `msw` or `nock`) returning 429 for the first 3 calls then 200, and asserts the final resolved value is the successful response payload.
- [ ] Write an integration test that mounts a mock server always returning 429 and asserts `RateLimitExhaustedError` is thrown after `maxRetries` attempts with proper metadata (`totalDelay`, `attempts`).

## 2. Task Implementation
- [ ] Create `src/orchestrator/rate-limit/RateLimitHandler.ts`.
- [ ] Define and export `RateLimitHandlerConfig` interface:
  ```ts
  interface RateLimitHandlerConfig {
    baseDelayMs: number;   // default 2000
    maxDelayMs: number;    // default 60000
    jitterFactor: number;  // default 0.1  (±10%)
    maxRetries: number;    // default 8
  }
  ```
- [ ] Define and export `RateLimitExhaustedError extends Error` carrying `{ attempts: number; totalDelayMs: number }`.
- [ ] Implement `RateLimitHandler` class:
  - Constructor accepts `RateLimitHandlerConfig` (with defaults).
  - Method `execute<T>(fn: () => Promise<T>, priority?: 'critical' | 'normal'): Promise<T>`:
    - Maintains an in-memory priority queue of pending retry tasks (`PriorityQueue<RetryTask>`).
    - On 429 response, computes delay: `Math.min(baseDelay * 2^attempt, maxDelay) * (1 ± jitter)`.
    - Schedules retry; critical-priority tasks are dequeued before normal ones.
    - Increments attempt counter; throws `RateLimitExhaustedError` when `maxRetries` is exceeded.
    - Non-429 errors propagate without retry.
- [ ] Implement `PriorityQueue<T>` utility in `src/orchestrator/rate-limit/PriorityQueue.ts` using a min-heap ordered by `{ priority, scheduledAt }`.
- [ ] Export everything through `src/orchestrator/rate-limit/index.ts`.
- [ ] Register `RateLimitHandler` as a singleton in the DI container (`src/container.ts`), bound to interface `IRateLimitHandler`.
- [ ] Wrap all Gemini SDK call sites (`src/agents/**/*.ts`) to pass through `rateLimitHandler.execute(...)`, tagging reasoning model calls (`gemini-3-pro`) as `priority: 'critical'` and utility calls (`gemini-3-flash`) as `priority: 'normal'`.

## 3. Code Review
- [ ] Verify `RateLimitHandler` has no direct dependency on `setTimeout` global; instead depends on an injected `ITimer` interface to allow deterministic testing.
- [ ] Verify jitter computation is bounded strictly within ±10% and cannot produce a negative delay.
- [ ] Verify `PriorityQueue` heap invariant with a property-based test (fast-check or similar).
- [ ] Verify that `critical` priority tasks are never starved; normal tasks are not indefinitely blocked.
- [ ] Ensure requirement mapping comments `// [1_PRD-REQ-CON-001] [8_RISKS-REQ-120]` appear in `RateLimitHandler.ts` and at each call-site wrapper.
- [ ] Ensure no `any` TypeScript types appear; strict-mode compliance.
- [ ] Confirm the module is covered ≥90% by unit tests per `coverage/lcov.info`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rate-limit"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="RateLimitHandler.integration"` and confirm the integration tests pass.
- [ ] Run `npm run test:coverage` and assert `src/orchestrator/rate-limit/` branch coverage ≥ 90%.
- [ ] Run `npm run lint` and confirm zero lint errors in modified files.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Rate Limit Handling` section to `docs/orchestrator.md` describing the exponential backoff algorithm, jitter formula, priority queue behavior, and `RateLimitExhaustedError` error contract.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with the decision to use a priority queue for critical reasoning requests and the rationale.
- [ ] Update `specs/1_prd.md` traceability table to mark `[1_PRD-REQ-CON-001]` as implemented in Phase 14 / Task 01.
- [ ] Update `specs/8_risks_mitigation.md` traceability table to mark `[8_RISKS-REQ-120]` as implemented.

## 6. Automated Verification
- [ ] Execute `scripts/validate-all.sh` and confirm exit code 0.
- [ ] Run `node scripts/check-req-coverage.js --req 1_PRD-REQ-CON-001 --req 8_RISKS-REQ-120` and assert both IDs report `status: covered`.
- [ ] Run `npm run test -- --ci --forceExit` and confirm zero failing test suites.
- [ ] Run `grep -r "1_PRD-REQ-CON-001\|8_RISKS-REQ-120" src/orchestrator/rate-limit/ src/agents/ --include="*.ts" -l` and confirm at least 3 files are listed, proving requirement annotations are present.
