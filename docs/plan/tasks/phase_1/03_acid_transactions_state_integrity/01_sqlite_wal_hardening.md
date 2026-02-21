# Task: SQLite WAL & Hardening Setup (Sub-Epic: 03_ACID Transactions & State Integrity)

## Covered Requirements
- [TAS-070], [8_RISKS-REQ-093]

## 1. Initial Test Written
- [ ] Write a unit test in `packages/core/test/persistence/sqlite_hardening.test.ts` that:
    - Verifies the `.devs/state.sqlite` file is created with `0600` (read/write for owner only) permissions using `fs.statSync`.
    - Verifies the database is running in `WAL` (Write-Ahead Logging) mode by querying `PRAGMA journal_mode;` and expecting `wal`.
    - Verifies that row-level locking (synchronous mode) is active by querying `PRAGMA synchronous;` and expecting `NORMAL` or `FULL`.

## 2. Task Implementation
- [ ] In `packages/core/src/persistence/SqliteManager.ts`:
    - Ensure the `.devs/` directory is created if it doesn't exist.
    - Before creating the SQLite database file, set the process `umask` or use `fs.openSync` with `0600` flags to ensure the file is created with the correct permissions.
    - Use `better-sqlite3` to open the database.
    - Execute `PRAGMA journal_mode = WAL;` on the database instance.
    - Execute `PRAGMA synchronous = NORMAL;` for performance-safe concurrency.
    - Add a check on startup that throws an error if the file permissions are loose (greater than `0600`).

## 3. Code Review
- [ ] Verify that `better-sqlite3` is initialized once and reused (Singleton or managed lifecycle).
- [ ] Ensure that no secrets are ever logged during database initialization.
- [ ] Confirm that `WAL` mode is used to allow concurrent reads and writes between the CLI and VSCode Extension.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/persistence/sqlite_hardening.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `packages/core/README.md` or internal `.agent.md` memory to reflect the database hardening and WAL configuration.

## 6. Automated Verification
- [ ] Run a standalone script `scripts/verify_db_hardening.ts` that checks the file permissions and PRAGMA settings of a dummy database initialized via the `SqliteManager`.
