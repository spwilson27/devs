# Task: Implement Long-Term (LanceDB Vector) Memory Layer (Sub-Epic: 03_Tiered_Memory_Architecture)

## Covered Requirements
- [TAS-100], [TAS-081], [1_PRD-REQ-GOAL-007], [4_USER_FEATURES-REQ-017]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/long-term-memory.test.ts`.
- [ ] Mock the LanceDB client and the `text-embedding-004` embedding call so tests run offline and deterministically:
  - Create a `jest.mock('../long-term/embeddingClient')` that returns a fixed 768-dimension zero vector for any input.
  - Create a mock LanceDB table object with in-memory jest mock functions for `add`, `search`, and `delete`.
- [ ] Write unit tests for `LanceDbLongTermMemory` implementing `ILongTermMemory`:
  - `upsert(doc)` calls the embedding client with `doc.content` and stores the returned vector alongside the document.
  - `upsert` called twice with the same `doc.id` replaces the first entry (no duplicate ids).
  - `search(query, topK)` calls the embedding client with `query`, then invokes LanceDB cosine-similarity search with the resulting vector and `topK` limit, returning `MemoryDocument[]` sorted by relevance.
  - `delete(id)` calls the LanceDB delete operation with a filter matching the document `id`.
  - `delete` on a non-existent `id` does not throw.
- [ ] Write a test verifying `LanceDbLongTermMemory` satisfies `ILongTermMemory` (TypeScript assignability check).
- [ ] All tests must fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `packages/memory/src/long-term/embeddingClient.ts`:
  - Export an async function `embed(text: string): Promise<number[]>` that calls the `text-embedding-004` model via the project's configured AI client (e.g., Google Generative AI SDK).
  - The function must return a `number[]` of length 768.
- [ ] Create `packages/memory/src/long-term/LanceDbLongTermMemory.ts`:
  - Accept a `lanceDbPath: string` in the constructor (e.g., `.devs/memory.lancedb`).
  - Lazily open/create the LanceDB connection and a table named `memory` on first use.
  - Table schema: `{ id: string, content: string, embedding: number[] (768-dim), created_at: string, tags: string (JSON array), metadata: string (JSON object or null) }`.
  - Use IVF-PQ indexing (call `table.createIndex({ column: 'embedding', index_type: 'IVF_PQ', num_partitions: 256, num_sub_vectors: 96 })`) after first population.
  - Implement `upsert(doc: MemoryDocument): Promise<void>`:
    - Compute embedding via `embed(doc.content)`.
    - Delete any existing row with the same `id`.
    - Insert new row with all fields plus the embedding vector.
  - Implement `search(query: string, topK: number): Promise<MemoryDocument[]>`:
    - Compute embedding via `embed(query)`.
    - Call `table.search(embedding).limit(topK).metric('cosine').execute()`.
    - Map results back to `MemoryDocument[]`, deserializing `tags` and `metadata` from JSON.
  - Implement `delete(id: string): Promise<void>`:
    - Call `table.delete(`id = '${id}'`)`.
- [ ] Add `packages/memory/src/long-term/index.ts` re-exporting `LanceDbLongTermMemory` and `embed`.
- [ ] Update `packages/memory/src/index.ts` to re-export from `./long-term`.
- [ ] Add `vectordb` (LanceDB npm package) and `@google/generative-ai` (or existing project AI SDK) to `packages/memory/package.json` dependencies.

## 3. Code Review
- [ ] Verify the LanceDB connection is not re-opened on every call (connection is cached as an instance field).
- [ ] Verify `upsert` always deletes before inserting to guarantee idempotency.
- [ ] Confirm `embed` is called exactly once per `upsert` and once per `search` call (not multiple times).
- [ ] Verify that no raw document `id` values are string-interpolated into LanceDB filter expressions without sanitization (or use parameterized filters if supported by the LanceDB version in use).
- [ ] Confirm the class is annotated with `implements ILongTermMemory`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=long-term-memory`
- [ ] Confirm all tests pass (green).
- [ ] Run `npm run build --workspace=packages/memory` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/memory/src/memory.agent.md` to add a "Long-Term Memory" section describing:
  - `LanceDbLongTermMemory` as the concrete implementation.
  - Storage path convention: `.devs/memory.lancedb`.
  - Embedding model: `text-embedding-004`, 768 dimensions.
  - Indexing strategy: IVF-PQ (256 partitions, 96 sub-vectors).
  - Cosine similarity search and the `topK` parameter.
  - Idempotency guarantee of `upsert`.

## 6. Automated Verification
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=long-term-memory --reporter=json` and assert `numFailedTests` is `0`.
- [ ] Run `npm run build --workspace=packages/memory 2>&1 | grep -c "error TS"` and assert output is `0`.
