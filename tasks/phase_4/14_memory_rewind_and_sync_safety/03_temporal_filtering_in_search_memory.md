# Task: Implement Temporal Filtering in search_memory to Prevent Future-Knowledge Retrieval (Sub-Epic: 14_Memory_Rewind_and_Sync_Safety)

## Covered Requirements
- [8_RISKS-REQ-071], [4_USER_FEATURES-REQ-075]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/search-memory-temporal.test.ts`, write tests using an in-memory LanceDB instance:
  - **Baseline (no filter)**: Seed 10 entries spanning `phase_index` 3–5. Call `searchMemory({ query: "...", topK: 10 })` with no temporal filter. Assert all 10 entries are eligible for return.
  - **Filter excludes future entries**: Seed entries at `(phase_index=4, task_index=3)` and `(phase_index=4, task_index=5)`. Call `searchMemory({ query: "...", topK: 10, beforeRewindPoint: { phaseIndex: 4, taskIndex: 3 } })`. Assert entries with `task_index=5` (in phase 4) and any entries from `phase_index > 4` are **not** present in results.
  - **Filter includes entries from earlier phases fully**: Add entries in `phase_index=3`. With the same `beforeRewindPoint`, assert all `phase_index=3` entries are eligible.
  - **Edge case — rewind to task_index=0**: Only pre-phase entries should remain eligible.
  - **Type safety**: Assert that passing a `beforeRewindPoint` with non-integer values throws a `TypeError` at the TypeScript level (compile-time test via `tsd` or `expect-type`).

## 2. Task Implementation
- [ ] In `packages/memory/src/search-memory.ts`, update the `searchMemory` function signature:
  ```typescript
  export async function searchMemory(params: {
    query: string;
    topK?: number;
    metadataFilter?: Record<string, unknown>;
    beforeRewindPoint?: { phaseIndex: number; taskIndex: number };
  }): Promise<MemoryEntry[]>;
  ```
- [ ] Build the LanceDB filter string conditionally:
  - If `beforeRewindPoint` is provided, construct a pre-filter:
    ```
    (phase_index < beforeRewindPoint.phaseIndex)
    OR (phase_index = beforeRewindPoint.phaseIndex AND task_index <= beforeRewindPoint.taskIndex)
    ```
  - Apply this as LanceDB's `prefilter` option on the ANN (approximate nearest neighbor) search call.
  - Merge with any existing `metadataFilter` using `AND`.
- [ ] In `packages/core/src/context-composer.ts`, update all calls to `searchMemory` within the post-rewind context re-composition flow to pass `beforeRewindPoint` derived from the active rewind state stored in `.devs/state.sqlite` (`rewind_events` table, `rewind_point_phase` and `rewind_point_task` columns).
- [ ] Ensure `beforeRewindPoint` is `undefined` (not passed) during normal (non-rewind) operation so there is zero performance overhead.

## 3. Code Review
- [ ] Confirm that the temporal pre-filter is applied **before** ANN scoring, not as a post-filter, to ensure cosine similarity results are not contaminated by future-knowledge entries.
- [ ] Verify that all existing callers of `searchMemory` compile without errors after the signature change (run `pnpm tsc --noEmit`).
- [ ] Check that `beforeRewindPoint` values are validated to be non-negative integers before being embedded in the filter string.
- [ ] Confirm unit tests mock LanceDB's query interface without making real disk I/O; integration tests use a temp directory.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` — all temporal filtering tests must pass.
- [ ] Run `pnpm tsc --noEmit` across the monorepo — zero type errors.
- [ ] Run `pnpm --filter @devs/core test` — context-composer tests that exercise post-rewind search must pass.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` — add a "Temporal Filtering" section under `searchMemory` documenting the `beforeRewindPoint` parameter and its semantics.
- [ ] Update `packages/core/docs/context-composition.md` to note that after a rewind, all `searchMemory` calls are automatically scoped to the rewind point via `beforeRewindPoint`.
- [ ] Add entry to `.devs/agent-memory/architecture-decisions.md`: "searchMemory uses LanceDB prefilter (not post-filter) for temporal scoping after rewind to guarantee no future-knowledge embeddings enter the context window."

## 6. Automated Verification
- [ ] Run `pnpm test:e2e --grep "post-rewind search excludes future knowledge"` and confirm exit code 0.
- [ ] Run `pnpm tsc --noEmit` and assert zero errors via `echo $?` returning `0`.
