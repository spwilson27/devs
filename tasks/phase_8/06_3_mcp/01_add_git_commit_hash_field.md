# Task: Add git_commit_hash column and migration to state.sqlite (Sub-Epic: 06_3_MCP)

## Covered Requirements
- [3_MCP-TAS-094]

## 1. Initial Test Written
- [ ] Create an integration test at tests/integration/test_migration_git_commit_hash.py that:
  - Creates a temporary copy of the project schema (fresh SQLite file in tmpdir).
  - Runs the project's migration runner (or invoke migrations/migrate.py) against the temp DB.
  - Asserts that PRAGMA table_info('tasks') contains a column named `git_commit_hash` of type TEXT (nullable).
  - This test must fail initially (before migration code is implemented).

## 2. Task Implementation
- [ ] Implement a reversible, idempotent migration that adds `git_commit_hash` to the `tasks` table:
  - Add migration file: migrations/0002_add_git_commit_hash.sql (or implement in migrations runner).
  - SQL: `ALTER TABLE tasks ADD COLUMN git_commit_hash TEXT DEFAULT NULL;` (ensure SQLite compatibility).
  - Update migration runner to rely on PRAGMA user_version or a simple migrations table so the migration runs once.
  - Ensure migration runs at startup or via a migrations CLI command: `python -m migrations migrate --db <path>`.

## 3. Code Review
- [ ] Verify the migration is idempotent and safe to run on existing DBs.
- [ ] Confirm the column is nullable with a sensible default (NULL) to avoid blocking older records.
- [ ] Ensure migration scripts are small, documented, and recorded in a migrations manifest.
- [ ] Ensure no secrets or large binaries will be stored in the new column.

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/integration/test_migration_git_commit_hash.py and confirm it passes.
- [ ] Optionally run full integration test suite to check for regressions: `pytest tests/integration -q`.

## 5. Update Documentation
- [ ] Update docs/ or specs/ with a short note describing the migration and the rationale (link to 3_MCP-TAS-094).
- [ ] Add a brief note in docs/deployment.md describing how to run the migration in production and rollback instructions.

## 6. Automated Verification
- [ ] Add scripts/verify_migration.sh that:
  - Creates a temp DB, runs the migration, runs `sqlite3 <db> "PRAGMA table_info('tasks');"` and validates the `git_commit_hash` column exists and is TEXT.
  - Exit non-zero on failure so CI can pick it up.
