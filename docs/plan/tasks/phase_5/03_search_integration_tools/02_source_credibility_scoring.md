# Task: Source Credibility Scoring Engine (Sub-Epic: 03_Search Integration Tools)

## Covered Requirements
- [9_ROADMAP-TAS-302], [9_ROADMAP-REQ-025]

## 1. Initial Test Written
- [ ] Create `src/tools/search/__tests__/credibility_scorer.test.ts`.
- [ ] Write a unit test verifying `CredibilityScorer.score(result: SerperOrganicResult): CredibilityScore` returns a `CredibilityScore` with a `value` between 0.0 and 1.0 for any valid input.
- [ ] Write unit tests for each scoring heuristic in isolation:
  - **Domain Authority**: A result with `link` from `github.com`, `docs.python.org`, `developer.mozilla.org`, `arxiv.org`, or `stackoverflow.com` should receive a `domainScore` ≥ 0.8. A result from a random unknown domain should receive `domainScore` ≤ 0.5.
  - **Recency**: A result with `date` within the last 30 days should receive `recencyScore` ≥ 0.9. A result with `date` older than 2 years should receive `recencyScore` ≤ 0.4. A result with no `date` should receive `recencyScore` = 0.5 (neutral).
  - **Snippet Quality**: A result whose `snippet` contains complete sentences (length ≥ 80 chars) should receive `snippetScore` ≥ 0.7. A result with a very short or empty snippet should receive `snippetScore` ≤ 0.3.
  - **Position Bias**: A result at `position` 1–3 receives a `positionScore` ≥ 0.8; position 8–10 receives `positionScore` ≤ 0.5.
- [ ] Write a unit test verifying the **weighted composite score**: `value = 0.4 * domainScore + 0.3 * recencyScore + 0.2 * snippetScore + 0.1 * positionScore`, rounded to 4 decimal places.
- [ ] Write a unit test verifying `CredibilityScorer.filterAboveThreshold(results: SerperOrganicResult[], threshold: number): ScoredResult[]` returns only results where `score.value > threshold`.
- [ ] Write a unit test verifying that when `filterAboveThreshold` is called with threshold `0.8`, results with `score.value <= 0.8` are excluded.
- [ ] Write a unit test for `CredibilityScorer.scoreAll(results: SerperOrganicResult[]): ScoredResult[]` that returns every result annotated with its `CredibilityScore` sorted descending by `score.value`.

## 2. Task Implementation
- [ ] Add to `src/tools/search/types.ts`:
  - `CredibilityScore`: `{ value: number; domainScore: number; recencyScore: number; snippetScore: number; positionScore: number }`.
  - `ScoredResult`: `SerperOrganicResult & { credibility: CredibilityScore }`.
- [ ] Create `src/tools/search/credibility_scorer.ts` implementing the `CredibilityScorer` class:
  - Define a `TRUSTED_DOMAINS` constant (a `Set<string>`) containing high-authority domains: `github.com`, `npmjs.com`, `pypi.org`, `developer.mozilla.org`, `docs.python.org`, `stackoverflow.com`, `arxiv.org`, `medium.com` (low-weighted), `wikipedia.org`, `official docs patterns`.
  - Implement `private scoreDomain(link: string): number` using URL parsing to extract hostname and match against `TRUSTED_DOMAINS`.
  - Implement `private scoreRecency(date?: string): number` using date parsing; treat missing dates as neutral (0.5).
  - Implement `private scoreSnippet(snippet: string): number` based on character length and presence of complete sentences.
  - Implement `private scorePosition(position: number): number` using an inverse linear scale: `1 - ((position - 1) / 9)` clamped to [0, 1].
  - Implement `score(result: SerperOrganicResult): CredibilityScore` combining the four sub-scores with weights `[0.4, 0.3, 0.2, 0.1]`.
  - Implement `scoreAll(results: SerperOrganicResult[]): ScoredResult[]` that maps `score()` over all results and returns them sorted descending by `credibility.value`.
  - Implement `filterAboveThreshold(results: SerperOrganicResult[], threshold: number = 0.8): ScoredResult[]` that calls `scoreAll` and filters.
- [ ] Export `CredibilityScorer` and new types from `src/tools/search/index.ts`.

## 3. Code Review
- [ ] Verify the composite score weights sum exactly to `1.0` (i.e., `0.4 + 0.3 + 0.2 + 0.1 === 1.0`).
- [ ] Verify `scoreDomain` uses `new URL(link).hostname` (not naive string splitting) to correctly handle subdomains.
- [ ] Verify `scoreRecency` correctly handles ISO 8601 date strings, relative date strings (e.g., "3 days ago"), and `undefined`.
- [ ] Verify `TRUSTED_DOMAINS` is defined as a module-level constant (not inline in the method) so it can be extended in future tasks.
- [ ] Verify the threshold default value of `0.8` is defined as a named constant `DEFAULT_CREDIBILITY_THRESHOLD = 0.8` and not a magic number.
- [ ] Verify the scoring functions are pure (no side effects) and individually testable.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=credibility_scorer` and confirm all unit tests pass.
- [ ] Run the linter and confirm 0 errors.

## 5. Update Documentation
- [ ] Update `src/tools/search/search.agent.md` adding a section describing `CredibilityScorer`, the four scoring dimensions, their weights, and the default threshold of 0.8.
- [ ] Document the `TRUSTED_DOMAINS` list in the AOD file and the rationale for each domain's inclusion.
- [ ] Add a note in `ARCHITECTURE.md` explaining that all search results in the Discovery phase are filtered through `CredibilityScorer` before being used in research reports.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern=credibility_scorer` and confirm coverage for `src/tools/search/credibility_scorer.ts` is ≥ 95% for statements and branches.
- [ ] Run a check confirming the string `DEFAULT_CREDIBILITY_THRESHOLD` exists in `src/tools/search/credibility_scorer.ts`: `grep -n "DEFAULT_CREDIBILITY_THRESHOLD" src/tools/search/credibility_scorer.ts`.
- [ ] Confirm the `search.agent.md` AOD file contains the section heading `## CredibilityScorer`.
