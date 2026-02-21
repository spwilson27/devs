# Task: Implement SPA/Dynamic Content Noise Stripping and Markdown Validation (Sub-Epic: 04_Content Extraction Tools)

## Covered Requirements
- [9_ROADMAP-TAS-303], [9_ROADMAP-REQ-026]

## 1. Initial Test Written
- [ ] Create `src/tools/content_extractor/__tests__/markdown_sanitizer.test.ts`.
- [ ] Write a test that `sanitizeMarkdown(input)` imported from `src/tools/content_extractor/utils/markdown_sanitizer.ts` removes repeated blank lines (more than 2 consecutive) from markdown output, replacing them with a single blank line.
- [ ] Write a test that `sanitizeMarkdown` strips inline CSS/HTML remnants (e.g., `<style>...</style>`, `<script>...</script>` blocks) that may survive the extractor.
- [ ] Write a test that `sanitizeMarkdown` removes markdown links whose display text matches navigation patterns (e.g., `"Home"`, `"Skip to content"`, `"Menu"`) using a configurable blocklist.
- [ ] Write a test that `sanitizeMarkdown` removes image-only lines (lines matching `!\[.*\]\(.*\)` with no surrounding text).
- [ ] Write a test that `sanitizeMarkdown` preserves code blocks (``` fenced blocks) without modification, even if their content matches navigation patterns.
- [ ] Write a test that `sanitizeMarkdown` returns a string where `noiseStrippedMetrics` (returned alongside the cleaned text) contains accurate `removedLinkCount` and `removedBlockCount` integers.
- [ ] Write a test that `validateMarkdown(input)` from the same module throws `MarkdownValidationError` when the input is an empty string.
- [ ] Write a test that `validateMarkdown` throws `MarkdownValidationError` when the input contains fewer than 50 non-whitespace characters (too sparse to be real content).
- [ ] Write a test that `validateMarkdown` does NOT throw for a well-formed markdown string with sufficient content.

## 2. Task Implementation
- [ ] Create `src/tools/content_extractor/utils/markdown_sanitizer.ts` exporting:
  - `SanitizeResult` interface: `{ cleanedMarkdown: string; removedLinkCount: number; removedBlockCount: number }`.
  - `sanitizeMarkdown(raw: string, blocklist?: string[]): SanitizeResult`: Applies all stripping rules in sequence:
    1. Strip `<style>`, `<script>`, and other HTML block tags using regex.
    2. Remove navigation links using blocklist (default list includes: `Home`, `Skip to content`, `Menu`, `Back to top`, `Cookie Policy`, `Privacy Policy`, `Terms of Service`).
    3. Remove image-only lines.
    4. Collapse excessive blank lines.
    5. Return `SanitizeResult` with cleaned text and counts.
  - `MarkdownValidationError extends Error` with a `reason: string` field.
  - `validateMarkdown(markdown: string): void`: Throws `MarkdownValidationError` if the string is empty or has fewer than 50 non-whitespace characters.
- [ ] Update `FirecrawlExtractor.extract()` and `JinaExtractor.extract()` to call `sanitizeMarkdown()` on the raw markdown before populating `ExtractResult.markdown`, and to derive `adCount` and `navCount` from the `SanitizeResult`.
- [ ] Update both adapters to call `validateMarkdown()` on the sanitized output, throwing `ExtractionFailedError` (wrapping the `MarkdownValidationError`) if validation fails.
- [ ] Export `MarkdownValidationError` from `src/tools/content_extractor/errors.ts`.

## 3. Code Review
- [ ] Verify that the sanitization pipeline is a pure function (no side effects, same input → same output) to enable easy unit testing.
- [ ] Verify that the fenced code block preservation logic correctly uses a stateful flag (or regex with `s` flag) to skip sanitization inside ` ``` ` blocks.
- [ ] Verify that the navigation blocklist is a configurable parameter with a sensible default, not a hard-coded internal list.
- [ ] Verify that `MarkdownValidationError` is exported through the module's `index.ts`.
- [ ] Verify that `removedLinkCount` correctly counts individual links removed, not lines.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/tools/content_extractor/__tests__/markdown_sanitizer.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `markdown_sanitizer.ts`.
- [ ] Run the full extractor test suite: `npx jest src/tools/content_extractor/ --coverage` and confirm no regressions in Firecrawl and Jina adapter tests.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Update `src/tools/content_extractor/utils/utils.agent.md` with a section `### Markdown Sanitizer` documenting:
  - The ordered sanitization pipeline steps.
  - The default navigation blocklist.
  - The `SanitizeResult` return shape.
  - The `validateMarkdown` minimum content threshold (50 non-whitespace characters).
- [ ] Update `src/tools/content_extractor/content_extractor.agent.md` with a note that all adapters run `sanitizeMarkdown` before returning results, guaranteeing `noiseStripped: true`.

## 6. Automated Verification
- [ ] Run `npx jest src/tools/content_extractor/__tests__/markdown_sanitizer.test.ts --json --outputFile=/tmp/sanitizer_results.json && node -e "const r=require('/tmp/sanitizer_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and confirm exit code 0.
- [ ] Run `npx jest src/tools/content_extractor/ --coverage --coverageThreshold='{"global":{"branches":90}}'` and confirm threshold is met.
- [ ] Run `npm run lint src/tools/content_extractor/utils/markdown_sanitizer.ts` and confirm zero errors.
