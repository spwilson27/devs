# Task: Implement Tech Landscape Decision Matrix Generator with Weighted Scoring (Sub-Epic: 10_Report Generation Engine)

## Covered Requirements
- [9_ROADMAP-TAS-304], [1_PRD-REQ-MAP-003], [1_PRD-REQ-NEED-DOMAIN-01]

## 1. Initial Test Written
- [ ] Create `src/agents/research/reports/__tests__/tech_decision_matrix_generator.test.ts`.
- [ ] Write unit tests asserting:
  - `TechDecisionMatrixGenerator.generate(data: DecisionMatrixData): DecisionMatrixResult` returns an object with `rankedOptions: RankedOption[]` sorted descending by `totalWeightedScore`.
  - Given a `DecisionMatrixData` with `criteria` (each having a `weight: number` 0–1) and `options` (each having `scores` keyed by criterion name), the `totalWeightedScore` for each option equals the sum of `(score * weight)` across all criteria.
  - Weights that do not sum to 1.0 (±0.001 tolerance) cause a `WeightValidationError` to be thrown with a descriptive message.
  - An option with a missing score for a criterion defaults the missing score to `0`.
  - `TechDecisionMatrixGenerator.toMarkdownTable(result: DecisionMatrixResult): string` returns a GFM table string with a header row of criterion names plus a "Total Score" column, and one row per option, sorted by `totalWeightedScore` descending.
  - `TechDecisionMatrixGenerator.toMermaidXYChart(result: DecisionMatrixResult): string` returns a Mermaid `xychart-beta` block with a bar chart showing each option's `totalWeightedScore`.
  - The `recommendedOption` field on `DecisionMatrixResult` equals the first entry in `rankedOptions` (highest score).
  - A "Pros/Cons" section can be generated via `TechDecisionMatrixGenerator.toProsConsMarkdown(data: DecisionMatrixData): string`, returning a GFM section with `### Pros` and `### Cons` subsections for each option.
- [ ] Write a snapshot test for the markdown table output with a known 3-option, 3-criterion fixture.

## 2. Task Implementation
- [ ] Create `src/agents/research/reports/tech_decision_matrix_generator.ts`.
- [ ] Define and export the following interfaces in a co-located `types` block or imported from `types.ts`:
  ```typescript
  export interface DecisionCriterion { name: string; weight: number; description?: string; }
  export interface DecisionOption { name: string; scores: Record<string, number>; pros: string[]; cons: string[]; rationale: string; }
  export interface DecisionMatrixData { projectContext: string; criteria: DecisionCriterion[]; options: DecisionOption[]; }
  export interface RankedOption extends DecisionOption { totalWeightedScore: number; breakdown: Record<string, number>; }
  export interface DecisionMatrixResult { rankedOptions: RankedOption[]; recommendedOption: RankedOption; generatedAt: Date; }
  export class WeightValidationError extends Error { ... }
  ```
- [ ] Implement `TechDecisionMatrixGenerator` class with:
  - `static generate(data: DecisionMatrixData): DecisionMatrixResult`: validates weights sum to 1.0, computes weighted scores, returns sorted result.
  - `static toMarkdownTable(result: DecisionMatrixResult): string`: renders a GFM pipe table. Scores formatted to 2 decimal places. Options sorted by `totalWeightedScore` desc.
  - `static toMermaidXYChart(result: DecisionMatrixResult): string`: renders a Mermaid `xychart-beta bar` chart. Option names truncated to 20 characters if needed to prevent Mermaid parse errors.
  - `static toProsConsMarkdown(data: DecisionMatrixData): string`: renders a `## Pros & Cons` section with `### {OptionName}` subsections each containing `**Pros:**` and `**Cons:**` bullet lists and a `**Rationale:**` paragraph.
- [ ] Export all new symbols from `src/agents/research/reports/index.ts`.

## 3. Code Review
- [ ] Verify `WeightValidationError` extends `Error` and sets `this.name` correctly.
- [ ] Verify the weight validation uses a numeric tolerance of `±0.001` (not strict equality) to handle floating-point precision.
- [ ] Confirm `toMarkdownTable` aligns columns with at least three dashes in the separator row (GFM requirement).
- [ ] Confirm `toMermaidXYChart` wraps output in a fenced ` ```mermaid ``` ` block.
- [ ] Verify `toProsConsMarkdown` is a pure function with no side effects; does not mutate `data`.
- [ ] Confirm the `Pros/Cons` and `Trade-offs` sections satisfy `[1_PRD-REQ-MAP-003]` — verify these words appear in output.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="tech_decision_matrix_generator"` and confirm all tests pass.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Append to `docs/architecture/research_agents.md` a `### Tech Landscape Decision Matrix Generator` subsection documenting the weighted scoring algorithm, the `DecisionMatrixData` input schema, and the three output formats (markdown table, Mermaid XY chart, Pros/Cons markdown).
- [ ] Update `docs/agent_memory/phase_5_decisions.md` with: "Decision Matrix uses weight-normalized scoring (weights must sum to 1.0±0.001). Missing scores default to 0. `xychart-beta` used for Mermaid bar charts. Option names truncated to 20 chars in chart labels."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="tech_decision_matrix_generator" --passWithNoTests=false` and assert exit code is `0`.
- [ ] Run `npm test -- --testPathPattern="tech_decision_matrix_generator" -u` and assert snapshot is unchanged.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
