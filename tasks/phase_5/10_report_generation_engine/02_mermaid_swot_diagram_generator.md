# Task: Implement Mermaid SWOT Diagram Auto-Generator (Sub-Epic: 10_Report Generation Engine)

## Covered Requirements
- [9_ROADMAP-TAS-305], [1_PRD-REQ-MAP-003]

## 1. Initial Test Written
- [ ] Create `src/agents/research/reports/__tests__/mermaid_swot_generator.test.ts`.
- [ ] Write unit tests asserting:
  - `MermaidSWOTGenerator.generate(swotData: SWOTData): string` returns a string that starts with ` ```mermaid` and ends with ` ``` `.
  - The returned string contains `quadrantChart` as the diagram type declaration.
  - Given a `SWOTData` object with `strengths`, `weaknesses`, `opportunities`, and `threats` arrays, each item appears in the output string.
  - Empty arrays for any quadrant result in that quadrant being rendered with a placeholder label `(none identified)`.
  - Items containing special Mermaid characters (e.g., `"`, `:`) are escaped so the output remains valid Mermaid syntax.
  - The output string contains the four axis labels: `"Strengths"`, `"Weaknesses"`, `"Opportunities"`, `"Threats"`.
  - A snapshot test captures the exact Mermaid output for a known `SWOTData` fixture.
- [ ] Write an integration test asserting that embedding the `MermaidSWOTGenerator` output inside a `ReportSection.content` field and passing it through `BaseReportGenerator.renderMarkdown()` produces a final markdown string where the mermaid block is preserved verbatim (not escaped).

## 2. Task Implementation
- [ ] Create `src/agents/research/reports/mermaid_swot_generator.ts`.
- [ ] Define and export `SWOTData` interface:
  ```typescript
  export interface SWOTData {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }
  ```
- [ ] Implement `MermaidSWOTGenerator` class with a static `generate(data: SWOTData): string` method that:
  - Builds a Mermaid `quadrantChart` block.
  - Maps `strengths` → top-left quadrant, `weaknesses` → top-right, `opportunities` → bottom-left, `threats` → bottom-right.
  - Escapes any `"` characters in item text as `\"` and any `:` as `&#58;` before inserting into the diagram.
  - Substitutes empty arrays with a single entry: `(none identified)`.
  - Wraps the output in a fenced code block with the `mermaid` language tag.
- [ ] Export `MermaidSWOTGenerator` and `SWOTData` from `src/agents/research/reports/index.ts`.

## 3. Code Review
- [ ] Verify the escaping function is a pure, side-effect-free utility function (not inline logic).
- [ ] Verify the quadrant mapping is expressed as a constant lookup object, not a chain of `if` statements.
- [ ] Confirm the fenced code block uses exactly three backticks (` ``` `) and the `mermaid` language tag on the opening line.
- [ ] Confirm no external libraries are used for Mermaid generation; the output is pure string templating.
- [ ] Verify the snapshot test file is committed and reflects the expected canonical output.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="mermaid_swot_generator"` and confirm all tests pass including the snapshot test.
- [ ] Run `npm run type-check` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Append to `docs/architecture/research_agents.md` a `### Mermaid SWOT Generator` subsection documenting the `SWOTData` interface, the quadrant mapping, and the escaping rules.
- [ ] Update `docs/agent_memory/phase_5_decisions.md` with the decision: "SWOT diagrams use Mermaid `quadrantChart`; special characters `:` and `\"` are escaped before rendering."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="mermaid_swot_generator" --passWithNoTests=false` and assert exit code is `0`.
- [ ] Run `npm test -- --testPathPattern="mermaid_swot_generator" -u` and assert the snapshot file is unchanged (exit code `0` with no snapshot updates).
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
