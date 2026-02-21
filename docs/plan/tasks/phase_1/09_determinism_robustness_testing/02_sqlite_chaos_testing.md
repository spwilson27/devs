# Task: SQLiteSaver Chaos Testing for State Integrity (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [9_ROADMAP-REQ-016]

## 1. Initial Test Written
- [ ] Create a "Chaos Test" script `tests/chaos/sqlite_integrity.test.ts`.
- [ ] The test should spawn a child process that performs high-frequency writes (checkpoints, logs, task updates) to a SQLite database using `SQLiteSaver`.
- [ ] The parent process should randomly send `SIGKILL` to the child process at varying intervals.
- [ ] After each kill, the parent process should attempt to open the database and verify that the last "ACID-committed" record is intact and no partial/corrupt data exists (e.g., using `PRAGMA integrity_check`).

## 2. Task Implementation
- [ ] Ensure `@devs/core/persistence` is configured with WAL (Write-Ahead Logging) mode and synchronous=NORMAL or FULL to maximize durability.
- [ ] Refine the `SQLiteSaver` implementation to ensure every state transition is wrapped in an explicit `BEGIN TRANSACTION` and `COMMIT`.
- [ ] Implement a recovery handler that runs `PRAGMA wal_checkpoint(TRUNCATE)` or similar on startup to ensure any pending changes are merged correctly.

## 3. Code Review
- [ ] Verify that `better-sqlite3` transactions are used correctly (e.g., `db.transaction(() => { ... })()`).
- [ ] Ensure that no file-system operations are performed outside the database transaction if they are meant to be atomic with the state change (or use the Git correlation strategy).
- [ ] Check that the chaos test covers various record types (JSON blobs, binary checkpoints).

## 4. Run Automated Tests to Verify
- [ ] Run the chaos test script multiple times (e.g., 50 iterations) and ensure 0% state corruption.
- [ ] Run `npm run test:chaos` and verify all tests pass.

## 5. Update Documentation
- [ ] Document the results of the chaos testing in `research/persistence_durability_report.md`.
- [ ] Update `TAS` to include the specific SQLite PRAGMA settings used for "Chaos Resilience".

## 6. Automated Verification
- [ ] Run a validation script `scripts/validate_sqlite_integrity.sh` that checks the database for corruption after a simulated crash-recovery cycle.
