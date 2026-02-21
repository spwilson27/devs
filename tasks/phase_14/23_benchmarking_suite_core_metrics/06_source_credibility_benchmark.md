# Task: Source Credibility Benchmark for Research Reports (Sub-Epic: 23_Benchmarking Suite Core Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-025]

## 1. Initial Test Written
- [ ] Create `src/benchmarking/__tests__/suites/SourceCredibilitySuite.test.ts`.
- [ ] Write a unit test asserting `SourceCredibilitySuite` implements `IBenchmarkSuite` with `name === 'SourceCredibilitySuite'` and `requirmentIds` containing `'9_ROADMAP-REQ-025'`.
- [ ] Write a unit test with a mock research report containing 5 citations, all with URLs and all returning `confidenceScore > 0.8` from the mocked `CredibilityScorer`. Assert `metrics.citationsWithUrl === 5`, `metrics.citationsAboveThreshold === 5`, `metrics.coverageRate === 1.0`, `status === 'pass'`.
- [ ] Write a unit test where one citation has no URL. Assert `metrics.citationsWithUrl === 4`, `metrics.coverageRate < 1.0`, `status === 'fail'`.
- [ ] Write a unit test where one citation has a URL but `confidenceScore === 0.7` (below threshold). Assert `metrics.citationsAboveThreshold === 4` (out of 5), `status === 'fail'`.
- [ ] Write a unit test asserting `execute()` returns `status === 'pass'` only when BOTH `coverageRate === 1.0` AND `metrics.belowThresholdCount === 0`.
- [ ] Create `src/benchmarking/__tests__/CredibilityScorer.test.ts`:
  - Write a unit test asserting `CredibilityScorer.score(citation)` returns a `number` between 0.0 and 1.0.
  - Write a unit test asserting a citation from a known high-quality domain (e.g., `arxiv.org`, `github.com`, `docs.anthropic.com`) returns `score >= 0.8`.
  - Write a unit test asserting a citation with no URL returns `score === 0.0`.
  - Write a unit test asserting a citation with a URL that returns HTTP 404 (mocked via `nock` or `jest-fetch-mock`) returns `score < 0.5`.

## 2. Task Implementation
- [ ] Create `src/benchmarking/types/researchReport.ts` and define:
  - `Citation`: `{ id: string; text: string; url?: string; confidenceScore?: number; domain?: string }`.
  - `ResearchReport`: `{ title: string; phase: string; citations: Citation[]; generatedAt: string }`.
- [ ] Create `src/benchmarking/CredibilityScorer.ts`:
  - `score(citation: Citation): Promise<number>` — deterministic scoring algorithm:
    1. If `citation.url` is absent or empty, return `0.0`.
    2. Parse the URL and extract the domain.
    3. Check the domain against a hardcoded allowlist of high-credibility domains (e.g., `arxiv.org`, `github.com`, `npmjs.com`, `developer.mozilla.org`, `docs.anthropic.com`, `cloud.google.com`); if matched, start score at `0.9`.
    4. Make an HTTP HEAD request to the URL (timeout: 5s); if status is 2xx or 3xx, add `0.05`; if 4xx or 5xx, subtract `0.3`.
    5. If `citation.confidenceScore` is already set by the research agent (from its own grounding metadata), use it as a weighted input: `finalScore = 0.6 * computedScore + 0.4 * citation.confidenceScore`.
    6. Clamp result to `[0.0, 1.0]` and return.
- [ ] Create `src/benchmarking/suites/SourceCredibilitySuite.ts` implementing `IBenchmarkSuite`:
  - `name = 'SourceCredibilitySuite'`
  - `requirmentIds = ['9_ROADMAP-REQ-025']`
  - Constructor accepts `SourceCredibilityConfig`: `{ reportsGlob: string; confidenceThreshold: number }`. Default: `confidenceThreshold: 0.8`, `reportsGlob: 'docs/research/**/*.json'`.
  - `execute()`:
    1. Glob `reportsGlob` to find all research report JSON files.
    2. Parse each into `ResearchReport`.
    3. For each citation in each report, call `CredibilityScorer.score(citation)`.
    4. Track: `totalCitations`, `citationsWithUrl`, `citationsAboveThreshold`, `belowThresholdCount`.
    5. Compute `coverageRate = citationsWithUrl / totalCitations`.
    6. Compute `aboveThresholdRate = citationsAboveThreshold / citationsWithUrl` (guard zero-divide).
    7. Return `SuiteResult` with `metrics: { totalCitations, citationsWithUrl, citationsAboveThreshold, belowThresholdCount, coverageRate, aboveThresholdRate, reportsScanned }`.
    8. `status = (coverageRate === 1.0 && belowThresholdCount === 0) ? 'pass' : 'fail'`.
    9. Include `details`: `"Scanned {reportsScanned} reports, {totalCitations} citations. Coverage: {coverageRate*100:.1f}%. Above threshold: {citationsAboveThreshold}/{citationsWithUrl}"`.
- [ ] Register `SourceCredibilitySuite` in `src/benchmarking/index.ts`.
- [ ] Ensure `CredibilityScorer` uses a configurable HTTP client (default: Node `fetch`) so it can be mocked in tests without `nock` patching global state.

## 3. Code Review
- [ ] Verify HTTP requests in `CredibilityScorer` use a 5-second timeout and do not throw on network errors (catch and return a low score instead).
- [ ] Verify `SourceCredibilitySuite.execute()` runs `CredibilityScorer.score()` calls with `Promise.allSettled` (parallel, capped at 10 concurrent) for performance; do not use sequential `await` in a loop.
- [ ] Verify the `reportsGlob` pattern is validated at construction time; throw a descriptive error if the glob matches zero files.
- [ ] Verify the `CitationCredibilityConfig` default threshold (`0.8`) matches the requirement exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/SourceCredibilitySuite"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/CredibilityScorer"` and confirm all tests pass.
- [ ] Run `npm run build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/benchmarking/suites/source-credibility.agent.md` documenting: the `CredibilityScorer` algorithm, the high-credibility domain allowlist and how to extend it, the `reportsGlob` pattern, the confidence threshold, and how to add research reports to the scan path.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/benchmarking/__tests__/suites/SourceCredibilitySuite|src/benchmarking/__tests__/CredibilityScorer" --coverage` and confirm ≥ 90% line coverage for `SourceCredibilitySuite.ts` and `CredibilityScorer.ts`.
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
- [ ] Confirm `src/benchmarking/suites/source-credibility.agent.md` exists.
