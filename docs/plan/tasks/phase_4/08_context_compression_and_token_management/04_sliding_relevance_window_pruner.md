# Task: Implement Intelligent Context Pruning with Sliding Relevance Window (Sub-Epic: 08_Context_Compression_and_Token_Management)

## Covered Requirements
- [1_PRD-REQ-PERF-001], [1_PRD-REQ-CON-004], [1_PRD-REQ-SYS-001]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/compression/__tests__/sliding-relevance-window.test.ts`.
- [ ] Write a unit test that constructs a `SlidingRelevanceWindow` with a mock set of 20 turns and asserts that calling `prune()` returns only turns with the highest relevance scores plus pinned turns (Plan, active task spec).
- [ ] Write a unit test that verifies pinned turns (type `'plan'` or `'spec'`) are NEVER removed by `prune()`, regardless of their relevance score.
- [ ] Write a unit test verifying that turns beyond the sliding window boundary are dropped in order from oldest to least relevant.
- [ ] Write a unit test asserting that when the turn list fits within the budget (all turns' token counts sum to < 800k), `prune()` returns the input list unchanged.
- [ ] Write a unit test asserting that relevance scores are computed using cosine similarity against the current task goal embedding (mock the embedding function in tests).
- [ ] Write an integration test confirming that `SlidingRelevanceWindow.prune()` + `ContextCompressor.compress()` together reduce a 1000-turn conversation to under 800k tokens.

## 2. Task Implementation
- [ ] Create `packages/memory/src/compression/sliding-relevance-window.ts`.
- [ ] Define and export `RelevanceWindowOptions`:
  ```typescript
  export interface RelevanceWindowOptions {
    tokenBudget: number;          // default: 800_000
    pinnedTypes: TurnType[];      // default: ['plan', 'spec']
    embedGoal: (goal: string) => Promise<number[]>; // embedding function
    embedTurn: (turn: Turn) => Promise<number[]>;   // embedding function
  }
  ```
- [ ] Implement the `SlidingRelevanceWindow` class:
  - Constructor accepts `options: RelevanceWindowOptions` and `currentGoal: string`.
  - `async prune(turns: Turn[]): Promise<Turn[]>`:
    1. Separate pinned turns (those with `type` in `pinnedTypes`) from candidate turns.
    2. Compute cosine similarity of each candidate turn's embedding against the current goal embedding (use `embedGoal` and `embedTurn`).
    3. Sort candidates by descending relevance score.
    4. Greedily select candidates until `tokenBudget - pinnedTokens` is exhausted.
    5. Return `[...pinnedTurns, ...selectedCandidates]` sorted by original chronological index.
- [ ] Implement `cosineSimilarity(a: number[], b: number[]): number` as a private static helper.
- [ ] Export from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm pinned turns are correctly identified by type (not by index) — verify against `options.pinnedTypes` using a Set for O(1) lookup.
- [ ] Confirm that `prune()` is pure / side-effect-free (does not mutate the input array).
- [ ] Confirm the cosine similarity function handles zero vectors (return 0 to avoid division by zero).
- [ ] Confirm async embedding calls are batched with `Promise.all` to avoid N serial round-trips.
- [ ] Confirm the function is deterministic when two turns share the same cosine score (use chronological order as tiebreaker).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test --testPathPattern="sliding-relevance-window"` and confirm all tests pass.
- [ ] Run the integration test and confirm the output turn list's total token count is < 800k.

## 5. Update Documentation
- [ ] Add a `## Sliding Relevance Window` section to `packages/memory/README.md` describing the pruning algorithm, the concept of pinned turns, and the cosine similarity relevance ranking.
- [ ] Update `docs/architecture/context-management.md` to include a Mermaid flowchart of the pruning decision tree: check token budget → separate pinned → score candidates → greedy selection.

## 6. Automated Verification
- [ ] CI step `pnpm --filter @devs/memory test` exits with code 0.
- [ ] Verify export: `node -e "const m = require('./packages/memory/dist'); console.assert(typeof m.SlidingRelevanceWindow === 'function')"`.
