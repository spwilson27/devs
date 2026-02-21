---
package: "@devs/core"
module: "persistence/state_repository"
type: module-doc
status: active
created: 2026-02-21
requirements: ["2_TAS-REQ-017", "TAS-105", "TAS-106", "TAS-107", "TAS-108", "TAS-109", "TAS-110", "TAS-111"]
---

# persistence/state_repository.ts — @devs/core State Repository

## Purpose

Implements the Repository pattern for reading and writing all core Flight Recorder
entities to the SQLite state store. Provides the single authoritative interface
through which the orchestrator persists and recovers agent state.

All multi-row write operations use `better-sqlite3`'s `.transaction()` to guarantee
ACID semantics: a failed row causes a full rollback — no partial data is ever
committed. [2_TAS-REQ-017]

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

#### Write Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `upsertProject` | `(project: Project) => number` | Insert or update a project. Returns the project id. Uses `ON CONFLICT(id) DO UPDATE` to preserve child rows. |
| `addDocument` | `(doc: Document) => number` | Insert a document. Returns the document id. |
| `saveRequirements` | `(reqs: Requirement[]) => void` | Bulk-insert requirements in a single transaction. |
| `saveEpics` | `(epics: Epic[]) => void` | Bulk-insert epics in a single transaction. |
| `saveTasks` | `(tasks: Task[]) => void` | Bulk-insert tasks in a single transaction. |
| `appendAgentLog` | `(log: AgentLog) => number` | Insert one agent log entry. Returns the log id. |
| `recordEntropyEvent` | `(event: EntropyEvent) => number` | Insert one entropy event. Returns the event id. |

#### Query Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getProjectState` | `(id: number) => ProjectState \| null` | Full snapshot: project + requirements + epics + tasks + agent_logs. `null` if project not found. |
| `getTaskLogs` | `(taskId: number) => AgentLog[]` | All log entries for a task, ordered by id (insertion order). |

## Design Decisions

- **`ON CONFLICT(id) DO UPDATE` for upsertProject:** Unlike `INSERT OR REPLACE`,
  this variant updates fields in-place without deleting and re-inserting the row.
  Avoids the cascade-delete side-effect that would wipe all documents, requirements,
  epics, and tasks belonging to the project.

- **Two INSERT paths for upsertProject:** When `project.id` is `undefined`, the
  repository uses a separate `INSERT` statement (no `id` column) so that SQLite's
  `AUTOINCREMENT` assigns a fresh id. When `project.id` is provided, the `ON
  CONFLICT DO UPDATE` statement is used.

- **Prepared statements compiled once:** All statements are created in the
  constructor via `db.prepare()` and stored as private fields. This avoids
  per-call parse overhead for hot write paths.

- **`db.transaction()` wrapper for bulk operations:** `saveRequirements`,
  `saveEpics`, and `saveTasks` wrap their insert loops in a transaction function.
  Any row-level error causes a full rollback — compliant with [2_TAS-REQ-017].

- **`number` return type for single inserts:** `upsertProject`, `addDocument`,
  `appendAgentLog`, and `recordEntropyEvent` return the new row's primary-key id
  (converted from `bigint` via `Number(result.lastInsertRowid)`). This lets
  callers chain FK references without additional queries.

- **`getProjectState` scopes all joins by `project_id`:** Tasks and agent logs
  are fetched by joining through epics → project_id, ensuring the query is
  correctly bounded even if tasks from other projects share the same epic_id range.

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

// Recover full state after restart.
const state = repo.getProjectState(projectId);
```

## Related Modules

- `persistence/database.ts` — opens the DB connection, sets `foreign_keys = ON`
- `persistence/schema.ts` — creates all 7 tables via `initializeSchema(db)`
- `scripts/db_stress_test.ts` — stress test (1000 writes/reads) for WAL consistency
- `docs/architecture/database_schema.md` — ERD and full column reference
