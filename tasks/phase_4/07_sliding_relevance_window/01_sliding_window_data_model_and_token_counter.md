# Task: Define SlidingRelevanceWindow Data Model and Token-Counting Infrastructure (Sub-Epic: 07_Sliding_Relevance_Window)

## Covered Requirements
- [3_MCP-REQ-SYS-001], [REQ-SYS-001]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/sliding-window/__tests__/types.test.ts`. Assert that a `ContextSlot` object with `kind: 'goal' | 'map' | 'recent_past'`, `content: string`, and `tokenCount: number` fields can be constructed and validated.
- [ ] Create `packages/memory/src/sliding-window/__tests__/token-counter.test.ts`. Write unit tests for a `countTokens(text: string): number` utility that approximates token counts (using the `tiktoken` or equivalent character-ratio heuristic). Tests MUST cover: empty string returns 0; a 1000-character prose passage returns a count in the range [200, 350]; a JSON blob with repetitive keys returns a proportionally lower count than raw prose.
- [ ] Write a test asserting that `countTokens` throws a `TypeError` when called with a non-string argument.
- [ ] Write a test for a `WindowBudget` record type: `{ totalBudget: number; goalBudget: number; mapBudget: number; recentPastBudget: number }`. Assert that `goalBudget + mapBudget + recentPastBudget <= totalBudget`.
- [ ] Write a test for a `createDefaultWindowBudget(totalBudget: number): WindowBudget` factory that allocates 30% to goal, 20% to map, and 50% to recent past (rounded down), with the total set to the provided argument (default `800_000`).

## 2. Task Implementation

- [ ] Create `packages/memory/src/sliding-window/types.ts`. Export:
  - `ContextSlotKind = 'goal' | 'map' | 'recent_past'`
  - `ContextSlot = { kind: ContextSlotKind; content: string; tokenCount: number; timestampMs: number }`
  - `WindowBudget = { totalBudget: number; goalBudget: number; mapBudget: number; recentPastBudget: number }`
- [ ] Create `packages/memory/src/sliding-window/token-counter.ts`. Implement `countTokens(text: string): number` using a character-to-token ratio of `text.length / 4` (rounded down), matching the GPT-3.5/Gemini approximation heuristic. Export the function.
- [ ] Create `packages/memory/src/sliding-window/window-budget.ts`. Implement `createDefaultWindowBudget(totalBudget = 800_000): WindowBudget`. Allocate: `goalBudget = Math.floor(totalBudget * 0.30)`, `mapBudget = Math.floor(totalBudget * 0.20)`, `recentPastBudget = Math.floor(totalBudget * 0.50)`.
- [ ] Add barrel export in `packages/memory/src/sliding-window/index.ts` re-exporting all public symbols from `types.ts`, `token-counter.ts`, and `window-budget.ts`.
- [ ] Add the new module path to `packages/memory/package.json` exports map and ensure `tsconfig.json` includes the new source directory.

## 3. Code Review

- [ ] Verify that all types are exported from `packages/memory/src/sliding-window/index.ts` only—no direct path imports in tests.
- [ ] Confirm `countTokens` is a pure function with no side effects and no I/O.
- [ ] Verify `createDefaultWindowBudget` invariant: `goalBudget + mapBudget + recentPastBudget <= totalBudget` (the ≤ instead of = accounts for rounding).
- [ ] Ensure TypeScript strict mode is satisfied (no `any`, no implicit `undefined`).
- [ ] Confirm there are no circular dependencies between the new files.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="sliding-window"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/memory build` and confirm TypeScript compilation produces no errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/sliding-window/sliding-window.agent.md` describing: the purpose of the sliding relevance window, the three slot kinds (goal/map/recent_past), the `800_000` default token budget, the character-to-token ratio heuristic, and guidance for agents on when to call `countTokens`.
- [ ] Update `packages/memory/README.md` to reference the new `sliding-window` sub-module under a "Context Management" section.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="sliding-window"` and assert branch coverage ≥ 90% for `token-counter.ts` and `window-budget.ts`.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code is `0`.
