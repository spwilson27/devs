# Task: Implement Competitor Identification Agent (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-001], [9_ROADMAP-REQ-RES-001]

## 1. Initial Test Written
- [ ] In `src/research/market/__tests__/competitorAgent.test.ts`, write the following tests using `vitest` and mocked dependencies:
  - **Unit: `CompetitorIdentificationAgent.run(brief)`**
    - Mock `SearchClient.search()` to return a fixture of 10 raw search results.
    - Mock `ContentExtractor.extract()` to return sanitized Markdown from each URL.
    - Assert that the agent returns a `CompetitorProfile[]` array with **at least 5** items.
    - Assert each returned `CompetitorProfile` has non-empty `name`, `url`, `description`, `features`, and `pricing`.
    - Assert each profile's `credibilityScore` is between 0 and 1 inclusive.
  - **Unit: deduplication**
    - Provide fixture search results containing 3 duplicate URLs.
    - Assert the returned list contains no duplicate `url` entries.
  - **Unit: credibility filtering**
    - Provide fixture results where 3 items have `credibilityScore < 0.3`.
    - Assert those low-credibility items are excluded from the final list.
  - **Unit: minimum competitor guard**
    - When the search returns fewer than 5 credible results, assert the agent throws `InsufficientCompetitorDataError`.
  - **Integration (with mock HTTP)**: Use `msw` (Mock Service Worker for Node) to intercept Serper API calls and return fixture JSON. Assert that the agent correctly transforms the Serper response into `CompetitorProfile[]`.

## 2. Task Implementation
- [ ] Create `src/research/market/competitorAgent.ts` exporting class `CompetitorIdentificationAgent`:
  - Constructor accepts `{ searchClient: SearchClient; contentExtractor: ContentExtractor; minCompetitors?: number }` (default `minCompetitors = 5`).
  - `async run(brief: string): Promise<CompetitorProfile[]>` method:
    1. Calls `searchClient.search(generateCompetitorQueries(brief))` to produce search results for queries like `"<brief> competitors"`, `"<brief> alternatives"`, `"best tools for <brief>"`.
    2. Deduplicates results by URL.
    3. For each result, calls `contentExtractor.extract(url)` to get clean Markdown content.
    4. Calls LLM (via `LLMClient.complete()`) with a structured prompt to extract `CompetitorProfile` fields from the Markdown, enforcing the Zod schema validation from task 01.
    5. Assigns `credibilityScore` from `searchClient`'s domain authority score.
    6. Filters out items where `credibilityScore < 0.3`.
    7. If resulting list has fewer than `minCompetitors` items, throws `InsufficientCompetitorDataError`.
    8. Returns the validated `CompetitorProfile[]`.
- [ ] Create `src/research/market/errors.ts` exporting `InsufficientCompetitorDataError extends Error`.
- [ ] Create `src/research/market/queries.ts` exporting `generateCompetitorQueries(brief: string): string[]` that generates 3–5 targeted search query strings.

## 3. Code Review
- [ ] Verify that `CompetitorIdentificationAgent` depends on `SearchClient` and `ContentExtractor` only via constructor-injected interfaces (not direct imports of implementations).
- [ ] Verify that LLM prompt for extraction is written to a separate `prompts/competitorExtraction.ts` constant (not inline in the method body).
- [ ] Verify deduplication uses URL normalization (strip trailing slash, lowercase scheme+host).
- [ ] Verify `InsufficientCompetitorDataError` includes a `found: number` and `required: number` field in its message or properties.
- [ ] Verify no raw Zod errors propagate out of `run()`—all schema failures must be caught and converted to typed errors.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/market/__tests__/competitorAgent.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/research/market/market.agent.md` to add a section:
  - **CompetitorIdentificationAgent**: Inputs (user brief string), outputs (`CompetitorProfile[]`), failure modes (`InsufficientCompetitorDataError`), dependencies (`SearchClient`, `ContentExtractor`, `LLMClient`).
  - Document query generation strategy (3–5 queries covering direct competitors and alternatives).
  - Document credibility filtering threshold (≥ 0.3).

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/market/__tests__/competitorAgent.test.ts` and assert branch coverage ≥ 90% for `competitorAgent.ts`.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
- [ ] Run integration test with a live Serper sandbox key (if available in CI env var `SERPER_API_KEY_TEST`) and assert ≥5 competitors are returned for the brief `"project management SaaS tool"`.
