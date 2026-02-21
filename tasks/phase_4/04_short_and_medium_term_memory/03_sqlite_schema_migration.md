# Task: Design and Migrate SQLite Schema for Medium-Term Memory (Sub-Epic: 04_Short_and_Medium_Term_Memory)

## Covered Requirements
- [TAS-017]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/sqlite_schema.test.ts`, write integration tests using an in-memory SQLite database (`better-sqlite3` with `:memory:`) that verify:
  - **Migration runs cleanly**: Calling `runMigrations(db)` on a fresh database creates all required tables without throwing.
  - **Idempotency**: Calling `runMigrations(db)` twice on the same database does not throw and does not duplicate tables or data.
  - **`agent_task_logs` schema**: The table exists and has columns: `id TEXT PRIMARY KEY`, `epic_id TEXT NOT NULL`, `task_id TEXT NOT NULL`, `timestamp INTEGER NOT NULL`, `summary TEXT NOT NULL`, `outcome TEXT NOT NULL CHECK(outcome IN ('success','failure','skipped'))`, `token_cost INTEGER NOT NULL`.
  - **`strategy_failures` schema**: The table exists and has columns: `id TEXT PRIMARY KEY`, `epic_id TEXT NOT NULL`, `task_id TEXT NOT NULL`, `timestamp INTEGER NOT NULL`, `strategy TEXT NOT NULL`, `reason TEXT NOT NULL`.
  - **`epic_overrides` schema**: The table exists and has columns: `id TEXT PRIMARY KEY`, `epic_id TEXT NOT NULL`, `key TEXT NOT NULL`, `value TEXT NOT NULL`, `timestamp INTEGER NOT NULL`.
  - **Indexes exist**: Queries on `epic_id` column in both `agent_task_logs` and `strategy_failures` use an index (verify via `EXPLAIN QUERY PLAN`).
  - **Foreign key pragma**: `PRAGMA foreign_keys = ON` is set and respected.
- [ ] Tests must fail before the migration files are created.

## 2. Task Implementation
- [ ] Install `better-sqlite3` and `@types/better-sqlite3` as dependencies in `packages/memory/package.json`.
- [ ] Create `packages/memory/src/db/migrations/001_initial_schema.sql`:
  ```sql
  PRAGMA journal_mode=WAL;
  PRAGMA foreign_keys=ON;

  CREATE TABLE IF NOT EXISTS agent_task_logs (
    id          TEXT    PRIMARY KEY,
    epic_id     TEXT    NOT NULL,
    task_id     TEXT    NOT NULL,
    timestamp   INTEGER NOT NULL,
    summary     TEXT    NOT NULL,
    outcome     TEXT    NOT NULL CHECK(outcome IN ('success','failure','skipped')),
    token_cost  INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_task_logs_epic ON agent_task_logs(epic_id);
  CREATE INDEX IF NOT EXISTS idx_task_logs_timestamp ON agent_task_logs(timestamp);

  CREATE TABLE IF NOT EXISTS strategy_failures (
    id        TEXT    PRIMARY KEY,
    epic_id   TEXT    NOT NULL,
    task_id   TEXT    NOT NULL,
    timestamp INTEGER NOT NULL,
    strategy  TEXT    NOT NULL,
    reason    TEXT    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_failures_epic ON strategy_failures(epic_id);

  CREATE TABLE IF NOT EXISTS epic_overrides (
    id        TEXT    PRIMARY KEY,
    epic_id   TEXT    NOT NULL,
    key       TEXT    NOT NULL,
    value     TEXT    NOT NULL,
    timestamp INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_overrides_epic ON epic_overrides(epic_id);

  CREATE TABLE IF NOT EXISTS schema_migrations (
    version   TEXT    PRIMARY KEY,
    applied_at INTEGER NOT NULL
  );
  ```
- [ ] Create `packages/memory/src/db/migrate.ts` that:
  - Accepts a `Database` instance from `better-sqlite3`.
  - Reads migration files from `./migrations/` in lexicographic order.
  - Checks `schema_migrations` to skip already-applied migrations.
  - Executes each migration within a transaction and records it in `schema_migrations`.
  - Exports a single function: `runMigrations(db: Database): void`.
- [ ] Create `packages/memory/src/db/connection.ts` that:
  - Exports `openDatabase(dbPath: string): Database` which opens a `better-sqlite3` connection with WAL mode and foreign keys enabled.
  - The default path is `process.env.DEVS_SQLITE_PATH ?? '.devs/agent_memory.db'`.
- [ ] Export `runMigrations` and `openDatabase` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify that all SQL uses `IF NOT EXISTS` guards so migrations are idempotent.
- [ ] Verify that `runMigrations` wraps each migration in `db.transaction(...)` so failures are atomic.
- [ ] Verify that the `schema_migrations` table is used to track applied versions and that re-running does not re-apply old migrations.
- [ ] Verify that `openDatabase` sets both `PRAGMA journal_mode=WAL` and `PRAGMA foreign_keys=ON` immediately after connection.
- [ ] Verify there are no raw string interpolations in any SQL that could enable SQL injection.
- [ ] Confirm `better-sqlite3` is used (synchronous) rather than `sqlite3` (async callback-based), consistent with TAS-017's requirement for a simple, synchronous relational log store.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test sqlite_schema` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/db/db.agent.md` documenting:
  - The schema design rationale for each table.
  - The migration system (how to add future migrations: create `002_*.sql` in the migrations directory).
  - The environment variable `DEVS_SQLITE_PATH` for overriding the database path.
  - The WAL mode choice and why it's appropriate for concurrent agent access.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test sqlite_schema --reporter=json > /tmp/sqlite_schema_results.json`.
- [ ] Assert: `node -e "const r = require('/tmp/sqlite_schema_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` exits with `0`.
- [ ] Manually inspect the output of `PRAGMA table_info(agent_task_logs)` in a test to confirm all 7 columns exist.
