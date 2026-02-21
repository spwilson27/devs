---
package: "@devs/core"
module: "persistence/state_repository"
type: module-doc
status: active
created: 2026-02-21
updated: 2026-02-21
requirements: ["2_TAS-REQ-017", "TAS-067", "TAS-105", "TAS-106", "TAS-107", "TAS-108", "TAS-109", "TAS-110", "TAS-111", "8_RISKS-REQ-115", "3_MCP-REQ-REL-004"]
---

# persistence/state_repository.ts — @devs/core State Repository

## Purpose

Implements the Repository pattern for reading and writing all core Flight Recorder
entities to the SQLite state store. Provides the single authoritative interface
through which the orchestrator persists and recovers agent state.

**ACID Guarantee:** All write operations — both individual and bulk — are wrapped
inside `this.transaction()`. No raw, non-transactional writes exist in this module.
A public `transaction<T>(cb)` method allows callers to compose multiple writes
into one atomic operation. [TAS-067, 8_RISKS-REQ-115, 3_MCP-REQ-REL-004]

## ACID Transactions

### `transaction<T>(cb: () => T): T`

The central transaction primitive. Delegates to `db.transaction(cb)()` from
`better-sqlite3`.

**Behaviour:**
- **Commit:** if `cb` returns normally, the transaction is committed and the
  return value is forwarded to the caller.
- **Rollback:** if `cb` throws, the transaction is automatically rolled back and
  the exception is re-thrown — no partial data is ever committed.
- **Nesting:** when `transaction()` is called while another `transaction()` is
  already active on the same connection, `better-sqlite3` automatically uses a
  SQLite **SAVEPOINT** for the inner call. The inner savepoint can be rolled back
  independently without affecting the outer transaction.

**No non-transactional writes:** every write method in this class calls
`this.transaction()` internally, so even a single `upsertProject()` call is
individually atomic. When a caller wraps several calls in an outer
`transaction()`, the inner calls participate as savepoints — the outer
transaction governs the final commit.

**Example: atomic task-start event (TAS-067)**
```typescript
repo.transaction(() => {
  repo.updateTaskStatus(taskId, 'in_progress');
  repo.appendAgentLog({
    task_id: taskId,
    agent_role: 'implementer',
    thought: 'Starting implementation',
  });
});
// Both writes commit together; either both persist or neither does.
```

## Exports

### Entity Types

| Type | Description |
|------|-------------|
| `Project` | Top-level project metadata; `id` optional on insert. [TAS-105] |
| `Document` | Versioned document attached to a project (PRD, TAS, etc.). [TAS-106] |
| `Requirement` | Atomic requirement distilled from project documents. [TAS-107] |
| `Epic` | Ordered high-level phase within a project. [TAS-108] |
| `Task` | Atomic implementation task within an epic. [TAS-109] |
| `AgentLog` | One reasoning step (thought/action/observation) recorded by an agent. [TAS-110] |
| `EntropyEvent` | Repeating failure record for the loop-prevention subsystem. [TAS-111] |
| `ProjectState` | Snapshot returned by `getProjectState()`: project + all child entities. |

### Class: `StateRepository`

Construct with `new StateRepository(db)` where `db` is an open, schema-initialised
`Database.Database` instance (from `createDatabase()`).

All prepared statements are compiled in the constructor and reused on every method
call.

#### Transaction Method

| Method | Signature | Description |
|--------|-----------|-------------|
| `transaction` | `<T>(cb: () => T) => T` | Wraps `cb` in a SQLite transaction. Commits on success; auto-rollback on throw. Supports nesting via SAVEPOINTs. [TAS-067] |

#### Write Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `upsertProject` | `(project: Project) => number` | Insert or update a project. Returns the project id. Uses `ON CONFLICT(id) DO UPDATE` to preserve child rows. |
| `addDocument` | `(doc: Document) => number` | Insert a document. Returns the document id. |
| `saveRequirements` | `(reqs: Requirement[]) => void` | Bulk-insert requirements in a single transaction. |
| `saveEpics` | `(epics: Epic[]) => void` | Bulk-insert epics in a single transaction. |
| `saveTasks` | `(tasks: Task[]) => void` | Bulk-insert tasks in a single transaction. |
| `updateTaskStatus` | `(taskId: number, status: string) => void` | Update a single task's `status` field. Participates in outer transactions. |
| `appendAgentLog` | `(log: AgentLog) => number` | Insert one agent log entry. Returns the log id. |
| `recordEntropyEvent` | `(event: EntropyEvent) => number` | Insert one entropy event. Returns the event id. |

