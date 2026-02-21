# Task: Implement Medium-Term (SQLite) Memory Layer (Sub-Epic: 03_Tiered_Memory_Architecture)

## Covered Requirements
- [TAS-081], [4_USER_FEATURES-REQ-017]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/medium-term-memory.test.ts`.
- [ ] Use an in-memory SQLite database (`:memory:` with `better-sqlite3` or the project's existing SQLite driver) for all tests (no filesystem side-effects).
- [ ] Write integration tests for `SqliteMediumTermMemory` implementing `IMediumTermMemory`:
  - `append` inserts a `MemoryEntry` row and a subsequent `query({})` (no filter) returns it.
  - `query` with a `tags` filter returns only entries whose `tags` column contains ALL specified tags.
  - `query` with `since` / `until` date filters returns only entries within the time window.
  - `query` with `limit: 2` returns at most 2 results ordered by `createdAt DESC`.
  - `prune(date)` deletes all entries older than the given date and returns the count of deleted rows.
  - After `prune`, deleted entries do not appear in subsequent `query` calls.
- [ ] Write a test verifying `SqliteMediumTermMemory` satisfies `IMediumTermMemory` (TypeScript assignability check).
- [ ] All tests must fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `packages/memory/src/medium-term/SqliteMediumTermMemory.ts`:
  - Accept a `db: Database` (better-sqlite3 `Database` type) in the constructor.
  - On construction, run `CREATE TABLE IF NOT EXISTS memory_entries (id TEXT PRIMARY KEY, content TEXT NOT NULL, created_at TEXT NOT NULL, tags TEXT NOT NULL, metadata TEXT)`.
  - `tags` column stores a JSON array string (e.g., `'["epic","decision"]'`).
  - `metadata` column stores a JSON object string or NULL.
  - Implement `append(entry: MemoryEntry): Promise<void>` using a prepared `INSERT OR REPLACE` statement.
  - Implement `query(filter: MemoryFilter): Promise<MemoryEntry[]>`:
    - Build a SQL query dynamically based on provided filter fields.
    - For `tags` filter: use SQLite JSON functions or a JavaScript post-filter after fetching to check each tag is present in the stored JSON array.
    - For `since` / `until`: compare `created_at` ISO string lexicographically.
    - Apply `LIMIT` if provided, ordering by `created_at DESC`.
    - Deserialize `tags` and `metadata` from JSON before returning.
  - Implement `prune(olderThan: Date): Promise<number>`:
    - Delete rows where `created_at < olderThan.toISOString()`.
    - Return the number of deleted rows via `stmt.run(...).changes`.
  - Wrap synchronous better-sqlite3 calls in `Promise.resolve()` to satisfy the async interface.
- [ ] Add `packages/memory/src/medium-term/index.ts` re-exporting `SqliteMediumTermMemory`.
- [ ] Update `packages/memory/src/index.ts` to re-export from `./medium-term`.

## 3. Code Review
- [ ] Verify all SQL statements are prepared once in the constructor (not re-prepared per call) for performance.
- [ ] Verify no SQL injection vectors: all user-supplied values are passed as parameterized query bindings, never string-interpolated.
- [ ] Confirm `query` result deserialization always produces correctly typed `MemoryEntry` objects (dates as `Date` instances, tags as `string[]`).
- [ ] Confirm the class is annotated with `implements IMediumTermMemory`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=medium-term-memory`
- [ ] Confirm all tests pass (green).
- [ ] Run `npm run build --workspace=packages/memory` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/memory/src/memory.agent.md` to add a "Medium-Term Memory" section describing:
  - `SqliteMediumTermMemory` as the concrete implementation.
  - The SQLite table schema (`memory_entries`).
  - Serialization conventions for `tags` (JSON array) and `metadata` (JSON object).
  - The `prune` lifecycle: called at phase/epic boundaries to remove stale entries.

## 6. Automated Verification
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=medium-term-memory --reporter=json` and assert `numFailedTests` is `0`.
- [ ] Run `npm run build --workspace=packages/memory 2>&1 | grep -c "error TS"` and assert output is `0`.
