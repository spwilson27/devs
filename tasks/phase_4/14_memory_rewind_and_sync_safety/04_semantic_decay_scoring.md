# Task: Implement Semantic Decay Scoring for Older Vector Memory Entries (Sub-Epic: 14_Memory_Rewind_and_Sync_Safety)

## Covered Requirements
- [8_RISKS-REQ-105], [8_RISKS-REQ-122]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/semantic-decay.test.ts`, write the following unit tests:
  - **`applySemanticDecay` reduces score for older entries**: Create two `MemoryEntry` objects with the same cosine similarity score (`0.9`) but different `task_index` values (`task_index=1` vs `task_index=10`). Assert that after applying decay, the older entry (`task_index=1`) has a lower `decayedScore` than the newer entry.
  - **Decay is monotonically decreasing with age**: Generate 5 entries with `task_index` 1, 3, 5, 7, 9 (same `phase_index`, same cosine score). Assert that `decayedScore` is strictly decreasing as `task_index` decreases.
  - **Contradiction penalty**: Create two entries — one "old" entry stating `"Use PostgreSQL"` and one "new" entry stating `"Use SQLite"`. Inject a contradiction flag (`contradicted_by_task_id` set on the old entry). Assert that the contradicted old entry's `decayedScore` is reduced by at least 30% compared to a non-contradicted entry of equal age.
  - **Decay does not go below a minimum floor**: Assert that `decayedScore` never goes below `0.05` regardless of age, to prevent valid-but-old entries from being entirely silenced.
  - **No decay applied to entries from the current task**: An entry with `task_index` equal to the current task's index must have `decayedScore === rawScore`.

## 2. Task Implementation
- [ ] In `packages/memory/src/schema.ts`, add the following fields to the `MemoryEntry` schema:
  - `decay_weight: float32` — persisted decay multiplier in `[0.0, 1.0]`. Default `1.0` on insert.
  - `contradicted_by_task_id: string | null` — UUID of the task whose embedding contradicts this entry. Null if no contradiction detected. Nullable.
- [ ] In `packages/memory/src/semantic-decay.ts`, implement and export:
  ```typescript
  export function applySemanticDecay(
    entries: ScoredMemoryEntry[],
    currentTaskIndex: number,
    currentPhaseIndex: number,
    decayRate?: number   // default: 0.05 per task-index distance
  ): ScoredMemoryEntry[];
  ```
  Where `ScoredMemoryEntry = MemoryEntry & { rawScore: number; decayedScore: number }`.
  - Compute age as `ageTasks = (currentPhaseIndex - entry.phase_index) * PHASE_WEIGHT + (currentTaskIndex - entry.task_index)`. Use `PHASE_WEIGHT = 50` (configurable via env `DEVS_PHASE_WEIGHT`).
  - `decayedScore = rawScore * Math.max(MIN_DECAY_FLOOR, entry.decay_weight * Math.exp(-decayRate * ageTasks))`.
  - If `entry.contradicted_by_task_id !== null`, multiply `decayedScore` by `0.6` (contradiction penalty, configurable via `DEVS_CONTRADICTION_PENALTY`).
  - `MIN_DECAY_FLOOR = 0.05` (configurable via `DEVS_MIN_DECAY_FLOOR`).
- [ ] In `packages/memory/src/search-memory.ts`, after fetching ANN results, pipe them through `applySemanticDecay` and re-sort by `decayedScore` descending before returning. Pass `currentTaskIndex` and `currentPhaseIndex` from the active run context.
- [ ] In `packages/memory/src/vector-store.ts`, when `upsertMemory` detects a new entry whose content semantically contradicts an existing entry (detected by cosine similarity > 0.85 between the new embedding and an existing entry with opposite sentiment heuristic), set `contradicted_by_task_id` on the old entry to the new entry's `task_id` via a `table.update()` call.

## 3. Code Review
- [ ] Confirm that `applySemanticDecay` is a pure function with no side effects (no DB calls); all DB writes happen only in `vector-store.ts`.
- [ ] Verify that `PHASE_WEIGHT`, `DEVS_CONTRADICTION_PENALTY`, and `DEVS_MIN_DECAY_FLOOR` are documented in `packages/memory/README.md` and in `.env.example`.
- [ ] Ensure decay logic uses `Math.exp` (exponential decay), not linear decay, to avoid abrupt cutoffs.
- [ ] Confirm that `decayedScore` is **not** persisted to the DB — it is computed at query time only. Only `decay_weight` and `contradicted_by_task_id` are persisted.
- [ ] Verify that the contradiction detection heuristic in `upsertMemory` cannot cascade (i.e., marking A as contradicted by B must not then mark B as contradicted by something else in the same call).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` — all decay tests must pass.
- [ ] Run `pnpm tsc --noEmit` — zero type errors.
- [ ] Run `pnpm --filter @devs/memory test --coverage` and confirm `semantic-decay.ts` has ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` with a "Semantic Decay" section explaining the decay formula, configurable constants, and contradiction penalty.
- [ ] Add a Mermaid diagram to `packages/memory/docs/decay-model.md` showing how `rawScore` transforms to `decayedScore` for entries of varying ages.
- [ ] Add entry to `.devs/agent-memory/architecture-decisions.md`: "Semantic decay uses exponential decay (not linear) with a minimum floor of 0.05. Contradiction detection sets `contradicted_by_task_id` on the older entry at write time."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/decay-results.json` and assert `"numFailedTests": 0`.
- [ ] Run `pnpm --filter @devs/memory test --coverage --reporter=json > /tmp/coverage.json` and use `jq '.coverageMap["packages/memory/src/semantic-decay.ts"].s | to_entries | map(.value) | add / length'` to assert coverage ≥ 0.9.
