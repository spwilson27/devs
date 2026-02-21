# Task: Initialize Persistence Layer & Zero-Dependency Storage (Sub-Epic: 02_SQLite Schema & Persistence Layer)

## Covered Requirements
- [TAS-066], [TAS-010], [4_USER_FEATURES-REQ-086]

## 1. Initial Test Written
- [ ] Create a unit test in `packages/core/test/persistence/database.test.ts` that verifies:
    - The `.devs/` directory is automatically created if it doesn't exist.
    - The `state.sqlite` file is created within `.devs/`.
    - The database connection is established using `better-sqlite3`.
    - PRAGMA settings like `journal_mode = WAL` and `synchronous = NORMAL` are correctly applied.
    - A simple "connection check" query (e.g., `SELECT 1`) succeeds.

## 2. Task Implementation
- [ ] Implement a database connection manager in `packages/core/src/persistence/database.ts`.
- [ ] Use `path` and `fs-extra` to ensure the `.devs/` directory exists relative to the project root.
- [ ] Initialize `better-sqlite3` pointing to `.devs/state.sqlite`.
- [ ] Configure WAL (Write-Ahead Logging) mode and synchronous settings for performance and ACID compliance.
- [ ] Export a singleton or factory function to provide the database instance to other modules.

## 3. Code Review
- [ ] Verify that the `.devs/` path is configurable or correctly resolved to the project root.
- [ ] Ensure that `better-sqlite3` is used as specified in [TAS-010].
- [ ] Check that WAL mode is enabled to support concurrent access by CLI and VSCode Extension.
- [ ] Confirm no external cloud dependencies or absolute host paths are used, satisfying [4_USER_FEATURES-REQ-086].

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/persistence/database.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `@devs/core` README or internal documentation to reflect the persistence layer initialization and the location of the source of truth (`.devs/state.sqlite`).

## 6. Automated Verification
- [ ] Run a script `scripts/verify_db_init.ts` that checks for the existence of `.devs/state.sqlite` and runs `PRAGMA journal_mode;` to verify WAL mode is active.
