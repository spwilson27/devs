# Task: Implement SAOP Schema Versioning and SQLite Migration Strategy (Sub-Epic: 15_Risk Mitigations & Resilience)

## Covered Requirements
- [3_MCP-RISK-102]

## 1. Initial Test Written
- [ ] In `packages/core/src/persistence/__tests__/migrations.test.ts`, write unit and integration tests for the migration runner:
  - Test `MigrationRunner.run()`: given a fresh in-memory SQLite database, assert that all migrations execute in ascending version order and that the `schema_migrations` table is populated with the correct `version` and `applied_at` values.
  - Test idempotency: calling `MigrationRunner.run()` a second time on an already-migrated database must produce zero additional changes and must not throw.
  - Test forward migration from v1 → v2: seed a v1 schema (no `schema_version` column on `agent_logs`), run migration, assert `schema_version` column exists and all existing rows have `schema_version = 1`.
  - Test that a migration with a syntax error is rolled back atomically — the `schema_migrations` table must NOT record the failed version.
  - Test `MigrationRunner.currentVersion()`: returns the highest successfully applied version integer.
  - Test `SAOPEnvelopeCompatibilityLayer.upcast(raw, fromVersion)`: given a v1 envelope JSON, assert it is transformed to the current schema version without data loss.
  - Write an integration test that opens a real on-disk SQLite file, applies migrations, closes, reopens, and confirms `MigrationRunner.currentVersion()` equals the expected value.

## 2. Task Implementation
- [ ] Create `packages/core/src/persistence/migrations/` directory with the following structure:
  ```
  migrations/
    index.ts              # MigrationRunner entry point
    0001_initial_schema.sql
    0002_add_schema_version_to_agent_logs.sql
    schema_migrations.sql # DDL for the version-tracking table
  ```
- [ ] `schema_migrations.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at INTEGER NOT NULL   -- Unix epoch ms
  );
  ```
- [ ] `0001_initial_schema.sql`: contains the canonical v1 DDL for `agent_logs`, `agent_logs_archive`, `traceability_index` view, and all other Phase 3 tables.
- [ ] `0002_add_schema_version_to_agent_logs.sql`:
  ```sql
  ALTER TABLE agent_logs ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1;
  ALTER TABLE agent_logs_archive ADD COLUMN schema_version INTEGER NOT NULL DEFAULT 1;
  ```
- [ ] Implement `packages/core/src/persistence/migrations/index.ts`:
  - `class MigrationRunner` with constructor `(db: BetterSqlite3.Database)`.
  - `run(): void` — reads all `*.sql` files from the `migrations/` directory, sorted numerically by prefix, skips versions already recorded in `schema_migrations`, executes each in a transaction, records success in `schema_migrations`.
  - `currentVersion(): number` — queries `MAX(version)` from `schema_migrations`.
  - All migration SQL files are embedded at build time via `fs.readFileSync` with `__dirname`-relative paths (not dynamic `require`).
- [ ] Implement `packages/core/src/persistence/saop-compatibility.ts`:
  - `class SAOPEnvelopeCompatibilityLayer`.
  - `upcast(raw: Record<string, unknown>, fromVersion: number): SAOPEnvelope` — applies a chain of version-specific transformers to bring old envelopes up to the current schema version. Start with a v1→v2 transformer as a concrete example.
  - Export `CURRENT_SAOP_VERSION: number` constant (set to `2` for this task).
- [ ] Add `schema_version` field to the `SAOPEnvelope` TypeScript interface in `packages/core/src/protocol/saop.ts`:
  ```ts
  schema_version: number;  // required; set to CURRENT_SAOP_VERSION at creation time
  ```
- [ ] Update `OrchestratorServer` startup sequence to call `new MigrationRunner(db).run()` before registering any MCP tools.
- [ ] Wire `SAOPEnvelopeCompatibilityLayer.upcast()` into `LogArchiver.restoreArchivedLog()` so that deserialized envelopes are always returned at the current schema version.

## 3. Code Review
- [ ] Confirm each migration SQL file is wrapped in `BEGIN; ... COMMIT;` within `MigrationRunner.run()` — a failed migration must not partially apply.
- [ ] Verify `MigrationRunner.run()` uses `better-sqlite3`'s synchronous transaction API (`.transaction()`) not raw `exec` calls, to guarantee atomicity.
- [ ] Ensure migration files are named with zero-padded 4-digit prefixes (`0001_`, `0002_`) for unambiguous lexicographic ordering.
- [ ] Confirm `SAOPEnvelopeCompatibilityLayer` has no side effects (pure transformation functions) — it must not write to the database.
- [ ] Verify `CURRENT_SAOP_VERSION` is a single source of truth imported by both `saop.ts` and `saop-compatibility.ts` (no magic numbers duplicated).
- [ ] Confirm `schema_migrations` table is created as part of migration `0001` so the system bootstraps cleanly on a fresh database.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="migrations"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="saop-compatibility"` and confirm all tests pass.
- [ ] Run the full core suite `pnpm --filter @devs/core test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/persistence/migrations/migrations.agent.md` documenting: how to add a new migration (naming convention, transaction requirement, backwards-compatibility rules), how `SAOPEnvelopeCompatibilityLayer` must be updated when adding a new schema version, and how to test migrations locally.
- [ ] Update `packages/core/src/protocol/saop.agent.md` to document the `schema_version` field and the upcast contract.
- [ ] Add an entry to `.devs/memory/phase_3_decisions.md`: "Schema evolution: versioned SQL migration files in `migrations/`; `MigrationRunner` applies them at startup; `SAOPEnvelopeCompatibilityLayer` upcasts old envelope blobs on read."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="migrations" --coverage` and assert line coverage ≥ 90% for `migrations/index.ts` and `saop-compatibility.ts`.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
- [ ] Execute a smoke test: `node -e "const db = require('better-sqlite3')(':memory:'); const {MigrationRunner} = require('./packages/core/dist'); new MigrationRunner(db).run(); console.assert(new MigrationRunner(db).currentVersion() >= 2, 'migrations must reach v2')"` and assert exit code 0.
