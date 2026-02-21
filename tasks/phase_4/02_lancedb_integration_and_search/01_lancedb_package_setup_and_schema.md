# Task: LanceDB Package Setup and Vector Schema Definition (Sub-Epic: 02_LanceDB_Integration_and_Search)

## Covered Requirements
- [9_ROADMAP-TAS-104], [2_TAS-REQ-027]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/vector/__tests__/schema.test.ts`.
- [ ] Write a unit test that imports `MemoryRecord` (the LanceDB schema type) and asserts all required fields are present: `id` (string/UUID), `content` (string), `embedding` (Float32Array of length 768), `source` (string enum: `'prd' | 'tas' | 'decision' | 'task_outcome' | 'rca'`), `project_id` (string), `phase` (number), `task_id` (string or null), `created_at` (ISO timestamp string), `metadata` (JSON string).
- [ ] Write a unit test that attempts to open a LanceDB connection at a temp path and verifies the returned object is non-null (smoke test for the installed package).
- [ ] Write a test asserting that the IVF-PQ index config object exported from the schema module contains `num_partitions: 256` and `num_sub_vectors: 96` (appropriate for 768-dimensional embeddings).
- [ ] All tests must fail initially (red phase).

## 2. Task Implementation

- [ ] In `packages/memory/package.json`, add `@lancedb/lancedb` (latest stable) and `apache-arrow` as dependencies. Run `pnpm install` from the repo root.
- [ ] Create `packages/memory/src/vector/schema.ts`:
  - Export a TypeScript interface `MemoryRecord` with the fields defined in the test.
  - Export an Arrow schema object (`MEMORY_ARROW_SCHEMA`) using `apache-arrow` that maps each field to the correct Arrow data type (`Utf8`, `Float32`, `FixedSizeList<Float32>(768)`, etc.).
  - Export an `IVF_PQ_INDEX_CONFIG` constant with `{ type: 'ivf_pq', num_partitions: 256, num_sub_vectors: 96 }`.
- [ ] Create `packages/memory/src/vector/db.ts`:
  - Export an `async function openVectorDb(basePath: string): Promise<lancedb.Connection>` that opens (or creates) a LanceDB database at `path.join(basePath, 'memory.lancedb')`.
  - The function must be idempotent — calling it twice with the same path returns a valid connection without error.
- [ ] Create `packages/memory/src/vector/index.ts` that re-exports everything from `schema.ts` and `db.ts`.
- [ ] The default `basePath` used elsewhere in the codebase must resolve to `.devs/` relative to the active project root (passed in at runtime, not hardcoded).

## 3. Code Review

- [ ] Verify `memory.lancedb` is never written inside the `packages/` monorepo directory; it must always target a runtime project path.
- [ ] Confirm `MEMORY_ARROW_SCHEMA` uses `FixedSizeList` of exactly 768 floats to match `text-embedding-004` output dimensions.
- [ ] Confirm no `console.log` or debug output is left in production code paths.
- [ ] Confirm `openVectorDb` handles the case where the `.devs/` directory does not yet exist (it should create it with `fs.mkdirSync(..., { recursive: true })`).
- [ ] Confirm all exports are typed — no `any` types.

## 4. Run Automated Tests to Verify

- [ ] From the repo root, run: `pnpm --filter @devs/memory test -- --testPathPattern=schema`
- [ ] All tests in `schema.test.ts` must pass (green phase).
- [ ] Run `pnpm --filter @devs/memory build` to ensure TypeScript compilation succeeds with zero errors.

## 5. Update Documentation

- [ ] Create `packages/memory/src/vector/vector.agent.md` documenting: the purpose of the LanceDB integration, the `MemoryRecord` schema fields and their semantics, the IVF-PQ index configuration rationale, and the `openVectorDb` API signature.
- [ ] Append a `## LanceDB Schema` section to `packages/memory/README.md` referencing the schema file and storage path convention.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --coverage -- --testPathPattern=schema` and confirm 100% statement coverage on `schema.ts` and `db.ts`.
- [ ] Run `pnpm --filter @devs/memory build` and assert exit code is `0`.
- [ ] Assert that `packages/memory/package.json` contains `@lancedb/lancedb` in `dependencies` (not `devDependencies`).
