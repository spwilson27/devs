# Task: Implement SQLite WAL Mode and Sequence ID Tracking (Sub-Epic: 07_State_Watchers_Sync)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-038], [6_UI_UX_ARCH-REQ-050]

## 1. Initial Test Written
- [ ] Create a unit test in `@devs/core` (or the database management module) that verifies the SQLite database is initialized with `PRAGMA journal_mode=WAL;`.
- [ ] Create an integration test that performs a state update (e.g., updating a task status) and verifies that a `sequence_id` (monotonically increasing) or a high-resolution timestamp is updated in a metadata table.
- [ ] Verify that the `ProjectState` payload returned by the MCP server includes this `sequence_id`.

## 2. Task Implementation
- [ ] Configure the SQLite connection string or initialization script to enable Write-Ahead Logging (WAL) mode for better concurrency between the orchestrator and the VSCode extension.
- [ ] Add a `sequence_id` column to the `projects` table or create a dedicated `state_metadata` table to track the latest state version.
- [ ] Update the `SQLiteSaver` (or equivalent persistence layer) to increment the `sequence_id` inside every state-modifying transaction.
- [ ] Ensure that all internal state models (Task, Epic, Project) are updated to propagate this `sequence_id` in their serialized forms.
- [ ] Update the MCP server's `get_project_state` and related tools to include the `sequence_id` in the response payload.

## 3. Code Review
- [ ] Verify that WAL mode is correctly enabled and handles concurrent reads from the extension while the orchestrator is writing.
- [ ] Ensure the `sequence_id` is updated atomically within the same transaction as the state change to prevent "ghost updates".
- [ ] Check that the `sequence_id` implementation is robust against integer overflow (e.g., using a 64-bit integer or timestamp).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the relevant test runner to ensure the database initialization and sequence tracking tests pass.

## 5. Update Documentation
- [ ] Update the TAS or architectural documentation to reflect the use of WAL mode and the `sequence_id` synchronization protocol.
- [ ] Update the agent "memory" (AOD) with the new database schema details.

## 6. Automated Verification
- [ ] Execute a script that opens the `state.sqlite` file and runs `PRAGMA journal_mode;` to verify it returns `wal`.
- [ ] Run a state-change command and verify the `sequence_id` increments via a CLI query tool.
