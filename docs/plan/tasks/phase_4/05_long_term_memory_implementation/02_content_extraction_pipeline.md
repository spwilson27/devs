# Task: Web Content Extraction Pipeline for Memory Ingestion (Sub-Epic: 05_Long_Term_Memory_Implementation)

## Covered Requirements
- [TAS-028]

## 1. Initial Test Written

- [ ] In `packages/memory/src/__tests__/content-extraction.test.ts`, write a test suite `describe('ContentExtractor')` that:
  - Mocks the Firecrawl API client (`@mendable/firecrawl-js`) and Jina Reader HTTP endpoint.
  - Tests `extractContent({ url: 'https://example.com', strategy: 'firecrawl' })`:
    - Asserts that it calls `FirecrawlApp.scrapeUrl(url, { formats: ['markdown'] })`.
    - Asserts that it returns a `ContentExtractionResult` object with `{ markdown: string, title: string, url: string, extractedAt: number }`.
    - Asserts that the returned `markdown` is non-empty and that `extractedAt` is a Unix timestamp in milliseconds.
  - Tests `extractContent({ url: 'https://example.com', strategy: 'jina' })`:
    - Asserts that it calls `fetch('https://r.jina.ai/https://example.com')` with the correct `Authorization: Bearer <JINA_API_KEY>` header.
    - Asserts that the response body (plain text Markdown from Jina) is parsed and returned as `ContentExtractionResult.markdown`.
  - Tests the fallback logic: when Firecrawl fails with a network error, `extractContent` automatically retries with Jina if `strategy: 'auto'` is set.
  - Tests that `extractContent` throws `ContentExtractionError` with a descriptive message when both strategies fail.
  - Tests that content longer than 500,000 characters is truncated to 500,000 characters, with a `truncated: true` flag on the result.
- [ ] Write an integration test (tagged `@integration`) in `packages/memory/src/__tests__/content-extraction.integration.test.ts` that:
  - Uses a real HTTP call to `https://r.jina.ai/https://example.com` (skip if `JINA_API_KEY` not set via `process.env`).
  - Asserts the returned markdown is non-empty and contains recognizable content.

## 2. Task Implementation

- [ ] Install `@mendable/firecrawl-js` as a dependency in `packages/memory/package.json`.
- [ ] Create `packages/memory/src/extraction/types.ts` defining:
  ```typescript
  export interface ContentExtractionResult {
    markdown: string;
    title: string;
    url: string;
    extractedAt: number;
    truncated: boolean;
    strategy: 'firecrawl' | 'jina';
  }
  export class ContentExtractionError extends Error {
    constructor(message: string, public readonly url: string, public readonly strategies: string[]) {
      super(message);
      this.name = 'ContentExtractionError';
    }
  }
  export type ExtractionStrategy = 'firecrawl' | 'jina' | 'auto';
  ```
- [ ] Create `packages/memory/src/extraction/firecrawl.ts` exporting `extractViaFirecrawl(url: string): Promise<ContentExtractionResult>`:
  - Initialize `FirecrawlApp` with `apiKey: process.env.FIRECRAWL_API_KEY`.
  - Call `app.scrapeUrl(url, { formats: ['markdown'] })`.
  - Parse the response: map `response.markdown` to `ContentExtractionResult.markdown`, `response.metadata?.title` to `title`.
  - Set `extractedAt: Date.now()`, `strategy: 'firecrawl'`.
  - Apply truncation at 500,000 characters.
- [ ] Create `packages/memory/src/extraction/jina.ts` exporting `extractViaJina(url: string): Promise<ContentExtractionResult>`:
  - Call `fetch(`https://r.jina.ai/${url}`, { headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}`, Accept: 'text/plain' } })`.
  - On non-200 response, throw `ContentExtractionError`.
  - Parse plain-text response body as `markdown`.
  - Extract title from the first `# ` heading in the markdown if present.
  - Apply truncation at 500,000 characters.
- [ ] Create `packages/memory/src/extraction/extractor.ts` exporting `extractContent(opts: { url: string; strategy: ExtractionStrategy }): Promise<ContentExtractionResult>`:
  - If `strategy === 'firecrawl'`: call `extractViaFirecrawl(url)`.
  - If `strategy === 'jina'`: call `extractViaJina(url)`.
  - If `strategy === 'auto'`: try Firecrawl first; on any thrown error, fall back to Jina; if both fail, throw `ContentExtractionError`.
- [ ] Re-export `extractContent`, `ContentExtractionResult`, `ContentExtractionError`, `ExtractionStrategy` from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify that `FIRECRAWL_API_KEY` and `JINA_API_KEY` are never logged or included in error messages to prevent credential leakage.
- [ ] Verify that the truncation logic in both extractors is identical and extracted to a shared utility `packages/memory/src/extraction/utils.ts` (`truncateContent(text: string, maxChars: number): { text: string; truncated: boolean }`).
- [ ] Verify that all network calls have a configurable timeout (default 30 seconds), passed via an optional `timeoutMs` parameter.
- [ ] Verify the fallback in `auto` mode is tested and logs a `console.warn` (not `console.error`) when Firecrawl fails and Jina is used as fallback.
- [ ] Verify there are zero unhandled promise rejections: all `fetch` calls are wrapped in try/catch.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="content-extraction.test"` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.
- [ ] Optionally run integration tests: `JINA_API_KEY=<key> pnpm --filter @devs/memory test -- --testPathPattern="content-extraction.integration"`.

## 5. Update Documentation

- [ ] Add a section `## Content Extraction` to `packages/memory/README.md` documenting:
  - Available strategies (`firecrawl`, `jina`, `auto`).
  - Required environment variables (`FIRECRAWL_API_KEY`, `JINA_API_KEY`).
  - The 500,000 character truncation limit.
  - The fallback behavior in `auto` mode.
- [ ] Update `specs/2_tas.md` to confirm that both Firecrawl and Jina Reader are supported with `auto` fallback, per [TAS-028].
- [ ] Add to agent memory: "Content extraction for web URLs uses Firecrawl (primary) and Jina Reader (fallback). Max content size: 500k chars. Strategy default: `auto`."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="content-extraction.test" --reporter=json > test-results/content-extraction.json` and assert exit code `0`.
- [ ] Assert `jq '.testResults[].assertionResults[] | select(.status == "failed")' test-results/content-extraction.json | wc -l` equals `0`.
- [ ] Assert that the TypeScript output `dist/extraction/extractor.js` exists after build: `test -f packages/memory/dist/extraction/extractor.js && echo PASS || echo FAIL`.
