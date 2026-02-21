# Task: Implement Vector Retrieval Noise Filtering — Epic-Scoped Metadata Filtering (Sub-Epic: 17_Context_Drift_and_Semantic_Integrity)

## Covered Requirements
- [3_MCP-RISK-502]

## 1. Initial Test Written

- [ ] Create test file at `packages/memory/src/__tests__/vector-retrieval-noise-filter.test.ts`.
- [ ] Write a unit test `search_memory filters results by epic_id metadata`:
  - Seed a mock LanceDB table with 10 vector entries:
    - 5 entries with `metadata.epic_id = 'epic_4'`
    - 5 entries with `metadata.epic_id = 'epic_7'`
  - Call `VectorStore.search({ query: 'context management', epicId: 'epic_4', limit: 10 })`.
  - Assert that all returned results have `metadata.epic_id === 'epic_4'`.
  - Assert that no results from `epic_7` are returned.
- [ ] Write a unit test `search_memory with no epicId returns results across all epics`:
  - Using the same seeded table, call `VectorStore.search({ query: 'context management', limit: 10 })` without `epicId`.
  - Assert that results from both `epic_4` and `epic_7` may appear.
- [ ] Write a unit test `search_memory respects cosine similarity threshold with epic filter`:
  - Seed entries with known embeddings (use a mock embedding function that returns deterministic vectors).
  - Assert that results below the configured `similarityThreshold` (default: `0.75`) are excluded even if they match the `epic_id` filter.
- [ ] Write a unit test `search_memory returns empty array when no entries match epic_id`:
  - Query with `epicId: 'epic_99'` (not present in the table).
  - Assert that the result is an empty array, not an error.
- [ ] Write a unit test `VectorStore.addEntry stores epic_id in metadata`:
  - Call `VectorStore.addEntry({ content: '...', type: 'tas', epicId: 'epic_4', phaseId: 'phase_4' })`.
  - Retrieve the entry directly from LanceDB.
  - Assert that `metadata.epic_id === 'epic_4'` and `metadata.phase_id === 'phase_4'` are present.
- [ ] Write an integration test `search_memory end-to-end with real LanceDB instance`:
  - Use a temp LanceDB directory (clean up in `afterEach`).
  - Insert entries for two epics.
  - Perform a filtered search.
  - Assert correct scoping.

## 2. Task Implementation

- [ ] In `packages/memory/src/vector-store.ts`, update `VectorEntrySchema` to include mandatory metadata fields:
  ```typescript
  export interface VectorEntryMetadata {
    epic_id: string;       // e.g. 'epic_4'
    phase_id: string;      // e.g. 'phase_4'
    task_id?: string;      // e.g. 'task_17_03'
    entry_type: string;    // e.g. 'tas', 'requirements', 'architectural_decision'
    created_at: number;    // Unix ms
    approved: boolean;     // Only 'Approved' entries are indexed (see [3_MCP-RISK-503])
  }

  export interface VectorEntry {
    id: string;
    content: string;
    embedding: number[];
    metadata: VectorEntryMetadata;
  }
  ```
- [ ] Update `VectorStore.addEntry(entry: Omit<VectorEntry, 'id' | 'embedding'>)`:
  - Validate that `entry.metadata.epic_id` is a non-empty string before inserting; throw `VectorStoreValidationError` if missing.
  - Validate that `entry.metadata.approved === true`; if not, reject the entry with a warning log and do not insert.
  - Compute the embedding using the project's `EmbeddingService` (`text-embedding-004` model).
  - Insert into LanceDB.
- [ ] Implement `VectorStore.search(options: VectorSearchOptions): Promise<VectorEntry[]>`:
  ```typescript
  export interface VectorSearchOptions {
    query: string;
    epicId?: string;           // If provided, filters by metadata.epic_id
    phaseId?: string;          // Optional additional filter
    limit?: number;            // Default: 10
    similarityThreshold?: number; // Default: 0.75
  }
  ```
  - Generate query embedding via `EmbeddingService`.
  - Build a LanceDB cosine similarity search.
  - If `epicId` is provided, apply a WHERE clause: `metadata.epic_id = '<epicId>'`.
  - Post-filter results below `similarityThreshold`.
  - Return at most `limit` results.
