# Task: Schema Drift Reconciliation on Rewind (Sub-Epic: 03_Relational State Rollback)

## Covered Requirements
- [8_RISKS-REQ-073], [3_MCP-RISK-102]

## 1. Initial Test Written
- [ ] In `src/state/__tests__/schema-drift-reconciliation.test.ts`, write unit tests that verify:
  - `SchemaDriftReconciler.detectDrift(targetTaskId)` returns `{ hasDrift: false }` when no schema migrations exist in `schema_migrations` with `applied_at > target_task.created_at`.
  - `detectDrift(targetTaskId)` returns `{ hasDrift: true, migrationsToRevert: Migration[] }` (ordered DESC by version) when migrations exist that post-date the target task.
  - `SchemaDriftReconciler.revertMigrations(migrationsToRevert)` calls each migration's `down` SQL inside a single `db.transaction()` in reverse version order.
  - If any `down` SQL throws, the entire revert transaction is rolled back and all `schema_migrations` rows remain intact.
  - After `revertMigrations`, the rows for reverted versions are deleted from `schema_migrations` inside the same transaction as the `down` SQL execution.
  - `revertMigrations` throws `NoDownMigrationError` if any migration in the list does not have a `down` property defined.
  - `SchemaDriftReconciler.reconcile(targetTaskId)` is an orchestration method that calls `detectDrift`, and if `hasDrift`, calls `revertMigrations` — assert it short-circuits when `hasDrift: false`.
- [ ] Write an integration test that applies three migrations (v1, v2, v3) to a real in-memory DB, targets a task created between v1 and v2, calls `reconcile`, and asserts: the DB is at schema version 1, `schema_migrations` has only one row (v1), and the v2/v3 tables/columns no longer exist.

## 2. Task Implementation
- [ ] Extend the `Migration` interface in `src/state/schema-migrations.ts` to include `down?: string` — the SQL to revert the migration (e.g., `DROP TABLE`, `DROP COLUMN`).
- [ ] Create `src/state/SchemaDriftReconciler.ts`:
  - Constructor accepts `db: Database` and `migrationRunner: MigrationRunner`.
  - `detectDrift(targetTaskId: string): DriftReport` — queries `tasks` for the target row's `created_at`; queries `schema_migrations WHERE applied_at > ?` to find post-date migrations; returns `DriftReport`.
  - `revertMigrations(migrations: Migration[]): void` — sorts by `version DESC`; wraps all `down` SQL executions and `DELETE FROM schema_migrations WHERE version = ?` calls inside a single `db.transaction()`.
  - `reconcile(targetTaskId: string): ReconcileResult` — calls `detectDrift`; if `hasDrift`, calls `revertMigrations`; returns `{ reconciledVersion: number, revertedCount: number }`.
- [ ] Define `DriftReport`, `ReconcileResult`, and `NoDownMigrationError` in `src/state/types.ts`.
- [ ] Integrate `SchemaDriftReconciler.reconcile` into `src/commands/rewind.ts` — call it *after* `RelationalRollbackEngine.rollbackToTask` and *before* returning success, ensuring schema state matches the data state at the target task.
- [ ] Add `NoDownMigrationError` handling in `src/commands/rewind.ts`: if thrown, abort the rewind and surface a user-facing error: `"Rewind blocked: migration v{N} has no down script. Manual schema intervention required."`.

## 3. Code Review
- [ ] Verify `revertMigrations` processes migrations in strictly descending version order — assert via a test spy that the `down` SQL for the highest version is executed first.
- [ ] Confirm `SchemaDriftReconciler` has no dependency on the filesystem — it depends only on `db` and `migrationRunner`.
- [ ] Ensure the `DELETE FROM schema_migrations WHERE version = ?` for each reverted migration is inside the same transaction as its `down` SQL — they must be atomic.
- [ ] Check that `detectDrift` never mutates the database — it is a pure read operation.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/state/__tests__/schema-drift-reconciliation.test.ts --coverage` and confirm all tests pass with branch coverage ≥ 90%.
- [ ] Run the integration test: `npx jest --testNamePattern="integration.*drift"` and assert v2/v3 tables are absent after reconcile.
- [ ] Run `npx jest --ci --forceExit --testPathPattern=schema-drift-reconciliation` and assert exit code `0`.

## 5. Update Documentation
- [ ] Add `SchemaDriftReconciler` API to `docs/architecture/state-management.md` under `## Schema Drift Reconciliation`.
- [ ] Document the requirement that every migration added to `src/state/migrations/index.ts` MUST include a `down` script. Add a lint rule or a startup assertion that throws if any migration lacks `down`.
- [ ] Update `docs/commands/rewind.md` to include the schema reconciliation step in the rewind sequence: Git → SQLite Data → Schema Reconciliation → Vector.
- [ ] Update `docs/agent-memory/phase_13_decisions.md`: "Schema drift reconciliation runs `down` migrations in reverse order inside a single transaction. Any migration without a `down` script blocks rewind entirely. Migrations are applied to `schema_migrations` atomically with their `down` SQL."

## 6. Automated Verification
- [ ] Run `node -e "const m = require('./dist/state/migrations/index'); const missing = m.migrations.filter(x => !x.down); if (missing.length) { console.error('MISSING DOWN:', missing.map(x => x.version)); process.exit(1); } console.log('All migrations have down scripts');"` and confirm exit code `0`.
- [ ] Run `npx tsc --noEmit` and confirm zero errors in `src/state/SchemaDriftReconciler.ts`.
- [ ] Run `npx jest --ci --forceExit --testPathPattern=schema-drift-reconciliation` and confirm exit code `0`.
