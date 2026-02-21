# Task: Implement Metadata-Scoped Vector Retrieval Noise Filtering (Sub-Epic: 04_Vector Memory Management)

## Covered Requirements
- [3_MCP-RISK-502]

## 1. Initial Test Written
- [ ] Create `src/memory/__tests__/VectorRetrieval.noise-filter.test.ts`.
- [ ] Write a unit test `search_filtersResultsByEpicId_excludesOtherEpics` that:
  1. Seeds a mock LanceDB table with 20 rows: 10 with `epic_id = "epic-3"` and 10 with `epic_id = "epic-7"`.
  2. Calls `VectorStore.search({ query: "some query", epicId: "epic-3", limit: 20 })`.
  3. Asserts the returned results contain exactly 10 rows, all with `epic_id = "epic-3"`.
- [ ] Write a unit test `search_withoutEpicId_returnsUnfilteredResults` that calls `VectorStore.search({ query: "q", limit: 5 })` without `epicId` and asserts results are not filtered by epic.
- [ ] Write a unit test `search_combinedFilter_appliesEpicIdAndCustomFilter` that seeds rows across 3 epics with varying `status` fields, calls `search` with both `epicId` and a custom metadata filter `{ status: "Verified" }`, and asserts only rows matching both criteria are returned.
- [ ] Write an integration test `search_integration_epicScopedRetrieval` against a real ephemeral LanceDB in a temp directory that validates end-to-end vector search with `epic_id` metadata filtering returns scoped results.

## 2. Task Implementation
- [ ] Locate `src/memory/VectorStore.ts` (created in earlier phases) and update the `search` method signature to:
  ```typescript
  async search(options: {
    query: string;
    limit?: number;
    epicId?: string;
    metadataFilter?: Record<string, unknown>;
  }): Promise<VectorSearchResult[]>
  ```
- [ ] Update the `search` implementation:
  1. Build the base vector similarity query via `LanceDBAdapter`.
  2. If `epicId` is provided, append a metadata pre-filter: `epic_id = '${epicId}'` using LanceDB's `where` clause before executing the ANN search.
  3. If `metadataFilter` is provided in addition to `epicId`, merge the filters with `AND`.
  4. Return the filtered results.
- [ ] Ensure the `epic_id` field is indexed (or at minimum included in the LanceDB table schema) by updating `src/memory/LanceDBAdapter.ts` table creation logic to include `epic_id: string` in the schema if not already present.
- [ ] Update all existing callers of `VectorStore.search()` in the codebase to pass `epicId` from the current execution context (available on `TaskContext.epicId`).

## 3. Code Review
- [ ] Verify the `epicId` filter is applied as a pre-filter (before ANN computation), not post-filter, to avoid returning irrelevant high-similarity vectors from other epics.
- [ ] Verify no SQL injection is possible in the metadata filter construction — use parameterized or escaped values only.
- [ ] Verify the `search` method signature remains backward-compatible: existing callers without `epicId` must not break.
- [ ] Confirm `epic_id` is stored as a string (not an enum) to support dynamic epic IDs generated at runtime.
- [ ] Verify the integration test uses a non-production temp directory and cleans up after itself.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="VectorRetrieval.noise-filter"` from the project root.
- [ ] All tests in `src/memory/__tests__/VectorRetrieval.noise-filter.test.ts` must pass with exit code 0.
- [ ] Run the full memory module test suite `npm test -- --testPathPattern="src/memory"` to ensure no regressions in existing vector search tests.
- [ ] Confirm test coverage for modified portions of `VectorStore.ts` and `LanceDBAdapter.ts` is ≥ 90%.

## 5. Update Documentation
- [ ] Create or update `src/memory/VectorStore.agent.md` to document:
  - The `epicId` metadata filter parameter and its purpose (noise reduction).
  - The `metadataFilter` combined filtering capability.
  - The requirement that all agent-facing vector searches MUST pass `epicId` from `TaskContext`.
- [ ] Update `docs/architecture/vector-memory.md` to include a "Retrieval Noise Filtering" section explaining the `epic_id` scoping strategy and why it's required to prevent cross-epic context bleed.
- [ ] Add a note in `docs/agent-guidelines.md` (or equivalent) that agents should always scope vector searches to the current `epicId`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="VectorRetrieval.noise-filter" --coverage --coverageReporters=text` and assert ≥ 90% coverage on changed files.
- [ ] Run `grep -rn "VectorStore.search" src/ | grep -v "epicId\|test\|spec\|agent.md"` and assert the output is empty (all production callers pass `epicId`).
- [ ] Run `npm run build` and confirm no TypeScript compilation errors related to the updated `search` signature.
