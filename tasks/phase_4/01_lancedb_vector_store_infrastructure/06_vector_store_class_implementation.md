# Task: Implement VectorStore Class with Add, Search, and Delete Operations (Sub-Epic: 01_LanceDB_Vector_Store_Infrastructure)

## Covered Requirements
- [TAS-011], [TAS-091], [TAS-092], [TAS-093], [2_TAS-REQ-015]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/__tests__/vector-store.test.ts`.
- [ ] Write a `beforeEach` hook that instantiates `VectorStore` with a temporary LanceDB path (using `os.tmpdir()`) and an `afterEach` hook that closes the connection and deletes the temp directory.
- [ ] **`add` tests:**
  - Write a test asserting `vectorStore.add(entry)` succeeds when given a valid `MemoryEntry` (with a 768-dim `Float32Array` vector).
  - Write a test asserting `vectorStore.add(entry)` throws if `entry.vector.length !== 768`.
  - Write a test asserting `vectorStore.add(entry)` throws if `entry.type` is not one of the four valid enum values.
  - Write a test asserting `vectorStore.add(entry)` assigns a UUID `id` automatically if none is provided.
- [ ] **`search` tests:**
  - Write a test that adds 3 records and calls `vectorStore.search(queryVector, { limit: 2 })` and asserts exactly 2 results are returned.
  - Write a test asserting the results are ordered by cosine similarity (highest score first) — insert one record with a vector identical to the query and assert it is the top result.
  - Write a test asserting `vectorStore.search` accepts an optional `filter` parameter (e.g., `{ type: 'ARCHITECTURAL_DECISION' }`) and returns only records matching that type.
  - Write a test asserting `vectorStore.search` returns an empty array (not an error) when the table is empty.
- [ ] **`delete` tests:**
  - Write a test asserting `vectorStore.delete(id)` removes a record by UUID and a subsequent search no longer returns it.
  - Write a test asserting `vectorStore.delete(id)` does not throw when the `id` does not exist.
- [ ] Confirm all tests **fail** (Red Phase) before implementation.

## 2. Task Implementation

- [ ] Create `packages/memory/src/store/VectorStore.ts`:
  ```typescript
  import * as lancedb from '@lancedb/lancedb';
  import { v4 as uuidv4 } from 'uuid';
  import { connectToVectorStore } from '../db/connection.js';
  import { createMemoryTable, MEMORY_TABLE_NAME } from '../db/table.js';
  import { buildVectorIndex } from '../db/index.js';
  import {
    MemoryEntry,
    MemoryEntryType,
    MemoryMetadata,
    VECTOR_DIMENSIONS,
  } from '../schema/memory-schema.js';

  const VALID_TYPES: MemoryEntryType[] = [
    'ARCHITECTURAL_DECISION',
    'USER_PREFERENCE',
    'REQ_CONTEXT',
    'LESSON_LEARNED',
  ];

  export interface SearchOptions {
    limit?: number;
    filter?: Partial<Pick<MemoryEntry, 'type'>>;
  }

  export interface SearchResult extends MemoryEntry {
    _distance: number; // cosine distance (lower = more similar)
  }

  export class VectorStore {
    private connection!: lancedb.Connection;
    private table!: lancedb.Table;
    private readonly dbPath: string;

    constructor(dbPath: string) {
      this.dbPath = dbPath;
    }

    async initialize(): Promise<void> {
      this.connection = await connectToVectorStore(this.dbPath);
      this.table = await createMemoryTable(this.connection);
    }

    async add(entry: Omit<MemoryEntry, 'id'> & { id?: string }): Promise<string> {
      if (entry.vector.length !== VECTOR_DIMENSIONS) {
        throw new Error(
          `Vector must have ${VECTOR_DIMENSIONS} dimensions, got ${entry.vector.length}.`
        );
      }
      if (!VALID_TYPES.includes(entry.type)) {
        throw new Error(
          `Invalid entry type "${entry.type}". Must be one of: ${VALID_TYPES.join(', ')}.`
        );
      }
      const id = entry.id ?? uuidv4();
      const record: MemoryEntry = { ...entry, id };
      await this.table.add([record]);
      return id;
    }

    async search(
      queryVector: Float32Array,
      options: SearchOptions = {}
    ): Promise<SearchResult[]> {
      const { limit = 10, filter } = options;
      let query = this.table.vectorSearch(queryVector).limit(limit).distanceType('cosine');
      if (filter?.type) {
        query = query.where(`type = '${filter.type}'`);
      }
      const results = await query.toArray();
      return results as SearchResult[];
    }

    async delete(id: string): Promise<void> {
      await this.table.delete(`id = '${id}'`);
    }

    async triggerIndex(): Promise<void> {
      await buildVectorIndex(this.table);
    }

    async close(): Promise<void> {
      await this.connection.close?.();
    }
  }
  ```
- [ ] Export `VectorStore`, `SearchOptions`, and `SearchResult` from `packages/memory/src/index.ts`.
- [ ] Create a convenience factory function `createVectorStore(dbPath: string): Promise<VectorStore>` that constructs and initializes a `VectorStore` in one call, and export it from `index.ts`.

## 3. Code Review

- [ ] Verify `search` uses cosine distance (`distanceType('cosine')`) as required by the TAS spec.
- [ ] Verify `add` validates both vector dimension and entry type before inserting — never allow malformed data into the store.
- [ ] Verify `delete` uses a parameterized-style filter (`id = '${id}'`) — confirm LanceDB's filter syntax is SQL-like and the `id` value won't cause SQL injection (UUIDs are alphanumeric-safe with hyphens; add an assertion that `id` matches the UUID regex before use).
- [ ] Verify `VectorStore` is a class (not a module-level singleton) so multiple stores can be opened simultaneously (e.g., different project directories).
- [ ] Verify `close()` is called in all test teardown hooks to prevent file descriptor leaks.
- [ ] Confirm `createVectorStore` is the preferred API for external callers, hiding the two-step `new` + `initialize` pattern.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` — all tests in `vector-store.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/memory build` — zero TypeScript errors.
- [ ] Run the full test suite: `pnpm --filter @devs/memory test` — all test files (`package-setup`, `db-init`, `schema`, `embedding`, `indexing`, `vector-store`) must pass together.

