# Task: Long-Term Memory Semantic Search API (Sub-Epic: 05_Long_Term_Memory_Implementation)

## Covered Requirements
- [3_MCP-TAS-018], [TAS-057], [3_MCP-TAS-097], [8_RISKS-REQ-013]

## 1. Initial Test Written

- [ ] In `packages/memory/src/__tests__/search-memory.test.ts`, write a test suite `describe('searchMemory')` that:
  - Mocks `EmbeddingClient.embedText()` to return a deterministic 768-dimensional `Float32Array`.
  - Mocks `LanceDBClient.table.search()` to return a fixed array of `VectorMemoryRecord` objects with mock `_distance` scores.
  - Tests `searchMemory(query: MemorySearchQuery, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<MemorySearchResult[]>`:
    - Asserts that `embedText(query.text)` is called exactly once with the raw query string.
    - Asserts that the LanceDB `table.search(embedding)` is called with the embedded query vector.
    - Asserts that a `.limit(query.topK ?? 10)` is applied.
    - Asserts that when `query.types` is `['ARCHITECTURAL_DECISION']`, a `.where("type = 'ARCHITECTURAL_DECISION'")` filter is applied.
    - Asserts that when `query.project_id` is set, a `.where("project_id = '<id>'")` filter is included.
    - Asserts that when both `query.types` and `query.project_id` are set, both filters are combined with `AND`.
    - Asserts that the returned `MemorySearchResult[]` maps each raw LanceDB row to `{ record: VectorMemoryRecord, similarity: number }` where `similarity = 1 - _distance` (cosine distance to similarity conversion).
    - Asserts that results with `similarity < (query.minSimilarity ?? 0.0)` are filtered out from the returned array.
  - Tests `searchMemory` with `query.tags = ['rca']`:
    - Asserts a `.where("array_has_any(tags, ['rca'])")` (or equivalent LanceDB filter syntax) is applied.
  - Tests that when `embeddingClient.embedText` throws, `searchMemory` throws a `MemorySearchError` with the original error as cause.
  - Tests that when the LanceDB `table.search()` returns 0 results, `searchMemory` returns an empty array (not null or undefined).

## 2. Task Implementation

- [ ] Create `packages/memory/src/search/types.ts` defining:
  ```typescript
  export interface MemorySearchQuery {
    text: string;
    topK?: number;           // default: 10
    minSimilarity?: number;  // default: 0.0 (no threshold)
    types?: VectorMemoryRecord['type'][];
    project_id?: string;
    tags?: string[];
  }
  export interface MemorySearchResult {
    record: VectorMemoryRecord;
    similarity: number;      // 0.0 (unrelated) to 1.0 (identical)
  }
  export class MemorySearchError extends Error {
    constructor(message: string, public readonly cause: unknown) {
      super(message);
      this.name = 'MemorySearchError';
    }
  }
  ```
- [ ] Create `packages/memory/src/search/filter-builder.ts` exporting `buildWhereClause(query: MemorySearchQuery): string | null`:
  - Constructs a SQL-like WHERE clause string from the query fields.
  - If `query.types` is non-empty: `type IN ('TYPE_A', 'TYPE_B')`.
  - If `query.project_id` is set: `project_id = '<id>'`.
  - If `query.tags` is non-empty: `array_has_any(tags, ['tag1', 'tag2'])`.
  - Combine multiple conditions with `AND`.
  - Return `null` if no filters apply (so `.where()` is not called at all).
- [ ] Create `packages/memory/src/search/search-memory.ts` exporting `searchMemory(query: MemorySearchQuery, client: LanceDBClient, embeddingClient: EmbeddingClient): Promise<MemorySearchResult[]>`:
  - Embed `query.text` via `embeddingClient.embedText(query.text)`.
  - Build LanceDB search: `let search = client.table.search(embedding).limit(query.topK ?? 10)`.
  - Apply WHERE clause from `buildWhereClause(query)` if non-null.
  - Execute search: `const rows = await search.execute()`.
  - Map rows to `MemorySearchResult`: `{ record: row as VectorMemoryRecord, similarity: 1 - row._distance }`.
  - Filter out results below `query.minSimilarity` if set.
  - Sort results descending by `similarity` and return.
  - Wrap entire function body in try/catch; re-throw as `MemorySearchError`.
- [ ] Create `packages/memory/src/search/index.ts` re-exporting all public symbols.
- [ ] Re-export `searchMemory`, `MemorySearchQuery`, `MemorySearchResult`, `MemorySearchError` from `packages/memory/src/index.ts`.
- [ ] Register `searchMemory` as an MCP tool in `packages/mcp-server/src/tools/search_memory.ts`:
  - Tool name: `search_memory`.
  - Input schema: `{ query: string, topK?: number, minSimilarity?: number, types?: string[], project_id?: string, tags?: string[] }`.
  - On invocation: initialize `LanceDBClient` (or reuse singleton), call `searchMemory`, return results as a formatted Markdown list of matches with similarity scores.

## 3. Code Review

- [ ] Verify that `buildWhereClause` is a pure function unit-tested independently with a variety of input combinations (all fields set, partial fields, no fields).
- [ ] Verify that `similarity = 1 - _distance` is correct for LanceDB's cosine metric (cosine distance returns values in [0, 2]; this assumes normalized vectors yield distance in [0, 1]—document this assumption with a code comment).
- [ ] Verify that the MCP tool `search_memory` validates all input types before calling `searchMemory` and returns a structured error response (not a thrown exception) if input is invalid.
- [ ] Verify that `topK` is capped at a maximum of 50 to prevent excessive memory usage during a single query, with a `console.warn` logged if the requested value exceeds the cap.
- [ ] Verify that `searchMemory` is exported from `packages/memory/src/index.ts` and accessible as a public API.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="search-memory"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="search_memory"` (if MCP tool tests exist) and confirm no failures.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add a section `## Semantic Search (search_memory)` to `packages/memory/README.md` documenting:
  - The `MemorySearchQuery` interface fields and defaults.
  - The `MemorySearchResult` similarity score interpretation (0.0–1.0).
  - Available filter fields (`types`, `project_id`, `tags`).
  - The `topK` cap of 50.
  - The MCP tool name (`search_memory`) and its input schema.
- [ ] Update `specs/3_mcp_design.md` to document `search_memory` as the canonical MCP tool for querying long-term memory, referencing [3_MCP-TAS-018].
- [ ] Add to agent memory: "`search_memory` MCP tool is available for semantic retrieval from LanceDB long-term memory. Supports filtering by `type`, `project_id`, `tags`. Similarity threshold configurable. Max topK: 50. [3_MCP-TAS-018] [TAS-057] [3_MCP-TAS-097] [8_RISKS-REQ-013]."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="search-memory" --reporter=json > test-results/search-memory.json` and assert exit code `0`.
- [ ] Assert `jq '[.testResults[].assertionResults[] | select(.status == "failed")] | length' test-results/search-memory.json` equals `0`.
- [ ] Assert the MCP tool is registered: `node -e "import('@devs/mcp-server').then(m => { const tool = m.getMCPTools().find(t => t.name === 'search_memory'); console.assert(!!tool, 'FAIL: search_memory tool not registered'); console.log('PASS'); })"` outputs `PASS`.
- [ ] Assert `jq '[.testResults[].assertionResults[] | select(.status == "passed")] | length' test-results/search-memory.json` is greater than `7`.
