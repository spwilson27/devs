# Task: Implement ContextPruner Class with Sliding-Window Logic (Sub-Epic: 06_Context_Pruner_Core)

## Covered Requirements
- [TAS-024], [2_TAS-REQ-028], [8_RISKS-REQ-010]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/context-pruner/__tests__/context-pruner.test.ts`.
  - Mock `FlashSummarizer` to return a fixed summary string `"[SUMMARY: turns 2-8]"`.
  - Write a test: given a `ContextWindow` with `totalTokenEstimate = 450_000` (below 500k soft limit), calling `pruner.prune(window)` returns `PrunerResult` with `pruned: false` and the original window unchanged.
  - Write a test: given a `ContextWindow` with `totalTokenEstimate = 550_000` (above 500k soft limit, below 800k hard limit), calling `pruner.prune(window)` triggers `FlashSummarizer.summarize`, returns `PrunerResult` with `pruned: true`, a non-empty `summary`, `removedTurnCount >= 1`, and `tokensSaved > 0`.
  - Write a test: given a `ContextWindow` with `totalTokenEstimate = 850_000` (above 800k hard limit), calling `pruner.prune(window)` also triggers summarization and forces pruning even if fewer candidate turns exist.
  - Write a test: pinned turns (first `config.pinnedPrefixTurns` turns and `turn.pinned === true` turns) are NEVER present in the list passed to `FlashSummarizer.summarize`.
  - Write a test: the returned `window` after pruning contains a new synthetic `ConversationTurn` with `role: 'user'` and `content` equal to the summary, inserted at the position where the pruned turns were.
  - Write a test: `pruner.prune(window)` re-annotates all remaining turns with updated `tokenEstimate` after pruning, and `result.window.totalTokenEstimate` reflects the reduced count.
  - Write a test: if `selectTurnsForSummarization` returns an empty array (not enough candidate turns), `pruner.prune` returns `pruned: false` even when above the soft limit.

## 2. Task Implementation

- [ ] Create `packages/memory/src/context-pruner/context-pruner.ts`:
  - Export class `ContextPruner`:
    - Constructor: `constructor(private summarizer: FlashSummarizer, private config: PrunerConfig)`
    - `async prune(window: ContextWindow, taskContext: string = ''): Promise<PrunerResult>`:
      1. Call `classifyPruneUrgency(window, this.config)` to get urgency.
      2. If urgency is `'none'`, return `{ pruned: false, window }`.
      3. Call `selectTurnsForSummarization(window, this.config)` to get candidate turns.
      4. If candidates array is empty, return `{ pruned: false, window }`.
      5. Call `await this.summarizer.summarize(candidates, taskContext)` to get the summary text.
      6. Build `summaryTurn: ConversationTurn` with a new UUID, `role: 'user'`, `content: \`[Context Summary]\n${summary}\``, `timestamp: Date.now()`, `pinned: false`.
      7. Reconstruct the new `turns` array:
         - `pinnedPrefix` = first `this.config.pinnedPrefixTurns` turns.
         - Additional pinned turns from the candidate pool (where `turn.pinned === true`).
         - Insert `summaryTurn`.
         - Append the last 5 turns (recent tail).
      8. Run `annotateWithTokenEstimates` on the reconstructed turns.
      9. Compute new `totalTokenEstimate` by calling `estimateMessagesTokenCount`.
      10. Return `{ pruned: true, window: { turns: newTurns, totalTokenEstimate }, summary, removedTurnCount: candidates.length, tokensSaved: window.totalTokenEstimate - newTotalTokenEstimate }`.
    - `buildPrunedWindow(original: ContextWindow, candidates: ConversationTurn[], summaryTurn: ConversationTurn): ContextWindow` — private helper implementing step 7-9 above, making it independently testable.

## 3. Code Review

- [ ] Verify the `ContextPruner` depends on `FlashSummarizer` interface (not a concrete class) to remain testable.
- [ ] Verify the turn reconstruction logic always places the `summaryTurn` between the pinned prefix and the recent tail — never before pinned turns and never after recent tail.
- [ ] Verify that `tokensSaved` cannot be negative (clamp to `0` if needed).
- [ ] Confirm that `removedTurnCount` equals exactly `candidates.length` (the turns passed to summarization).
- [ ] Confirm no mutation of the original `window.turns` array at any point.
- [ ] Verify the `[Context Summary]` marker prefix on the summary turn content allows downstream agents to detect and skip re-summarization of already-summarized turns.
- [ ] Verify all three requirement thresholds are enforced: 500k soft ([8_RISKS-REQ-010]), 800k hard ([TAS-024]), and the sliding-window candidate selection ([2_TAS-REQ-028]).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=context-pruner` and confirm all tests pass.
- [ ] Run `pnpm tsc --noEmit` in `packages/memory/` with no errors.

## 5. Update Documentation

- [ ] Update `packages/memory/README.md` with a `### ContextPruner` class section: document the constructor, `prune` method signature, the `PrunerResult` return shape, and describe the sliding-window turn reconstruction algorithm.
- [ ] Append to `.devs/memory/phase_4_decisions.md`: _"ContextPruner.prune() implements sliding-window management: soft prune at 500k tokens (Flash summarization triggered), hard prune at 800k tokens (forced). Pinned prefix and last-5-turn tail are always preserved. Summary is injected as a synthetic 'user' turn with '[Context Summary]' marker. ([TAS-024], [2_TAS-REQ-028], [8_RISKS-REQ-010])"_

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/context-pruner-results.json` and assert exit code `0`.
- [ ] Verify `/tmp/context-pruner-results.json` has `"numFailedTests": 0`.
- [ ] Run a quick smoke test script:
  ```bash
  node -e "
  const { ContextPruner } = require('./packages/memory/dist/index.js');
  console.assert(typeof ContextPruner === 'function', 'ContextPruner must be exported');
  console.log('ContextPruner smoke test passed');
  "
  ```
