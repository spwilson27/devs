# Task: Define Agent Log and Decision Log Schemas (Sub-Epic: 07_Audit Trails & Glass-Box Observability)

## Covered Requirements
- [TAS-046], [TAS-059], [TAS-001], [3_MCP-MCP-002]

## 1. Initial Test Written
- [ ] Create a test in `packages/core/test/persistence/audit_schemas.test.ts` to verify the existence and structure of the `agent_logs` and `decision_logs` tables in `state.sqlite`.
- [ ] The test should attempt to insert dummy data into each field and verify that data types, constraints (e.g., NOT NULL), and foreign keys (e.g., link to `tasks` or `epics` table) are respected.
- [ ] Verify that indices exist for `task_id`, `epic_id`, and `timestamp` to ensure efficient querying.

## 2. Task Implementation
- [ ] Update the SQLite schema definition in `@devs/core/persistence` to include the following:
  - **agent_logs table**:
    - `id` (INTEGER PRIMARY KEY)
    - `task_id` (TEXT, Foreign Key to tasks)
    - `epic_id` (TEXT, Foreign Key to epics)
    - `timestamp` (DATETIME DEFAULT CURRENT_TIMESTAMP)
    - `role` (TEXT: e.g., 'researcher', 'developer', 'reviewer')
    - `content_type` (TEXT: e.g., 'THOUGHT', 'ACTION', 'OBSERVATION')
    - `content` (TEXT: JSON blob containing the thought, tool call, or result)
    - `commit_hash` (TEXT, optional, linking to current git state)
  - **decision_logs table**:
    - `id` (INTEGER PRIMARY KEY)
    - `task_id` (TEXT, Foreign Key to tasks)
    - `timestamp` (DATETIME DEFAULT CURRENT_TIMESTAMP)
    - `alternative_considered` (TEXT)
    - `reasoning_for_rejection` (TEXT)
    - `selected_option` (TEXT)
- [ ] Implement a migration or initialization script that applies these schema changes to `state.sqlite`.
- [ ] Ensure WAL (Write-Ahead Logging) mode is enabled for the database.

## 3. Code Review
- [ ] Verify that the `agent_logs` table schema supports storing detailed JSON blobs for various interaction types without loss of information.
- [ ] Ensure foreign key relationships correctly map to existing `projects`, `epics`, and `tasks` tables.
- [ ] Check that indices are properly configured for performance on historical queries.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/core/test/persistence/audit_schemas.test.ts` to ensure the schema is correctly applied and constraints work as expected.

## 5. Update Documentation
- [ ] Update `@devs/core/README.md` to document the new table structures for the "Flight Recorder" pattern.
- [ ] Record the schema decision in the project's internal AOD (`.agent.md`).

## 6. Automated Verification
- [ ] Execute `sqlite3 .devs/state.sqlite ".schema"` and verify that the output matches the expected definitions for `agent_logs` and `decision_logs`.
