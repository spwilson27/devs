# Task: Implement ContentExtractor Benchmark Suite (Sub-Epic: 24_Benchmarking Suite Document and Quality Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/contentExtractor.bench.ts` with the following test cases:
  - **Unit test**: Mock an SPA HTML response (include `<nav>`, `<header>`, `<footer>`, `<aside>`, banner `<div>` with class `ad`/`advertisement`/`sponsored`) and assert that `ContentExtractor.extract()` returns Markdown containing zero occurrences of those navigation/ad elements.
  - **Integration test**: Provide a fixture HTML file at `src/benchmarks/fixtures/spa_sample.html` that simulates a real-world SPA page with dynamic content sections (`<main>` body), navigation sidebar, and cookie banner. Assert that the extracted Markdown string:
    1. Contains the `<main>` body content verbatim (no HTML tags).
    2. Does NOT contain any text from navigation, header, footer, or ad sections.
    3. Is valid Markdown (no raw `<script>`, `<style>` tags remain).
  - **Benchmark metric test**: Write a test that runs the extractor over a batch of 50 fixture HTML files and asserts that the noise-strip success rate equals 100% (i.e., no fixture produces output containing blacklisted selectors).
  - **Edge-case test**: Assert that a page with no `<main>` or `<article>` element still returns non-empty Markdown (falls back to `<body>` content minus stripped elements).

## 2. Task Implementation
- [ ] Create `src/benchmarks/contentExtractor.ts` that exports a `ContentExtractor` class with:
  - `extract(html: string): string` method.
  - Uses `cheerio` (already a project dependency) to parse the HTML.
  - Removes selectors: `nav`, `header`, `footer`, `aside`, `[class*="ad"]`, `[class*="banner"]`, `[class*="cookie"]`, `[class*="sponsored"]`, `[id*="ad"]`, `script`, `style`, `noscript`.
  - Extracts content from `main` or `article` with fallback to `body`.
  - Converts remaining HTML to Markdown using `turndown` (add as dependency if not present: `npm install turndown @types/turndown`).
  - Strips any remaining blank lines exceeding 2 consecutive newlines.
- [ ] Generate 50 HTML fixture files for the batch test in `src/benchmarks/fixtures/` by writing a fixture-generator script at `src/benchmarks/scripts/generateFixtures.ts` that creates varied SPA-like HTML with known nav/ad noise and known clean body content.
- [ ] Export the benchmark as a runnable script: add `"bench:content-extractor": "ts-node src/benchmarks/scripts/runContentExtractorBench.ts"` to `package.json` scripts. The script prints a JSON summary `{ successRate: number, testedCount: number, failedFiles: string[] }`.

## 3. Code Review
- [ ] Verify `ContentExtractor` uses a pure-function approach — `extract()` must be stateless and side-effect free.
- [ ] Confirm the selector blacklist is defined as a typed `readonly string[]` constant (not inline magic strings).
- [ ] Ensure the Markdown output is sanitized: no raw HTML tags remain (run a regex `/(<[a-z][\s\S]*>)/i` check and assert it returns no matches on the output).
- [ ] Verify all `cheerio` calls use the typed API (no `any` casts).
- [ ] Confirm `tsconfig.json` strict mode applies to the benchmark directory.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="contentExtractor"` and confirm all unit, integration, edge-case, and batch metric tests pass with exit code 0.
- [ ] Run `npm run bench:content-extractor` and confirm the printed JSON shows `successRate: 1.0` and `failedFiles: []`.

## 5. Update Documentation
- [ ] Update `docs/benchmarks/README.md` (create if absent) to include a section "Content Extraction Benchmark" describing the purpose, how to run it, and the pass criterion (100% noise-strip success rate, maps to `[9_ROADMAP-REQ-026]`).
- [ ] Add a `// [9_ROADMAP-REQ-026]` comment above the `extract()` method signature in `contentExtractor.ts`.
- [ ] Update `src/benchmarks/contentExtractor.agent.md` (create if absent) with a brief description of the module's purpose, inputs, outputs, and known edge cases for agent memory.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="contentExtractor" --coverage` and assert coverage is ≥ 90% for `src/benchmarks/contentExtractor.ts`.
- [ ] Run `npm run bench:content-extractor` and pipe the output through `node -e "const r=require('/dev/stdin');process.exit(r.successRate===1.0?0:1)"` to programmatically assert success rate is exactly 1.0.
- [ ] CI pipeline step: add a `bench:verify` npm script that exits non-zero if the benchmark JSON reports any `failedFiles`.
