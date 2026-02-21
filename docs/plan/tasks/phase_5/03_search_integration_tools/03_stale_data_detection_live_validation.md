# Task: Stale Data Detection & Live Library Validation (Sub-Epic: 03_Search Integration Tools)

## Covered Requirements
- [1_PRD-REQ-RES-006], [TAS-027]

## 1. Initial Test Written
- [ ] Create `src/tools/search/__tests__/stale_data_validator.test.ts`.
- [ ] Write a unit test verifying `StaleDataValidator.validateLibrary(name: string, ecosystem: 'npm' | 'pypi' | 'cargo' | 'generic'): Promise<LibraryValidationResult>` resolves to a `LibraryValidationResult` containing `isDeprecated: boolean`, `lastPublished: string | null`, `latestVersion: string | null`, `confidence: number`, and `sourceUrl: string`.
- [ ] Write a unit test (with mocked `SerperClient`) verifying that when the search results for a library contain the word "deprecated" or "archived" in the top snippet, `isDeprecated` is `true` and `confidence` is ≥ 0.8.
- [ ] Write a unit test verifying that when search results contain a snippet with a date within the last 6 months and no deprecation signals, `isDeprecated` is `false` and `confidence` is ≥ 0.7.
- [ ] Write a unit test verifying `StaleDataValidator.validateLibraries(libraries: LibraryRef[]): Promise<ValidationReport>` calls `validateLibrary` for each entry in the array and returns a `ValidationReport` with a `results` array and `deprecatedCount: number`.
- [ ] Write a unit test verifying that if `validateLibrary` is called for an `npm` ecosystem library, the search query sent to `SerperClient.search()` includes `site:npmjs.com OR site:github.com` and the library name.
- [ ] Write a unit test verifying that if `validateLibrary` is called for a `pypi` library, the query includes `site:pypi.org OR site:github.com` and the library name.
- [ ] Write a unit test verifying `StaleDataValidator` uses `dateRange: 'qdr:y'` (last year) in its `SearchOptions` to enforce recency of search results.
- [ ] Write a unit test verifying that libraries with `confidence < 0.5` are flagged with `requiresManualReview: true` in the `LibraryValidationResult`.

## 2. Task Implementation
- [ ] Add to `src/tools/search/types.ts`:
  - `LibraryRef`: `{ name: string; ecosystem: 'npm' | 'pypi' | 'cargo' | 'generic'; version?: string }`.
  - `LibraryValidationResult`: `{ library: LibraryRef; isDeprecated: boolean; lastPublished: string | null; latestVersion: string | null; confidence: number; sourceUrl: string; requiresManualReview: boolean }`.
  - `ValidationReport`: `{ results: LibraryValidationResult[]; deprecatedCount: number; requiresManualReviewCount: number; validatedAt: string }`.
- [ ] Create `src/tools/search/stale_data_validator.ts` implementing the `StaleDataValidator` class:
  - Constructor accepts a `SerperClient` instance (injected via constructor, not instantiated internally, for testability).
  - Implement `private buildQuery(library: LibraryRef): string` that generates an ecosystem-specific search query:
    - `npm`: `"<name>" site:npmjs.com OR site:github.com deprecated OR latest version`
    - `pypi`: `"<name>" site:pypi.org OR site:github.com deprecated OR latest version`
    - `cargo`: `"<name>" site:crates.io OR site:github.com deprecated OR latest version`
    - `generic`: `"<name>" library deprecated OR latest release OR documentation`
  - Implement `async validateLibrary(library: LibraryRef): Promise<LibraryValidationResult>`:
    - Calls `SerperClient.search(query, { dateRange: 'qdr:y', num: 5 })`.
    - Runs results through `CredibilityScorer.scoreAll()`.
    - Analyzes top credible result snippets for deprecation signals: keywords `deprecated`, `archived`, `end-of-life`, `no longer maintained`, `unmaintained`.
    - Extracts version/date information using regex patterns from snippets.
    - Calculates `confidence` based on `CredibilityScore.value` of the best matching result.
    - Sets `requiresManualReview: true` if `confidence < 0.5`.
  - Implement `async validateLibraries(libraries: LibraryRef[]): Promise<ValidationReport>`:
    - Processes libraries sequentially (not parallel) to respect rate limits.
    - Returns a `ValidationReport` with aggregated statistics.
- [ ] Export `StaleDataValidator` and new types from `src/tools/search/index.ts`.

## 3. Code Review
- [ ] Verify `StaleDataValidator` takes `SerperClient` as a constructor argument (dependency injection), not a global singleton, so it can be tested with a mock client.
- [ ] Verify `buildQuery` is a pure function with no side effects.
- [ ] Verify the deprecation keyword list is defined as a named constant `DEPRECATION_SIGNALS: string[]` at the module level.
- [ ] Verify `validateLibraries` does **not** use `Promise.all` (sequential execution is required to avoid Serper rate limits — this is intentional and should be commented in the code).
- [ ] Verify `LibraryValidationResult.validatedAt` is an ISO 8601 timestamp (from `new Date().toISOString()`).
- [ ] Verify there is no hardcoded threshold `0.5` — it should be `MANUAL_REVIEW_CONFIDENCE_THRESHOLD = 0.5`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=stale_data_validator` and confirm all unit tests pass.
- [ ] Run the linter and confirm 0 errors.

## 5. Update Documentation
- [ ] Update `src/tools/search/search.agent.md` adding a section `## StaleDataValidator` documenting: its purpose, the `LibraryRef` input type, the `ValidationReport` output type, the ecosystem-specific query strategies, and the deprecation signal keywords.
- [ ] Add a note in `docs/research_phase.md` (create if absent) explaining that all library recommendations generated by research agents must pass through `StaleDataValidator` before being included in any research report.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern=stale_data_validator` and confirm coverage for `src/tools/search/stale_data_validator.ts` is ≥ 90% for statements and branches.
- [ ] Confirm `DEPRECATION_SIGNALS` constant exists: `grep -n "DEPRECATION_SIGNALS" src/tools/search/stale_data_validator.ts`.
- [ ] Confirm `MANUAL_REVIEW_CONFIDENCE_THRESHOLD` constant exists: `grep -n "MANUAL_REVIEW_CONFIDENCE_THRESHOLD" src/tools/search/stale_data_validator.ts`.
- [ ] Confirm `Promise.all` is not used in `stale_data_validator.ts`: `grep -n "Promise.all" src/tools/search/stale_data_validator.ts` should return no results.
