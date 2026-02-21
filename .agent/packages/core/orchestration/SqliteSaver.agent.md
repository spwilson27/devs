---
module: packages/core/src/orchestration/SqliteSaver.ts
phase: 1
task: "03_acid_transactions_state_integrity/03_langgraph_sqlite_saver"
requirements: ["9_ROADMAP-REQ-014"]
exports:
  classes:
    - SqliteSaver
dependencies:
  internal:
    - packages/core/src/persistence/database.ts
  external:
    - "@langchain/langgraph"
    - "@langchain/core/runnables"
    - "better-sqlite3"
---

# `packages/core/src/orchestration/SqliteSaver.ts`

Implements the LangGraph `BaseCheckpointSaver` interface backed by `better-sqlite3`.
Every node transition in the devs `OrchestrationGraph` triggers a `put()` call that
persists the full serialized graph state to SQLite, providing the "Glass-Box" audit
trail and crash-recovery capability.

## Schema

Two tables created idempotently (`CREATE TABLE IF NOT EXISTS`) on construction:

### `checkpoints`

| Column                | Type | Description                                    |
|-----------------------|------|------------------------------------------------|
| `thread_id`           | TEXT | PK component — identifies the execution run    |
| `checkpoint_ns`       | TEXT | PK component — namespace (default `''`)        |
| `checkpoint_id`       | TEXT | PK component — UUID of the checkpoint         |
| `parent_checkpoint_id`| TEXT | UUID of the previous checkpoint (nullable)     |
| `type`                | TEXT | Serde type tag (`"json"` for built-in serde)   |
| `checkpoint`          | BLOB | JSON-serialized `Checkpoint` object            |
| `metadata`            | BLOB | JSON-serialized `CheckpointMetadata` object    |
| `created_at`          | TEXT | ISO 8601 UTC; set by SQLite default expression |

### `checkpoint_writes`

| Column          | Type    | Description                                         |
|-----------------|---------|-----------------------------------------------------|
| `thread_id`     | TEXT    | Logical ref to `checkpoints.thread_id` (no FK constraint) |
| `checkpoint_ns` | TEXT    | Logical ref to `checkpoints.checkpoint_ns` (no FK)        |
| `checkpoint_id` | TEXT    | Logical ref to `checkpoints.checkpoint_id` (no FK)        |
| `task_id`       | TEXT    | Agent task that produced these writes               |
| `idx`           | INTEGER | Zero-based ordering index within the write batch    |
| `channel`       | TEXT    | LangGraph channel name                              |
| `type`          | TEXT    | Serde type tag                                      |
| `value`         | BLOB    | JSON-serialized channel value                       |

## API

### Constructor

```ts
new SqliteSaver(db: Database.Database)
```

- Creates tables if they don't exist (idempotent).
- Compiles all 8 prepared statements once in the constructor.
- The `db` instance should be obtained from `createDatabase()`.

### `getTuple(config): Promise<CheckpointTuple | undefined>`

- If `config.configurable.checkpoint_id` is set: fetches that exact checkpoint.
- Otherwise: returns the most recently inserted checkpoint for `thread_id`.
- Returns `undefined` if no matching checkpoint exists.

### `list(config, options?): AsyncGenerator<CheckpointTuple>`

- Yields all checkpoints for `config.configurable.thread_id` in reverse
  chronological order (most recent first, ordered by SQLite `rowid DESC`).
- Supports `options.limit` to cap results.
- Yields an empty sequence for unknown thread IDs.
- **Phase 1 limitation:** `options.before` (filter checkpoints older than a
  given config) is not implemented. Sufficient for the current linear DAG
  topology; Phase 13 will add `before` support for branching workflows.

### `put(config, checkpoint, metadata, newVersions): Promise<RunnableConfig>`

- Serializes `checkpoint` and `metadata` via the inherited `serde` protocol.
- Wraps the `INSERT OR REPLACE` in a `db.transaction()()` — ACID guarantee.
- Returns a new `RunnableConfig` with `checkpoint_id` set to `checkpoint.id`.
- `parent_checkpoint_id` is taken from `config.configurable.checkpoint_id` (the
  previous checkpoint, if any).

### `putWrites(config, writes, taskId): Promise<void>`

- Stores each `[channel, value]` pair as a separate row in `checkpoint_writes`.
- The `idx` column is the zero-based position within the `writes` array.
- All rows are written in a single `db.transaction()()`.
- Values are JSON-serialized (not going through the `serde` protocol, which
  requires `async dumpsTyped` — writes are stored as plain JSON strings).

### `deleteThread(threadId): Promise<void>`

- Deletes all rows from `checkpoint_writes` and `checkpoints` for `threadId`.
- Both deletes are wrapped in a single transaction (all-or-nothing).
- `checkpoint_writes` is deleted first (child-before-parent ordering), which
  is safe now and future-proof should a FK constraint be added later.

### `close()`

- Closes the underlying `better-sqlite3` database connection.
- Should be called in test `afterEach` hooks when using isolated DB instances.
- In production, use `closeDatabase()` from `persistence/database.ts` to manage
  the singleton lifetime.

## ACID Contract

`better-sqlite3` is synchronous. Every write method wraps its statement(s) in
`db.transaction(fn)()`. If any error is thrown inside the callback, the driver
automatically executes `ROLLBACK` before re-throwing — no partial row is ever
committed. The previous checkpoint always remains intact.

## Serialization

The `serde` property is inherited from `BaseCheckpointSaver`. It defaults to the
LangGraph built-in JSON serializer (type tag `"json"`). Serialization:
- `checkpoint` and `metadata` objects: serialized via `serde.dumpsTyped()`.
- `putWrites` channel values: serialized via `JSON.stringify()` directly.

Deserialization (`_rowToTuple`):
- `Buffer` / `Uint8Array` columns are converted to `Uint8Array` before passing
  to `serde.loadsTyped()`.
- The `type` column stores the serializer type tag used to select the codec.

## Usage Example

```ts
import { createDatabase } from "@devs/core";
import { SqliteSaver } from "@devs/core";
import { StateGraph, START, END } from "@langchain/langgraph";

const db = createDatabase({ dbPath: ".devs/state.sqlite" });
const saver = new SqliteSaver(db);

const graph = new StateGraph(OrchestratorAnnotation)
  .addNode("research", researchNode)
  .addEdge(START, "research")
  .addEdge("research", END)
  .compile({ checkpointer: saver });

// Every node transition writes a checkpoint row to SQLite.
await graph.invoke(initialState, { configurable: { thread_id: "run-001" } });

// Resume from the latest checkpoint.
const state = await graph.getState({ configurable: { thread_id: "run-001" } });
```

## Notes

- `_stmtPutCheckpoint` is exposed as a non-private field to allow spy-based
  testing of the transaction rollback behaviour (crash simulation tests).
- `close()` swallows "already closed" errors so tests can call it safely in
  `afterEach` even after `closeDatabase()` has already closed the singleton.
- This implementation covers Phase 1 requirements. Phase 13 will extend it with
  binary BLOB handling (`msgpack` serde) and a dedicated `langgraph_writes` table
  that supports per-turn "Thought/Action" crash recovery.
