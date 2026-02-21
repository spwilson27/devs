# Task: Define ContentExtractor Interface and Adapter Pattern (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [TAS-028], [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/tools/content_extractor/__tests__/content_extractor.interface.test.ts`.
- [ ] Write a test that imports `IContentExtractor` from `src/tools/content_extractor/types.ts` and asserts the interface has the following signature: `extract(url: string, options?: ExtractOptions): Promise<ExtractResult>`.
- [ ] Write a test that imports `ExtractResult` type and asserts it contains the fields: `markdown: string`, `sourceUrl: string`, `extractedAt: Date`, `noiseStripped: boolean`, `adCount: number`, `navCount: number`.
- [ ] Write a test that imports `ExtractOptions` type and asserts it contains the optional fields: `timeout?: number`, `waitForSelector?: string`, `sanitize?: boolean`.
- [ ] Write a test asserting that a class implementing `IContentExtractor` but missing the `extract` method causes a TypeScript compile error (using `ts-expect-error` or `dtslint`-style checks).
- [ ] Write a test that imports `ContentExtractorFactory` from `src/tools/content_extractor/factory.ts` and asserts it has a static method `create(provider: 'firecrawl' | 'jina'): IContentExtractor`.
- [ ] Write a test that `ContentExtractorFactory.create('firecrawl')` returns an instance implementing `IContentExtractor`.
- [ ] Write a test that `ContentExtractorFactory.create('jina')` returns an instance implementing `IContentExtractor`.
- [ ] Write a test that `ContentExtractorFactory.create('unknown' as any)` throws an `UnsupportedProviderError`.

## 2. Task Implementation
- [ ] Create `src/tools/content_extractor/types.ts` and export:
  - `ExtractOptions` interface with fields: `timeout?: number` (default 30000), `waitForSelector?: string`, `sanitize?: boolean` (default true).
  - `ExtractResult` interface with fields: `markdown: string`, `sourceUrl: string`, `extractedAt: Date`, `noiseStripped: boolean`, `adCount: number`, `navCount: number`.
  - `IContentExtractor` interface with method: `extract(url: string, options?: ExtractOptions): Promise<ExtractResult>`.
- [ ] Create `src/tools/content_extractor/errors.ts` and export:
  - `UnsupportedProviderError extends Error` with a `provider: string` field.
  - `ExtractionFailedError extends Error` with `url: string` and `cause: unknown` fields.
- [ ] Create `src/tools/content_extractor/factory.ts`:
  - Export `ContentExtractorFactory` class with a static `create(provider: 'firecrawl' | 'jina'): IContentExtractor` method.
  - The method should import and instantiate `FirecrawlExtractor` or `JinaExtractor` lazily based on the provider string.
  - Throw `UnsupportedProviderError` for any unrecognized provider string.
- [ ] Create stub files `src/tools/content_extractor/adapters/firecrawl_extractor.ts` and `src/tools/content_extractor/adapters/jina_extractor.ts` that export classes implementing `IContentExtractor` but throw `new Error('Not implemented')` in the `extract` method body (stubs to be implemented in subsequent tasks).
- [ ] Create `src/tools/content_extractor/index.ts` re-exporting everything from `types.ts`, `errors.ts`, and `factory.ts`.

## 3. Code Review
- [ ] Verify that `IContentExtractor` is a pure TypeScript interface (no `class` keyword) and is not coupled to any specific SDK.
- [ ] Verify that `ContentExtractorFactory` uses lazy `require`/dynamic `import()` so that neither Firecrawl nor Jina SDK is loaded if not used.
- [ ] Verify that all exported types use named exports (not default exports) for tree-shaking compatibility.
- [ ] Verify that `errors.ts` classes correctly set `this.name` in their constructors for accurate stack trace labelling.
- [ ] Verify that no circular imports exist between `types.ts`, `errors.ts`, and `factory.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/tools/content_extractor/__tests__/content_extractor.interface.test.ts --coverage` and confirm all tests pass with 100% statement coverage on `factory.ts`, `types.ts`, and `errors.ts`.
- [ ] Run `npx tsc --noEmit` from the project root and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/tools/content_extractor/content_extractor.agent.md` with the following sections:
  - **Purpose**: Describes that this module provides a provider-agnostic interface for web content extraction.
  - **Providers**: Lists `firecrawl` and `jina` as available providers.
  - **Interface contract**: Documents `IContentExtractor.extract()` signature and the `ExtractResult` fields.
  - **Factory usage**: Code snippet showing `ContentExtractorFactory.create('firecrawl').extract(url)`.
  - **Error handling**: Documents `UnsupportedProviderError` and `ExtractionFailedError`.
- [ ] Append an entry to `docs/aod/phase_5_components.md` under the heading `## Content Extraction Tools` documenting the interface module.

## 6. Automated Verification
- [ ] Run `node -e "const {ContentExtractorFactory} = require('./dist/tools/content_extractor'); console.log(typeof ContentExtractorFactory.create)"` and assert it prints `function`.
- [ ] Run the project's lint script (`npm run lint`) and confirm zero lint errors in `src/tools/content_extractor/`.
- [ ] Confirm that the AOD density requirement is met: `ls src/tools/content_extractor/*.agent.md | wc -l` returns at least `1`.
