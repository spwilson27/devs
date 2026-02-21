# Task: Search Rate-Limit Management & Result Caching (Sub-Epic: 03_Search Integration Tools)

## Covered Requirements
- [TAS-027], [9_ROADMAP-TAS-302]

## 1. Initial Test Written
- [ ] Create `src/tools/search/__tests__/search_cache.test.ts`.
- [ ] Write a unit test verifying `SearchCache.get(query: string, options: SearchOptions): SerperSearchResponse | null` returns `null` on a cache miss.
- [ ] Write a unit test verifying that after `SearchCache.set(query, options, response)` is called, `SearchCache.get(query, options)` returns the stored response.
- [ ] Write a unit test verifying that cache entries expire after the configured TTL (default: 3600 seconds). Use fake timers (e.g., `jest.useFakeTimers`) to advance time beyond the TTL and confirm `get()` returns `null`.
- [ ] Write a unit test verifying that the cache key is deterministic: two calls with the same `query` and equivalent `options` objects (regardless of key ordering) produce the same cache key.
- [ ] Write a unit test verifying `SearchCache.clear()` removes all entries.
- [ ] Create `src/tools/search/__tests__/rate_limiter.test.ts`.
- [ ] Write a unit test verifying `RateLimiter.acquire(): Promise<void>` resolves immediately when under the rate limit (default: 10 requests per 60 seconds).
- [ ] Write a unit test verifying `RateLimiter.acquire()` delays when the rate limit has been reached, resolving only after the window resets (use fake timers).
- [ ] Write a unit test verifying `RateLimiter.getStatus(): RateLimiterStatus` returns `{ requestsInWindow: number; windowResetAt: Date; isLimited: boolean }`.
- [ ] Create `src/tools/search/__tests__/cached_search_client.test.ts`.
- [ ] Write an integration-style unit test (fully mocked) verifying `CachedSearchClient.search(query, options)` calls `SerperClient.search` on a cache miss and returns the cached result on a second identical call (i.e., `SerperClient.search` is called exactly once for two identical queries).
- [ ] Write a unit test verifying `CachedSearchClient` calls `RateLimiter.acquire()` before every call to `SerperClient.search()` (even if the result is then returned from cache — the acquire check happens before the cache check to correctly account for in-flight de-duplication).

## 2. Task Implementation
- [ ] Create `src/tools/search/search_cache.ts` implementing the `SearchCache` class:
  - Uses an in-memory `Map<string, { response: SerperSearchResponse; expiresAt: number }>`.
  - `private buildCacheKey(query: string, options: SearchOptions): string` — sorts `options` keys alphabetically, serializes to JSON, and hashes with a stable hash (e.g., a simple djb2 or SHA-256 truncated). The key format is `sha256(<query>|<sorted_options_json>)`.
  - `get(query, options): SerperSearchResponse | null` — returns response if `Date.now() < expiresAt`, else deletes the stale entry and returns `null`.
  - `set(query, options, response, ttlSeconds = 3600): void`.
  - `clear(): void`.
- [ ] Create `src/tools/search/rate_limiter.ts` implementing the `RateLimiter` class:
  - Constructor accepts `{ maxRequests: number; windowMs: number }` (defaults: `{ maxRequests: 10, windowMs: 60_000 }`).
  - Tracks a sliding window of request timestamps using a `number[]` array.
  - `async acquire(): Promise<void>` — removes timestamps older than `windowMs`, then if `requestsInWindow >= maxRequests`, waits until the oldest timestamp exits the window, then records the new request timestamp and resolves.
  - `getStatus(): RateLimiterStatus`.
- [ ] Create `src/tools/search/cached_search_client.ts` implementing `CachedSearchClient` wrapping `SerperClient`:
  - Constructor: `constructor(private client: SerperClient, private cache: SearchCache, private limiter: RateLimiter)`.
  - `async search(query: string, options?: SearchOptions): Promise<SerperSearchResponse>`:
    1. Call `await this.limiter.acquire()`.
    2. Check `this.cache.get(query, options)` — return cached result if hit.
    3. Call `await this.client.search(query, options)`.
    4. Call `this.cache.set(query, options, response)`.
    5. Return the response.
- [ ] Add types `RateLimiterStatus` to `src/tools/search/types.ts`.
- [ ] Export all new classes from `src/tools/search/index.ts`.
- [ ] Add configuration constants to `src/tools/search/constants.ts` (create if absent): `SEARCH_CACHE_TTL_SECONDS = 3600`, `RATE_LIMIT_MAX_REQUESTS = 10`, `RATE_LIMIT_WINDOW_MS = 60_000`.

## 3. Code Review
- [ ] Verify `buildCacheKey` produces the same output regardless of the order of keys in the `options` object.
- [ ] Verify `RateLimiter.acquire()` never resolves before the rate limit window allows — check there is no off-by-one error in the comparison `requestsInWindow >= maxRequests`.
- [ ] Verify `CachedSearchClient` uses constructor injection for all dependencies (no `new SerperClient()` or `new SearchCache()` inside the class body).
- [ ] Verify the cache does not store error responses — `set()` should only be called after a successful `search()`.
- [ ] Verify all configuration values come from `constants.ts` and not magic numbers inline in the implementation.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="search_cache|rate_limiter|cached_search_client"` and confirm all tests pass.
- [ ] Run the linter and confirm 0 errors.

## 5. Update Documentation
- [ ] Update `src/tools/search/search.agent.md` adding sections for `## SearchCache`, `## RateLimiter`, and `## CachedSearchClient`, each describing: purpose, constructor arguments, key methods, and configuration constants.
- [ ] Document the `RATE_LIMIT_MAX_REQUESTS` and `SEARCH_CACHE_TTL_SECONDS` constants in the project's configuration documentation.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="search_cache|rate_limiter|cached_search_client"` and confirm coverage ≥ 90% for all three new source files.
- [ ] Confirm no `new SerperClient` appears inside `cached_search_client.ts`: `grep -n "new SerperClient" src/tools/search/cached_search_client.ts` should return no results.
- [ ] Confirm all constants are centralized: `grep -rn "3600\|60_000\|60000" src/tools/search/ --include="*.ts" | grep -v "constants.ts" | grep -v "test"` should return no results.
