# Task: Implement ACID-Compliant LangGraph State Checkpointing to SQLite (Sub-Epic: 06_Crash Recovery and Resume)

## Covered Requirements
- [4_USER_FEATURES-REQ-013]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/checkpointing.test.ts`, write unit tests for a `SqliteCheckpointer` class that implements the LangGraph `BaseCheckpointSaver` interface:
  - Test `put(config, checkpoint, metadata)`: verifies that a checkpoint is serialized as JSON and written to the `langgraph_checkpoints` table in `state.sqlite` within a single SQLite transaction. Confirm the row exists with correct `thread_id`, `checkpoint_id`, and `checkpoint_ns` after the call.
  - Test `get(config)`: verifies that the latest checkpoint for a given `thread_id` is deserialized and returned correctly.
  - Test `list(config)`: verifies that checkpoints are returned in descending `checkpoint_id` order.
  - Test atomicity: simulate a crash mid-write (throw inside transaction) and verify no partial row is persisted (ACID rollback).
  - Test idempotency: writing the same checkpoint twice results in only one row (upsert via `INSERT OR REPLACE`).
  - Write an integration test that runs a minimal two-node LangGraph graph using `SqliteCheckpointer` and then crashes (process.exit mock), restarts, and asserts the graph resumes from the last checkpointed node without re-executing completed nodes.

## 2. Task Implementation
- [ ] Create `src/orchestrator/checkpointing/SqliteCheckpointer.ts`:
  - Import `better-sqlite3` (already a project dependency).
  - Implement `SqliteCheckpointer` extending `BaseCheckpointSaver` from `@langchain/langgraph`.
  - In the constructor, accept a `db: Database` instance and run the schema migration:
    ```sql
    CREATE TABLE IF NOT EXISTS langgraph_checkpoints (
      thread_id TEXT NOT NULL,
      checkpoint_ns TEXT NOT NULL DEFAULT '',
      checkpoint_id TEXT NOT NULL,
      parent_checkpoint_id TEXT,
      type TEXT,
      checkpoint BLOB NOT NULL,
      metadata BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
    );
    CREATE TABLE IF NOT EXISTS langgraph_writes (
      thread_id TEXT NOT NULL,
      checkpoint_ns TEXT NOT NULL DEFAULT '',
      checkpoint_id TEXT NOT NULL,
      task_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      channel TEXT NOT NULL,
      type TEXT,
      value BLOB,
      PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
    );
    ```
  - Implement `put(config, checkpoint, metadata)` using a `db.transaction()` that serializes `checkpoint` and `metadata` via `JSON.stringify` (with `msgpack` fallback for binary channels) and does an `INSERT OR REPLACE`.
  - Implement `putWrites(config, writes, taskId)` inside a transaction for the `langgraph_writes` table.
  - Implement `getTuple(config)` to fetch the latest or specific checkpoint.
  - Implement `list(config, options)` as a generator yielding `CheckpointTuple` objects.
- [ ] Create `src/orchestrator/checkpointing/index.ts` exporting `SqliteCheckpointer`.
- [ ] In `src/orchestrator/OrchestratorGraph.ts`, replace any in-memory saver with `SqliteCheckpointer`, passing the shared `better-sqlite3` `Database` instance obtained from `src/persistence/DatabaseManager.ts`.

## 3. Code Review
- [ ] Verify all SQLite writes are wrapped in `db.transaction()` — no bare `db.prepare(...).run()` calls outside a transaction in the checkpointer.
- [ ] Confirm `checkpoint` and `metadata` columns use `BLOB` affinity with `Buffer` binding, not plain string, to support binary-safe serialization.
- [ ] Ensure the `SqliteCheckpointer` does not open its own database connection — it must receive the singleton `Database` instance to avoid WAL conflicts.
- [ ] Verify the implementation satisfies the `BaseCheckpointSaver` interface type-check (`tsc --noEmit`).
- [ ] Confirm no `any` types are used in the public interface of `SqliteCheckpointer`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=checkpointing` and confirm all unit and integration tests pass.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add `src/orchestrator/checkpointing/SqliteCheckpointer.agent.md` documenting: purpose, the two SQLite tables (`langgraph_checkpoints`, `langgraph_writes`), the `put`/`get`/`list` contract, and the requirement that only the singleton DB instance be used.
- [ ] Update `docs/architecture/persistence.md` to include a section on LangGraph state checkpointing and reference `4_USER_FEATURES-REQ-013`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=checkpointing --coverage` and assert line coverage for `SqliteCheckpointer.ts` is ≥ 90%.
- [ ] Run `node -e "const db = require('better-sqlite3')(':memory:'); const {SqliteCheckpointer} = require('./dist/orchestrator/checkpointing'); new SqliteCheckpointer(db); console.log('OK')"` to confirm the compiled module loads without error.
