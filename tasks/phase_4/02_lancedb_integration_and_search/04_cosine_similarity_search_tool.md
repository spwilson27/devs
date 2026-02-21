# Task: Cosine Similarity search_memory Tool Implementation (Sub-Epic: 02_LanceDB_Integration_and_Search)

## Covered Requirements
- [3_MCP-TAS-011], [2_TAS-REQ-027]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/vector/__tests__/search.test.ts`.
- [ ] Use a real LanceDB temp instance (same pattern as `vector-store.test.ts`) pre-populated with 10 known `MemoryRecord` rows using fixed, deterministic embeddings (unit vectors in specific directions so nearest-neighbor results are predictable).
- [ ] Write an integration test for `VectorStore.search(query: string, opts?: SearchOptions): Promise<SearchResult[]>`:
  - Assert the return type is an array of `SearchResult` objects, each containing: `record: MemoryRecord`, `score: number` (cosine similarity, 0–1), and `rank: number` (1-based position).
  - Assert results are sorted descending by `score` (highest similarity first).
  - Assert the default top-K is `5`.
- [ ] Write an integration test verifying the `opts.topK` override:
  - Pass `topK: 3` and assert exactly 3 results are returned.
- [ ] Write an integration test verifying `opts.filter` metadata filtering:
  - Populate records with mixed `source` values (`'prd'`, `'tas'`, `'decision'`).
  - Pass `filter: { source: 'tas' }` and assert all returned records have `source === 'tas'`.
- [ ] Write an integration test verifying `opts.filter.project_id` scoping:
  - Insert records for two different `project_id` values.
  - Assert results are scoped to the queried `project_id` only.
- [ ] Write a unit test (with mocked `EmbeddingService`) asserting that `search` calls `embeddingService.embedQuery(query)` (not `embed`) to generate the query vector.
- [ ] All tests must fail initially (red phase).

## 2. Task Implementation

- [ ] In `packages/memory/src/vector/vector-store.ts`, add the following types and method:
  - Export interface `SearchOptions`:
    ```ts
    interface SearchOptions {
      topK?: number;           // default: 5
      filter?: {
        source?: MemoryRecord['source'];
        project_id?: string;
        phase?: number;
      };
    }
    ```
  - Export interface `SearchResult`:
    ```ts
    interface SearchResult {
      record: MemoryRecord;
      score: number;
      rank: number;
    }
    ```
  - Add `async search(query: string, opts?: SearchOptions): Promise<SearchResult[]>` to `VectorStore`:
    1. Call `this.config.embeddingService.embedQuery(query)` to get the query vector.
    2. Build a LanceDB filter expression from `opts.filter` fields (AND-combine non-undefined fields).
    3. Call `table.vectorSearch(queryVector).limit(opts.topK ?? 5).distanceType('cosine')`. Apply the filter if present.
    4. Execute the query and convert raw rows into `SearchResult[]`:
       - Deserialize each row into a `MemoryRecord`.
       - Set `score` to `1 - _distance` (LanceDB returns cosine distance; convert to similarity).
       - Set `rank` to the 1-based index in the result array.
    5. Return the sorted results array.
- [ ] Export `SearchOptions` and `SearchResult` from `packages/memory/src/vector/index.ts`.

## 3. Code Review

- [ ] Confirm `embedQuery` (not `embed`) is used for query embedding — this is mandatory for retrieval quality with `text-embedding-004`.
- [ ] Confirm the distance-to-similarity conversion `score = 1 - distance` is applied correctly (LanceDB cosine distance ranges 0–2; verify this assumption matches the installed LanceDB version and adjust if needed).
- [ ] Confirm the filter expression builder handles `undefined` fields by omitting them from the filter string — never passes empty strings or `undefined` to LanceDB.
- [ ] Confirm `search` does not call the embedding API when `topK` is `0` (short-circuit and return empty array).
- [ ] Confirm that if the LanceDB table has fewer records than `topK`, the function returns however many records exist without error.

## 4. Run Automated Tests to Verify

- [ ] Run: `pnpm --filter @devs/memory test -- --testPathPattern=search`
- [ ] All tests in `search.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/memory build` and assert zero TypeScript errors.

## 5. Update Documentation

- [ ] Update `packages/memory/src/vector/vector-store.agent.md` with a `## Semantic Search` section documenting: `SearchOptions` fields, `SearchResult` structure, the `topK` default, filter semantics, and the cosine-distance-to-similarity conversion formula.
- [ ] Update `packages/memory/README.md` with a `## Semantic Search` section showing a code example of calling `vectorStore.search(...)` with options.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=search` and confirm ≥ 90% branch coverage on the `search` method in `vector-store.ts`.
- [ ] Run `pnpm --filter @devs/memory build` and assert exit code is `0`.
- [ ] Run the full memory package test suite (`pnpm --filter @devs/memory test`) and assert zero regressions from previously passing tests.
