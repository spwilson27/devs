# Task: Implement ContextPruner with Gemini Flash Summarization for Intermediate Turns (Sub-Epic: 07_Sliding_Relevance_Window)

## Covered Requirements
- [3_MCP-TAS-024], [3_MCP-REQ-SYS-001]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/context-pruner/__tests__/context-pruner.test.ts`.
- [ ] Write a test: `ContextPruner.shouldPrune(currentTokenCount: number, budget: WindowBudget): boolean` returns `false` when `currentTokenCount` is below 90% of `budget.totalBudget`.
- [ ] Write a test: `shouldPrune` returns `true` when `currentTokenCount >= budget.totalBudget * 0.90` (saturation threshold).
- [ ] Write a test using a mock `GeminiFlashClient`: `ContextPruner.prune(turns: AgentTurn[], plan: string, tas: string, currentObservation: string): Promise<PrunedContext>` calls the Flash model's `summarize` method exactly once when `shouldPrune` is true.
- [ ] Write a test: the returned `PrunedContext` MUST always include the full `plan` text, the full `tas` text, and the full `currentObservation` text, regardless of length.
- [ ] Write a test: `PrunedContext.summary` is a non-empty string when the Flash client returns a valid response.
- [ ] Write a test: when the Flash client throws a network error, `prune()` re-throws a `ContextPrunerError` with `cause` set to the original error.
- [ ] Write an integration test stub (marked `@skip` for CI) verifying the live Flash API call returns a summary shorter than the combined input text.

## 2. Task Implementation

- [ ] Create `packages/memory/src/context-pruner/types.ts`. Export:
  - `AgentTurn = { role: 'user' | 'model'; content: string; timestampMs: number }`
  - `PrunedContext = { summary: string; plan: string; tas: string; currentObservation: string; originalTurnCount: number; prunedAt: number }`
  - `ContextPrunerError` (extends `Error`) with a `cause` field.
- [ ] Create `packages/memory/src/context-pruner/gemini-flash-client.ts`. Define and export `interface GeminiFlashClient { summarize(prompt: string): Promise<string> }`. Implement `class DefaultGeminiFlashClient implements GeminiFlashClient` that calls the Gemini 3 Flash REST API endpoint (`gemini-flash` model) with a structured prompt requesting a concise technical summary. Use the `GEMINI_API_KEY` environment variable for auth.
- [ ] Create `packages/memory/src/context-pruner/context-pruner.ts`. Implement `class ContextPruner`:
  - Constructor: `constructor(flashClient: GeminiFlashClient, options?: { saturationRatio?: number })`. Default `saturationRatio = 0.90`.
  - Method: `shouldPrune(currentTokenCount: number, budget: WindowBudget): boolean` — returns `currentTokenCount >= budget.totalBudget * saturationRatio`.
  - Method: `async prune(turns: AgentTurn[], plan: string, tas: string, currentObservation: string): Promise<PrunedContext>`:
    1. Construct a summarization prompt instructing the Flash model to condense `turns` into a concise technical narrative, preserving all code symbols, file paths, error messages, and strategic decisions. The prompt MUST include the instruction: "Preserve only the Plan, TAS, and the current failing Observation verbatim."
    2. Call `flashClient.summarize(prompt)`.
    3. Return `PrunedContext` with the summary plus verbatim `plan`, `tas`, `currentObservation`.
    4. On error, wrap in `ContextPrunerError`.
- [ ] Add barrel export in `packages/memory/src/context-pruner/index.ts`.

## 3. Code Review

- [ ] Verify the summarization prompt explicitly instructs the model to preserve: Plan, TAS, and current failing Observation verbatim. This is a correctness requirement from [3_MCP-TAS-024].
- [ ] Confirm `DefaultGeminiFlashClient` reads `GEMINI_API_KEY` from `process.env` and throws a descriptive `Error` at construction time if the variable is missing.
- [ ] Verify `prune()` is not called when `shouldPrune` returns `false`—callers should check first; document this contract in JSDoc.
- [ ] Ensure no agent turn data is logged to disk during pruning (privacy constraint).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="context-pruner"` and confirm all non-skipped tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/context-pruner/context-pruner.agent.md` describing: the 90% saturation threshold, the Flash model used for summarization, what is always preserved verbatim (Plan, TAS, current Observation), and the `ContextPrunerError` retry contract.
- [ ] Update `packages/memory/README.md` to list the `context-pruner` sub-module and link to its `.agent.md`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="context-pruner"` and confirm branch coverage ≥ 85% for `context-pruner.ts`.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code `0`.
- [ ] Confirm the test suite does NOT make live HTTP calls by asserting no outbound network requests occur during `pnpm test` (use `nock` or equivalent interceptor in the test setup to assert this).
