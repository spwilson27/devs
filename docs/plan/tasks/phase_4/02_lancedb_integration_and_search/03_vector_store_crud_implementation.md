# Task: VectorStore Class Implementation with CRUD Operations (Sub-Epic: 02_LanceDB_Integration_and_Search)

## Covered Requirements
- [2_TAS-REQ-027], [9_ROADMAP-TAS-104]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/vector/__tests__/vector-store.test.ts`.
- [ ] Use `tmp` or `os.tmpdir()` to create a unique temp directory for each test; clean up in `afterEach`.
- [ ] Write an integration test for `VectorStore.initialize()`:
  - Assert it creates the LanceDB table `memory` at the configured path if it does not exist.
  - Assert it opens an existing table without error on a second call (idempotency).
- [ ] Write an integration test for `VectorStore.insert(record: MemoryRecord)`:
  - Insert a single `MemoryRecord` with a known `id`.
  - Assert the record count increases by 1.
- [ ] Write an integration test for `VectorStore.insertBatch(records: MemoryRecord[])`:
  - Insert 5 records in one batch.
  - Assert all 5 are retrievable.
- [ ] Write an integration test for `VectorStore.getById(id: string)`:
  - Insert a record, then retrieve it by `id`.
  - Assert all fields match the inserted record (deep equality, excluding the Float32Array which should be compared element-wise).
- [ ] Write an integration test for `VectorStore.deleteById(id: string)`:
  - Insert then delete a record.
  - Assert `getById` returns `null` afterward.
- [ ] Write an integration test for `VectorStore.update(id: string, patch: Partial<Omit<MemoryRecord, 'id' | 'embedding'>>)`:
  - Insert a record, update its `content` field, then retrieve it.
  - Assert the `content` is updated and all other fields are unchanged.
- [ ] Write a unit test asserting that `VectorStore.insert` generates a UUID `id` if the provided `id` field is empty/undefined.
- [ ] All tests must fail initially (red phase).

## 2. Task Implementation

- [ ] Create `packages/memory/src/vector/vector-store.ts`:
  - Export `class VectorStore`:
    - Constructor: `constructor(private config: { dbPath: string; embeddingService: EmbeddingService })`.
    - `async initialize(): Promise<void>` — opens (or creates) the LanceDB connection via `openVectorDb`, then opens (or creates) the `memory` table using `MEMORY_ARROW_SCHEMA`. Stores the table reference as a private field. Creates the IVF-PQ index if no index exists yet (use `table.createIndex` with `IVF_PQ_INDEX_CONFIG`).
    - `async insert(record: Omit<MemoryRecord, 'id'> & { id?: string }): Promise<string>` — generates a UUID if `id` is absent, converts `embedding` to Arrow format, adds the row to the table. Returns the final `id`.
    - `async insertBatch(records: Array<Omit<MemoryRecord, 'id'> & { id?: string }>): Promise<string[]>` — same as insert but for multiple records in a single LanceDB `add` call.
    - `async getById(id: string): Promise<MemoryRecord | null>` — queries the table with a filter `id = '<id>'`, returns the first result deserialized into `MemoryRecord` or `null`.
    - `async deleteById(id: string): Promise<void>` — calls `table.delete(filter)`.
    - `async update(id: string, patch: Partial<Omit<MemoryRecord, 'id' | 'embedding'>>): Promise<void>` — LanceDB does not support partial updates natively; implement as `getById` + `deleteById` + `insert` with merged fields.
  - All methods must throw a typed `VectorStoreError extends Error` on failure, wrapping the underlying LanceDB error.
- [ ] Export `class VectorStoreError extends Error` from `vector-store.ts`.
- [ ] Update `packages/memory/src/vector/index.ts` to re-export `VectorStore` and `VectorStoreError`.

## 3. Code Review

- [ ] Verify that `initialize()` is always called before any other method — add a private `assertInitialized()` guard that throws `VectorStoreError` with a clear message if the table is not yet open.
- [ ] Verify that `insertBatch` uses a single `table.add(rows)` call, not a loop of individual inserts, for performance.
- [ ] Verify the `update` implementation fetches the existing embedding (not re-embedding) to avoid unnecessary API calls.
- [ ] Verify `Float32Array` embeddings are correctly serialized into Arrow `FixedSizeList<Float32>(768)` format before insertion.
- [ ] Confirm no raw SQL strings are constructed — all filtering uses the LanceDB filter API.

## 4. Run Automated Tests to Verify

- [ ] Run: `pnpm --filter @devs/memory test -- --testPathPattern=vector-store`
- [ ] All integration tests in `vector-store.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/memory build` and assert zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/vector/vector-store.agent.md` documenting: the `VectorStore` class API (all methods with signatures), the update-as-delete+insert pattern and its rationale, error handling conventions, and the `assertInitialized` guard.
- [ ] Update `packages/memory/README.md` with a `## VectorStore` section showing initialization and CRUD usage examples.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=vector-store` and confirm ≥ 90% statement coverage on `vector-store.ts`.
- [ ] Run `pnpm --filter @devs/memory build` and assert exit code is `0`.
- [ ] Verify that no test uses a hardcoded path like `/tmp/lancedb` — all paths must be generated dynamically per test run.
