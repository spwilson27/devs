# Task: Implement Market and Competitive Analysis Report Generators (Sub-Epic: 10_Report Generation Engine)

## Covered Requirements
- [9_ROADMAP-TAS-305], [1_PRD-REQ-MAP-003], [1_PRD-REQ-NEED-DOMAIN-01]

## 1. Initial Test Written
- [ ] Create `src/agents/research/reports/__tests__/market_report_generator.test.ts`.
- [ ] Write unit tests for `MarketReportGenerator` asserting:
  - `generate(data: MarketReportData): Promise<ReportDocument>` resolves to a `ReportDocument` with `reportType === 'market'`.
  - The `markdownContent` contains an H1 heading equal to `data.projectName + " — Market Research Report"`.
  - The `markdownContent` contains a `## Market Overview` section populated from `data.overview`.
  - The `markdownContent` contains a `## Key Findings` section with a numbered list of `data.findings`.
  - The `markdownContent` contains a `## Pros & Cons` section (satisfying `[1_PRD-REQ-MAP-003]`) with `### Pros` and `### Cons` subsections.
  - The `markdownContent` contains a `## Trade-offs` section (satisfying `[1_PRD-REQ-MAP-003]`).
  - The `markdownContent` contains the Mermaid SWOT diagram block generated from `data.swot` (verified by checking the presence of ` ```mermaid`).
  - The `markdownContent` contains a `## Sources` section with a numbered citation list from `data.sources`, each formatted as `[n] {title} — {url}`.
  - The `generatedAt` field on the returned document is a `Date` within 2 seconds of `Date.now()`.
- [ ] Create `src/agents/research/reports/__tests__/competitive_report_generator.test.ts`.
- [ ] Write unit tests for `CompetitiveReportGenerator` asserting:
  - `generate(data: CompetitiveReportData): Promise<ReportDocument>` resolves with `reportType === 'competitive'`.
  - The `markdownContent` includes a `## Competitor Profiles` section with one `### {competitor.name}` subsection per competitor in `data.competitors`.
  - Each competitor subsection includes `**Market Share:**`, `**Strengths:**` bullet list, `**Weaknesses:**` bullet list.
  - The `markdownContent` includes a `## Competitive SWOT` section with a Mermaid SWOT diagram.
  - The `markdownContent` includes `## Pros & Cons` and `## Trade-offs` sections.
  - The `markdownContent` includes a `## Sources` section.

## 2. Task Implementation
- [ ] Create `src/agents/research/reports/market_report_generator.ts`.
- [ ] Define and export `MarketReportData` interface:
  ```typescript
  export interface MarketReportData extends ReportData {
    type: 'market';
    projectName: string;
    overview: string;
    findings: string[];
    pros: string[];
    cons: string[];
    tradeoffs: string[];
    swot: SWOTData;
    sources: Array<{ title: string; url: string; credibilityScore: number }>;
  }
  ```
- [ ] Implement `MarketReportGenerator extends BaseReportGenerator` with `generate(data: MarketReportData): Promise<ReportDocument>`:
  - Build ordered sections: Market Overview, Key Findings, Pros & Cons, Trade-offs, SWOT Diagram (using `MermaidSWOTGenerator.generate()`), Sources.
  - Render `markdownContent` using the inherited `renderMarkdown()` helper.
  - Return a fully formed `ReportDocument`.
- [ ] Create `src/agents/research/reports/competitive_report_generator.ts`.
- [ ] Define and export `CompetitiveReportData` interface:
  ```typescript
  export interface CompetitorProfile { name: string; marketShare?: string; strengths: string[]; weaknesses: string[]; notes?: string; }
  export interface CompetitiveReportData extends ReportData {
    type: 'competitive';
    projectName: string;
    competitors: CompetitorProfile[];
    pros: string[];
    cons: string[];
    tradeoffs: string[];
    swot: SWOTData;
    sources: Array<{ title: string; url: string; credibilityScore: number }>;
  }
  ```
- [ ] Implement `CompetitiveReportGenerator extends BaseReportGenerator` with `generate(data: CompetitiveReportData): Promise<ReportDocument>`:
  - Build ordered sections: Competitor Profiles (one subsection per competitor), Competitive SWOT, Pros & Cons, Trade-offs, Sources.
- [ ] Register both generators in `ReportGeneratorFactory.create()` for types `'market'` and `'competitive'`.
- [ ] Export all new symbols from `src/agents/research/reports/index.ts`.

## 3. Code Review
- [ ] Confirm both generators extend `BaseReportGenerator` and call `this.renderMarkdown()` — no duplicated markdown serialization logic.
- [ ] Confirm `## Pros & Cons` and `## Trade-offs` headings are present in rendered output for both report types (required by `[1_PRD-REQ-MAP-003]`).
- [ ] Confirm sources are rendered as a numbered citation list, not an unordered list.
- [ ] Confirm the Mermaid SWOT block is inserted as raw markdown content (not HTML-escaped).
- [ ] Confirm `credibilityScore` field exists on source objects but is not rendered in the report (it is for internal filtering only).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="(market_report_generator|competitive_report_generator)"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Append `### Market Report Generator` and `### Competitive Analysis Report Generator` subsections to `docs/architecture/research_agents.md`, documenting the input data shapes and output section ordering.
- [ ] Update `docs/agent_memory/phase_5_decisions.md` with: "Market and Competitive reports both include mandatory `## Pros & Cons` and `## Trade-offs` sections per `[1_PRD-REQ-MAP-003]`. Sources rendered as numbered citation lists."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="(market_report_generator|competitive_report_generator)" --passWithNoTests=false` and assert exit code is `0`.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
- [ ] Run `node -e "const {ReportGeneratorFactory} = require('./dist/agents/research/reports'); ['market','competitive'].forEach(t => { const g = ReportGeneratorFactory.create(t); console.assert(g !== null, t + ' factory failed'); });"` and assert exit code is `0`.
