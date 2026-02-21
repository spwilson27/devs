# Task: Implement Tasks DB schema and HEAD correlation (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-039]

## 1. Initial Test Written
- [ ] Create integration tests at tests/db/tasks_schema.spec.ts that run against an in-memory SQLite instance. Tests to write first:
  - Test A: "migrations create tasks table"
    - Arrange: run migrations against a fresh in-memory DB
    - Act: inspect sqlite_master for table 'tasks'
    - Assert: table exists with columns (id TEXT PRIMARY KEY, status TEXT, git_head TEXT, created_at INTEGER, updated_at INTEGER)
  - Test B: "tasks table stores commit head after CommitNode runs"
    - Arrange: create a dummy commit head 'abc123' and write a row into tasks
    - Act: query tasks table
    - Assert: the row's git_head === 'abc123'

## 2. Task Implementation
- [ ] Add SQL migration script at scripts/db/migrations/2026_02_21_create_tasks_table.sql with the following DDL:
  - CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      git_head TEXT,
      metadata JSON DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  - Add an index on git_head for quick lookups.
- [ ] Implement a data access module src/db/tasks.ts exposing:
  - async createTask(id, metadata)
  - async updateTaskCommit(id, gitHead)
  - async getTask(id)
- [ ] Ensure all DB operations use transactions when mutating state and tag any DB writes with REQ:[TAS-039].

## 3. Code Review
- [ ] Review migration for backwards-compatibility, idempotence, and ensure it uses PRAGMA foreign_keys=ON. Verify that the tasks API functions are typed, use parameterized queries, and do not allow SQL injection.

## 4. Run Automated Tests to Verify
- [ ] Run tests: `node ./scripts/db/run-migrations.js --database ':memory:' && pnpm vitest tests/db/tasks_schema.spec.ts --run` (or equivalent test harness). Ensure migration test and task persistence tests pass.

## 5. Update Documentation
- [ ] Add docs/db/tasks_table.md describing the schema, fields, and the significance of git_head for hard rewind and task-to-commit correlation. Reference [TAS-039].

## 6. Automated Verification
- [ ] Add a CI script scripts/db/verify_tasks_schema.js that runs migrations against a fresh DB, inserts a test row, updates commit head, then queries and asserts equality. CI must exit non-zero on mismatch.
