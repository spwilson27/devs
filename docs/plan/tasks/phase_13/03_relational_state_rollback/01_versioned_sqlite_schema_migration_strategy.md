# Task: Versioned SQLite Schema Migration Strategy (Sub-Epic: 03_Relational State Rollback)

## Covered Requirements
- [3_MCP-RISK-102], [8_RISKS-REQ-115]

## 1. Initial Test Written
- [ ] In `src/state/__tests__/schema-migrations.test.ts`, write unit tests that verify:
  - A `schema_migrations` table is created in `.devs/state.sqlite` on first boot with columns: `id INTEGER PRIMARY KEY`, `version INTEGER NOT NULL UNIQUE`, `description TEXT NOT NULL`, `applied_at TEXT NOT NULL`, `checksum TEXT NOT NULL`.
  - `getCurrentSchemaVersion()` returns `0` on a fresh database and returns the correct integer after migrations are applied.
  - `applyMigration(version, sql, description)` inserts a row into `schema_migrations`, executes the migration SQL inside a single SQLite transaction, and throws if the version already exists.
  - `getMigrationHistory()` returns all rows ordered by `version ASC`.
  - Applying a migration with invalid SQL causes a full rollback — no partial state is written and no row is inserted into `schema_migrations`.
  - Checksum of the migration SQL is stored and verified on startup against the stored checksum; a mismatch throws `SchemaTamperingError`.
- [ ] Write an integration test that spins up a real in-memory SQLite database, applies three sequential migrations, kills the process mid-migration (using a mock that throws mid-execution), and asserts the DB is still at the pre-migration version with no orphan rows.

## 2. Task Implementation
- [ ] Create `src/state/schema-migrations.ts` exporting:
  - `interface Migration { version: number; description: string; sql: string; }` 
  - `class MigrationRunner` constructor accepts a `Database` (better-sqlite3 instance).
  - `ensureMigrationsTable()`: creates the `schema_migrations` table using `CREATE TABLE IF NOT EXISTS`.
  - `getCurrentSchemaVersion(): number`: queries `MAX(version)` from `schema_migrations`; returns `0` if empty.
  - `applyMigration(migration: Migration): void`: wraps `db.prepare(migration.sql).run()` and the `schema_migrations` insert inside `db.transaction(...)()` (better-sqlite3 synchronous transaction API). Computes SHA-256 checksum of `migration.sql` via Node's built-in `crypto.createHash('sha256')`.
  - `runPendingMigrations(migrations: Migration[]): void`: sorts by `version`, filters to those with `version > getCurrentSchemaVersion()`, applies each in order.
  - `validateChecksums(migrations: Migration[]): void`: for each already-applied migration, fetches stored checksum and compares to computed checksum; throws `SchemaTamperingError` if mismatch.
- [ ] Create `src/state/migrations/index.ts` as the canonical ordered array of all `Migration` objects the project will ever define. Start with the baseline schema as `version: 1`.
- [ ] In `src/state/db.ts`, call `migrationRunner.validateChecksums()` then `migrationRunner.runPendingMigrations()` inside the DB initialization path before any other table access.
- [ ] Enable WAL mode (`PRAGMA journal_mode=WAL`) and `PRAGMA foreign_keys=ON` in the DB initialization path.

## 3. Code Review
- [ ] Verify every migration SQL execution and its `schema_migrations` row insertion share a single `db.transaction` call — no migration may partially commit.
- [ ] Confirm `MigrationRunner` has zero direct `fs` or `git` calls — it depends only on a `Database` instance (dependency injection).
- [ ] Ensure `SchemaTamperingError` extends `Error` with a `code` property set to `'SCHEMA_TAMPERED'`.
- [ ] Confirm `migrations/index.ts` is the single source of truth — no migration SQL is embedded elsewhere.
- [ ] Check that WAL mode pragma is the very first statement executed against the DB connection.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/state/__tests__/schema-migrations.test.ts --coverage` and confirm all tests pass with branch coverage ≥ 90%.
- [ ] Run `npx jest --testPathPattern=schema-migrations` and confirm zero failures.

## 5. Update Documentation
- [ ] Add a `## Schema Versioning` section to `docs/architecture/state-management.md` describing the `schema_migrations` table, the `MigrationRunner` API, and the startup validation flow.
- [ ] Update `docs/agent-memory/phase_13_decisions.md` with the decision: "SQLite migrations are versioned monotonically; checksums prevent silent tampering; WAL mode is mandatory."

## 6. Automated Verification
- [ ] Run `node -e "const db = require('better-sqlite3')(':memory:'); require('./dist/state/schema-migrations').MigrationRunner; console.log('OK')"` and confirm `OK` is printed with exit code 0.
- [ ] Run `npx jest --ci --forceExit --testPathPattern=schema-migrations` in CI-equivalent mode and assert the exit code is `0`.
