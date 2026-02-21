# Task: Define and Implement the LanceDB Vector Table Schema (Sub-Epic: 01_LanceDB_Vector_Store_Infrastructure)

## Covered Requirements
- [TAS-093], [TAS-091], [2_TAS-REQ-015]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/__tests__/schema.test.ts`.
- [ ] Write a test that calls `createMemoryTable(connection)` and asserts the returned LanceDB `Table` object is non-null.
- [ ] Write a test that opens the table and inserts one record with all required fields:
  - `id`: a valid UUID string
  - `vector`: a `Float32Array` of exactly 768 elements (all zeros are acceptable for schema validation)
  - `content`: a non-empty string
  - `type`: one of `"ARCHITECTURAL_DECISION" | "USER_PREFERENCE" | "REQ_CONTEXT" | "LESSON_LEARNED"`
  - `metadata`: a valid JSON string (serialized object)
  - `timestamp`: a Unix epoch integer
- [ ] Write a test asserting insertion fails (or the schema type asserts fail at compile time) when `vector` has a length other than 768.
- [ ] Write a test asserting that calling `createMemoryTable` on a connection where the table already exists does **not** throw (idempotent creation using `existsOk: true` or equivalent LanceDB option).
- [ ] Write a test that reads back the inserted record by `id` and asserts all fields are preserved correctly (including the JSON `metadata` field deserialization).
- [ ] Confirm all tests **fail** (Red Phase) before implementation.

## 2. Task Implementation

- [ ] Create `packages/memory/src/schema/memory-schema.ts` defining the TypeScript types and schema:
  ```typescript
  export const VECTOR_DIMENSIONS = 768;

  export type MemoryEntryType =
    | 'ARCHITECTURAL_DECISION'
    | 'USER_PREFERENCE'
    | 'REQ_CONTEXT'
    | 'LESSON_LEARNED';

  export interface MemoryEntry {
    id: string;           // UUID v4
    vector: Float32Array; // text-embedding-004 output, 768 dims
    content: string;      // Raw text of the requirement, decision, or directive
    type: MemoryEntryType;
    metadata: string;     // JSON-serialized: { epic_id?, task_id?, relevance_score? }
    timestamp: number;    // Unix epoch (seconds)
  }

  export interface MemoryMetadata {
    epic_id?: string;
    task_id?: string;
    relevance_score?: number;
    [key: string]: unknown;
  }
  ```
- [ ] Create `packages/memory/src/db/table.ts` with the table creation logic:
  ```typescript
  import * as lancedb from '@lancedb/lancedb';
  import { VECTOR_DIMENSIONS } from '../schema/memory-schema.js';

  export const MEMORY_TABLE_NAME = 'memory';

  /**
   * Creates (or opens) the 'memory' table in LanceDB with the canonical schema.
   * Idempotent: safe to call if the table already exists.
   */
  export async function createMemoryTable(
    connection: lancedb.Connection
  ): Promise<lancedb.Table> {
    const tableNames = await connection.tableNames();
    if (tableNames.includes(MEMORY_TABLE_NAME)) {
      return await connection.openTable(MEMORY_TABLE_NAME);
    }
    // Create table with a single seed record to establish the schema,
    // then delete the seed record.
    const seedVector = new Float32Array(VECTOR_DIMENSIONS).fill(0);
    const table = await connection.createTable(MEMORY_TABLE_NAME, [
      {
        id: '00000000-0000-0000-0000-000000000000',
        vector: seedVector,
        content: '__schema_seed__',
        type: 'REQ_CONTEXT',
        metadata: '{}',
        timestamp: 0,
      },
    ]);
    await table.delete(`content = '__schema_seed__'`);
    return table;
  }
  ```
- [ ] Export `createMemoryTable`, `MEMORY_TABLE_NAME`, `VECTOR_DIMENSIONS`, `MemoryEntry`, `MemoryEntryType`, and `MemoryMetadata` from `packages/memory/src/index.ts`.

## 3. Code Review

- [ ] Verify `VECTOR_DIMENSIONS = 768` is a named constant — never use the magic number `768` directly in table or embedding code.
- [ ] Verify the schema seed approach correctly creates a typed table and the seed row is deleted, leaving an empty-but-typed table.
- [ ] Confirm `metadata` is stored as a `string` (JSON-serialized) rather than a raw `object`, because LanceDB's Arrow schema requires a flat type; deserialization is the caller's responsibility.
- [ ] Verify `createMemoryTable` is idempotent — calling it multiple times on the same connection must not throw or create duplicate tables.
- [ ] Confirm the `MemoryEntryType` union covers all four required values from the TAS spec: `ARCHITECTURAL_DECISION`, `USER_PREFERENCE`, `REQ_CONTEXT`, `LESSON_LEARNED`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` — all tests in `schema.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/memory build` — TypeScript compilation must succeed with zero errors.

## 5. Update Documentation

- [ ] Add a `## Schema` section to `packages/memory/README.md` with a table documenting all six fields (`id`, `vector`, `content`, `type`, `metadata`, `timestamp`) with their types and descriptions, matching the TAS-093 spec exactly.
- [ ] Document in agent memory: "The `memory` table schema is defined in `packages/memory/src/schema/memory-schema.ts`. `VECTOR_DIMENSIONS = 768`. `metadata` is always a JSON string. The `type` field is one of four enum values."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/schema-test-results.json` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/memory build` and assert exit code `0`.
- [ ] Assert `grep -r "VECTOR_DIMENSIONS" packages/memory/src` shows at least 2 usages (definition + usage), confirming no magic numbers are present.
