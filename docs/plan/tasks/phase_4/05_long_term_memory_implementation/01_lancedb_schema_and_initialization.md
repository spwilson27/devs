# Task: LanceDB Schema Definition and Storage Initialization (Sub-Epic: 05_Long_Term_Memory_Implementation)

## Covered Requirements
- [3_MCP-TAS-018], [TAS-057]

## 1. Initial Test Written

- [ ] In `packages/memory/src/__tests__/lancedb-init.test.ts`, write a test suite `describe('LanceDB Initialization')` that:
  - Asserts that calling `initLongTermMemory({ storagePath: '.devs/memory.lancedb' })` creates the LanceDB directory at the specified path if it does not already exist.
  - Asserts that calling `initLongTermMemory` when the directory already exists does NOT throw or corrupt existing data (idempotency test).
  - Asserts that after initialization, the `vector_memories` table exists in the LanceDB instance.
  - Asserts that the `vector_memories` table schema exactly matches the required fields:
    - `id` (string, UUID)
    - `vector` (Float32Array, dimension 768 for text-embedding-004)
    - `content` (string)
    - `type` (string enum: `'ARCHITECTURAL_DECISION' | 'RCA_LESSON' | 'TASK_OUTCOME' | 'USER_DIRECTIVE' | 'RESEARCH_SUMMARY'`)
    - `source_task_id` (string, nullable)
    - `source_epic_id` (string, nullable)
    - `project_id` (string)
    - `created_at` (int64, Unix timestamp milliseconds)
    - `tags` (list of strings)
    - `checksum` (string, SHA-256 of content for integrity validation)
- [ ] Write a test that connects to an existing LanceDB store and reads the schema back, asserting all fields are present with correct types.
- [ ] Write a test that asserts `initLongTermMemory` returns a typed `LanceDBClient` object with a `table` property referencing the `vector_memories` table.

## 2. Task Implementation

- [ ] Create the package `packages/memory` if it does not exist. Ensure `package.json` includes `"name": "@devs/memory"`, `"type": "module"`, and dependencies: `vectordb` (LanceDB Node.js SDK), `uuid`, `crypto` (built-in).
- [ ] Create `packages/memory/src/lancedb/schema.ts` defining the `VectorMemoryRecord` TypeScript interface matching the schema described in the test:
  ```typescript
  export interface VectorMemoryRecord {
    id: string;
    vector: Float32Array;
    content: string;
    type: 'ARCHITECTURAL_DECISION' | 'RCA_LESSON' | 'TASK_OUTCOME' | 'USER_DIRECTIVE' | 'RESEARCH_SUMMARY';
    source_task_id: string | null;
    source_epic_id: string | null;
    project_id: string;
    created_at: number;
    tags: string[];
    checksum: string;
  }
  ```
- [ ] Create `packages/memory/src/lancedb/init.ts` exporting `initLongTermMemory(opts: { storagePath: string }): Promise<LanceDBClient>`:
  - Use `vectordb.connect(opts.storagePath)` to open/create the database.
  - Check if `vector_memories` table exists; if not, create it via `db.createTable('vector_memories', [], { schema: VECTOR_MEMORY_SCHEMA })` using the Apache Arrow schema matching `VectorMemoryRecord` with a fixed dimension of 768 for the Float32 vector field.
  - Return a `LanceDBClient` wrapper object with `.table` property pointing to the opened table.
- [ ] Create `packages/memory/src/lancedb/client.ts` exporting the `LanceDBClient` class with a `.table` getter returning the `Table<VectorMemoryRecord>` instance.
- [ ] Create `packages/memory/src/index.ts` re-exporting `initLongTermMemory`, `LanceDBClient`, and `VectorMemoryRecord`.
- [ ] The default `storagePath` must be `.devs/memory.lancedb` relative to the project root (use `process.cwd()`).

## 3. Code Review

- [ ] Verify that `initLongTermMemory` is strictly idempotent: calling it twice does not throw or duplicate the table.
- [ ] Verify that the Arrow schema dimensions for the `vector` field are hardcoded as 768 (matching `text-embedding-004` output dimension) and this constant is exported as `EMBEDDING_DIMENSION = 768` from `schema.ts`.
- [ ] Verify that `checksum` is computed as `crypto.createHash('sha256').update(content).digest('hex')` and this utility is centralized in `packages/memory/src/utils/checksum.ts`.
- [ ] Verify there are no raw `any` types in TypeScript; all LanceDB table interactions must be typed via `VectorMemoryRecord`.
- [ ] Verify that the storage path is configurable via the `DEVS_MEMORY_PATH` environment variable as a fallback before defaulting.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` and confirm all tests in `lancedb-init.test.ts` pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript compilation errors.
- [ ] Manually verify that running the tests creates the `.devs/memory.lancedb` directory (or its test equivalent) with the correct structure.

## 5. Update Documentation

- [ ] Add a section `## Long-Term Memory (LanceDB)` to `packages/memory/README.md` documenting:
  - The storage path (`.devs/memory.lancedb`).
  - The `VectorMemoryRecord` schema with field descriptions.
  - How to call `initLongTermMemory`.
- [ ] Update `specs/3_mcp_design.md` or the relevant architecture doc to reference the confirmed embedding dimension (768) and the `vector_memories` table name.
- [ ] Add an entry to the agent memory file (e.g., `memory/architecture_decisions.md`) stating: "LanceDB long-term memory initialized at `.devs/memory.lancedb`. Table: `vector_memories`. Embedding dim: 768."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > test-results/memory-init.json` and assert exit code is `0`.
- [ ] Run `node -e "import('@devs/memory').then(m => m.initLongTermMemory({ storagePath: '/tmp/devs-test.lancedb' })).then(() => console.log('PASS')).catch(e => { console.error('FAIL', e); process.exit(1); })"` and confirm `PASS` is printed.
- [ ] Assert that the file `test-results/memory-init.json` reports 0 failed tests using `jq '.testResults[].assertionResults[] | select(.status == "failed")' test-results/memory-init.json | wc -l` equals `0`.
