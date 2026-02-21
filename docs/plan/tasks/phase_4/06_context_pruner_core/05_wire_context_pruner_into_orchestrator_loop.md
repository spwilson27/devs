# Task: Wire ContextPruner into Orchestrator Loop and Integration Tests (Sub-Epic: 06_Context_Pruner_Core)

## Covered Requirements
- [9_ROADMAP-TAS-105], [9_ROADMAP-REQ-SYS-001]

## 1. Initial Test Written

- [ ] Create `packages/core/src/__tests__/orchestrator-context-pruning.integration.test.ts`.
  - Use a real `ContextPruner` with a mocked `FlashSummarizer` (returns a fixed summary string).
  - Create a mock orchestrator loop that appends turns to a `ContextWindow` and calls the pruner on each iteration.
  - **Test A – No Prune Below Threshold**: Simulate 10 turns totaling 400k tokens. Assert that after each loop iteration, `window.turns.length` stays at 10 and no summary turn is injected.
  - **Test B – Soft Prune at 500k**: Simulate turns accumulating to 520k tokens. Assert that on the iteration where the threshold is crossed, `ContextPruner.prune` returns `{ pruned: true }`, and the returned window's `totalTokenEstimate` is less than `520_000`.
  - **Test C – Hard Prune at 800k**: Simulate turns accumulating to 850k tokens. Assert that pruning is triggered and the window is reduced even when the number of candidate turns is at the minimum (3 turns).
  - **Test D – Pinned Turns Preserved**: Create a window where the first 2 turns are the system prompt and PRD injection (pinned). Simulate pruning. Assert that neither of the pinned turns appears in the summarizer's input and both are present in the pruned output window at indices 0 and 1.
  - **Test E – Summary Turn Injection**: After a pruning event, assert that the resulting `window.turns` contains exactly one turn with `content` matching `/^\[Context Summary\]/`.
  - **Test F – Sequential Pruning**: Simulate a loop running 50 turns where pruning is triggered at turns 20, 35, and 50. Assert each prune event reduces the window correctly and the window never exceeds `hardLimitTokens`.

## 2. Task Implementation

- [ ] In `packages/core/src/orchestrator/orchestrator.ts` (or the relevant orchestrator module), locate the main agent turn loop.
- [ ] Inject `ContextPruner` as a dependency into the orchestrator class/factory. The constructor should accept `contextPruner?: ContextPruner` (optional, for backward compatibility).
- [ ] After each agent turn completes and a new `ConversationTurn` is appended to the context window:
  1. Call `annotateWithTokenEstimates` on the updated turns array.
  2. Compute the updated `totalTokenEstimate`.
  3. Call `await this.contextPruner.prune(currentWindow, activeTaskContext)`.
  4. If `result.pruned === true`, replace `currentWindow` with `result.window` and emit a log event: `{ event: 'context_pruned', removedTurnCount: result.removedTurnCount, tokensSaved: result.tokensSaved, newTotal: result.window.totalTokenEstimate }`.
  5. Continue to the next loop iteration with the (possibly pruned) window.
- [ ] Add a `createDefaultContextPruner(llmClient: LLMClient): ContextPruner` factory function in `packages/memory/src/context-pruner/factory.ts`:
  ```typescript
  export function createDefaultContextPruner(llmClient: LLMClient): ContextPruner {
    const summarizerConfig: FlashSummarizerConfig = {
      model: 'gemini-3-flash',
      maxOutputTokens: 4096,
      temperature: 0.1,
    };
    const prunerConfig: PrunerConfig = {
      softLimitTokens: 500_000,
      hardLimitTokens: 800_000,
      pinnedPrefixTurns: 2,
      model: 'gemini-3-flash',
    };
    const summarizer = new FlashSummarizer(llmClient, summarizerConfig);
    return new ContextPruner(summarizer, prunerConfig);
  }
  ```
- [ ] Export `createDefaultContextPruner` from `packages/memory/src/index.ts`.
- [ ] Update the orchestrator's initialization code to call `createDefaultContextPruner(llmClient)` and pass the resulting instance to the orchestrator constructor.

## 3. Code Review

- [ ] Verify the orchestrator does not import `FlashSummarizer` directly — it must depend only on `ContextPruner` (single level of abstraction).
- [ ] Verify the orchestrator emits the `context_pruned` log event with all required fields for observability ([9_ROADMAP-REQ-SYS-001]).
- [ ] Verify the optional `contextPruner` parameter allows the orchestrator to run without pruning in test environments where the pruner is not provided (graceful no-op).
- [ ] Confirm the `activeTaskContext` string passed to `prune` contains the current task's title or requirement ID, ensuring the Flash summary is contextually relevant.
- [ ] Verify `createDefaultContextPruner` correctly wires Gemini 3 Flash as the summarization model ([9_ROADMAP-TAS-105]).
- [ ] Confirm no token estimation or pruning logic has leaked into the orchestrator itself — it must only call `contextPruner.prune()`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=orchestrator-context-pruning` and confirm all 6 integration tests (A–F) pass.
- [ ] Run full test suite: `pnpm test` from the monorepo root and confirm no regressions are introduced in other packages.
- [ ] Run `pnpm tsc --noEmit` from the monorepo root and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Update `packages/core/README.md` with a `## Context Pruning` section describing how `ContextPruner` is wired into the orchestrator, the `context_pruned` event, and the default configuration.
- [ ] Update `packages/memory/README.md` with a `### createDefaultContextPruner` section showing the factory function usage example.
- [ ] Append to `.devs/memory/phase_4_decisions.md`: _"ContextPruner is injected into the orchestrator as an optional dependency via createDefaultContextPruner factory. Pruning is triggered after each turn. The 'context_pruned' event is emitted for observability. Active task context is passed to the summarizer for relevance ([9_ROADMAP-TAS-105], [9_ROADMAP-REQ-SYS-001])."_

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/core test --reporter=json > /tmp/orchestrator-pruning-results.json` and assert exit code `0`.
- [ ] Verify `/tmp/orchestrator-pruning-results.json` has `"numFailedTests": 0`.
- [ ] Run the full monorepo test suite and pipe results: `pnpm test --reporter=json > /tmp/full-test-results.json`. Assert exit code `0` and `"numFailedTests": 0`.
