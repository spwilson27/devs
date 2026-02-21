# Task: Design and Migrate SQLite Schema for Lessons Learned (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [3_MCP-TAS-052], [4_USER_FEATURES-REQ-068]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/lessons-learned-schema.test.ts`, write unit tests that:
  - Verify the `lessons_learned` table is created with the correct columns: `id` (TEXT PRIMARY KEY), `task_id` (TEXT NOT NULL), `strategy_description` (TEXT NOT NULL), `rca_summary` (TEXT NOT NULL), `failure_type` (TEXT NOT NULL, e.g. `ARCHITECTURAL_MISUNDERSTANDING` | `TOOL_MISUSE` | `DEPENDENCY_CONFLICT`), `source_agent` (TEXT NOT NULL), `is_active` (INTEGER DEFAULT 1), `created_at` (TEXT NOT NULL ISO-8601), `updated_at` (TEXT NOT NULL ISO-8601).
  - Verify the `directive_history` table is created with columns: `id` (TEXT PRIMARY KEY), `task_id` (TEXT NOT NULL), `intervention_type` (TEXT NOT NULL, e.g. `MANUAL_FIX` | `FEEDBACK` | `OVERRIDE`), `description` (TEXT NOT NULL), `actor` (TEXT NOT NULL DEFAULT `USER`), `lancedb_vector_id` (TEXT NULLABLE), `created_at` (TEXT NOT NULL ISO-8601).
  - Verify both tables are created idempotently (running the migration twice does not error).
  - Verify that unique indexes exist on `lessons_learned(task_id, strategy_description)` and `directive_history(task_id, created_at)`.
  - Verify the SQLite WAL mode is enabled on the `.devs/state.db` database after migration.

## 2. Task Implementation
- [ ] Create the migration file at `packages/memory/src/migrations/004_lessons_learned.sql`:
  ```sql
  PRAGMA journal_mode=WAL;

  CREATE TABLE IF NOT EXISTS lessons_learned (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    strategy_description TEXT NOT NULL,
    rca_summary TEXT NOT NULL,
    failure_type TEXT NOT NULL CHECK(failure_type IN ('ARCHITECTURAL_MISUNDERSTANDING','TOOL_MISUSE','DEPENDENCY_CONFLICT','LOGIC_ERROR','UNKNOWN')),
    source_agent TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_ll_task_strategy
    ON lessons_learned(task_id, strategy_description);

  CREATE TABLE IF NOT EXISTS directive_history (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    intervention_type TEXT NOT NULL CHECK(intervention_type IN ('MANUAL_FIX','FEEDBACK','OVERRIDE','ESCALATION')),
    description TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT 'USER',
    lancedb_vector_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_dh_task_id
    ON directive_history(task_id);
  ```
- [ ] In `packages/memory/src/db/migrate.ts`, register and run `004_lessons_learned.sql` as part of the existing migration runner (use the existing `runMigrations(db: Database)` pattern already in place). The migration runner must be idempotent using `CREATE TABLE IF NOT EXISTS`.
- [ ] Export the migration from `packages/memory/src/index.ts` so it is applied when `@devs/memory` is initialized.

## 3. Code Review
- [ ] Confirm the migration file follows the existing naming convention (`NNN_description.sql`) and is loaded in numeric order by the migration runner.
- [ ] Confirm all `CHECK` constraints on `failure_type` and `intervention_type` columns exactly match the TypeScript union types that will be used in the service layer (to be implemented in task 02).
- [ ] Confirm WAL mode pragma is the first statement in the migration to ensure it applies before table creation.
- [ ] Confirm no raw SQL strings are scattered outside of `packages/memory/src/migrations/`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="lessons-learned-schema"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/memory test` to confirm no regressions in existing memory tests.

## 5. Update Documentation
- [ ] Add a section `### lessons_learned Table` and `### directive_history Table` to `packages/memory/AGENT.md` describing column semantics, constraints, and the migration file that creates them.
- [ ] Update `packages/memory/src/migrations/README.md` (create if absent) to document migration `004` and its purpose.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="lessons-learned-schema"` and assert exit code 0.
- [ ] Execute `node -e "const db = require('better-sqlite3')('.devs/state.db'); const t = db.prepare(\"SELECT name FROM sqlite_master WHERE type='table' AND name IN ('lessons_learned','directive_history')\").all(); if(t.length!==2) process.exit(1);"` in the project root to confirm tables exist at runtime.
