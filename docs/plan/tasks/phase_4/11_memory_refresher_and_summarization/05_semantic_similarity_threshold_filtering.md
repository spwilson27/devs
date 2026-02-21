# Task: Implement Semantic Similarity Threshold Filtering for LanceDB Retrieval (Sub-Epic: 11_Memory_Refresher_and_Summarization)

## Covered Requirements
- [8_RISKS-REQ-104]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/retrieval/__tests__/SemanticFilter.test.ts`.
- [ ] Write a unit test for `SemanticFilter.filter(results: VectorSearchResult[], threshold: number): VectorSearchResult[]`:
  - Provide an array of `VectorSearchResult` objects with `score` values: `[0.95, 0.82, 0.74, 0.61, 0.43]`.
  - Call `filter(results, 0.75)` and assert that only the results with `score >= 0.75` are returned (`[0.95, 0.82]` — two entries).
  - Call `filter(results, 0.0)` and assert all five results are returned.
  - Call `filter(results, 1.1)` and assert an empty array is returned.
- [ ] Write a unit test asserting that `filter()` preserves the original ordering of results (highest score first is not enforced by this function — it only filters, not re-sorts).
- [ ] Write a unit test for `SemanticFilter.filterAndRank(results: VectorSearchResult[], threshold: number): VectorSearchResult[]`:
  - Assert that after filtering by threshold, results are sorted descending by `score`.
- [ ] Create `packages/memory/src/retrieval/__tests__/VectorStore.search.test.ts`.
- [ ] Write a unit test for `VectorStore.searchWithThreshold(query: string, threshold: number, limit: number): Promise<VectorSearchResult[]>`:
  - Mock `LanceDBStore.search()` to return a predefined set of results with varying scores.
  - Assert that results below `threshold` are excluded from the returned array.
  - Assert that at most `limit` results are returned (post-filtering).
- [ ] Write an integration test using a real in-memory LanceDB table with 10 pre-inserted vectors. Insert a query vector with known cosine similarity distances. Call `searchWithThreshold` with threshold `0.80` and assert only high-similarity entries are returned.

## 2. Task Implementation

- [ ] Create `packages/memory/src/retrieval/types.ts`:
  ```ts
  export interface VectorSearchResult {
    id: string;
    content: string;
    score: number;        // Cosine similarity in [0, 1]
    metadata: Record<string, unknown>;
  }
  ```
- [ ] Create `packages/memory/src/retrieval/SemanticFilter.ts`:
  - `filter(results: VectorSearchResult[], threshold: number): VectorSearchResult[]`:
    1. Validate `threshold` is in `[0, 1]`; throw `InvalidThresholdError` if not.
    2. Return `results.filter(r => r.score >= threshold)`.
  - `filterAndRank(results: VectorSearchResult[], threshold: number): VectorSearchResult[]`:
    1. Call `filter(results, threshold)`.
    2. Sort the filtered array by `score` descending.
    3. Return sorted array.
- [ ] Update `packages/memory/src/store/VectorStore.ts` to add:
  - `searchWithThreshold(query: string, threshold: number, limit: number): Promise<VectorSearchResult[]>`:
    1. Generate embedding for `query` via `embeddingClient.embed(query)` using `text-embedding-004`.
    2. Call `lanceDBStore.search(embeddingVector, { metric: 'cosine', limit: limit * 3 })` — fetch 3× the requested limit to allow for threshold filtering.
    3. Map raw LanceDB rows to `VectorSearchResult[]` (populate `score` from the cosine similarity distance: `score = 1 - distance`).
    4. Apply `SemanticFilter.filterAndRank(rawResults, threshold)`.
    5. Return the first `limit` entries.
  - Default threshold constant: `export const DEFAULT_SIMILARITY_THRESHOLD = 0.75` — document that this was chosen based on empirical analysis of LanceDB cosine similarity distributions for code-adjacent text embeddings.
- [ ] Update all existing callers of `VectorStore.search()` in the codebase to use `searchWithThreshold` with `DEFAULT_SIMILARITY_THRESHOLD` as the default:
  - `packages/memory/src/refresher/MemoryRefresher.ts` (if it calls `search`).
  - `packages/orchestrator/src/ContextComposer.ts`.
  - Any MCP tool implementations that query vector memory.
- [ ] Export `SemanticFilter`, `VectorSearchResult`, `DEFAULT_SIMILARITY_THRESHOLD` from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify that `SemanticFilter.filter()` does not mutate the input array — it must return a new filtered array.
- [ ] Verify that `VectorStore.searchWithThreshold()` over-fetches by 3× before filtering, not exactly `limit` — this is critical to ensure the threshold filter has enough candidates to fill the result set.
- [ ] Verify that `score = 1 - distance` conversion is correct for cosine distance (LanceDB returns distance, not similarity — confirm by checking LanceDB documentation or existing integration tests).
- [ ] Verify that `InvalidThresholdError` is a typed error class (extends `Error`) with a `threshold` field, not a raw string throw.
- [ ] Verify that `DEFAULT_SIMILARITY_THRESHOLD = 0.75` is documented with a rationale comment in the source file, not left as a magic number.
- [ ] Verify that the threshold is configurable per-call and not baked into the `VectorStore` class constructor — it must remain a parameter to `searchWithThreshold`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all `SemanticFilter` and `VectorStore.searchWithThreshold` unit tests pass.
- [ ] Run `pnpm --filter @devs/memory test:integration` and confirm the LanceDB integration test passes.
- [ ] Run `pnpm --filter @devs/memory build` to confirm TypeScript compiles without errors.
- [ ] Run `pnpm --filter @devs/memory lint` to confirm no violations.
- [ ] Run `pnpm --filter @devs/orchestrator test` to confirm no regressions in the orchestrator after updating callers.

## 5. Update Documentation

- [ ] Add a `## Semantic Similarity Threshold Filtering` section to `packages/memory/README.md`:
  - Describe `SemanticFilter.filterAndRank()`, the `DEFAULT_SIMILARITY_THRESHOLD` of `0.75`, and when to override the default.
  - Explain that the 3× over-fetch strategy is used to compensate for post-filter result attrition.
- [ ] Update `docs/agent-memory/vector-store.md` to document `searchWithThreshold` as the required method for all vector memory queries per `[8_RISKS-REQ-104]` — direct calls to `search()` without threshold filtering are deprecated.
- [ ] Add an ADR `docs/architecture-decisions/adr-similarity-threshold.md` recording the decision to use `0.75` as the default cosine similarity threshold, with rationale and the instruction to re-evaluate after 100 real project runs.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json --outputFile=test-results/semantic-filter.json` and confirm zero `failed` entries.
- [ ] Run `grep -r "VectorStore.search\b" packages/ --include="*.ts"` (without `WithThreshold`) and confirm no unguarded direct `search()` calls remain in orchestrator or MCP tool code.
- [ ] Run `pnpm tsc --noEmit -p packages/memory/tsconfig.json` and confirm exit code 0.
