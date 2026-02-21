# Task: Implement Vector Memory Hard-Pruning on Project Rewind (Sub-Epic: 14_Memory_Rewind_and_Sync_Safety)

## Covered Requirements
- [4_USER_FEATURES-REQ-075], [8_RISKS-REQ-071]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/prune-on-rewind.test.ts`, write the following tests using an in-memory LanceDB instance:
  - **`pruneMemoryAfterRewind` deletes rows with `task_index > rewindTaskIndex` within the same phase**: Seed the table with 5 entries spanning `task_index` 1–5 in `phase_index = 4`. Call `pruneMemoryAfterRewind({ phaseIndex: 4, taskIndex: 2 })`. Assert that only entries with `task_index <= 2` remain.
  - **`pruneMemoryAfterRewind` deletes rows from later phases entirely**: Seed entries in `phase_index` 3, 4, and 5. Rewind to `{ phaseIndex: 4, taskIndex: 2 }`. Assert all entries from `phase_index >= 5` are deleted, and entries from `phase_index <= 3` are untouched.
  - **Idempotency**: Calling `pruneMemoryAfterRewind` twice with the same arguments must not error and must return the same remaining row count.
  - **Empty table**: Calling `pruneMemoryAfterRewind` on an empty table must succeed without error.
  - **Integration test**: Verify that after pruning, a `searchMemory` call returns no entries that were seeded past the rewind boundary.

## 2. Task Implementation
- [ ] In `packages/memory/src/prune-on-rewind.ts`, implement and export:
  ```typescript
  export async function pruneMemoryAfterRewind(
    db: LanceDBConnection,
    rewindPoint: { phaseIndex: number; taskIndex: number }
  ): Promise<{ deletedCount: number }>;
  ```
  - Use LanceDB's `table.delete(filter)` API.
  - The filter predicate must be:
    ```
    (phase_index > rewindPoint.phaseIndex)
    OR (phase_index = rewindPoint.phaseIndex AND task_index > rewindPoint.taskIndex)
    ```
  - Return the number of deleted rows.
  - Wrap the operation in a try/catch; on failure, throw a typed `MemoryPruneError` (defined in `packages/memory/src/errors.ts`).
- [ ] In `packages/core/src/rewind.ts` (the project's rewind orchestrator), import and call `pruneMemoryAfterRewind` as a mandatory step immediately after the Git reset and before re-initializing the agent context. The rewind must not proceed to agent re-initialization if pruning fails.
- [ ] Expose a CLI command `devs memory prune --phase <n> --task <n>` in `packages/cli/src/commands/memory.ts` that calls `pruneMemoryAfterRewind` and prints the deleted count.

## 3. Code Review
- [ ] Verify that `pruneMemoryAfterRewind` is called in the rewind orchestration path and that there is no code path allowing agent re-initialization after a rewind without memory pruning.
- [ ] Confirm the SQL-like filter string passed to `table.delete()` uses parameterized values (not string interpolation of user-supplied data) to prevent injection.
- [ ] Ensure `MemoryPruneError` is a subclass of the project's base error class and carries the `rewindPoint` in its `context` field for audit trail purposes.
- [ ] Verify that the `deletedCount` is written to the SQLite audit log (`.devs/state.sqlite`, `memory_prune_events` table) with timestamp, phase, and task index.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` — all tests must pass.
- [ ] Run `pnpm --filter @devs/core test` — rewind integration tests must pass.
- [ ] Run `pnpm --filter @devs/cli test` — CLI command tests must pass.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` with a section "Rewind Pruning" explaining that `pruneMemoryAfterRewind` is called automatically during a project rewind and documents its parameters and return value.
- [ ] Update `packages/core/docs/rewind-lifecycle.md` to include memory pruning as a step in the rewind sequence diagram (Mermaid).
- [ ] Add an entry to `.devs/agent-memory/architecture-decisions.md`: "Hard-deletion of LanceDB entries after a rewind point is mandatory and synchronous — agent context must not be restored until pruning succeeds."

## 6. Automated Verification
- [ ] Run the end-to-end rewind scenario test: `pnpm test:e2e --grep "rewind prunes vector memory"` and assert exit code 0.
- [ ] Verify the SQLite `memory_prune_events` table is populated after a test rewind: `sqlite3 .devs/state.sqlite "SELECT COUNT(*) FROM memory_prune_events WHERE phase_index=4 AND task_index=2;"` must return `>= 1`.
