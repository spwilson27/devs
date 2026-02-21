# Task: Implement Vector Memory Pruning on Rewind (Sub-Epic: 05_Full Rewind Execution)

## Covered Requirements
- [3_MCP-TAS-095]

## 1. Initial Test Written
- [ ] In `src/rewind/__tests__/vector.memory.pruner.test.ts`, write unit tests for `VectorMemoryPruner`:
  - Mock the LanceDB client (or the project's vector store abstraction).
  - Test that `prune(timestamp)` calls the vector store's delete/filter API to remove all embeddings where `created_at > timestamp`.
  - Test that `prune(timestamp)` resolves without error when the vector store returns 0 deleted records (no embeddings exist after the timestamp).
  - Test that `prune(timestamp)` throws `VectorPruneError` if the vector store API returns an error, with the original error attached as `cause`.
  - Test that `prune(timestamp)` is called with a Unix epoch integer (milliseconds), not an ISO string, to match the vector store's native timestamp format.
- [ ] In `src/rewind/__tests__/vector.memory.pruner.integration.test.ts`, write an integration test using a real in-process LanceDB instance (or test double):
  - Insert 5 embeddings with `created_at` timestamps spanning before and after a target cutoff.
  - Call `prune(cutoffTimestamp)` and assert that only embeddings with `created_at <= cutoffTimestamp` remain.
  - Assert the exact count of remaining embeddings matches expectation.

## 2. Task Implementation
- [ ] Create `src/rewind/vector.memory.pruner.ts` implementing the `VectorMemoryPruner` interface from `src/rewind/interfaces.ts`:
  - Export class `LanceDBVectorMemoryPruner implements VectorMemoryPruner`.
  - Constructor accepts `{ vectorStore: VectorStore }` where `VectorStore` is the project's existing vector store abstraction (e.g., wrapping LanceDB).
  - Implement `async prune(targetTimestamp: number): Promise<PruneResult>`:
    1. Call `vectorStore.delete({ filter: \`created_at > ${targetTimestamp}\` })` (use the vector store's native filter syntax for the project's LanceDB version).
    2. Capture the count of deleted embeddings from the response.
    3. Return `{ deletedCount: number }`.
    4. If the vector store call throws, catch and re-throw as `VectorPruneError` with `cause` set.
- [ ] Add `VectorPruneError extends Error` to `src/rewind/errors.ts` with a `cause: unknown` field.
- [ ] Add `PruneResult` interface to `src/rewind/types.ts`: `{ deletedCount: number }`.
- [ ] Wire `LanceDBVectorMemoryPruner` as the concrete implementation in `src/rewind/composition-root.ts`.

## 3. Code Review
- [ ] Verify the filter expression passed to LanceDB uses parameterized or safe string construction — no user-controlled input can reach this filter.
- [ ] Confirm that `targetTimestamp` is a `number` (not `string`) at the TypeScript type level, preventing accidental ISO string injection.
- [ ] Verify that `VectorMemoryPruner` is a pure interface in `interfaces.ts` with no concrete dependency on LanceDB, keeping the abstraction layer clean.
- [ ] Confirm the pruner does NOT commit any relational DB changes — it operates exclusively on the vector store.
- [ ] Verify the `PruneResult` is logged by the `RewindOrchestrator` (update orchestrator to log `deletedCount` for observability).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="vector.memory.pruner"` and confirm all unit tests pass.
- [ ] Run the integration test: `npm test -- --testPathPattern="vector.memory.pruner.integration" --runInBand` and confirm the count assertions pass.
- [ ] Run `npm run lint` and `npm run build` with zero errors.

## 5. Update Documentation
- [ ] Update `src/rewind/REWIND.agent.md` with a section on `LanceDBVectorMemoryPruner`:
  - Document the filter expression used and the `created_at` field convention in the vector store schema.
  - Document `VectorPruneError` and recovery behavior.
  - Document `PruneResult` and note that `deletedCount` is logged for audit purposes.
- [ ] Update `docs/architecture/rewind.md` with a "Vector Memory Pruning" subsection explaining why embeddings after the rewind point must be pruned (to prevent semantic context contamination from future tasks leaking into past context retrieval).

## 6. Automated Verification
- [ ] Run integration test in CI: `npm test -- --testPathPattern="vector.memory.pruner.integration"` and assert exit code 0.
- [ ] Assert via integration test that after `prune(cutoffTimestamp)`, a direct LanceDB query for `created_at > cutoffTimestamp` returns an empty result set.
- [ ] Run `npm test -- --coverage --testPathPattern="vector.memory.pruner"` and assert line coverage ≥ 90% for `vector.memory.pruner.ts`.
