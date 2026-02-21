---
module: packages/core/src/recovery/RecoveryManager.ts
phase: 5
task: "05_state_checkpointing_recovery/02_crash_recovery_engine"
requirements: ["1_PRD-REQ-REL-003", "1_PRD-REQ-SYS-002", "1_PRD-REQ-MET-014", "1_PRD-REQ-CON-002"]
exports:
  interfaces:
    - RecoveryInfo
  classes:
    - RecoveryManager
dependencies:
  internal:
    - packages/core/src/orchestration/SqliteSaver.ts
    - packages/core/src/orchestration/graph.ts
  external:
    - "@langchain/core/runnables"
    - "@langchain/langgraph"
    - "better-sqlite3"
tests: 25
---

# `packages/core/src/recovery/RecoveryManager.ts`

The crash recovery engine for the devs orchestration pipeline. Bridges the
LangGraph checkpoint layer (`SqliteSaver`) with the business-logic persistence
layer (`StateRepository`) to provide a unified interface for detecting, preparing,
and auditing crash recovery.

## Key Design Decisions

1. **Separate concerns:** `RecoveryManager` does NOT re-implement checkpoint
   loading logic. It delegates to `SqliteSaver.getTuple()` which already
   implements the "latest checkpoint for `thread_id`" query correctly.

2. **Dual ID space:** The LangGraph `thread_id` (UUID string) and the business
   `projects.id` (autoincrement integer) are different key spaces. Recovery
   across both layers requires the caller to know both IDs and call the right
   method:
   - `getLatestCheckpoint(projectId: string)` — UUID space (LangGraph)
   - `markInProgressTasksAsResumed(numericProjectId: number)` — integer space

3. **Pre-compiled statements:** Both `_stmtCheckpointCount` and `_stmtMarkResumed`
   are compiled once in the constructor. `getCheckpointCount` is synchronous
   (no serde deserialization), making it safe to call on the hot path.

4. **`markInProgressTasksAsResumed` uses a sub-SELECT:** SQLite's `UPDATE`
   does not support `JOIN` syntax. The sub-SELECT pattern (`epic_id IN (SELECT id
   FROM epics WHERE project_id = ?)`) is ACID-safe within the wrapping transaction.

5. **`SqliteSaver` is re-instantiated:** `RecoveryManager` creates its own
   `SqliteSaver(db)` in the constructor. This is safe because `SqliteSaver`'s
   `CREATE TABLE IF NOT EXISTS` DDL is idempotent. The `saver` is used only for
   reads (`getTuple`); no checkpoints are written via `RecoveryManager`.

## API

### `RecoveryInfo` interface

```ts
interface RecoveryInfo {
  projectId: string;       // UUID = thread_id in checkpoints table
  checkpointId: string;    // checkpoint_id of the latest committed row
  checkpointTuple: CheckpointTuple;  // full deserialized checkpoint
  config: RunnableConfig;  // ready-to-use config for graph.invoke(...)
}
```

### Constructor

```ts
new RecoveryManager(db: Database.Database)
```

Accepts an open, WAL-enabled `better-sqlite3` Database. Constructs `SqliteSaver`
and pre-compiles two prepared statements.

### `hasCheckpoint(projectId: string): Promise<boolean>`

Returns `true` if any checkpoints exist for the given project UUID.

### `getCheckpointCount(projectId: string): number`

Returns the count of committed checkpoint rows. Synchronous — COUNT query only.

### `getLatestCheckpoint(projectId: string): Promise<RecoveryInfo | undefined>`

Returns `RecoveryInfo` for the most recent checkpoint (highest `rowid`),
or `undefined` if no checkpoints exist. Uses `SqliteSaver.getTuple()`
which fetches the row with `ORDER BY rowid DESC LIMIT 1`.

### `recoverProject(projectId: string): Promise<RunnableConfig | undefined>`

Convenience wrapper over `getLatestCheckpoint`. Returns a `RunnableConfig`
with `thread_id` and `checkpoint_id` already set — pass directly to
`graph.invoke(new Command({ resume: signal }), config)`.

### `markInProgressTasksAsResumed(numericProjectId: number): number`

Updates all `tasks` rows with `status = 'in_progress'` that belong to the
given numeric project id to `status = 'resumed'`. Wrapped in a transaction.
Returns the number of rows updated. Requires `initializeSchema(db)` to have
been called first.

## Recovery Flow

```
1. Open fresh DB connection to .devs/state.sqlite (WAL mode).
2. new RecoveryManager(db)
3. hasCheckpoint(projectId)        → true if prior run exists
4. recoverProject(projectId)       → RunnableConfig with checkpoint_id set
5. markInProgressTasksAsResumed()  → audit in-progress tasks as "resumed"
6. new OrchestrationGraph(new SqliteSaver(db))
7. graph.invoke(new Command({ resume: signal }), recoveryConfig)
```

## Tests

25 integration tests in `packages/core/test/recovery/CrashRecovery.test.ts`:

- `hasCheckpoint` — 2 tests (false for new project, true after run)
- `getLatestCheckpoint` — 5 tests (undefined, correct info, checkpointId type, thread_id, most-recent semantics)
- `getCheckpointCount` — 2 tests (0 for new, positive after run)
- `recoverProject` — 2 tests (undefined when no checkpoints, RunnableConfig correctness)
- `markInProgressTasksAsResumed` — 4 tests (marks, status isolation, project isolation, 0 returns)
- Happy Path — 2 tests (graph resumes after clean exit, checkpoint structure integrity)
- Crash Path — 3 tests (checkpoints survive crash, zero data loss, 100% resume success)
- Thread isolation — 2 tests (project A does not expose B's checkpoints, independent sequences)
