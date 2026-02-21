# Task: Implement Core Tables Schema (Sub-Epic: 02_SQLite Schema & Persistence Layer)

## Covered Requirements
- [TAS-105], [TAS-106], [TAS-107], [TAS-108], [TAS-109], [TAS-110], [TAS-111], [9_ROADMAP-TAS-102], [9_ROADMAP-REQ-017]

## 1. Initial Test Written
- [ ] Create a schema verification test in `packages/core/test/persistence/schema.test.ts` that:
    - Verifies the existence of all 7 core tables: `projects`, `documents`, `requirements`, `epics`, `tasks`, `agent_logs`, `entropy_events`.
    - Checks for specific mandatory columns and types in each table (e.g., `task_id` in `tasks`, `commit_hash` in `tasks`, `thread_id` in `agent_logs`).
    - Verifies that primary keys and foreign key constraints are correctly defined.
    - Tests ACID transaction capability by attempting a multi-table write and verifying rollback on failure.

## 2. Task Implementation
- [ ] Create a migration or initialization script in `packages/core/src/persistence/schema.ts` that executes the SQL DDL for:
    - `projects`: `id`, `name`, `status`, `current_phase`, `metadata`.
    - `documents`: `id`, `project_id`, `name`, `content`, `version`, `status`.
    - `requirements`: `id`, `project_id`, `description`, `priority`, `status`, `metadata`.
    - `epics`: `id`, `project_id`, `name`, `order_index`, `status`.
    - `tasks`: `id`, `epic_id`, `title`, `description`, `status`, `git_commit_hash`.
    - `agent_logs`: `id`, `task_id`, `agent_role`, `thought`, `action`, `observation`, `timestamp`.
    - `entropy_events`: `id`, `task_id`, `hash_chain`, `error_output`, `timestamp`.
- [ ] Ensure all tables use appropriate SQLite types (TEXT, INTEGER, BLOB, etc.).
- [ ] Enable foreign key constraints in the database connection.

## 3. Code Review
- [ ] Verify that the schema matches the design specified in [9_ROADMAP-TAS-102].
- [ ] Ensure `git_commit_hash` is present in the `tasks` table for correlation [TAS-109].
- [ ] Check that `agent_logs` supports detailed auditing of thoughts and tool calls [TAS-110].
- [ ] Verify that the `entropy_events` table is structured to track repeating failures [TAS-111].

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/persistence/schema.test.ts` and ensure all tables are correctly initialized and constraints are working.

## 5. Update Documentation
- [ ] Document the database schema in `docs/architecture/database_schema.md`, including an ERD (Mermaid) if possible.

## 6. Automated Verification
- [ ] Run a CLI command or script `devs-internal db-audit` that queries `sqlite_master` and prints the schema of all 7 core tables to ensure they exist and match expectations.
