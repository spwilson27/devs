# Task: Implement VectorPruner Service for Temporal LanceDB Pruning (Sub-Epic: 04_Vector Memory Management)

## Covered Requirements
- [8_RISKS-REQ-071], [4_USER_FEATURES-REQ-075]

## 1. Initial Test Written
- [ ] Create `src/memory/__tests__/VectorPruner.test.ts`.
- [ ] Write a unit test `pruneAfterTaskId_removesEmbeddingsNewerThanTarget` that:
  1. Seeds a mock LanceDB table (`vector_embeddings`) with 10 rows, each with a `created_at_task_id` integer field (values 1–10).
  2. Calls `VectorPruner.pruneAfterTaskId(targetTaskId: 5)`.
  3. Asserts that the table now contains exactly 5 rows (task IDs 1–5) and that rows with task IDs 6–10 have been deleted.
- [ ] Write a unit test `pruneAfterTaskId_noop_whenNoRowsExceedTarget` that seeds 3 rows (IDs 1–3), calls `pruneAfterTaskId(10)`, and asserts all 3 rows remain.
- [ ] Write an integration test `pruneAfterTaskId_integration` against a real ephemeral LanceDB database in a temp directory, verifying the full lifecycle: insert → prune → re-query confirms deletion.
- [ ] Write a test `pruneAfterTaskId_emitsAuditEvent` that stubs the `EventBus` and asserts a `vector:pruned` event is emitted with `{ targetTaskId, rowsDeleted }` payload after pruning.
- [ ] Ensure all tests are under the `describe('VectorPruner')` block and use `beforeEach` / `afterEach` to set up and tear down in-memory/temp LanceDB instances.

## 2. Task Implementation
- [ ] Create `src/memory/VectorPruner.ts`.
- [ ] Define and export the `VectorPruner` class with a static async method:
  ```typescript
  static async pruneAfterTaskId(targetTaskId: number, db?: VectorDB): Promise<{ rowsDeleted: number }>
  ```
- [ ] Inject (or instantiate via singleton) the `LanceDBAdapter` from `src/memory/LanceDBAdapter.ts` (already exists from earlier phases).
- [ ] Implement the pruning logic:
  1. Open the `vector_embeddings` LanceDB table.
  2. Execute a delete filter: `created_at_task_id > targetTaskId`.
  3. Count deleted rows by comparing pre-delete and post-delete row counts.
  4. Return `{ rowsDeleted }`.
- [ ] Emit a `vector:pruned` event on the shared `EventBus` after completion, with payload `{ targetTaskId, rowsDeleted, timestamp: Date.now() }`.
- [ ] All LanceDB table interactions must use the `LanceDBAdapter` abstraction; do not call `lancedb` directly in this class.
- [ ] Export the `VectorPruner` class from `src/memory/index.ts`.

## 3. Code Review
- [ ] Verify the `VectorPruner` class does NOT import `lancedb` directly — all access must go through `LanceDBAdapter`.
- [ ] Verify the delete filter uses the `created_at_task_id` integer column (not a timestamp string) for determinism.
- [ ] Verify the `pruneAfterTaskId` method is idempotent: calling it twice with the same `targetTaskId` produces no error and returns `rowsDeleted: 0` on the second call.
- [ ] Verify the `EventBus` emission is fire-and-forget (non-blocking) so pruning latency is not impacted.
- [ ] Verify that the method signature uses dependency injection for `db` to allow easy unit testing without real LanceDB.
- [ ] Check that there are no unhandled promise rejections and that errors from LanceDB propagate correctly as thrown exceptions.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="VectorPruner"` from the project root.
- [ ] All tests in `src/memory/__tests__/VectorPruner.test.ts` must pass with exit code 0.
- [ ] Run `npm run test:integration -- --testPathPattern="VectorPruner"` and confirm the integration test passes against a real ephemeral LanceDB.
- [ ] Confirm test coverage for `src/memory/VectorPruner.ts` is ≥ 90% (branches, lines, functions).

## 5. Update Documentation
- [ ] Create `src/memory/VectorPruner.agent.md` with:
  - Purpose: Temporal pruning of LanceDB embeddings on `devs rewind`.
  - Method signatures with parameter descriptions.
  - The `created_at_task_id` schema field convention.
  - Note that this class must always be called as part of the rewind sequence AFTER Git and SQLite rollback.
- [ ] Update `docs/architecture/state-recovery.md` to include a "Vector Memory Pruning" subsection referencing `VectorPruner` and its role in the rewind pipeline.
- [ ] Update `src/memory/index.ts` exports list in the module-level JSDoc comment.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="VectorPruner" --coverage --coverageReporters=text` and assert output contains `VectorPruner.ts | ... | 100 |` (or ≥ 90% for each column).
- [ ] Run `node -e "const { VectorPruner } = require('./dist/memory'); console.assert(typeof VectorPruner.pruneAfterTaskId === 'function', 'VectorPruner.pruneAfterTaskId must be a function');"` after `npm run build` to confirm the export is present in the compiled output.
- [ ] Run `grep -r "vector:pruned" src/` to confirm the event name is used only in `VectorPruner.ts` (single source of truth).
