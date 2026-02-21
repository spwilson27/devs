# Task: Implement Jina Reader Adapter for ContentExtractor (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [TAS-028], [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/tools/content_extractor/__tests__/jina_extractor.test.ts`.
- [ ] Mock the Node.js `fetch` global (or `node-fetch`) using `jest.spyOn(global, 'fetch')`.
- [ ] Write a test that `JinaExtractor` can be instantiated with a valid API key string.
- [ ] Write a test that `JinaExtractor.extract(url)` makes an HTTPS GET request to `https://r.jina.ai/<encoded-url>` with the header `Authorization: Bearer <apiKey>` and `Accept: application/json`.
- [ ] Write a test that when the Jina API returns a successful JSON response `{ code: 200, data: { content: "# Title\n...", url: "..." } }`, `extract()` returns an `ExtractResult` where `markdown` equals `data.content`, `sourceUrl` equals the input URL, and `noiseStripped` is `true`.
- [ ] Write a test that when the Jina API returns a non-200 HTTP status, `extract()` throws `ExtractionFailedError` with the correct `url`.
- [ ] Write a test that when the Jina API returns `code !== 200` in the JSON body, `extract()` throws `ExtractionFailedError`.
- [ ] Write a test that when `fetch` throws a network error, `extract()` re-throws it wrapped in `ExtractionFailedError`.
- [ ] Write a test that `ExtractOptions.timeout` is used as the `AbortSignal` timeout for the fetch call.
- [ ] Write an integration test (tagged `@integration`) in `src/tools/content_extractor/__tests__/jina_extractor.integration.test.ts` that calls the real Jina Reader API against `https://example.com` (skipped if `JINA_API_KEY` env var is not set), asserting the returned `markdown` is a non-empty string and `noiseStripped` is `true`.

## 2. Task Implementation
- [ ] Implement `src/tools/content_extractor/adapters/jina_extractor.ts`:
  - Export `JinaExtractor` class implementing `IContentExtractor`.
  - Constructor accepts `apiKey: string`.
  - `extract(url, options)`: Build request URL as `https://r.jina.ai/${encodeURIComponent(url)}`. Set headers: `Authorization: Bearer ${this.apiKey}`, `Accept: application/json`, `X-Return-Format: markdown`.
  - Use `fetch` with `AbortSignal.timeout(options?.timeout ?? 30000)`.
  - If the HTTP response is not ok (`!response.ok`), throw `ExtractionFailedError`.
  - Parse JSON; if `body.code !== 200` or `!body.data?.content`, throw `ExtractionFailedError`.
  - Compute `adCount` and `navCount` using the shared `countNoiseElements` utility (extract to `src/tools/content_extractor/utils/noise_counter.ts`).
  - Return a fully populated `ExtractResult` with `noiseStripped: true` and `extractedAt: new Date()`.
- [ ] Create `src/tools/content_extractor/utils/noise_counter.ts` exporting `countNoiseElements(markdown: string): { adCount: number; navCount: number }`. Use heuristic regex patterns on the markdown text (e.g., count `[Ad]` labels, count navigation link clusters) since raw HTML is not available.
- [ ] Update `src/tools/content_extractor/adapters/index.ts` to also re-export `JinaExtractor`.
- [ ] Add `JINA_API_KEY` to `.env.example` with a placeholder and comment.

## 3. Code Review
- [ ] Verify that `JinaExtractor` uses the standard `fetch` API (Node 18+) rather than any third-party HTTP library, to minimize dependencies.
- [ ] Verify that `AbortSignal.timeout()` is used for timeout handling, not `setTimeout` + manual abort.
- [ ] Verify that `noise_counter.ts` is imported by both `firecrawl_extractor.ts` (replacing its inline regex) and `jina_extractor.ts`, eliminating code duplication.
- [ ] Verify that the Jina API key is never logged or serialized to disk.
- [ ] Verify the URL encoding: `encodeURIComponent` must be used (not `encodeURI`) to correctly encode special characters in the target URL.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/tools/content_extractor/__tests__/jina_extractor.test.ts --coverage` and confirm all unit tests pass with ≥90% branch coverage on `jina_extractor.ts`.
- [ ] Run `npx jest src/tools/content_extractor/__tests__/ --coverage` (all extractor tests) and confirm the combined coverage for the `adapters/` directory is ≥90%.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Update `src/tools/content_extractor/content_extractor.agent.md` with a new section `### Jina Reader Adapter` documenting:
  - Required environment variable: `JINA_API_KEY`.
  - Jina Reader endpoint format: `https://r.jina.ai/<url>`.
  - Differences from Firecrawl: no browser rendering, faster, lower cost.
  - When to prefer Jina vs Firecrawl.
- [ ] Update `.env.example` with `JINA_API_KEY=<your-key-here> # Required for Jina ContentExtractor adapter`.
- [ ] Document `noise_counter.ts` in `src/tools/content_extractor/utils/utils.agent.md`.

## 6. Automated Verification
- [ ] Run `npx jest src/tools/content_extractor/__tests__/jina_extractor.test.ts --json --outputFile=/tmp/jina_results.json && node -e "const r=require('/tmp/jina_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `grep -r 'JINA_API_KEY' .env.example` and confirm the key is documented.
- [ ] Run `npx jest src/tools/content_extractor/ --coverage --coverageThreshold='{"global":{"branches":90}}' ` and confirm the threshold is met.
