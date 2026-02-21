# Task: Implement Trusted/Untrusted Partition Separation in Vector Memory (Sub-Epic: 16_Vector_Memory_Security_and_Integrity)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-061]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/vector-partitions.test.ts`.
- [ ] Write a unit test `VectorStore_writesToTrustedPartitionByDefault` that:
  - Instantiates `VectorStore` without specifying a partition.
  - Calls `VectorStore.add(record)` and asserts the internal LanceDB table name used is `"trusted"` (or the configured `TRUSTED_TABLE` constant).
- [ ] Write a unit test `VectorStore_writesToUntrustedPartitionForResearch` that:
  - Calls `VectorStore.add(record, { partition: 'untrusted' })`.
  - Asserts the internal LanceDB table name used is `"untrusted"` (or the configured `UNTRUSTED_TABLE` constant).
- [ ] Write a unit test `VectorStore_searchDefaultsToTrustedOnly` that:
  - Stubs both `trusted` and `untrusted` LanceDB tables.
  - Calls `VectorStore.search(query)` without a partition option.
  - Asserts only the `trusted` table's `search()` was called; the `untrusted` table's `search()` was NOT called.
- [ ] Write a unit test `VectorStore_searchCanIncludeUntrustedWhenExplicit` that:
  - Calls `VectorStore.search(query, { partitions: ['trusted', 'untrusted'] })`.
  - Asserts both tables' `search()` methods were called, and results are merged and sorted by score.
- [ ] Write a unit test `VectorStore_cannotPromoteUntrustedToTrustedDirectly` that:
  - Calls `VectorStore.promoteToTrusted(recordId)` for a record that does NOT exist in the `trusted` table.
  - Asserts it throws `RecordNotVerifiedError`.
- [ ] Write a unit test `PartitionRouter_routesResearchDocsToUntrusted` that:
  - Creates a `PartitionRouter` configured with source type `'research'`.
  - Asserts `router.resolve()` returns `'untrusted'`.
- [ ] Write a unit test `PartitionRouter_routesVerifiedDecisionsToTrusted` that:
  - Creates a `PartitionRouter` configured with source type `'architectural_decision'` and status `'verified'`.
  - Asserts `router.resolve()` returns `'trusted'`.
- [ ] Write an integration test `VectorStore_integration_partitionIsolation` that:
  - Inserts one record into each partition in a temp LanceDB instance.
  - Searches with default options and asserts only the trusted record is returned.
  - Searches with `{ partitions: ['untrusted'] }` and asserts only the untrusted record is returned.

## 2. Task Implementation
- [ ] Define partition constants in `packages/memory/src/partitions.ts`:
  ```ts
  export const TRUSTED_PARTITION = 'trusted' as const;
  export const UNTRUSTED_PARTITION = 'untrusted' as const;
  export type Partition = typeof TRUSTED_PARTITION | typeof UNTRUSTED_PARTITION;
  ```
- [ ] Create `packages/memory/src/partition-router.ts` exporting `class PartitionRouter`:
  - Constructor accepts `{ sourceType: MemorySourceType; status?: string }`.
  - `resolve(): Partition` returns `UNTRUSTED_PARTITION` for `sourceType === 'research'` regardless of status.
  - Returns `TRUSTED_PARTITION` only for `sourceType` values in `['task_outcome', 'architectural_decision', 'lesson_learned']` AND `status === 'verified'` or `status === 'approved'`.
  - Defaults to `UNTRUSTED_PARTITION` for any unrecognized combination.
- [ ] Modify `packages/memory/src/vector-store.ts`:
  - On initialization, open (or create) two named LanceDB tables: `trusted` and `untrusted`, both using the same schema from `schema.ts`.
  - Update `add(record, opts?)`:
    - Accept optional `opts?: { partition?: Partition }`.
    - Default partition to `TRUSTED_PARTITION`.
    - Write to the LanceDB table matching the resolved partition.
  - Update `search(query, opts?)`:
    - Accept optional `opts?: { partitions?: Partition[] }`.
    - Default `partitions` to `[TRUSTED_PARTITION]`.
    - Fan out search to each requested partition table, collect results, merge and re-rank by cosine similarity score, return unified array.
  - Add `promoteToTrusted(recordId: string): Promise<void>`:
    - Reads the record from `untrusted` by id.
    - Throws `RecordNotVerifiedError` if not found.
    - Writes it to the `trusted` table.
    - Deletes it from the `untrusted` table.
- [ ] Create `packages/memory/src/errors.ts` (or extend existing) with `export class RecordNotVerifiedError extends Error {}`.
- [ ] Update `.devs/memory.lancedb` path documentation: note that the database now contains two tables (`trusted`, `untrusted`) within a single LanceDB database file.
- [ ] Expose `promoteToTrusted` as an MCP tool `memory_promote_to_trusted` in `packages/mcp-server/src/tools/memory.ts` with input schema `{ recordId: string }`.

## 3. Code Review
- [ ] Verify that `search()` with no explicit partitions option NEVER touches the `untrusted` table — confirm via test spy or by reading the implementation.
- [ ] Verify that `PartitionRouter` has no path that routes research data to the `trusted` partition.
- [ ] Verify that `promoteToTrusted` is atomic: the delete from `untrusted` only happens after a successful write to `trusted` (use try/catch to rollback the `trusted` write if delete fails, or document the known risk).
- [ ] Verify that the merge/re-rank in multi-partition search preserves the original score metadata so callers can inspect which partition a result came from (add a `partition` field to the result type).
- [ ] Verify `PartitionRouter` unit tests cover all branch paths (research → untrusted, verified decision → trusted, default → untrusted).
- [ ] Verify there are no hardcoded table name strings outside `partitions.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="vector-partitions"` and confirm all new tests pass.
- [ ] Run `pnpm --filter @devs/memory test` for the full memory suite and confirm no regressions.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="memory"` to confirm the MCP tool tests pass.
- [ ] Run the partition isolation integration test: `pnpm --filter @devs/memory test:integration -- --testPathPattern="partitionIsolation"`.

## 5. Update Documentation
- [ ] Create/update `docs/memory/partitions.md` describing:
  - The two-partition model (trusted vs. untrusted).
  - The `PartitionRouter` decision logic table.
  - How to use `memory_promote_to_trusted` MCP tool to graduate a research finding.
  - Warning: agents MUST NOT read from the `untrusted` partition during task execution without explicit opt-in.
- [ ] Update `packages/memory/README.md` with a "Partitions" section summarizing the design.
- [ ] Update agent memory (`docs/agent-memory/phase_4_decisions.md`) with: "Research data is stored in the `untrusted` LanceDB partition. Only records with status `verified` or `approved` are written to or promoted into the `trusted` partition. Default `VectorStore.search()` queries only the `trusted` partition."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm threshold is met.
- [ ] Execute `scripts/verify_vector_partitions.sh` which:
  1. Inserts a research record (`sourceType: 'research'`) via `VectorStore.add()`.
  2. Runs a default `VectorStore.search()` and asserts the research record is NOT in the results.
  3. Calls `memory_promote_to_trusted` MCP tool on the research record and asserts it throws (since status is not `verified`).
  4. Updates the record's status to `verified` in `untrusted`, calls `promoteToTrusted`, then re-runs the default search and asserts the record IS now returned.
  5. Exits 0 on success, non-zero on failure.
- [ ] Confirm CI pipeline step `test:memory` exits 0.
