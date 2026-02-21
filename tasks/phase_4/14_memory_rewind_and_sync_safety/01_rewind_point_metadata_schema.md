# Task: Extend LanceDB Schema with Rewind Point Temporal Metadata (Sub-Epic: 14_Memory_Rewind_and_Sync_Safety)

## Covered Requirements
- [4_USER_FEATURES-REQ-075], [8_RISKS-REQ-071]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/schema.test.ts`, write unit tests that:
  - Assert that the LanceDB table schema (exported from `packages/memory/src/schema.ts`) includes a non-nullable `task_id` field (string/UUID) representing the task during which the embedding was created.
  - Assert that the schema includes a `created_at` field (ISO-8601 timestamp string, non-nullable).
  - Assert that the schema includes a `phase_index` field (integer) representing the phase ordinal at time of write.
  - Assert that the schema includes a `task_index` field (integer) representing the task ordinal within the phase at time of write.
  - Assert that both `task_index` and `phase_index` are required (cannot be null or undefined) by attempting to insert a record missing these fields and expecting a validation error.
  - Write an integration test using an in-memory LanceDB instance (via `lancedb` npm package's in-memory mode) that inserts a valid record with all temporal fields and reads it back, asserting all fields are preserved correctly.

## 2. Task Implementation
- [ ] In `packages/memory/src/schema.ts`, update the Arrow/LanceDB schema definition for the `memory_entries` table to add the following fields:
  - `task_id: string` — UUID of the task that produced this embedding. Non-nullable, indexed.
  - `created_at: string` — ISO-8601 UTC timestamp of insertion. Non-nullable.
  - `phase_index: int32` — ordinal index of the phase (e.g., `4` for Phase 4). Non-nullable.
  - `task_index: int32` — ordinal index of the task within the phase (e.g., `3` for task 3 of phase 4). Non-nullable.
- [ ] In `packages/memory/src/vector-store.ts`, update the `upsertMemory(entry)` function signature and implementation:
  - Accept a `RewindContext` parameter `{ taskId: string; phaseIndex: number; taskIndex: number }`.
  - Auto-populate `created_at` with `new Date().toISOString()` if not provided.
  - Populate `task_id`, `phase_index`, `task_index` from `RewindContext`.
- [ ] Create a migration helper `packages/memory/src/migrations/add-temporal-fields.ts` that, when run against an existing `.devs/memory.lancedb` database, adds the new columns with sensible defaults (`task_id = 'unknown'`, `phase_index = 0`, `task_index = 0`) for pre-existing rows.
- [ ] Export a TypeScript type `MemoryEntry` from `packages/memory/src/types.ts` that reflects the full schema including the new temporal fields.

## 3. Code Review
- [ ] Verify that no raw `INSERT` or table-write path in the codebase bypasses the updated `upsertMemory` call (grep for `table.add(` and `table.merge(`).
- [ ] Confirm that the `MemoryEntry` type is used consistently across all callers of `upsertMemory` and `searchMemory` to prevent runtime type mismatches.
- [ ] Ensure the migration helper is idempotent: running it twice on the same database must not corrupt data or throw errors.
- [ ] Confirm `phase_index` and `task_index` use Apache Arrow `Int32` (not `Float32`) to avoid precision loss.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` and confirm all new and existing tests pass with exit code 0.
- [ ] Run the migration helper against a test fixture LanceDB file and assert the schema upgrade succeeds: `npx ts-node packages/memory/src/migrations/add-temporal-fields.ts --db=./test/fixtures/legacy.lancedb`.

## 5. Update Documentation
- [ ] Update `packages/memory/README.md` to document the new `task_id`, `created_at`, `phase_index`, and `task_index` fields, explaining their purpose in supporting rewind-safe temporal filtering.
- [ ] Update `.devs/agent-memory/architecture-decisions.md` (or equivalent long-term memory log) with an entry: "LanceDB schema extended with temporal rewind metadata fields (task_id, created_at, phase_index, task_index) to enable pruning of post-rewind embeddings."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/memory-schema-test-results.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run the integration migration test end-to-end: `pnpm --filter @devs/memory test:integration` and confirm exit code 0.
