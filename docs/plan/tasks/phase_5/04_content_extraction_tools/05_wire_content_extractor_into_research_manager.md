# Task: Wire ContentExtractor into ResearchManager via Dependency Injection (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [TAS-028], [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/agents/research_manager/__tests__/research_manager_content_extractor.test.ts`.
- [ ] Mock `IContentExtractor` using a hand-rolled Jest mock object: `{ extract: jest.fn() }`.
- [ ] Write a test that `ResearchManager` can be instantiated with an `IContentExtractor` injected via its constructor.
- [ ] Write a test that `ResearchManager.extractContent(url: string)` calls `this.contentExtractor.extract(url)` exactly once with the correct URL.
- [ ] Write a test that when `contentExtractor.extract()` resolves, `extractContent()` returns the `ExtractResult` unchanged.
- [ ] Write a test that when `contentExtractor.extract()` throws `ExtractionFailedError`, `ResearchManager.extractContent()` catches it, logs a warning, and returns `null` (graceful degradation — the research stream should not die due to a single URL failure).
- [ ] Write a test that `ResearchManager.extractAllUrls(urls: string[])` calls `extract` in parallel for all provided URLs (verify that all mock calls are triggered before any await resolves, using `Promise.allSettled` semantics).
- [ ] Write a test that `extractAllUrls` correctly filters out `null` results from failed extractions and returns only successful `ExtractResult[]`.

## 2. Task Implementation
- [ ] Update `ResearchManager` constructor in `src/agents/research_manager/research_manager.ts` to accept `contentExtractor: IContentExtractor` as a required constructor parameter. Store it as `private readonly contentExtractor: IContentExtractor`.
- [ ] Add `extractContent(url: string): Promise<ExtractResult | null>` method to `ResearchManager`:
  - Calls `this.contentExtractor.extract(url)`.
  - On success: returns the `ExtractResult`.
  - On `ExtractionFailedError`: logs `[ResearchManager] Extraction failed for ${url}: ${error.message}` to the project logger at `warn` level and returns `null`.
- [ ] Add `extractAllUrls(urls: string[]): Promise<ExtractResult[]>` method:
  - Uses `Promise.allSettled(urls.map(url => this.extractContent(url)))`.
  - Filters settled results to only fulfilled non-null values.
  - Returns `ExtractResult[]`.
- [ ] Update the `ResearchManager` factory/bootstrap code (e.g., `src/agents/research_manager/factory.ts` or the DI container) to create a `ContentExtractor` using `ContentExtractorFactory.create(process.env.CONTENT_EXTRACTOR_PROVIDER ?? 'firecrawl')` and inject it into `ResearchManager`.
- [ ] Add `CONTENT_EXTRACTOR_PROVIDER` to `.env.example` with value `firecrawl` and a comment listing valid values (`firecrawl`, `jina`).

## 3. Code Review
- [ ] Verify that `ResearchManager` depends only on `IContentExtractor` (the interface), never on `FirecrawlExtractor` or `JinaExtractor` directly — confirming the Dependency Inversion Principle.
- [ ] Verify that `extractAllUrls` uses `Promise.allSettled` (not `Promise.all`) to prevent a single URL failure from aborting the entire extraction batch.
- [ ] Verify that the logger call in the catch block uses the project's shared logger instance (not `console.warn`), consistent with other agents.
- [ ] Verify that the `CONTENT_EXTRACTOR_PROVIDER` environment variable is validated at startup (i.e., `ContentExtractorFactory.create()` throws early with a clear error if an invalid provider is configured).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/agents/research_manager/__tests__/research_manager_content_extractor.test.ts --coverage` and confirm all tests pass.
- [ ] Run `npx jest src/agents/research_manager/ --coverage` and confirm no regressions in existing `ResearchManager` tests.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Update `src/agents/research_manager/research_manager.agent.md` with a section `## Content Extraction` documenting:
  - The `IContentExtractor` injection point.
  - The `extractContent` graceful degradation behavior.
  - The `extractAllUrls` parallel execution behavior.
  - The `CONTENT_EXTRACTOR_PROVIDER` environment variable.
- [ ] Update `.env.example` comment for `CONTENT_EXTRACTOR_PROVIDER` to list valid values.

## 6. Automated Verification
- [ ] Run `npx jest src/agents/research_manager/__tests__/research_manager_content_extractor.test.ts --json --outputFile=/tmp/rm_extractor_results.json && node -e "const r=require('/tmp/rm_extractor_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `grep -r 'CONTENT_EXTRACTOR_PROVIDER' .env.example` and confirm the variable is documented.
- [ ] Run `npm run lint src/agents/research_manager/research_manager.ts` and confirm zero errors.
