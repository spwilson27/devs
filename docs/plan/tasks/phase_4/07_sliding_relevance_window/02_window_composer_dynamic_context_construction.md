# Task: Implement WindowComposer — Dynamic Context Window Construction (Sub-Epic: 07_Sliding_Relevance_Window)

## Covered Requirements
- [3_MCP-TAS-047]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/sliding-window/__tests__/window-composer.test.ts`.
- [ ] Write a test: given zero SAOP envelopes, `WindowComposer.compose()` returns a `ComposedWindow` with `slots: []` and `totalTokensUsed: 0`.
- [ ] Write a test: given a `goalSlot` that exceeds `windowBudget.goalBudget`, `compose()` truncates the goal content to fit within budget and sets `truncated: true` on the returned slot.
- [ ] Write a test: given a `mapSlot` that exceeds `windowBudget.mapBudget`, `compose()` truncates the map content similarly.
- [ ] Write a test: given 15 SAOP envelopes, `compose()` retains only the most-recent 10 envelopes in `recentPastSlots`, sorted newest-first, and the combined token count of retained envelopes does not exceed `windowBudget.recentPastBudget`.
- [ ] Write a test: given a mix of goal, map, and recentPast slots whose combined token count fits within `windowBudget.totalBudget`, `compose()` returns all slots without truncation and sets `totalTokensUsed` to the exact sum.
- [ ] Write a test: `WindowComposer` accepts a `maxRecentEnvelopes` constructor option (default 10, max 10) and enforces this cap on `recentPastSlots`.
- [ ] Write a test: `compose()` is deterministic — calling it twice with identical inputs returns structurally equal outputs.

## 2. Task Implementation

- [ ] Create `packages/memory/src/sliding-window/window-composer.ts`.
- [ ] Define and export `SaopEnvelope = { id: string; content: string; timestampMs: number }`.
- [ ] Define and export `ComposedWindowSlot = ContextSlot & { truncated: boolean }`.
- [ ] Define and export `ComposedWindow = { slots: ComposedWindowSlot[]; totalTokensUsed: number; budgetExceeded: boolean }`.
- [ ] Implement `class WindowComposer`:
  - Constructor: `constructor(budget: WindowBudget, options?: { maxRecentEnvelopes?: number })`. Default `maxRecentEnvelopes` to `10`, clamped to `[1, 10]`.
  - Method: `compose(goal: string, map: string, envelopes: SaopEnvelope[]): ComposedWindow`.
    1. **Goal slot**: count tokens; if over `budget.goalBudget`, truncate `goal` string to fit (`Math.floor(budget.goalBudget * 4)` characters), mark `truncated: true`.
    2. **Map slot**: same logic with `budget.mapBudget`.
    3. **Recent-past slots**: sort `envelopes` descending by `timestampMs`, take the most-recent `maxRecentEnvelopes` entries. Greedily add envelopes newest-first until the cumulative token count would exceed `budget.recentPastBudget`; stop adding further envelopes.
    4. Assemble `ComposedWindow`: `slots` = [goalSlot, mapSlot, ...recentPastSlots] (omit any null/empty slots), `totalTokensUsed` = sum of all slot `tokenCount`s, `budgetExceeded` = `totalTokensUsed > budget.totalBudget`.
- [ ] Export `WindowComposer` from `packages/memory/src/sliding-window/index.ts`.

## 3. Code Review

- [ ] Confirm priority order in composed output: goal → map → recent_past (newest to oldest). This order must be documented in code comments.
- [ ] Verify truncation logic preserves whole words where possible (truncate at last space before the character limit).
- [ ] Confirm `compose()` never mutates its input arguments.
- [ ] Verify `maxRecentEnvelopes` clamp is unit-tested and enforced in the constructor, not only at call sites.
- [ ] Check that `budgetExceeded` is computed from the final totals, not from individual slot flags alone.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="window-composer"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Append a "WindowComposer" section to `packages/memory/src/sliding-window/sliding-window.agent.md` describing: input types (`goal`, `map`, `SaopEnvelope[]`), the three-tier priority order, truncation behaviour, the 10-envelope cap, and the `budgetExceeded` flag semantics.
- [ ] Add an inline JSDoc comment block on the `compose()` method explaining the slot assembly algorithm.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="window-composer"` and confirm statement and branch coverage ≥ 90% for `window-composer.ts`.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code `0`.
