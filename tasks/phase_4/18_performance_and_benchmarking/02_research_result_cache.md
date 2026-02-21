# Task: Implement Research Result Cache and Memoization Layer (Sub-Epic: 18_Performance_and_Benchmarking)

## Covered Requirements
- [8_RISKS-REQ-058]

## 1. Initial Test Written
- [ ] In `packages/orchestrator/src/__tests__/research-cache.test.ts`, write unit tests for a `ResearchCache` class:
  - Test that `ResearchCache.get(key: string)` returns `undefined` when no entry exists.
  - Test that `ResearchCache.set(key: string, value: ResearchResult)` stores a result and subsequent `get(key)` returns it.
  - Test that cache entries include a `createdAt` ISO timestamp and a `phase` label (e.g., `'market_research'`, `'requirements_distillation'`).
  - Test that `ResearchCache.has(key)` returns `true` only for previously set keys.
  - Test cache persistence: after calling `ResearchCache.persist()`, create a new `ResearchCache` instance pointing to the same SQLite path and confirm `get(key)` returns the previously stored result.
  - Test that `ResearchCache.invalidate(key)` removes a stored result and subsequent `get(key)` returns `undefined`.
  - Test that the cache correctly handles concurrent `set` calls for the same key (last-write-wins with a timestamp).
- [ ] In `packages/orchestrator/src/__tests__/research-cache-integration.test.ts`, write an integration test:
  - Spy on the `MarketResearchAgent.run()` method.
  - Call the orchestrator's research phase twice for the same project description hash.
  - Assert `MarketResearchAgent.run()` was called exactly once (cache hit on second call).

## 2. Task Implementation
- [ ] Create `packages/orchestrator/src/cache/ResearchCache.ts`:
  - Define `ResearchResult` interface: `{ key: string; phase: string; data: unknown; createdAt: string; projectHash: string; }`.
  - Implement `ResearchCache` backed by a SQLite table (`research_cache`) in the project's `.devs/cache.db` file (use the existing `better-sqlite3` dependency).
  - Schema: `CREATE TABLE IF NOT EXISTS research_cache (key TEXT PRIMARY KEY, phase TEXT, data TEXT, created_at TEXT, project_hash TEXT)`.
  - Implement `get(key): ResearchResult | undefined` — SELECT and JSON-parse `data`.
  - Implement `set(key, value): void` — INSERT OR REPLACE with `JSON.stringify(data)`.
  - Implement `has(key): boolean`.
  - Implement `invalidate(key): void` — DELETE by key.
  - Implement `persist(): void` — no-op (SQLite is write-through); exists for API symmetry.
  - Implement static `computeProjectHash(description: string, userJourneys: string[]): string` using Node's `crypto.createHash('sha256')`.
- [ ] Create `packages/orchestrator/src/cache/CachedResearchRunner.ts`:
  - Wrap each research agent (`MarketResearchAgent`, `CompetitiveAnalysisAgent`, `TechLandscapeAgent`, `UserResearchAgent`) with cache-check logic:
    - Compute cache key as `${phase}:${projectHash}`.
    - If `researchCache.has(key)`, return cached result without calling the agent.
    - Otherwise, run the agent, store result via `researchCache.set(key, result)`, return result.
- [ ] Integrate `CachedResearchRunner` into `packages/orchestrator/src/OrchestratorPipeline.ts`:
  - Replace direct agent calls in the research phase with `CachedResearchRunner.run(phase, agent, projectContext)`.
- [ ] Similarly wrap the `RequirementsDistillationAgent` and `RequirementsMergeAgent` output with cache keys `requirements_distillation:${projectHash}` and `requirements_merge:${projectHash}`.

## 3. Code Review
- [ ] Verify `ResearchCache` has no in-memory fallback — it MUST persist to SQLite on every `set` to survive process restarts.
- [ ] Confirm `computeProjectHash` is deterministic: same inputs always yield the same hash, independent of object key ordering.
- [ ] Ensure `CachedResearchRunner` logs a structured message (JSON, to the devs logger) on cache hit and miss, including the key and phase.
- [ ] Verify no agent-specific logic leaks into `ResearchCache` — it must be a generic key-value store.
- [ ] Confirm the SQLite connection is opened once per process (singleton pattern), not per `get`/`set` call.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern="research-cache"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/orchestrator test -- --coverage` and confirm coverage for `ResearchCache.ts` and `CachedResearchRunner.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Add JSDoc headers to `ResearchCache.ts` and `CachedResearchRunner.ts` referencing `[8_RISKS-REQ-058]` and describing the cache contract.
- [ ] Add a section "Research Result Cache" to `packages/orchestrator/AGENT.md` (create if absent) covering: purpose, cache key format, SQLite path (`.devs/cache.db`), and invalidation strategy.
- [ ] Update `.devs/memory/phase_4_decisions.md` with: "Research and requirements results are memoized in `.devs/cache.db` using SHA-256 project hashes as keys to avoid redundant API calls across retries."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/orchestrator test 2>&1 | tail -5` and confirm zero failures.
- [ ] Run `grep -r "CachedResearchRunner" packages/orchestrator/src/OrchestratorPipeline.ts` and confirm the import and usage exist.
- [ ] Run `grep -rn "research_cache" packages/orchestrator/src/cache/ResearchCache.ts` and confirm the SQLite table name is present, proving the persistence layer is wired.
