# Task: Implement User Research Markdown Report Generator (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-003], [9_ROADMAP-REQ-RES-003]

## 1. Initial Test Written
- [ ] In `src/research/user/__tests__/reportGenerator.test.ts`, write the following tests:
  - **Unit: `UserReportGenerator.generate(report)`**
    - Provide a fixture `UserResearchReport` with 3 `PersonaProfile` entries and 3 `UserJourney` entries.
    - Assert the returned Markdown string contains `# User Persona & Journey Research Report` as the H1 title.
    - Assert the Markdown contains an H2 `## Research Summary` section with `report.researchSummary` text.
    - Assert the Markdown contains exactly 3 H2 `## Persona: <PersonaName>` sections.
    - Assert each persona section contains a Markdown table with rows for: `Age`, `Occupation`, `Technical Level`, `Goals`, `Pain Points`, `Motivations`, `Preferred Channels`.
    - Assert each persona section contains an H3 `### User Journey: <scenario>` subsection with an embedded Mermaid `sequenceDiagram` block.
    - Assert the H1 title section includes `Generated:` followed by the ISO timestamp of `report.generatedAt`.
  - **Unit: multiple journeys per persona**
    - Provide a fixture where one persona has 2 journeys.
    - Assert both journey subsections appear under that persona's H2 section.
  - **Unit: persona with no journey**
    - Provide a fixture where one persona has no corresponding journey.
    - Assert the persona section is still generated but does not contain an H3 journey subsection.
  - **Unit: empty personas guard**
    - Provide `personas: []`.
    - Assert the generator throws `ReportGenerationError` with message including `"no personas"`.
  - **Snapshot test**: Generate a report from a known fixture and assert it matches a saved snapshot `__snapshots__/userReport.snap.md`.

## 2. Task Implementation
- [ ] Create `src/research/user/reportGenerator.ts` exporting `UserReportGenerator` class:
  - Constructor accepts `{ journeyRenderer: (journey: UserJourney) => string }` (injectable, defaults to `renderJourneyMermaid` from task 07).
  - `generate(report: UserResearchReport): string` method (synchronous):
    1. Validates input with `UserResearchReportSchema.parse(report)`.
    2. Builds a lookup map: `journeysByPersonaId: Map<string, UserJourney[]>`.
    3. Builds report sections in order:
       - H1 title with project ID and ISO timestamp of `generatedAt`.
       - H2 `## Research Summary` with `report.researchSummary`.
       - For each persona in `report.personas`:
         - H2 `## Persona: <name>`.
         - A Markdown table with 2 columns (`| Attribute | Value |`) listing: Age, Occupation, Technical Level, Goals (joined by `; `), Pain Points (joined by `; `), Motivations (joined by `; `), Preferred Channels (joined by `; `).
         - For each journey in `journeysByPersonaId.get(persona.id) ?? []`:
           - H3 `### User Journey: <scenario>`.
           - Embedded fenced Mermaid `sequenceDiagram` block via `journeyRenderer(journey)`.
    4. Returns concatenated Markdown string.
  - Throws `ReportGenerationError` if `report.personas` is empty.
- [ ] Update `src/research/user/errors.ts` to add `ReportGenerationError extends Error`.

## 3. Code Review
- [ ] Verify `generate()` is a pure function (no I/O, deterministic output for same input).
- [ ] Verify Goals/Pain Points/Motivations/Preferred Channels arrays are joined with `'; '` separator (not newlines) to keep the table cell readable.
- [ ] Verify the journey-to-persona grouping uses `Map` (not repeated `Array.filter` calls per persona).
- [ ] Verify the report sections appear in the exact order: H1 → Summary → (Personas with journeys interleaved).
- [ ] Verify snapshot test uses a deterministic fixture (fixed `generatedAt` date) to prevent snapshot drift.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/user/__tests__/reportGenerator.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/research/user/user.agent.md` to add a section:
  - **UserReportGenerator**: Inputs (`UserResearchReport`), output (Markdown string), report structure (section order).
  - Note that `generate()` is pure and synchronous.
  - Document persona table attribute order and array join separator.
- [ ] Update the top-level `src/research/user/index.ts` barrel to export `UserReportGenerator` and `ReportGenerationError`.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/user/__tests__/reportGenerator.test.ts` and assert line coverage ≥ 95% for `reportGenerator.ts`.
- [ ] Run `pnpm test -- --update-snapshots=false` and assert 0 snapshot mismatches.
- [ ] Run `pnpm tsc --noEmit` and assert exit code 0.
