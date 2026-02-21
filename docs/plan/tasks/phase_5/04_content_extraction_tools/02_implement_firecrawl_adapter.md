# Task: Implement Firecrawl Adapter for ContentExtractor (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [TAS-028], [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/tools/content_extractor/__tests__/firecrawl_extractor.test.ts`.
- [ ] Mock the `@mendable/firecrawl-js` SDK module using `jest.mock('@mendable/firecrawl-js')`.
- [ ] Write a test that `FirecrawlExtractor` can be instantiated with a valid API key string and that it stores the key internally.
- [ ] Write a test that `FirecrawlExtractor.extract(url)` calls `FirecrawlApp.scrapeUrl()` with the correct URL and options (`{ formats: ['markdown'] }`).
- [ ] Write a test that when `scrapeUrl` resolves successfully, `extract()` returns an `ExtractResult` where `markdown` equals the SDK's returned markdown, `sourceUrl` equals the input URL, `noiseStripped` is `true`, `adCount` is a non-negative integer, and `navCount` is a non-negative integer.
- [ ] Write a test that when `scrapeUrl` returns an empty or null markdown field, `extract()` throws `ExtractionFailedError` with the correct `url` and `cause`.
- [ ] Write a test that when `scrapeUrl` throws a network error, `extract()` re-throws it wrapped in `ExtractionFailedError`.
- [ ] Write a test that the `ExtractOptions.timeout` value (if provided) is forwarded to the underlying Firecrawl SDK call.
- [ ] Write a test that `ExtractOptions.waitForSelector` is forwarded to Firecrawl's `actions` or appropriate option.
- [ ] Write an integration test (tagged `@integration`) in `src/tools/content_extractor/__tests__/firecrawl_extractor.integration.test.ts` that calls the real Firecrawl API against `https://example.com` (skipped if `FIRECRAWL_API_KEY` env var is not set), asserting the returned `markdown` contains the string `"Example Domain"` and `noiseStripped` is `true`.

## 2. Task Implementation
- [ ] Install the Firecrawl SDK: `npm install @mendable/firecrawl-js`.
- [ ] Implement `src/tools/content_extractor/adapters/firecrawl_extractor.ts`:
  - Export `FirecrawlExtractor` class implementing `IContentExtractor`.
  - Constructor accepts `apiKey: string`.
  - Internally instantiate `FirecrawlApp` from `@mendable/firecrawl-js` with the provided API key.
  - `extract(url, options)`: Call `firecrawlApp.scrapeUrl(url, { formats: ['markdown'], timeout: options?.timeout ?? 30000, actions: options?.waitForSelector ? [{ type: 'wait', selector: options.waitForSelector }] : undefined })`.
  - Parse the SDK result; if `result.markdown` is falsy, throw `ExtractionFailedError`.
  - Count stripped noise: scan the raw HTML (if available) for `<nav>` and `<a class="ad">` elements using a lightweight regex, populate `adCount` and `navCount`.
  - Return a fully populated `ExtractResult` with `extractedAt: new Date()` and `noiseStripped: true`.
- [ ] Add `FIRECRAWL_API_KEY` to the project's `.env.example` file with a placeholder value and a descriptive comment.
- [ ] Create `src/tools/content_extractor/adapters/index.ts` re-exporting `FirecrawlExtractor` (and later `JinaExtractor`).

## 3. Code Review
- [ ] Verify that `FirecrawlExtractor` never logs raw API keys to stdout or any logger.
- [ ] Verify that the adapter contains zero business logic beyond adapting the Firecrawl SDK to the `IContentExtractor` interface.
- [ ] Verify that error wrapping always includes the original error as the `cause` field of `ExtractionFailedError`.
- [ ] Verify that `adCount` and `navCount` computation is isolated into a private helper method `countNoiseElements(rawHtml: string): { adCount: number; navCount: number }` for testability.
- [ ] Verify that `timeout` has a sensible default (30000 ms) and is not hard-coded outside of the default parameter.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/tools/content_extractor/__tests__/firecrawl_extractor.test.ts --coverage` and confirm all unit tests pass with ≥90% branch coverage on `firecrawl_extractor.ts`.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Optionally run integration tests: `FIRECRAWL_API_KEY=<key> npx jest --testPathPattern=firecrawl_extractor.integration`.

## 5. Update Documentation
- [ ] Update `src/tools/content_extractor/content_extractor.agent.md` with a new section `### Firecrawl Adapter` documenting:
  - Required environment variable: `FIRECRAWL_API_KEY`.
  - SPA/dynamic page support via Firecrawl's JavaScript rendering.
  - Noise-stripping behavior (`adCount`, `navCount` fields).
- [ ] Update `.env.example` (if not already done in implementation) with `FIRECRAWL_API_KEY=<your-key-here> # Required for Firecrawl ContentExtractor adapter`.

## 6. Automated Verification
- [ ] Run `npx jest src/tools/content_extractor/__tests__/firecrawl_extractor.test.ts --json --outputFile=/tmp/firecrawl_results.json && node -e "const r=require('/tmp/firecrawl_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `grep -r 'FIRECRAWL_API_KEY' .env.example` and confirm the key is documented.
- [ ] Run `npm run lint src/tools/content_extractor/adapters/firecrawl_extractor.ts` and confirm zero errors.
