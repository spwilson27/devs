# Task: Implement Mermaid Diagram Visual Correctness Benchmark (Sub-Epic: 24_Benchmarking Suite Document and Quality Metrics)

## Covered Requirements
- [9_ROADMAP-REQ-028]

## 1. Initial Test Written
- [ ] Create `src/benchmarks/__tests__/mermaidVisualCorrectness.bench.ts` with the following test cases:
  - **Unit test — valid diagram**: Write a test that passes a valid Mermaid ERD string (e.g., `erDiagram\n  USER ||--o{ ORDER : places`) through `MermaidValidator.validate()` and asserts `{ valid: true, errors: [] }`.
  - **Unit test — valid sequence**: Same for a valid Mermaid sequence diagram (e.g., `sequenceDiagram\n  Alice->>Bob: Hello`).
  - **Unit test — invalid diagram**: Write a test that passes a syntactically broken Mermaid string (e.g., `erDiagram\n  USER ||--oX INVALID`) and asserts `valid: false` with a non-empty `errors` array.
  - **Integration test — extract and validate all diagrams**: Write a test that scans `specs/` for all `.md` files, extracts all ` ```mermaid ` fenced code blocks, runs each through `MermaidValidator.validate()`, and asserts that 100% of extracted diagrams return `{ valid: true }`.
  - **Edge-case test**: Assert that a Markdown file with no Mermaid blocks returns `[]` from `MermaidDiagramExtractor.extract()` without throwing.

## 2. Task Implementation
- [ ] Install `@mermaid-js/mermaid-cli` or `mermaid` package for server-side parsing: `npm install mermaid`. Since Mermaid requires a browser for full rendering, use the `mermaid` package's `parse()` API in a Node.js environment to perform syntax validation only.
- [ ] Create `src/benchmarks/mermaidDiagramExtractor.ts` exporting `MermaidDiagramExtractor` class with:
  - `extract(markdownContent: string): MermaidBlock[]` method.
  - Uses a regex `` /```mermaid\n([\s\S]*?)```/g `` to extract all Mermaid fenced code blocks.
  - Returns typed `MermaidBlock[]` where `MermaidBlock = { source: string; lineNumber: number }`.
- [ ] Create `src/benchmarks/mermaidValidator.ts` exporting `MermaidValidator` class with:
  - `validate(diagramSource: string): { valid: boolean; errors: string[] }` method.
  - Attempts to parse the diagram using `mermaid.parse(diagramSource)` wrapped in a try/catch.
  - On success, returns `{ valid: true, errors: [] }`.
  - On parse error, returns `{ valid: false, errors: [error.message] }`.
- [ ] Create `src/benchmarks/scripts/runMermaidBench.ts` that:
  1. Recursively reads all `.md` files under `specs/` and `docs/`.
  2. Extracts all Mermaid blocks using `MermaidDiagramExtractor`.
  3. Validates each block using `MermaidValidator`.
  4. Prints a JSON summary: `{ totalDiagrams: number, passed: number, failed: number, failedDiagrams: { file: string; line: number; error: string }[] }`.
- [ ] Add npm script: `"bench:mermaid": "ts-node src/benchmarks/scripts/runMermaidBench.ts"`.

## 3. Code Review
- [ ] Verify `MermaidDiagramExtractor.extract()` handles edge cases: unclosed fences, nested code blocks, and empty Mermaid blocks (returns `[]` or skips them without throwing).
- [ ] Confirm `MermaidBlock` and the validator result type are exported from `src/benchmarks/types.ts`.
- [ ] Ensure the validator does NOT launch a browser or Puppeteer — it must be a pure parse-only check using the `mermaid` Node.js API.
- [ ] Verify the benchmark script resolves file paths using `path.resolve` and handles `ENOENT` gracefully (logs a warning, continues).
- [ ] Confirm TypeScript strict mode is applied — no implicit `any` in regex match results.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="mermaidVisualCorrectness"` and confirm all tests pass with exit code 0.
- [ ] Run `npm run bench:mermaid` and confirm the output JSON shows `failed: 0` and `failedDiagrams: []`.

## 5. Update Documentation
- [ ] Update `docs/benchmarks/README.md` with a section "Mermaid Visual Correctness Benchmark" describing the extraction process, the validation method, how to run it, and the pass criterion (100% of diagrams parse without errors, maps to `[9_ROADMAP-REQ-028]`).
- [ ] Add a `// [9_ROADMAP-REQ-028]` comment above the `validate()` method signature in `mermaidValidator.ts`.
- [ ] Create `src/benchmarks/mermaidValidator.agent.md` documenting the module, its limitations (syntax-only, not pixel-render), and instructions for adding new Mermaid diagrams to spec documents.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="mermaidVisualCorrectness" --coverage` and assert coverage ≥ 90% for `src/benchmarks/mermaidDiagramExtractor.ts` and `src/benchmarks/mermaidValidator.ts`.
- [ ] Run `npm run bench:mermaid` and assert programmatically via: `node -e "const r=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));process.exit(r.failed===0?0:1)"`.
- [ ] Add `bench:mermaid` to CI pipeline so any newly added broken Mermaid diagram causes a build failure.
