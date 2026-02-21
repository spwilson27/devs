# Task: Implement Sliding Relevance Window and Spec Refresh Protocol (Sub-Epic: 11_Memory_Refresher_and_Summarization)

## Covered Requirements
- [4_USER_FEATURES-REQ-018]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/context/__tests__/SlidingRelevanceWindow.test.ts`.
- [ ] Write a unit test for `SlidingRelevanceWindow.compose(turns: TurnEntry[], taskGoal: string): ContextWindow`:
  - Provide 50 mock turns and assert that the returned `ContextWindow.turns` contains at most 20 entries (the configured `maxTurns` default).
  - Assert that the most recent turns are prioritized (the last 20 turns of the input are returned, not random ones).
  - Assert that the `ContextWindow` object contains a `taskGoal` field equal to the input.
- [ ] Write a unit test for `SlidingRelevanceWindow.shouldInjectSpec(turnCount: number): boolean`:
  - Assert `true` when `turnCount % 10 === 0 && turnCount > 0` (i.e., turns 10, 20, 30…).
  - Assert `false` for all other values.
- [ ] Create `packages/memory/src/context/__tests__/SpecRefreshProtocol.test.ts`.
- [ ] Write a unit test for `SpecRefreshProtocol.buildInjectionTurn(specDocuments: SpecDocument[]): TurnEntry`:
  - Assert that the returned `TurnEntry` has `role = 'user'` and `content` starts with `[SPEC REFRESH]`.
  - Assert that each provided `SpecDocument.content` is included in the output (truncated to 3000 chars per document).
- [ ] Write a unit test for `SpecRefreshProtocol.inject(window: ContextWindow, specDocuments: SpecDocument[], turnCount: number): ContextWindow`:
  - When `shouldInjectSpec(turnCount)` is `true`, assert the returned window has an additional turn prepended with `[SPEC REFRESH]` content.
  - When `shouldInjectSpec(turnCount)` is `false`, assert the returned window is unchanged.

## 2. Task Implementation

- [ ] Create `packages/memory/src/context/types.ts`:
  ```ts
  export interface ContextWindow {
    taskGoal: string;
    turns: TurnEntry[];
    specInjected: boolean;
  }

  export interface SpecDocument {
    name: string;   // e.g. 'TAS', 'PRD'
    content: string;
  }

  export interface SlidingRelevanceWindowConfig {
    maxTurns: number; // Default: 20
  }
  ```
- [ ] Create `packages/memory/src/context/SlidingRelevanceWindow.ts`:
  - Constructor accepts `SlidingRelevanceWindowConfig`, defaults `maxTurns` to `20`.
  - `compose(turns: TurnEntry[], taskGoal: string): ContextWindow`:
    1. Slice to the last `maxTurns` entries from `turns` (most-recent priority).
    2. Return `{ taskGoal, turns: sliced, specInjected: false }`.
  - `shouldInjectSpec(turnCount: number): boolean`:
    1. Return `turnCount > 0 && turnCount % 10 === 0`.
- [ ] Create `packages/memory/src/context/SpecRefreshProtocol.ts`:
  - `buildInjectionTurn(specDocuments: SpecDocument[]): TurnEntry`:
    1. For each doc, truncate `content` to 3000 characters.
    2. Build content string: `[SPEC REFRESH]\n\n` followed by each doc formatted as `## ${doc.name}\n${truncatedContent}\n`.
    3. Return `{ turnIndex: -1, agentId: 'system', role: 'user', content, createdAt: new Date() }`.
  - `inject(window: ContextWindow, specDocuments: SpecDocument[], turnCount: number): ContextWindow`:
    1. If `SlidingRelevanceWindow.shouldInjectSpec(turnCount)` is `false`, return `window` unchanged.
    2. Build the injection turn via `buildInjectionTurn(specDocuments)`.
    3. Prepend the injection turn to `window.turns`.
    4. Return `{ ...window, specInjected: true }`.
- [ ] Wire `SlidingRelevanceWindow` and `SpecRefreshProtocol` into `packages/orchestrator/src/ContextComposer.ts`:
  - On each turn, call `slidingWindow.compose(allTurns, currentTaskGoal)` to produce the active context window.
  - Call `specRefresh.inject(window, [tasDoc, prdDoc], currentTurnCount)` to conditionally inject specs.
  - Load TAS and PRD spec documents from `.devs/specs/tas_summary.md` and `.devs/specs/prd_summary.md` respectively at orchestrator startup.
- [ ] Export `SlidingRelevanceWindow`, `SpecRefreshProtocol`, `ContextWindow`, `SpecDocument` from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify that `compose()` never mutates the input `turns` array — it must return a new sliced array.
- [ ] Verify that the spec injection turn is prepended (not appended) to the window so that spec content appears before the conversation history in the context, giving it higher positional salience.
- [ ] Verify that `SpecRefreshProtocol` reads spec content as read-only inputs — it does not write to disk or mutate any external state.
- [ ] Verify that the `maxTurns` cap in `SlidingRelevanceWindow` is always enforced even if the injected spec turn is added (the final window may have `maxTurns + 1` entries: the spec turn + `maxTurns` conversation turns — this is acceptable and must be documented in a code comment).
- [ ] Verify that the `ContextComposer` integration does not block the agent execution path — spec document loading must be done once at startup, not on every turn.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all `SlidingRelevanceWindow` and `SpecRefreshProtocol` unit tests pass.
- [ ] Run `pnpm --filter @devs/orchestrator test` to confirm `ContextComposer` tests pass.
- [ ] Run `pnpm --filter @devs/memory build && pnpm --filter @devs/orchestrator build` to confirm TypeScript compilation succeeds.
- [ ] Run `pnpm --filter @devs/memory lint` to confirm no linting violations.

## 5. Update Documentation

- [ ] Add a `## Context Window Composition` section to `packages/memory/README.md` describing `SlidingRelevanceWindow` (maxTurns, recency priority) and `SpecRefreshProtocol` (every-10-turns injection of TAS/PRD).
- [ ] Update `docs/agent-memory/tiered-memory.md` to document the sliding relevance window as the short-term context management layer per `[4_USER_FEATURES-REQ-018]`.
- [ ] Document the spec refresh protocol in `docs/agent-memory/spec-refresh.md`: explain the 10-turn cycle, which documents are injected (TAS summary, PRD summary), and how to configure the `maxTurns` window size.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json --outputFile=test-results/sliding-window.json` and confirm zero `failed` entries.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code 0.
- [ ] Assert `grep -r "shouldInjectSpec" packages/memory/src/context/SlidingRelevanceWindow.ts` returns a match, confirming the method is present.
