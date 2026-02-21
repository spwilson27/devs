# Task: Define ReportGenerator Base Interfaces and Module Structure (Sub-Epic: 10_Report Generation Engine)

## Covered Requirements
- [9_ROADMAP-TAS-305], [1_PRD-REQ-NEED-DOMAIN-01]

## 1. Initial Test Written
- [ ] Create `src/agents/research/reports/__tests__/report_generator.base.test.ts`.
- [ ] Write unit tests that assert:
  - `BaseReportGenerator` is an abstract class that cannot be instantiated directly.
  - Each concrete subclass must implement a `generate(data: ReportData): Promise<ReportDocument>` method.
  - `ReportDocument` interface has mandatory fields: `title: string`, `generatedAt: Date`, `sections: ReportSection[]`, `markdownContent: string`.
  - `ReportSection` interface has mandatory fields: `heading: string`, `content: string`, `subsections?: ReportSection[]`.
  - `ReportData` is a discriminated union type with a `type` field corresponding to `'market' | 'competitive' | 'technology' | 'user_research'`.
  - Calling `generate()` on a stub subclass with valid `ReportData` resolves to a `ReportDocument` where `markdownContent` is non-empty.
  - The `markdownContent` field contains a valid H1 header matching the `title` field.
  - An invalid/unknown `type` field passed to a factory function throws a `ReportTypeError`.
- [ ] Write an integration test asserting that `ReportGeneratorFactory.create(type)` returns the correct concrete class instance for each of the four valid types.

## 2. Task Implementation
- [ ] Create directory `src/agents/research/reports/`.
- [ ] Create `src/agents/research/reports/types.ts` and define the following exported TypeScript interfaces and types:
  ```typescript
  export interface ReportSection { heading: string; content: string; subsections?: ReportSection[]; }
  export interface ReportDocument { title: string; generatedAt: Date; reportType: ReportDataType; sections: ReportSection[]; markdownContent: string; }
  export type ReportDataType = 'market' | 'competitive' | 'technology' | 'user_research';
  export interface ReportData { type: ReportDataType; [key: string]: unknown; }
  export class ReportTypeError extends Error { constructor(type: string) { super(`Unknown report type: ${type}`); this.name = 'ReportTypeError'; } }
  ```
- [ ] Create `src/agents/research/reports/base_report_generator.ts`. Define `abstract class BaseReportGenerator` with:
  - `abstract generate(data: ReportData): Promise<ReportDocument>`
  - Protected helper `renderMarkdown(doc: Omit<ReportDocument, 'markdownContent'>): string` that converts sections recursively into GitHub-Flavored Markdown, using `#` for H1, `##` for H2, etc.
- [ ] Create `src/agents/research/reports/report_generator_factory.ts` with a `ReportGeneratorFactory` class containing a static `create(type: ReportDataType): BaseReportGenerator` method. Use a `switch` statement; throw `ReportTypeError` for unknown types. (Concrete classes will be registered as they are implemented in subsequent tasks.)
- [ ] Export all public symbols from `src/agents/research/reports/index.ts`.

## 3. Code Review
- [ ] Verify that all types are exported from the `index.ts` barrel file and no circular imports exist.
- [ ] Confirm `renderMarkdown` correctly handles nested `subsections` recursively with incrementing heading levels (H2 → H3 → H4).
- [ ] Confirm `ReportTypeError` extends `Error` properly and has the correct `name` property set.
- [ ] Confirm the factory uses a `switch` statement (not `if/else`) for extensibility and clarity.
- [ ] Confirm no `any` types are used; all generics are constrained.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="report_generator.base"` and confirm all tests pass with zero failures.
- [ ] Run `npm run type-check` (or `tsc --noEmit`) and confirm zero TypeScript errors in the new files.

## 5. Update Documentation
- [ ] Add a `## Report Generation Engine` section to `docs/architecture/research_agents.md` (create the file if it doesn't exist) describing the `BaseReportGenerator` pattern, the four report types, and the factory.
- [ ] Update agent memory file `docs/agent_memory/phase_5_decisions.md` with the decision: "Report generation uses an abstract factory pattern with a single `generate()` entrypoint returning a `ReportDocument` containing pre-rendered GFM Markdown."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="report_generator.base" --passWithNoTests=false` and assert exit code is `0`.
- [ ] Run `grep -r "ReportDocument" src/agents/research/reports/index.ts` and assert the symbol is exported.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
