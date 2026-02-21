# Task: Implement Gemini Flash Context Compression Turn (Sub-Epic: 08_Context_Compression_and_Token_Management)

## Covered Requirements
- [3_MCP-TAS-049], [1_PRD-REQ-PERF-001], [1_PRD-REQ-CON-004], [1_PRD-REQ-SYS-001]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/compression/__tests__/context-compressor.test.ts`.
- [ ] Write a unit test that mocks the Gemini Flash API client (`@devs/llm/flash`) and asserts that `ContextCompressor.compress(turns)` calls the Flash model with a prompt containing the serialized conversation turns.
- [ ] Write a unit test asserting that the compressor returns a `CompressedContext` object containing: `summary: string`, `retainedTurns: Turn[]` (the most recent N turns that were NOT summarized), and `tokensSaved: number`.
- [ ] Write a unit test asserting that the compressor always retains the current task's Plan turn and the most recent failing Observation turn unchanged (these must never be summarized away), per `[3_MCP-TAS-024]`.
- [ ] Write a unit test asserting that if the Flash API call fails, the compressor throws a `CompressionError` with a descriptive message and does NOT mutate the original turn array.
- [ ] Write a unit test confirming that the compression is only triggered when token count >= 800k (delegates to `TokenThresholdMonitor`).
- [ ] Write an integration test in `packages/memory/src/compression/__tests__/context-compressor.integration.test.ts` that uses a real (or stubbed-out) Flash model to compress a 50-turn conversation and asserts the output summary is non-empty and the retained turn count is ≤ 5.

## 2. Task Implementation
- [ ] Create `packages/memory/src/compression/context-compressor.ts`.
- [ ] Define and export the `CompressedContext` interface:
  ```typescript
  export interface CompressedContext {
    summary: string;
    retainedTurns: Turn[];
    tokensSaved: number;
    compressedAt: string; // ISO timestamp
  }
  ```
- [ ] Define and export `CompressionError` as a subclass of `Error`.
- [ ] Implement the `ContextCompressor` class:
  - Constructor accepts `flashClient: GeminiFlashClient` and `options?: { retainLastNTurns?: number }` (default `retainLastNTurns = 3`).
  - Implement `async compress(turns: Turn[]): Promise<CompressedContext>`:
    1. Identify and extract the Plan turn (type `'plan'`) and the most recent failing Observation turn (type `'observation'`, `status: 'failed'`) — these are always retained verbatim.
    2. From the remaining turns, retain the last `retainLastNTurns` turns.
    3. Build a summarization prompt: "You are a context compressor for an AI coding agent. Summarize the following conversation turns into a concise technical summary preserving all decisions, constraints, and failure modes: \n\n{JSON.stringify(turnsToSummarize)}"
    4. Call `flashClient.generateContent(prompt)` and extract the summary text.
    5. Calculate `tokensSaved` as `estimateTokens(turnsToSummarize) - estimateTokens(summary)`.
    6. Return the `CompressedContext` object.
  - Wrap the Flash API call in try/catch; throw `CompressionError` on failure.
- [ ] Export from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm the Plan turn and the most recent failing Observation turn are ALWAYS in `retainedTurns` — add assertions in the implementation's guard clauses.
- [ ] Confirm the Flash model is called with exactly one prompt string and that the prompt does not exceed 200k tokens itself (add a guard that throws `CompressionError` if the input itself is too large).
- [ ] Confirm `tokensSaved` is never negative (clamp to 0 if the summary is unexpectedly larger).
- [ ] Confirm no mutable state is held between `compress()` calls — the compressor must be stateless/re-entrant.
- [ ] Confirm the integration test uses `nock` or `msw` to intercept the real HTTP call rather than reaching the internet.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test --testPathPattern="context-compressor"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test:coverage --testPathPattern="context-compressor"` and confirm >= 90% branch coverage.

## 5. Update Documentation
- [ ] Add a `## Context Compressor` section to `packages/memory/README.md` describing the compression algorithm, what is always retained (Plan + failing Observation), and how `tokensSaved` is estimated.
- [ ] Update `docs/architecture/context-management.md` to include a sequence diagram (Mermaid) showing the compression trigger flow: `TokenThresholdMonitor` → 800k threshold → `ContextCompressor.compress()` → returns `CompressedContext`.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/memory test` exits with code 0.
- [ ] After build, verify: `node -e "const m = require('./packages/memory/dist'); console.assert(typeof m.ContextCompressor === 'function'); console.assert(typeof m.CompressionError === 'function')"`.