- [ ] Expose `VectorStore` from `packages/memory/src/index.ts`.
- [ ] Update the `search_memory` MCP tool definition in `packages/mcp/src/tools/search-memory.ts`:
  - Add optional `epic_id` parameter to the tool's input schema.
  - Pass `epic_id` to `VectorStore.search({ epicId })`.
  - Document in the tool's description that omitting `epic_id` searches globally.

## 3. Code Review

- [ ] Verify that `epic_id` is applied as a server-side LanceDB WHERE filter (not post-filtered in application code after fetching all results), for performance correctness.
- [ ] Confirm `VectorStoreValidationError` is a typed error class extending `Error`, not a generic `Error` throw.
- [ ] Ensure the `approved` field check prevents unapproved entries from polluting the vector index (relates to [3_MCP-RISK-503] context poisoning prevention — do not implement that full requirement here, but do not break it).
- [ ] Verify `similarityThreshold` defaults are defined as named constants, not inline magic numbers.
- [ ] Confirm the MCP tool schema change is backward-compatible (new `epic_id` parameter must be `optional`).
- [ ] Check that the integration test uses a real temporary LanceDB directory (not a full mock), to validate actual filter behavior.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=vector-retrieval-noise-filter` and confirm all tests pass.
- [ ] Run `pnpm test --filter @devs/mcp -- --testPathPattern=search-memory` to ensure MCP tool tests pass.
- [ ] Run the full `@devs/memory` test suite: `pnpm test --filter @devs/memory` and confirm no regressions.
- [ ] Check test coverage: `pnpm test --filter @devs/memory -- --coverage` and confirm `vector-store.ts` has ≥90% line coverage.

## 5. Update Documentation

- [ ] Update `packages/memory/README.md`:
  - Add a `## Vector Retrieval Noise Filtering` section.
  - Document the `epic_id` and `phase_id` metadata fields.
  - Describe how to perform a scoped vs. global search.
  - Document `DEVS_VECTOR_SIMILARITY_THRESHOLD` env var (if not already present), controlling the default similarity threshold.
- [ ] Update `packages/mcp/README.md` or the MCP tool catalog:
  - Document the `epic_id` parameter for the `search_memory` tool.
  - Provide a usage example showing scoped search.
- [ ] Add TSDoc comments to `VectorStore.search()` and `VectorStore.addEntry()` describing the filtering contract.
- [ ] Update agent memory file `.devs/memory/architectural_decisions.md` with an entry:
  ```
  Decision: All vector memory searches MUST include an `epic_id` metadata filter when operating within a specific Epic context. This prevents cross-epic retrieval noise and hallucination from unrelated historical decisions. Requirement: [3_MCP-RISK-502]. Global (unscoped) search is only permitted for cross-cutting queries (e.g., project-wide architectural lookups).
  ```

## 6. Automated Verification

- [ ] Run `pnpm test --filter @devs/memory -- --testPathPattern=vector-retrieval-noise-filter --reporter=json > /tmp/vector-noise-filter-results.json` and assert exit code is `0`.
- [ ] Verify the JSON output contains `"numFailedTests": 0` using: `node -e "const r=require('/tmp/vector-noise-filter-results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `pnpm build --filter @devs/memory && pnpm build --filter @devs/mcp` and assert exit codes are `0`.
- [ ] Run the integration test in isolation with a fresh temp dir: `LANCEDB_PATH=$(mktemp -d) pnpm test --filter @devs/memory -- --testPathPattern=vector-retrieval-noise-filter --testNamePattern="end-to-end"` and assert exit code `0`.
