# Task: SQLite ACID Transaction Wrapper & State Schema (Sub-Epic: 01_Rewind Core Infrastructure)

## Covered Requirements
- [1_PRD-REQ-REL-003], [3_MCP-REQ-REL-003]

## 1. Initial Test Written
- [ ] Write a unit test (`src/state/__tests__/stateSchema.test.ts`) that asserts the `tasks` table schema includes columns: `id TEXT PRIMARY KEY`, `phase_id TEXT NOT NULL`, `task_index INTEGER NOT NULL`, `status TEXT NOT NULL CHECK(status IN ('pending','in_progress','completed','failed'))`, `git_head TEXT`, `started_at TEXT`, `completed_at TEXT`, `created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`.
- [ ] Write a unit test that asserts a `state_transitions` table exists with columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `task_id TEXT NOT NULL REFERENCES tasks(id)`, `from_status TEXT`, `to_status TEXT NOT NULL`, `timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`, `metadata TEXT` (JSON blob).
- [ ] Write an integration test (`src/state/__tests__/acidTransactions.test.ts`) that:
  1. Opens a SQLite connection using `better-sqlite3`.
  2. Begins a transaction and inserts a row into `tasks` and `state_transitions`.
  3. Throws an error mid-transaction.
  4. Asserts neither row was committed (verifying atomicity / rollback behavior).
- [ ] Write an integration test that verifies a `withTransaction<T>(db, fn: () => T): T` helper function commits successfully when `fn` does not throw, and rolls back completely when `fn` throws.
- [ ] Write a test that verifies foreign key enforcement (`PRAGMA foreign_keys = ON`) is active: inserting a `state_transitions` row referencing a non-existent `task_id` must throw a constraint error.

## 2. Task Implementation
- [ ] Create `src/state/schema.ts` that exports a `createSchema(db: Database)` function. This function must run the following SQL statements idempotently using `CREATE TABLE IF NOT EXISTS`:
  - `tasks` table as specified in the tests above.
  - `state_transitions` table as specified in the tests above.
  - Add an index: `CREATE INDEX IF NOT EXISTS idx_state_transitions_task_id ON state_transitions(task_id)`.
- [ ] Create `src/state/db.ts` that exports:
  - `openDatabase(dbPath: string): Database` — opens a `better-sqlite3` connection, runs `PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON`, and calls `createSchema(db)` before returning.
  - `withTransaction<T>(db: Database, fn: () => T): T` — wraps `fn` in `db.transaction(fn)()`, propagating any thrown error after automatic rollback.
- [ ] Ensure `openDatabase` is idempotent: calling it twice on the same path returns a usable connection without schema errors.
- [ ] Add `better-sqlite3` and `@types/better-sqlite3` to `package.json` dependencies.

## 3. Code Review
- [ ] Verify `PRAGMA journal_mode = WAL` is set immediately after opening the connection to prevent write-lock contention.
- [ ] Verify `PRAGMA foreign_keys = ON` is set before any DML to ensure referential integrity across all sessions.
- [ ] Confirm `withTransaction` uses `better-sqlite3`'s native `db.transaction()` (not manual `BEGIN`/`COMMIT` strings) to ensure proper error propagation.
- [ ] Confirm `createSchema` is idempotent (`CREATE TABLE IF NOT EXISTS`, not `CREATE TABLE`).
- [ ] Ensure there are no raw SQL strings outside `schema.ts` — all schema DDL must be centralized.
- [ ] Verify all exported types are strict (no `any`), and the `Database` type is imported from `better-sqlite3`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/(stateSchema|acidTransactions)"` and confirm all tests pass with zero failures.
- [ ] Run `npm run type-check` (or `tsc --noEmit`) and confirm zero TypeScript errors in `src/state/`.

## 5. Update Documentation
- [ ] Create `src/state/state.agent.md` documenting: the purpose of each table, the WAL and foreign-key pragmas, the `withTransaction` contract (commit on success, rollback on throw), and the file path convention for the SQLite database (`<project_root>/.devs/state.db`).
- [ ] Update the project-level `docs/architecture.md` (or create it if absent) to record that all state mutations must go through `withTransaction` and that the schema is owned by `src/state/schema.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/(stateSchema|acidTransactions)" --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm the coverage gate passes.
- [ ] Run `node -e "const {openDatabase}=require('./dist/state/db'); const db=openDatabase('/tmp/test_devs_verify.db'); console.log(db.pragma('journal_mode',{simple:true})); db.close();"` and assert the output is `wal`.
