# Task: Implement RelationalStateResetter and VectorMemoryPruner (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-002]

## 1. Initial Test Written
- [ ] Create unit tests in `src/rewind/__tests__/relational.resetter.test.ts`:
  - Use an in-memory SQLite DB to seed task rows with `id`, `git_commit_hash`, and `completed_at` timestamps.
  - Test that `RelationalStateResetter.reset(taskId)` replaces/rolls the database state to match the snapshot associated with the target task (mock snapshot retrieval), and that the method is transactional (either full apply or rollback on error).
- [ ] Create unit tests for `src/rewind/__tests__/vector.pruner.test.ts`:
  - Mock the Vector DB client and assert `VectorMemoryPruner.prune(timestamp)` removes entries older than the given timestamp and returns the count of pruned vectors.

## 2. Task Implementation
- [ ] Implement `src/rewind/relational.resetter.ts`:
  - Export class `RelationalStateResetter` with `async reset(taskId: string)`.
  - Implementation should load a stored DB snapshot for `taskId` (see checkpoint manager task), restore it into the project's SQLite (use a transactional file replace strategy or SQL restore commands), and ensure WAL and file locks are handled safely.
  - Ensure the method returns a structured result `{ restored: true, taskId, replacedFiles: [..] }`.
- [ ] Implement `src/rewind/vector.pruner.ts`:
  - Export `VectorMemoryPruner` with `async prune(cutoffTimestamp: string | number)` that removes vectors older than cutoff and returns `{ prunedCount }`.
  - Support both an in-memory fallback and an external vector DB client (abstract client via interface for mocking).

## 3. Code Review
- [ ] Confirm all DB restore operations are completed inside transactions where possible and that file locks/WAL are handled to prevent corruption.
- [ ] Ensure Vector pruning uses a paginated deletion approach to avoid OOM on large vector stores and logs pruned counts.
- [ ] Validate error handling surfaces structured errors for orchestration logging and entropy detection hashing.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="relational.resetter|vector.pruner"` and ensure passing tests.
- [ ] Run `npm run lint` and `npm run build`.

## 5. Update Documentation
- [ ] Add `docs/rewind/STATE_RESET.md` documenting the snapshot restore approach, expected snapshot format, and failover steps.
- [ ] Add `docs/rewind/VECTOR_PRUNER.md` documenting pruning strategy and safety limits (batch sizes, rate limits).

## 6. Automated Verification
- [ ] Add CI integration that seeds an in-memory DB, writes a snapshot, runs `RelationalStateResetter.reset(taskId)`, and verifies key rows match expected snapshot.
- [ ] Add an automated check that after `VectorMemoryPruner.prune` the vector index size decreased by `prunedCount` reported.
