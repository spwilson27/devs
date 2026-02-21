# Task: Implement SWOT Analysis Generator with Mermaid.js Diagrams (Sub-Epic: 07_Market & User Research Domains)

## Covered Requirements
- [1_PRD-REQ-RES-001], [9_ROADMAP-REQ-RES-001]

## 1. Initial Test Written
- [ ] In `src/research/market/__tests__/swotGenerator.test.ts`, write the following tests:
  - **Unit: `SWOTAnalysisGenerator.generate(competitorProfile)`**
    - Mock `LLMClient.complete()` to return a fixture JSON object with `strengths`, `weaknesses`, `opportunities`, `threats` arrays (3 items each).
    - Assert the returned `SWOTAnalysis` validates against `SWOTAnalysisSchema`.
    - Assert each array contains at least 1 item.
  - **Unit: `renderSWOTMermaid(analysis, competitorName)`**
    - Provide a fixture `SWOTAnalysis` object.
    - Assert the returned string begins with ` ```mermaid` and ends with ` ``` `.
    - Assert the output contains the competitor name as a graph title.
    - Assert the output contains all 4 quadrant labels: `Strengths`, `Weaknesses`, `Opportunities`, `Threats`.
    - Assert the output uses Mermaid `quadrantChart` or `mindmap` syntax (validate by checking for `quadrantChart` keyword or `mindmap` keyword in the output).
  - **Unit: malformed LLM output handling**
    - Mock `LLMClient.complete()` to return a plain string (not JSON).
    - Assert the generator throws `SWOTParseError` with a descriptive message.
  - **Unit: empty array handling**
    - Mock LLM to return a SWOT object where `strengths: []`.
    - Assert `SWOTAnalysisSchema` validation throws (violating `.min(1)` constraint).

## 2. Task Implementation
- [ ] Create `src/research/market/swotGenerator.ts` exporting:
  - `SWOTAnalysisGenerator` class with constructor `{ llmClient: LLMClient }` and method `async generate(competitor: CompetitorProfile): Promise<SWOTAnalysis>`:
    1. Builds a structured LLM prompt from `prompts/swotAnalysis.ts` using competitor's `name`, `description`, `features`, and `pricing`.
    2. Calls `llmClient.complete(prompt, { responseFormat: 'json' })`.
    3. Parses the JSON response and validates with `SWOTAnalysisSchema.parse()`.
    4. On parse failure, throws `SWOTParseError` with the raw LLM response included.
  - `renderSWOTMermaid(analysis: SWOTAnalysis, competitorName: string): string` — pure function returning a Mermaid `quadrantChart` block as a fenced code string. Map `strengths`/`opportunities` to positive quadrants and `weaknesses`/`threats` to negative quadrants. Truncate each item to 60 characters to avoid Mermaid rendering issues.
- [ ] Create `src/research/market/errors.ts` (update existing) to add `SWOTParseError extends Error` with property `rawResponse: string`.
- [ ] Create `src/research/market/prompts/swotAnalysis.ts` exporting `buildSWOTPrompt(competitor: CompetitorProfile): string`.

## 3. Code Review
- [ ] Verify `renderSWOTMermaid` is a pure function with no side effects.
- [ ] Verify the Mermaid output string uses only ASCII-safe characters (escape special characters `"`, `'`, `:`).
- [ ] Verify the LLM prompt explicitly instructs the model to respond with valid JSON only (no prose).
- [ ] Verify `SWOTParseError` includes the raw LLM response for debugging.
- [ ] Verify that item truncation in `renderSWOTMermaid` uses `item.slice(0, 60)` with an ellipsis suffix when truncated.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/research/market/__tests__/swotGenerator.test.ts` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `src/research/market/market.agent.md` to add a section:
  - **SWOTAnalysisGenerator**: Inputs (`CompetitorProfile`), outputs (`SWOTAnalysis`), failure modes (`SWOTParseError`).
  - **renderSWOTMermaid**: Inputs (`SWOTAnalysis`, `competitorName`), outputs (fenced Mermaid `quadrantChart` string). Note 60-char truncation rule.
  - Include a small example of the generated Mermaid block.

## 6. Automated Verification
- [ ] Run `pnpm test --coverage src/research/market/__tests__/swotGenerator.test.ts` and assert line coverage ≥ 90% for `swotGenerator.ts`.
- [ ] Run a smoke test script `scripts/smoke-swot.ts` that: instantiates `SWOTAnalysisGenerator` with a mock LLM returning a fixture, calls `generate()`, calls `renderSWOTMermaid()`, and asserts the output string contains `quadrantChart` — exit code 0 on success.
