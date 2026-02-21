# Task: Schema Drift Reconciliation (Sub-Epic: 03_ACID Transactions & State Integrity)

## Covered Requirements
- [8_RISKS-REQ-073]

## 1. Initial Test Written
- [ ] Create `packages/core/test/persistence/SchemaReconciler.test.ts`:
    - Mock a `SqliteManager` and a `SchemaReconciler`.
    - Test that `SchemaReconciler.snapshot()` captures the current database schema.
    - Test that `SchemaReconciler.diff()` detects changes to the schema (e.g., a new column).
    - Test that `SchemaReconciler.revert()` successfully reverts the database to its pre-task schema (using a `ROLLBACK` of a temporary migration or a database copy).
    - Test that a task involving schema migrations (mocked) is correctly rolled back if it fails.

## 2. Task Implementation
- [ ] In `packages/core/src/persistence/SchemaReconciler.ts`:
    - Implement a `snapshot()` method that uses SQLite's `PRAGMA table_info` and `PRAGMA index_list` to capture the schema of all core tables.
    - Implement a `diff()` method that compares the current schema with a snapshot.
    - If a task involves a database schema migration, the system MUST run a "Schema Reconciliation" turn.
    - If a task FAILS, use the `revert()` method to restore the local database instance to its pre-task schema.
    - Ensure this logic is integrated into the `StateRepository` or a higher-level `TaskRunner`.

## 3. Code Review
- [ ] Verify that `SchemaReconciler` does not capture data, ONLY schema.
- [ ] Confirm that `revert()` handles `ALTER TABLE` and `CREATE TABLE` operations correctly.
- [ ] Ensure that this process is fast enough to not impact implementation velocity.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/persistence/SchemaReconciler.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Add `Schema Drift Reconciliation` section to `@devs/core` documentation explaining how the system recovers from failed migrations.

## 6. Automated Verification
- [ ] Run a simulation script `scripts/simulate_failed_migration.ts` that mocks a failing schema migration task and verifies that the database schema remains unchanged.
