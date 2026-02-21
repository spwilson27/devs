# Task: Implement Stale Memory Pruning Job with Decay-Threshold Eviction (Sub-Epic: 14_Memory_Rewind_and_Sync_Safety)

## Covered Requirements
- [8_RISKS-REQ-122], [8_RISKS-REQ-105]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/stale-pruning.test.ts`, write the following tests using an in-memory LanceDB instance:
  - **`pruneStaleMemory` removes entries whose `decay_weight` is below the eviction threshold**: Seed 10 entries — 3 with `decay_weight = 0.02` (below threshold `0.05`) and 7 with `decay_weight >= 0.05`. Call `pruneStaleMemory({ db, evictionThreshold: 0.05 })`. Assert exactly 3 entries are deleted and 7 remain.
  - **`pruneStaleMemory` removes fully contradicted entries**: Seed entries where `contradicted_by_task_id` is non-null AND `decay_weight < 0.10`. Assert these are deleted by the job even if `decay_weight` alone wouldn't trigger eviction.
  - **`pruneStaleMemory` does NOT delete entries below threshold if they are pinned**: Seed one entry with `decay_weight = 0.01` and a `pinned = true` flag. Assert it survives pruning.
  - **Dry-run mode**: Call `pruneStaleMemory({ db, evictionThreshold: 0.05, dryRun: true })`. Assert no rows are actually deleted but the return value lists what would have been deleted.
  - **Prune job is idempotent**: Running `pruneStaleMemory` twice yields the same remaining set.

## 2. Task Implementation
- [ ] In `packages/memory/src/schema.ts`, add field `pinned: boolean` (default `false`) to the `MemoryEntry` schema. Pinned entries are never evicted by the stale pruning job (used for critical architectural decisions injected at project start).
- [ ] In `packages/memory/src/stale-pruning.ts`, implement and export:
  ```typescript
  export async function pruneStaleMemory(params: {
    db: LanceDBConnection;
    evictionThreshold?: number;          // default: 0.05
    contradictionThreshold?: number;     // default: 0.10 (evict contradicted entries below this weight)
    dryRun?: boolean;                    // default: false
  }): Promise<{ deletedCount: number; wouldDeleteCount?: number; deletedIds: string[] }>;
  ```
  - Build filter: `(decay_weight < evictionThreshold AND pinned = false) OR (contradicted_by_task_id IS NOT NULL AND decay_weight < contradictionThreshold AND pinned = false)`.
  - In dry-run mode, run a `SELECT` with the filter and return `wouldDeleteCount`; skip `DELETE`.
  - In live mode, call `table.delete(filter)` and return `deletedCount`.
  - Write a row to `.devs/state.sqlite` table `memory_prune_jobs` with columns: `run_at` (timestamp), `deleted_count` (int), `dry_run` (bool), `eviction_threshold` (real).
- [ ] In `packages/core/src/scheduler.ts`, register `pruneStaleMemory` as a periodic maintenance job:
  - Trigger: after every completed phase (hook into `onPhaseComplete` event).
  - Also expose as a manual CLI command: `devs memory prune-stale [--dry-run] [--threshold <float>]`.
- [ ] Add `DEVS_STALE_EVICTION_THRESHOLD` environment variable (default `0.05`) documented in `.env.example`.

## 3. Code Review
- [ ] Confirm that `pinned` entries can only be set programmatically by the system (never by agent output) — verify no agent tool exposes a `pin_memory` mutation.
- [ ] Verify that the SQLite audit write (`memory_prune_jobs`) is committed in the same transaction as the LanceDB delete completes (use the existing ACID wrapper in `packages/core/src/db-transaction.ts`).
- [ ] Confirm that `pruneStaleMemory` is tested in isolation (no network calls, no real FS); the LanceDB connection is injected via parameter (dependency injection pattern).
- [ ] Review that `evictionThreshold` and `contradictionThreshold` cannot be set above `0.5` to prevent accidental mass-deletion of valid memories (enforce in the function with a guard throwing `RangeError`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` — all stale pruning tests must pass.
- [ ] Run `pnpm --filter @devs/core test` — scheduler integration tests must pass.
- [ ] Run `pnpm --filter @devs/cli test` — CLI prune-stale command tests must pass.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` with a "Stale Memory Pruning" section explaining the eviction threshold, contradiction threshold, `pinned` flag, dry-run mode, and scheduling.
- [ ] Update `packages/core/docs/scheduler.md` to list `pruneStaleMemory` as a registered phase-completion hook.
- [ ] Add entry to `.devs/agent-memory/architecture-decisions.md`: "Stale memory eviction uses decay_weight threshold (default 0.05). Pinned entries are never evicted. Prune job runs after every completed phase. Threshold is capped at 0.5 to prevent mass deletion."

## 6. Automated Verification
- [ ] Run `pnpm test:e2e --grep "stale memory pruning job"` and confirm exit code 0.
- [ ] After running the e2e test, query SQLite: `sqlite3 .devs/state.sqlite "SELECT COUNT(*) FROM memory_prune_jobs;"` and assert result `>= 1`.
