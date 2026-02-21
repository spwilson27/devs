# Task: Implement Token Threshold Detection and Pruning Trigger Logic (Sub-Epic: 06_Context_Pruner_Core)

## Covered Requirements
- [TAS-024], [8_RISKS-REQ-010]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/context-pruner/__tests__/pruning-trigger.test.ts`.
  - Write unit tests for `shouldTriggerSoftPrune(window: ContextWindow, config: PrunerConfig): boolean`:
    - Returns `false` when `totalTokenEstimate < config.softLimitTokens`.
    - Returns `true` when `totalTokenEstimate >= config.softLimitTokens` (500k default from [8_RISKS-REQ-010]).
    - Returns `true` when `totalTokenEstimate >= config.hardLimitTokens` (800k default from [TAS-024]).
  - Write unit tests for `shouldTriggerHardPrune(window: ContextWindow, config: PrunerConfig): boolean`:
    - Returns `false` when tokens are below `hardLimitTokens`.
    - Returns `true` when tokens meet or exceed `hardLimitTokens` (800k).
  - Write unit tests for `classifyPruneUrgency(window: ContextWindow, config: PrunerConfig): PruneUrgency`:
    - Returns `'none'` below soft limit.
    - Returns `'soft'` between soft and hard limits.
    - Returns `'hard'` at or above hard limit.
  - Use mock `ContextWindow` objects with explicit `totalTokenEstimate` values: `0`, `499_999`, `500_000`, `799_999`, `800_000`, `1_000_000`.

## 2. Task Implementation

- [ ] Add the `PruneUrgency` type to `packages/memory/src/context-pruner/types.ts`:
  ```typescript
  export type PruneUrgency = 'none' | 'soft' | 'hard';
  ```
- [ ] Create `packages/memory/src/context-pruner/pruning-trigger.ts`:
  - Export `shouldTriggerSoftPrune(window: ContextWindow, config: PrunerConfig): boolean`:
    ```typescript
    return window.totalTokenEstimate >= config.softLimitTokens;
    ```
  - Export `shouldTriggerHardPrune(window: ContextWindow, config: PrunerConfig): boolean`:
    ```typescript
    return window.totalTokenEstimate >= config.hardLimitTokens;
    ```
  - Export `classifyPruneUrgency(window: ContextWindow, config: PrunerConfig): PruneUrgency`:
    ```typescript
    if (window.totalTokenEstimate >= config.hardLimitTokens) return 'hard';
    if (window.totalTokenEstimate >= config.softLimitTokens) return 'soft';
    return 'none';
    ```
  - Export `selectTurnsForSummarization(window: ContextWindow, config: PrunerConfig): ConversationTurn[]`:
    - Returns the slice of turns to be sent to Flash for summarization.
    - Always excludes the first `config.pinnedPrefixTurns` turns (pinned system/PRD injections).
    - Always excludes any turns where `turn.pinned === true`.
    - Excludes the last 5 turns (the most recent history, to preserve continuity).
    - Returns the "middle" turns between pinned prefix and recent tail. These are the candidates for summarization.
    - If fewer than 3 candidate turns exist, returns an empty array (no prune needed).
- [ ] Add exports for `pruning-trigger.ts` to `packages/memory/src/context-pruner/index.ts`.

## 3. Code Review

- [ ] Verify that all functions are pure (no side effects, no mutations).
- [ ] Verify threshold constants match spec: soft = 500k (per [8_RISKS-REQ-010]), hard = 800k (per [TAS-024]).
- [ ] Verify that `selectTurnsForSummarization` correctly excludes pinned turns via both `pinnedPrefixTurns` config AND the `turn.pinned` field.
- [ ] Confirm the last-5-turns tail exclusion rule is implemented correctly using `window.turns.slice(...)`.
- [ ] Confirm no mutation of `window.turns` array.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=pruning-trigger` and confirm all assertions pass.
- [ ] Run `pnpm tsc --noEmit` in `packages/memory/` with no errors.

## 5. Update Documentation

- [ ] Update `packages/memory/README.md` with a `### Pruning Trigger` section describing the two thresholds, the `PruneUrgency` enum, and the `selectTurnsForSummarization` selection algorithm.
- [ ] Append to `.devs/memory/phase_4_decisions.md`: _"Pruning trigger thresholds: Soft=500k tokens ([8_RISKS-REQ-010]), Hard=800k tokens ([TAS-024]). Pinned prefix turns and last 5 turns are always preserved during pruning candidate selection."_

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/pruning-trigger-results.json` and assert exit code `0`.
- [ ] Verify `/tmp/pruning-trigger-results.json` contains `"numFailedTests": 0`.
