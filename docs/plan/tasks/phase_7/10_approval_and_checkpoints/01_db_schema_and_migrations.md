# Task: Implement DB schema and migrations for Approval & Requirement Mapping (Sub-Epic: 10_Approval_and_Checkpoints)

## Covered Requirements
- [TAS-068], [1_PRD-REQ-HITL-003], [1_PRD-REQ-HITL-004]

## 1. Initial Test Written
- [ ] Create tests/phase_7/10_approval_and_checkpoints/test_migrations.py. The test MUST be written first (TDD):
  - Use pytest and the tmp_path fixture to create a temporary SQLite database file (db_path = tmp_path / "test.db").
  - Read migrations/phase_7_10_create_approval_tables.sql (to be created) and execute its SQL statements against the temporary DB using Python's sqlite3 module.
  - Assert that the following tables exist in sqlite_master: approvals, epic_review_snapshots, requirement_task_map, coverage_reports.
  - Assert that the approvals table contains at least these columns: id, entity_type, entity_id, approver_id, status, created_at, updated_at.
  - The test should fail before migrations are added, and pass after implementing the SQL migration and apply helper.

## 2. Task Implementation
- [ ] Add migrations/phase_7_10_create_approval_tables.sql containing idempotent CREATE TABLE IF NOT EXISTS statements for:
  - approvals (id TEXT PRIMARY KEY, entity_type TEXT, entity_id TEXT, approver_id TEXT, status TEXT, notes TEXT, created_at DATETIME, updated_at DATETIME)
  - epic_review_snapshots (id TEXT PRIMARY KEY, epic_id TEXT, task_snapshot JSON, created_at DATETIME)
  - requirement_task_map (requirement_id TEXT, task_id TEXT, PRIMARY KEY(requirement_id, task_id))
  - coverage_reports (id TEXT PRIMARY KEY, rti REAL, generated_at DATETIME, details JSON)
- [ ] Add scripts/db/apply_migration.py (or a small CLI utility) that accepts --db <path> and --sql <file> and executes the SQL safely (use transactions and PRAGMA foreign_keys = ON for SQLite).
- [ ] Add a convenience migration runner script scripts/db/run_migrations.py which applies all SQL files in migrations/ in lexicographic order.

## 3. Code Review
- [ ] Verify:
  - SQL uses CREATE TABLE IF NOT EXISTS and explicit PRIMARY KEYs.
  - requirement_task_map has a composite primary key and indexes for fast joins (create index on task_id and requirement_id if applicable).
  - No external network calls and no secrets in migration scripts.
  - Migrations are idempotent and safe to run multiple times.
  - Date/time columns use UTC and are documented.

## 4. Run Automated Tests to Verify
- [ ] Locally run: pytest -q tests/phase_7/10_approval_and_checkpoints/test_migrations.py
- [ ] Run: python scripts/db/apply_migration.py --db /tmp/devs_test.db --sql migrations/phase_7_10_create_approval_tables.sql and verify return code 0.

## 5. Update Documentation
- [ ] Add docs/phase_7/10_approval_and_checkpoints/schema.md describing each table, columns, indices, and example queries for the orphan check and approval queries.
- [ ] Add a short section to docs/operations/migrations.md describing how to run the SQL migrator and rollback strategy (if supported).

## 6. Automated Verification
- [ ] Implement scripts/db/verify_schema.py that connects to a given DB and asserts presence of the exact table/column set above; make the script exit non-zero on mismatch. Use this script in CI to verify migrations applied correctly.
