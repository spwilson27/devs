# @devs/core

Core orchestration logic for the `devs` AI project generator. This package
provides the LangGraph state machine, agent coordination, persistence layer,
and the headless-first API consumed by `@devs/cli`, `@devs/vscode`, and
`@devs/mcp`.

## State Persistence with SqliteSaver

`@devs/core` uses **`SqliteSaver`** to checkpoint the full LangGraph graph
state to a local SQLite database (`state.sqlite`) after every node transition.
This provides crash recovery, historical analysis, and the Glass-Box audit
trail required by the devs architecture.

### How it works

1. The orchestration graph is compiled with `checkpointer: new SqliteSaver(db)`.
2. After every node transition, LangGraph calls `saver.put(config, checkpoint,
   metadata, newVersions)`.
3. `SqliteSaver` serializes the full `Checkpoint` object (via the LangGraph
   `serde` protocol) and writes it to the `checkpoints` table inside a
   `better-sqlite3` transaction.
4. On crash or interruption, the graph can be resumed by invoking it again with
   the same `{ configurable: { thread_id } }`. `SqliteSaver.getTuple()` loads
   the last fully committed checkpoint, and LangGraph replays from that point.

### ACID guarantees

Every write in `SqliteSaver` is wrapped in a `db.transaction(fn)()` call:

- `put()`: The `INSERT OR REPLACE` for the checkpoint row is atomic. A disk
  failure or process kill mid-write leaves the previous checkpoint intact — the
  partial row is discarded on next database open (WAL recovery).
- `putWrites()`: All pending channel write rows are inserted in a single
  transaction. Either all rows are committed or none.
- `deleteThread()`: Writes and checkpoints are deleted together (child-before-
  parent ordering) in a single transaction.

### WAL mode

The database is opened with `PRAGMA journal_mode = WAL` (via `createDatabase()`
in `src/persistence/database.ts`). WAL mode allows concurrent reads during
writes and dramatically reduces the blast radius of a mid-write crash.

### Schema

Two tables are created automatically on construction:

#### `checkpoints`

| Column                | Type | Description                                        |
|-----------------------|------|----------------------------------------------------|
| `thread_id`           | TEXT | Identifies the execution run (PK component)        |
| `checkpoint_ns`       | TEXT | Namespace (default `''`, PK component)             |
| `checkpoint_id`       | TEXT | UUID of this checkpoint (PK component)             |
| `parent_checkpoint_id`| TEXT | UUID of the previous checkpoint (nullable)         |
| `type`                | TEXT | Serde type tag (e.g. `"json"`)                     |
| `checkpoint`          | BLOB | Serialized `Checkpoint` object                     |
| `metadata`            | BLOB | Serialized `CheckpointMetadata` object             |
| `created_at`          | TEXT | ISO 8601 UTC timestamp (set by SQLite default)     |

#### `checkpoint_writes`

| Column          | Type    | Description                                           |
|-----------------|---------|-------------------------------------------------------|
| `thread_id`     | TEXT    | Logical reference to `checkpoints.thread_id`          |
| `checkpoint_ns` | TEXT    | Logical reference to `checkpoints.checkpoint_ns`      |
| `checkpoint_id` | TEXT    | Logical reference to `checkpoints.checkpoint_id`      |
| `task_id`       | TEXT    | Agent task that produced these writes (PK component)  |
| `idx`           | INTEGER | Zero-based ordering index within the write batch (PK) |
| `channel`       | TEXT    | LangGraph channel name                                |
| `type`          | TEXT    | Serde type tag                                        |
| `value`         | BLOB    | JSON-serialized channel value                         |

### Usage

```typescript
import { createDatabase } from "@devs/core";
import { SqliteSaver } from "@devs/core";
import { StateGraph, START, END } from "@langchain/langgraph";
import { OrchestratorAnnotation } from "@devs/core";

const db = createDatabase({ dbPath: ".devs/state.sqlite" });
const saver = new SqliteSaver(db);

const graph = new StateGraph(OrchestratorAnnotation)
  .addNode("research", researchNode)
  .addNode("design", designNode)
  .addEdge(START, "research")
  .addEdge("research", "design")
  .addEdge("design", END)
  .compile({ checkpointer: saver });

const threadId = "project-run-001";

// Run the graph — each node transition writes a checkpoint.
await graph.invoke(initialState, {
  configurable: { thread_id: threadId },
});

// Query all checkpoints via the saver.
for await (const tuple of saver.list({ configurable: { thread_id: threadId } })) {
  console.log(tuple.checkpoint.id, tuple.metadata?.step);
}

// Or query state.sqlite directly (Glass-Box observability):
//   SELECT * FROM checkpoints WHERE thread_id = 'project-run-001';
```

### Resume after crash

```typescript
// If the process crashed mid-run, re-invoke with the same thread_id.
// LangGraph loads the last checkpoint via getTuple() and replays from there.
const result = await graph.invoke(
  {},                // empty — LangGraph will load state from the checkpoint
  { configurable: { thread_id: threadId } }
);
```

### Verifying checkpoints

Use the standalone verification script to confirm ACID guarantees:

```bash
pnpm exec tsx scripts/verify_checkpoints.ts
```

This script runs four scenarios:
1. Full graph run — verifies checkpoint count and WAL mode.
2. Node crash — verifies the last committed checkpoint is recoverable.
3. Mid-transaction failure — verifies no partial checkpoint is written.
4. Disk visibility — verifies checkpoints are readable via raw SQL.

## Persistence Layer Overview

| Module | Purpose |
|--------|---------|
| `src/persistence/database.ts` | `createDatabase()` / `getDatabase()` singleton, WAL + FK PRAGMAs |
| `src/persistence/schema.ts` | `initializeSchema()` — creates the 7 core business tables |
| `src/persistence/SqliteManager.ts` | Security-hardened connection manager (0600 file permissions) |
| `src/persistence/state_repository.ts` | `StateRepository` — ACID read/write for all 7 entity types |
| `src/orchestration/SqliteSaver.ts` | LangGraph `BaseCheckpointSaver` backed by `better-sqlite3` |

## Running Tests

```bash
pnpm test --filter @devs/core
```

All `SqliteSaver` tests are in
`packages/core/test/orchestration/SqliteSaver.test.ts`.

## Architecture

See `docs/architecture/` for authoritative documentation:
- `database_schema.md` — ERD and full column reference for business tables.
- `acid_transactions.md` — ACID transaction design guide.
- `orchestration_graph.md` — LangGraph topology with Mermaid diagram.
- `state_sharing.md` — `STATE_FILE_PATH` constant and project root resolution.
