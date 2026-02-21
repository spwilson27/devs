# Task: LangGraph SQLiteSaver Checkpointer (Sub-Epic: 03_ACID Transactions & State Integrity)

## Covered Requirements
- [9_ROADMAP-REQ-014]

## 1. Initial Test Written
- [ ] Create `packages/core/test/orchestration/SqliteSaver.test.ts`:
    - Test that `SqliteSaver` successfully persists a LangGraph checkpoint to a SQLite table.
    - Test that `SqliteSaver` can load a previously persisted checkpoint by its `thread_id`.
    - Test that every node transition in a dummy LangGraph triggers a checkpoint write that is wrapped in a transaction.
    - Test that a crash mid-transition (using a mock/spy on the persistence layer) results in a consistent state that can be resumed from the previous successful checkpoint.

## 2. Task Implementation
- [ ] In `packages/core/src/orchestration/SqliteSaver.ts`:
    - Implement a class that satisfies the `BaseCheckpointSaver` interface from `langgraph/checkpoint`.
    - Use the existing `SqliteManager` or a dedicated connection to interact with the database.
    - Create a `checkpoints` table with columns for `thread_id`, `checkpoint_id`, `data` (BLOB/JSON), and `metadata`.
    - Ensure every `put` and `get` operation is ACID-compliant using the `StateRepository`'s transaction manager.
    - Every node transition in the LangGraph (e.g., `Green` to `Sandbox2`) MUST be recorded.

## 3. Code Review
- [ ] Confirm that `SqliteSaver` correctly serializes and deserializes the checkpoint object (binary/JSON blobs).
- [ ] Ensure that `checkpoints` are associated with the `project_id` and `task_id` where applicable.
- [ ] Verify that checkpoints are searchable for historical state analysis.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/orchestration/SqliteSaver.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the `SqliteSaver` implementation and its role in the "Glass-Box" audit trail within `@devs/core`.

## 6. Automated Verification
- [ ] Run a test LangGraph scenario and verify that the `checkpoints` table contains a record for every node transition with valid state data.
