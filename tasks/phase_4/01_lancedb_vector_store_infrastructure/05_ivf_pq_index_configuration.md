# Task: Configure IVF-PQ Index on LanceDB Vector Column (Sub-Epic: 01_LanceDB_Vector_Store_Infrastructure)

## Covered Requirements
- [TAS-092], [TAS-093]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/__tests__/indexing.test.ts`.
- [ ] Write a test that calls `buildVectorIndex(table)` on a LanceDB table pre-populated with at least 256 seed records (minimum required by LanceDB for IVF-PQ), and asserts the function completes without throwing.
- [ ] Write a test asserting that after `buildVectorIndex(table)` is called, a subsequent vector search (using a zero-vector query) returns results in under 500ms (performance regression guard).
- [ ] Write a test asserting `buildVectorIndex` is a no-op (does not throw, returns gracefully) when the table has fewer than 256 rows, with a warning log emitted instead.
- [ ] Write a test asserting `getIndexConfig()` returns an object containing `{ type: "ivf_pq", num_partitions: 256, num_sub_vectors: 96 }` (or the values configured for 768-dim vectors — verify the LanceDB docs for optimal defaults).
- [ ] Confirm all tests **fail** (Red Phase) before implementation.

## 2. Task Implementation

- [ ] Create `packages/memory/src/db/index.ts` with the indexing configuration and creation logic:
  ```typescript
  import * as lancedb from '@lancedb/lancedb';

  // IVF-PQ parameters tuned for 768-dimensional text-embedding-004 vectors.
  // num_partitions: sqrt(N) where N is expected dataset size (~256 for initial).
  // num_sub_vectors: must divide evenly into 768. 96 = 768/8.
  const IVF_PQ_CONFIG = {
    type: 'ivf_pq' as const,
    num_partitions: 256,
    num_sub_vectors: 96,
  } as const;

  const MIN_ROWS_FOR_INDEX = 256;

  export function getIndexConfig() {
    return IVF_PQ_CONFIG;
  }

  /**
   * Builds an IVF-PQ vector index on the 'vector' column of the given table.
   * Requires at least 256 rows. Skips silently if insufficient data.
   */
  export async function buildVectorIndex(table: lancedb.Table): Promise<void> {
    const rowCount = await table.countRows();
    if (rowCount < MIN_ROWS_FOR_INDEX) {
      console.warn(
        `[VectorIndex] Skipping IVF-PQ index creation: table has ${rowCount} rows, ` +
        `minimum required is ${MIN_ROWS_FOR_INDEX}.`
      );
      return;
    }
    await table.createIndex('vector', {
      config: lancedb.Index.ivfPq({
        numPartitions: IVF_PQ_CONFIG.num_partitions,
        numSubVectors: IVF_PQ_CONFIG.num_sub_vectors,
      }),
    });
  }
  ```
- [ ] Export `buildVectorIndex` and `getIndexConfig` from `packages/memory/src/index.ts`.
- [ ] In `createMemoryTable` (from Task 03), after table creation, call `buildVectorIndex(table)` only when the table has enough rows — defer index building to after bulk inserts rather than on empty table creation.

## 3. Code Review

- [ ] Verify `num_sub_vectors: 96` correctly divides `768 / 8 = 96` — this must be validated against the LanceDB documentation for the chosen quantization strategy.
- [ ] Verify `num_partitions: 256` is appropriate for the expected dataset size (typical rule: `sqrt(N)` where N is expected row count at indexing time). Document the assumed N in a comment.
- [ ] Confirm the function does **not** throw when the table is empty or has too few rows — it must degrade gracefully.
- [ ] Confirm index building is deferred until after bulk inserts (not triggered on every single `add` call) to prevent excessive CPU usage during parallel task implementation ([8_RISKS-REQ-037] throttling concern).
- [ ] Verify no blocking operations are called synchronously — all LanceDB operations use `await`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` — all tests in `indexing.test.ts` must pass.
- [ ] Run `pnpm --filter @devs/memory build` — zero TypeScript errors.

## 5. Update Documentation

- [ ] Add an `## Indexing Strategy` section to `packages/memory/README.md` documenting:
  - Index type: IVF-PQ
  - `num_partitions: 256`
  - `num_sub_vectors: 96`
  - Minimum row requirement: 256
  - Why deferred indexing is used (CPU throttling)
- [ ] Document in agent memory: "IVF-PQ index is built via `buildVectorIndex(table)` in `@devs/memory`. It requires ≥256 rows and must be called after bulk inserts, not on every write. Config: `num_partitions=256`, `num_sub_vectors=96` for 768-dim vectors."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/index-test-results.json` and assert exit code `0`.
- [ ] Assert the search performance test passes (< 500ms query latency on indexed table with 256+ rows).
- [ ] Assert `grep -r "ivf_pq\|ivfPq\|IVF_PQ" packages/memory/src` produces results only in `packages/memory/src/db/index.ts` — index configuration must not be scattered across files.
