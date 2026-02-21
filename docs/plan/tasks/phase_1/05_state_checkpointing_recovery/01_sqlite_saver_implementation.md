# Task: Implement SQLiteSaver for LangGraph State Checkpointing (Sub-Epic: 05_State Checkpointing & Recovery)

## Covered Requirements
- [9_ROADMAP-TAS-103], [TAS-073], [TAS-094]

## 1. Initial Test Written
- [ ] Create a unit test suite in `@devs/core/tests/checkpointing/SQLiteSaver.test.ts`.
- [ ] Test that `SQLiteSaver` correctly implements the LangGraph `BaseCheckpointSaver` interface.
- [ ] Mock `better-sqlite3` and verify that `put` calls result in an ACID-compliant transaction being opened and committed.
- [ ] Test that `get` correctly retrieves a `Checkpoint` object from the database, handling binary/JSON blob conversion.
- [ ] Test "Chaos Condition": Simulate a database write failure during a transaction and verify that the graph state is not corrupted (ACID property).

## 2. Task Implementation
- [ ] Create `@devs/core/src/persistence/SQLiteSaver.ts` extending `BaseCheckpointSaver` from `langgraph`.
- [ ] Implement `put(config: CheckpointConfig, checkpoint: Checkpoint)`:
    - [ ] Wrap the database update in a `db.transaction(() => { ... })` block.
    - [ ] Store the `checkpoint` object as a serialized JSON or binary blob in the `checkpoints` table (linked to `state.sqlite`).
    - [ ] Ensure the `thread_id` and `checkpoint_id` are correctly indexed.
- [ ] Implement `get(config: CheckpointConfig)`:
    - [ ] Fetch the most recent checkpoint for the given `thread_id`.
    - [ ] Deserialize the blob back into a LangGraph `Checkpoint` object.
- [ ] Implement `list(config: CheckpointConfig, limit?: number, before?: string)` for retrieving checkpoint history.
- [ ] Configure `better-sqlite3` to use WAL (Write-Ahead Logging) mode to support concurrent access during checkpointing.

## 3. Code Review
- [ ] Verify that all database operations are within transactions.
- [ ] Ensure that serialization/deserialization of LangGraph state objects is robust and handles complex nested objects.
- [ ] Check that the `thread_id` is mapped correctly to the project/task context.
- [ ] Confirm that WAL mode is enabled on the database connection.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core` and ensure all `SQLiteSaver` tests pass.
- [ ] Run a sample LangGraph execution with `SQLiteSaver` attached and verify checkpoints are visible in `state.sqlite` using a SQL browser or CLI.

## 5. Update Documentation
- [ ] Update `@devs/core/README.md` with instructions on how `SQLiteSaver` handles state persistence.
- [ ] Update `.agent.md` documentation in the core module reflecting the persistence architecture.

## 6. Automated Verification
- [ ] Execute a script `scripts/verify_checkpoints.ts` that:
    - [ ] Starts a dummy LangGraph process.
    - [ ] Interupts it mid-transition.
    - [ ] Queries `state.sqlite` to verify a partial checkpoint was NOT written (atomicity) or the last full checkpoint IS present.
