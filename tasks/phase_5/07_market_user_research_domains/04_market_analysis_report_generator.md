# Task: Implement Market & Competitive Analysis Markdown Report Generator (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-001], [9_ROADMAP-REQ-RES-001]

## 1. Initial Test Written
- [ ] In `src/research/market/__tests__/reportGenerator.test.ts`, write the following tests:
  - **Unit: `MarketReportGenerator.generate(report)`**
    - Provide a fixture `MarketResearchReport` with 5 `CompetitorProfile` entries and matching `SWOTAnalysis` entries.
    - Assert the returned Markdown string contains an H1 title `# Market & Competitive Analysis Report`.
    - Assert the Markdown contains an H2 `## Competitors` section with a Markdown table containing columns: `| Competitor | URL | Pricing Model | Credibility Score |`.
    - Assert the Markdown contains one H3 `### SWOT Analysis: <CompetitorName>` section per competitor.
    - Assert each SWOT section embeds a fenced ` ```mermaid` block.
    - Assert the Markdown contains an H2 `## Overall Market Summary` section with non-empty prose.
    - Assert the Markdown contains an H2 `## Feature Comparison Matrix` table with competitor names as columns and feature categories as rows.
  - **Unit: citation inclusion**
    - Assert each competitor entry in the Competitors table links its name to its `url` using Markdown hyperlink syntax `[Name](url)`.
  - **Unit: empty competitors guard**
    - Provide a `MarketResearchReport` where `competitors: []`.
    - Assert the generator throws `ReportGenerationError` with message including `"no competitors"`.
  - **Snapshot test**: Generate a report from a known fixture and assert the full Markdown output matches a saved snapshot file `__snapshots__/marketReport.snap.md`.

## 2. Task Implementation
- [ ] Create `src/research/market/reportGenerator.ts` exporting `MarketReportGenerator` class:
  - Constructor accepts `{ swotRenderer: (analysis: SWOTAnalysis, name: string) => string }` (injectable for testability; defaults to `renderSWOTMermaid` from task 03).
  - `generate(report: MarketResearchReport): string` method (synchronous — all data already gathered):
    1. Validates input with `MarketResearchReportSchema.parse(report)`.
    2. Builds report sections in order:
       - H1 title with project ID and generation timestamp.
       - H2 `## Overall Market Summary` with `report.overallMarketSummary`.
       - H2 `## Competitors` Markdown table (competitor name linked to URL, pricing model, credibility score formatted to 2 decimal places).
       - H2 `## Feature Comparison Matrix` — builds a Markdown table where rows = unique feature categories (union across all competitors), columns = competitor names, cells = `✓` or `—`.
       - For each competitor: H3 `### SWOT Analysis: <name>` followed by the Mermaid block from `swotRenderer`.
    3. Returns the concatenated Markdown string.
  - Throws `ReportGenerationError` if `report.competitors` is empty.
- [ ] Update `src/research/market/errors.ts` to add `ReportGenerationError extends Error`.

## 3. Code Review
- [ ] Verify `generate()` is a pure function (no I/O, no side effects, deterministic output for same input).
- [ ] Verify the Feature Comparison Matrix correctly de-duplicates feature categories using a `Set<string>`.
- [ ] Verify credibility score is formatted to exactly 2 decimal places (e.g., `0.87`).
- [ ] Verify all competitor URLs are rendered as valid Markdown hyperlinks.
- [ ] Verify the report sections appear in the order specified (Summary → Competitors Table → Feature Matrix → SWOT sections).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/market/__tests__/reportGenerator.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/research/market/market.agent.md` to add a section:
  - **MarketReportGenerator**: Inputs (`MarketResearchReport`), output (Markdown string), report structure (section order and content).
  - Note that the generator is a pure synchronous function and can be called without async context.
  - Document the Feature Comparison Matrix construction logic.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/market/__tests__/reportGenerator.test.ts` and assert line coverage ≥ 95% for `reportGenerator.ts`.
- [ ] Run snapshot test via `pnpm test -- --update-snapshots=false` and assert 0 snapshot mismatches.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
