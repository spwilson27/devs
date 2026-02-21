# Task: Implement Diagram Text Alternative Data Model and Generation Logic (Sub-Epic: 96_Diagram_Alt_Text_Contrast)

## Covered Requirements
- [4_USER_FEATURES-REQ-057]

## 1. Initial Test Written
- [ ] In `packages/core/src/__tests__/diagramAlternative.test.ts`, write unit tests for a new `DiagramAlternativeService`:
  - Test `generateTextSummary(diagramDef: string, diagramType: 'flowchart' | 'sequenceDiagram' | 'classDiagram' | 'gantt'): DiagramTextAlternative` with a known flowchart definition and assert the returned object contains:
    - `type: 'flowchart'`
    - `nodes: Array<{ id: string; label: string }>` with correct entries
    - `edges: Array<{ from: string; to: string; label?: string }>` with correct entries
    - `prose: string` — a human-readable plain-text summary paragraph
  - Test `generateTableRows(diagramDef: string, diagramType): DiagramTableRow[]` returns an array of `{ column1, column2, ... }` objects suitable for tabular display.
  - Test that an unknown diagram syntax returns `{ type: 'unknown', prose: 'Diagram could not be parsed.', nodes: [], edges: [] }` without throwing.
  - Test that a Gantt diagram returns rows with `task`, `startDate`, `endDate`, `status` columns.
  - Test that a sequence diagram returns rows with `from`, `to`, `message`, `type` columns.

## 2. Task Implementation
- [ ] Create `packages/core/src/diagramAlternative/`:
  - `types.ts` — define and export:
    ```ts
    export type DiagramType = 'flowchart' | 'sequenceDiagram' | 'classDiagram' | 'gantt' | 'unknown';
    export interface DiagramNode { id: string; label: string; }
    export interface DiagramEdge { from: string; to: string; label?: string; }
    export interface DiagramTextAlternative {
      type: DiagramType;
      prose: string;
      nodes: DiagramNode[];
      edges: DiagramEdge[];
      tableRows?: Record<string, string>[];
    }
    ```
  - `parsers/flowchartParser.ts` — use `mermaid.parse()` (or the Mermaid AST API in v10+) to extract nodes and edges from flowchart/graph definitions.
  - `parsers/sequenceParser.ts` — extract actor pairs and messages from `sequenceDiagram` definitions.
  - `parsers/ganttParser.ts` — extract task name, section, start, end, and status from `gantt` definitions.
  - `parsers/classParser.ts` — extract class names, methods, and relationships from `classDiagram` definitions.
  - `DiagramAlternativeService.ts` — factory that selects the correct parser by detecting the diagram type from the first non-empty line, then calls `generateTextSummary()` and `generateTableRows()`.
  - `proseGenerator.ts` — convert parsed `DiagramNode[]` and `DiagramEdge[]` into a plain English summary paragraph using template strings (no AI call — deterministic).
- [ ] Export `DiagramAlternativeService` and all types from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify all parsers handle malformed Mermaid gracefully — wrap in try/catch and return the `unknown` fallback.
- [ ] Confirm `proseGenerator` output is deterministic for the same input (no randomness, no date stamps).
- [ ] Confirm no circular imports between `diagramAlternative` and other core modules.
- [ ] Confirm `DiagramAlternativeService` does not import any UI/React code — must remain a pure Node.js-compatible module.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=diagramAlternative` and confirm 0 failures.
- [ ] Run `pnpm --filter @devs/core test --coverage` and confirm coverage for `diagramAlternative/**` is ≥ 90%.

## 5. Update Documentation
- [ ] Create `packages/core/src/diagramAlternative/README.md` documenting:
  - Supported diagram types and their table column schemas.
  - How to call `DiagramAlternativeService.generateTextSummary()`.
  - How to add a new parser for a new diagram type.
- [ ] Add `diagramAlternative` to `docs/agent-memory/core.agent.md` under available services.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --reporter=json --outputFile=test-results/diagram-alternative.json` and assert `"numFailedTests": 0`.
- [ ] Run `pnpm --filter @devs/core build` and confirm no TypeScript compilation errors.
