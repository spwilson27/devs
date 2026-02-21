# Task: Implement High-Fidelity "Why" Rationale Engine for Research Reports (Sub-Epic: 10_Report Generation Engine)

## Covered Requirements
- [1_PRD-REQ-NEED-DOMAIN-01], [1_PRD-REQ-MAP-003], [9_ROADMAP-TAS-305]

## 1. Initial Test Written
- [ ] Create `src/agents/research/reports/__tests__/rationale_engine.test.ts`.
- [ ] Write unit tests asserting:
  - `RationaleEngine.buildWhySectionMarkdown(context: RationaleContext): string` returns a non-empty string.
  - The returned string contains `## Why` as a heading.
  - Given a `RationaleContext` with `chosenOption`, `alternativesConsidered`, `keyDrivers`, and `tradeoffsAccepted`, the output includes all four elements.
  - `chosenOption` name appears in a `### Decision` subsection.
  - `alternativesConsidered` items appear in a `### Alternatives Considered` bullet list, each with a `Reason rejected:` note.
  - `keyDrivers` items appear in a `### Key Decision Drivers` bullet list.
  - `tradeoffsAccepted` items appear in a `### Trade-offs Accepted` bullet list (satisfying `[1_PRD-REQ-MAP-003]`).
  - An empty `alternativesConsidered` array renders the subsection with the text `No alternatives were formally evaluated.`.
  - `RationaleEngine.validateContext(context: RationaleContext): ValidationResult` returns `{ valid: false, errors: string[] }` when `chosenOption` is missing or `keyDrivers` is empty.
  - `RationaleEngine.validateContext()` returns `{ valid: true, errors: [] }` for a fully populated context.
- [ ] Write an integration test asserting that `TechnologyReportGenerator.generate()` with a full `TechnologyReportData` (including `rationale` string and `matrixData`) produces a `markdownContent` string that:
  - Contains `## Why We Chose` with the recommended option name.
  - Contains `### Alternatives Considered`.
  - Contains `### Trade-offs Accepted`.

## 2. Task Implementation
- [ ] Create `src/agents/research/reports/rationale_engine.ts`.
- [ ] Define and export `RationaleContext` interface:
  ```typescript
  export interface AlternativeOption { name: string; reasonRejected: string; }
  export interface RationaleContext {
    chosenOption: { name: string; summary: string };
    alternativesConsidered: AlternativeOption[];
    keyDrivers: string[];
    tradeoffsAccepted: string[];
  }
  export interface ValidationResult { valid: boolean; errors: string[]; }
  ```
- [ ] Implement `RationaleEngine` class with:
  - `static validateContext(context: RationaleContext): ValidationResult`: returns errors if `chosenOption` is missing/empty or `keyDrivers.length === 0`.
  - `static buildWhySectionMarkdown(context: RationaleContext): string`:
    - Calls `validateContext` and throws `RationaleValidationError` if invalid.
    - Renders:
      ```markdown
      ## Why {chosenOption.name} Was Chosen

      ### Decision
      {chosenOption.summary}

      ### Key Decision Drivers
      - {driver1}
      - {driver2}

      ### Alternatives Considered
      - **{alt.name}**: Reason rejected: {alt.reasonRejected}

      ### Trade-offs Accepted
      - {tradeoff1}
      ```
  - `export class RationaleValidationError extends Error { ... }`
- [ ] Update `TechnologyReportGenerator.generate()` to:
  - Construct a `RationaleContext` from `data.matrixData` (the `recommendedOption` becomes `chosenOption`; runner-up options become `alternativesConsidered`; top 3 criteria by weight become `keyDrivers`; `data.tradeoffs` becomes `tradeoffsAccepted`).
  - Call `RationaleEngine.buildWhySectionMarkdown()` and insert the result as the `## Why We Chose ...` section.
- [ ] Update all four report generators (`MarketReportGenerator`, `CompetitiveReportGenerator`, `TechnologyReportGenerator`, `UserResearchReportGenerator`) to include a `## Why This Approach` section in their output using `RationaleEngine.buildWhySectionMarkdown()` with a `RationaleContext` derived from report-type-specific fields. For Market and Competitive reports, `chosenOption.name` is `data.projectName + " approach"` and the rationale is free-text from a new `data.whyRationale: RationaleContext` field on their data interfaces.
- [ ] Export `RationaleEngine`, `RationaleContext`, `AlternativeOption`, `ValidationResult`, `RationaleValidationError` from `src/agents/research/reports/index.ts`.

## 3. Code Review
- [ ] Verify `RationaleEngine.buildWhySectionMarkdown()` always produces the four subsections: Decision, Key Decision Drivers, Alternatives Considered, Trade-offs Accepted.
- [ ] Verify `RationaleValidationError` extends `Error`, sets `this.name`, and includes the list of validation errors in its message.
- [ ] Verify `validateContext` is called at the top of `buildWhySectionMarkdown` and throws before any rendering begins.
- [ ] Confirm all four report generators now include a `## Why` section, satisfying `[1_PRD-REQ-NEED-DOMAIN-01]` (high-fidelity rationale explaining the "Why").
- [ ] Confirm `### Trade-offs Accepted` satisfies `[1_PRD-REQ-MAP-003]` in all report types.
- [ ] Confirm no markdown is rendered manually (no string concatenation outside `RationaleEngine` or `renderMarkdown`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="rationale_engine"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="(market_report_generator|competitive_report_generator|technology_report_generator|user_research_report_generator)"` and confirm existing tests still pass (no regressions).
- [ ] Run `npm run type-check` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Append `### Rationale Engine` subsection to `docs/architecture/research_agents.md` documenting `RationaleContext`, `validateContext`, and `buildWhySectionMarkdown`.
- [ ] Update `docs/agent_memory/phase_5_decisions.md` with: "All research reports include a `## Why` section built by `RationaleEngine`. `RationaleContext.keyDrivers` must be non-empty or `RationaleValidationError` is thrown. For tech reports, top 3 criteria by weight auto-populate `keyDrivers`."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="rationale_engine" --passWithNoTests=false` and assert exit code is `0`.
- [ ] Run `npm test -- --passWithNoTests=false` (full suite) and assert zero failures.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