## 5. Update Documentation

- [ ] Add a `## VectorStore API` section to `packages/memory/README.md` with full JSDoc-style documentation of `VectorStore` class methods: `add`, `search`, `delete`, `triggerIndex`, `close`.
- [ ] Add a usage example to `packages/memory/README.md`:
  ```typescript
  import { createVectorStore, embedText } from '@devs/memory';

  const store = await createVectorStore('.devs/memory.lancedb');
  const vector = await embedText('Use functional programming patterns.');
  const id = await store.add({
    vector,
    content: 'Use functional programming patterns.',
    type: 'ARCHITECTURAL_DECISION',
    metadata: JSON.stringify({ epic_id: 'phase_4', relevance_score: 0.95 }),
    timestamp: Math.floor(Date.now() / 1000),
  });
  const results = await store.search(vector, { limit: 5, filter: { type: 'ARCHITECTURAL_DECISION' } });
  ```
- [ ] Document in agent memory: "`VectorStore` is the primary interface for all LanceDB operations in `@devs/memory`. Use `createVectorStore(path)` to instantiate. Call `triggerIndex()` after bulk inserts. Always call `close()` when done. Search uses cosine distance."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/vector-store-test-results.json` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/memory build` and assert `packages/memory/dist/store/VectorStore.js` exists.
- [ ] Assert the full `@devs/memory` public API exports are present by running:
  ```bash
  node -e "
  import('@devs/memory').then(m => {
    const required = ['connectToVectorStore','getDefaultVectorStorePath','createMemoryTable','embedText','buildVectorIndex','getIndexConfig','VectorStore','createVectorStore'];
    required.forEach(fn => { if (!m[fn]) throw new Error('Missing export: ' + fn); });
    console.log('All exports present');
  });
  "
  ```
  Assert exit code `0` and output contains `"All exports present"`.
