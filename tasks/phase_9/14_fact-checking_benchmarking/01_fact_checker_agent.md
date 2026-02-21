# Task: Implement Fact-Checker Agent for Research Validation (Sub-Epic: 14_Fact-Checking & Benchmarking)

## Covered Requirements
- [8_RISKS-REQ-052]

## 1. Initial Test Written
- [ ] Write a unit test suite in `tests/agents/factCheckerAgent.test.ts` for the `FactCheckerAgent`.
- [ ] Include a test case that provides a mocked "Research Report" containing a fabricated finding (e.g., "Library X has 50M downloads") and the raw scraped data which contradicts it (e.g., "Library X has 500 downloads"). Assert that the agent identifies the discrepancy and flags it.
- [ ] Include a test case where the Research Report accurately reflects the raw scraped data. Assert that the agent passes the validation without raising flags.

## 2. Task Implementation
- [ ] Create the `FactCheckerAgent` class in `src/agents/FactCheckerAgent.ts`.
- [ ] Implement the `verify()` method which takes a generated `ResearchReport` and the original `RawScrapedData` array as inputs.
- [ ] Construct a specific system prompt instructing the LLM (e.g., Gemini 3 Pro) to act as a strict fact-checker, comparing every claim in the report against the raw context, looking for hallucinated features, incorrect numbers, or unsupported claims.
- [ ] Return a structured evaluation object containing `isValid: boolean`, `discrepancies: string[]`, and `confidenceScore: number`.

## 3. Code Review
- [ ] Ensure that the agent does not throw an error if the raw scraped data exceeds the LLM context window; instead, implement a fallback or chunking strategy (or rely on `ContextPruner`).
- [ ] Verify the system prompt uses explicit XML/markdown delimiters to separate the "Report" from the "Raw Data" to prevent prompt injection or confusion.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/agents/factCheckerAgent.test.ts` and verify all tests pass.
- [ ] Confirm no regressions in the core agent infrastructure by running `npm run test:agents`.

## 5. Update Documentation
- [ ] Document the `FactCheckerAgent` inside `.agent/agents.md`. Explain its role in the Research phase and its input/output signature.
- [ ] Update the Phase 9 Validation architecture diagrams if necessary to include the Fact-Checker step.

## 6. Automated Verification
- [ ] Run `npm run lint` and `npm run typecheck` to verify no typescript or formatting errors have been introduced.