#### Query Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getProjectState` | `(id: number) => ProjectState \| null` | Full snapshot: project + requirements + epics + tasks + agent_logs. `null` if project not found. |
| `getTaskLogs` | `(taskId: number) => AgentLog[]` | All log entries for a task, ordered by id (insertion order). |

## Design Decisions

- **`transaction<T>()` delegates to `db.transaction(cb)()`:** `better-sqlite3`'s
  `.transaction()` factory compiles and caches the callback for reuse, and
  automatically handles SAVEPOINT nesting when called inside another active
  transaction. No manual `BEGIN/COMMIT/ROLLBACK` SQL is required.

- **Every write method calls `this.transaction()`:** This is the "no raw writes"
  invariant. Callers cannot accidentally bypass transaction semantics because
  the method itself guarantees atomicity. Composing writes in an outer
  `transaction()` call is simply layering savepoints.

- **`ON CONFLICT(id) DO UPDATE` for upsertProject:** Unlike `INSERT OR REPLACE`,
  this variant updates fields in-place without deleting and re-inserting the row.
  Avoids the cascade-delete side-effect that would wipe all documents, requirements,
  epics, and tasks belonging to the project.

- **Two INSERT paths for upsertProject:** When `project.id` is `undefined`, the
  repository uses a separate `INSERT` statement (no `id` column) so that SQLite's
  `AUTOINCREMENT` assigns a fresh id. When `project.id` is provided, the `ON
  CONFLICT DO UPDATE` statement is used.

- **Prepared statements compiled once:** All statements (15 total: 9 write + 6
  query) are created in the constructor via `db.prepare()` and stored as private
  readonly fields. This avoids per-call parse overhead for hot write paths.

- **`updateTaskStatus` uses positional `?` params (not named):** The UPDATE
  statement binds `(status, taskId)` positionally. Named params (`@status`,
  `@id`) would also work but the positional form is idiomatic for simple
  two-parameter updates.

- **`number` return type for single inserts:** `upsertProject`, `addDocument`,
  `appendAgentLog`, and `recordEntropyEvent` return the new row's primary-key id
  (converted from `bigint` via `Number(result.lastInsertRowid)`). This lets
  callers chain FK references without additional queries.

- **`getProjectState` scopes all joins by `project_id`:** Tasks and agent logs
  are fetched by joining through epics → project_id, ensuring the query is
  correctly bounded even if tasks from other projects share the same epic_id range.

## WAL Crash-Recovery Guarantee

SQLite WAL (Write-Ahead Logging) mode provides the following guarantee that
backs the atomicity of `transaction()`:

> A transaction is only durable once a COMMIT record is appended to the WAL
> file. When a process dies mid-transaction (no COMMIT record), the next
> connection to open the database performs WAL recovery and replays only
> fully-committed transactions — the partial/uncommitted transaction is
> silently discarded.

This is verified empirically by `scripts/simulate_crash_during_write.ts`.

## Usage Example

```typescript
import { createDatabase } from './database.js';
import { initializeSchema } from './schema.js';
import { StateRepository } from './state_repository.js';

const db = createDatabase({ dbPath: '.devs/state.sqlite' });
initializeSchema(db);
const repo = new StateRepository(db);

// Insert project.
const projectId = repo.upsertProject({ name: 'My Project', status: 'active' });

// Bulk-insert requirements (single ACID transaction).
repo.saveRequirements([
  { project_id: projectId, description: 'REQ-001: Auth', priority: 'high' },
  { project_id: projectId, description: 'REQ-002: Logging', priority: 'medium' },
]);

// Atomic task-start event: status update + agent log in one commit.
const taskId = 1; // obtained from saveTasks()
repo.transaction(() => {
  repo.updateTaskStatus(taskId, 'in_progress');
  repo.appendAgentLog({
    task_id: taskId,
    agent_role: 'implementer',
    thought: 'Starting task implementation',
  });
});

// Recover full state after restart.
const state = repo.getProjectState(projectId);
```

## Related Modules

- `persistence/database.ts` — opens the DB connection, sets `foreign_keys = ON`
- `persistence/schema.ts` — creates all 7 tables via `initializeSchema(db)`
- `scripts/db_stress_test.ts` — stress test (1000 writes/reads) for WAL consistency
- `scripts/simulate_crash_during_write.ts` — crash-recovery simulation (WAL + StateRepository ACID)
- `docs/architecture/database_schema.md` — ERD and full column reference
- `docs/architecture/acid_transactions.md` — ACID transactions design guide
