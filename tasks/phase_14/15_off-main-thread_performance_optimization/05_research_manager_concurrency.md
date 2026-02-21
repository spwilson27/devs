# Task: Implement ResearchManager Concurrent Stream Handling (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [9_ROADMAP-REQ-024]

## 1. Initial Test Written
- [ ] Create `src/research/__tests__/research-manager-concurrency.test.ts` using Vitest.
- [ ] Write a unit test that initialises `ResearchManager` and calls `runResearch(queries)` with an array of 5 distinct query strings. Mock the underlying `SearchAdapter` and `ExtractAdapter` to resolve after a random delay (50–300ms). Assert all 5 results are returned in a single resolved array without any rejected promises.
- [ ] Write a test that verifies no more than 3 concurrent `SearchAdapter.search()` calls are active at any time. Use a counter spy incremented on call start and decremented on resolution; assert the counter never exceeds 3.
- [ ] Write a test for rate-limit lockout recovery: make `SearchAdapter.search()` reject with a `RateLimitError` on the first 2 attempts for one query, then resolve on the 3rd. Assert `ResearchManager` retries with exponential backoff and the query ultimately resolves successfully.
- [ ] Write a test for thread starvation prevention: submit 10 concurrent queries to a `ResearchManager` with `concurrencyLimit: 3`. Assert that all 10 complete (no promise hangs indefinitely) and that the total elapsed time is less than if they were run serially (i.e., parallelism actually helps).
- [ ] Write a test that ensures a single slow or failing stream does not block the remaining streams from completing.
- [ ] Write a test that validates `ResearchManager` emits a `'stream-complete'` event for each individual query result as it resolves, before the full batch is done.

## 2. Task Implementation
- [ ] Create or update `src/research/research-manager.ts`:
  - Add a `concurrencyLimit: number` configuration option (default: `3`) — satisfying [9_ROADMAP-REQ-024]'s "3+ concurrent streams" requirement.
  - Implement a `PQueue`-based (or custom semaphore) concurrency limiter that caps simultaneous `search + extract` pipeline executions at `concurrencyLimit`.
  - Annotate the concurrency logic: `// [9_ROADMAP-REQ-024] ResearchManager: handles 3+ concurrent search/extract streams`.
  - Implement per-stream retry logic with exponential backoff: `baseDelayMs: 500`, `maxRetries: 3`, `maxDelayMs: 8000`. Catch `RateLimitError` specifically; other errors propagate immediately.
  - Emit typed events using `EventEmitter`:
    - `'stream-start'` when a query begins processing.
    - `'stream-complete'` with `{ query, result }` when a query finishes.
    - `'stream-error'` with `{ query, error }` when a query permanently fails.
  - Ensure the semaphore releases even if a stream throws, preventing deadlock.
- [ ] Create `src/research/rate-limit-error.ts` exporting class `RateLimitError extends Error` if it does not already exist.
- [ ] Create `src/research/semaphore.ts` exporting a generic `Semaphore` class with `acquire(): Promise<void>` and `release(): void` if a suitable utility is not already present. Alternatively, install and use `p-limit` (`pnpm add p-limit`).

## 3. Code Review
- [ ] Verify that the semaphore's `release()` is always called in a `finally` block — never skipped on error.
- [ ] Confirm `concurrencyLimit` defaults to `3` and is documented with a JSDoc comment explaining the [9_ROADMAP-REQ-024] requirement.
- [ ] Verify exponential backoff does not exceed `maxDelayMs` and that the delay formula is: `Math.min(baseDelayMs * 2^attempt + jitter, maxDelayMs)` where `jitter` is a random value in `[0, 100]ms` to avoid thundering-herd.
- [ ] Confirm `'stream-complete'` events fire as individual streams resolve (not batched at the end) — enabling progressive UI updates.
- [ ] Verify no global state is mutated between concurrent streams (each stream must use its own local variables).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/__tests__/research-manager-concurrency.test.ts` and confirm all tests pass.
- [ ] Run `pnpm test --coverage src/research/` and confirm coverage ≥ 90%.
- [ ] Run `pnpm run test:integration` and confirm the research phase of the orchestrator still produces correct results.

## 5. Update Documentation
- [ ] Add a `### Concurrent Research Streams` section to `docs/architecture/performance.md`, documenting the `concurrencyLimit` option, the retry/backoff strategy, and the `EventEmitter` event contract.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "ResearchManager configured with `concurrencyLimit: 3` (default) per [9_ROADMAP-REQ-024]. Rate-limit errors trigger exponential backoff (max 3 retries). Events: `stream-start`, `stream-complete`, `stream-error`."
- [ ] Update the `ResearchManager` constructor JSDoc to document `concurrencyLimit`, backoff parameters, and all emitted events.

## 6. Automated Verification
- [ ] Run the concurrency test file and capture JSON output: `pnpm test src/research/__tests__/research-manager-concurrency.test.ts --reporter=json > /tmp/research-concurrency-results.json && node -e "const r=require('/tmp/research-concurrency-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
- [ ] Run `grep -n "concurrencyLimit" src/research/research-manager.ts` and assert at least one match (confirming the option exists in implementation).
- [ ] Run `grep -n "9_ROADMAP-REQ-024" src/research/research-manager.ts` and assert at least one annotated comment exists.
