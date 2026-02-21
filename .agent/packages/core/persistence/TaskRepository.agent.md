---
module: packages/core/src/persistence/TaskRepository.ts
package: "@devs/core"
layer: persistence
status: implemented
requirements:
  - TAS-095
  - TAS-114
  - 9_ROADMAP-REQ-015
---

# TaskRepository

Focused repository for task-scoped git hash persistence and "Time-Travel" (rewind) lookup.

## Purpose

`TaskRepository` provides two capabilities beyond the general-purpose `StateRepository`:

1. **Git hash persistence** — `updateGitHash(taskId, hash)` stores the commit SHA in the `tasks.git_commit_hash` column. Throws `TaskNotFoundError` (not a silent no-op) if the task does not exist.

2. **Time-Travel lookup** — `getTaskByGitHash(hash)` enables the `devs rewind <sha>` command to locate which task a given commit implements, so the orchestrator can run `git checkout <sha>` to restore the project to that exact state.

## Public API

### `TaskNotFoundError`

Custom error class thrown when `updateGitHash` is called with a task id that does not exist in the DB. Has a typed `taskId: number` property for programmatic handling.

### `TaskRow`

Raw row type returned by `getTask` and `getTaskByGitHash`. Fields:
- `id: number` — numeric primary key
- `epic_id: number` — FK → epics
- `title: string`
- `description: string | null`
- `status: string`
- `git_commit_hash: string | null` — 40-char SHA-1 or `null`

### `TaskRepository`

Constructor: `new TaskRepository(db: Database.Database)`

| Method | Signature | Description |
|---|---|---|
| `updateGitHash` | `(taskId: number, hash: string): void` | Stores hash; throws `TaskNotFoundError` if task missing. Wrapped in transaction. |
| `getTask` | `(taskId: number): TaskRow \| null` | Retrieves a task by numeric PK. Returns `null` if absent. |
| `getTaskByGitHash` | `(hash: string): TaskRow \| null` | Returns the task with that `git_commit_hash`, or `null`. Used by rewind. |

## Design Decisions

- **`changes === 0` detection** — `_stmtUpdateGitHash.run(hash, id)` returns a `RunResult` with `changes`. When `changes === 0`, no row matched the WHERE clause, so `TaskNotFoundError` is thrown. This avoids a separate SELECT-then-UPDATE pattern and is safe because `id` is a unique PK.

- **Transaction wrapping** — `updateGitHash` calls `this.transaction()` (which delegates to `db.transaction(cb)()`). When called inside an outer transaction (e.g. from `GitAtomicManager.commitTaskChange`), better-sqlite3 automatically demotes the inner call to a SQLite SAVEPOINT — rollback semantics are preserved.

- **Prepared statements compiled once** — all 3 statements are compiled in the constructor, consistent with `StateRepository` pattern.

- **Separate from `StateRepository`** — `StateRepository` already has `updateTaskGitCommitHash`, but it accepts updates without existence validation. `TaskRepository` is the authoritative interface for the git hash lifecycle, with strict validation to prevent silent no-ops.

## Integration with ImplementationNode

`ImplementationNode` accepts two optional config fields:

```ts
taskRepository?: TaskRepository;
dbTaskId?: number;
```

When both are provided AND a commit hash is produced, `ImplementationNode` calls `taskRepository.updateGitHash(dbTaskId, commitHash)` immediately after the snapshot, persisting the hash to the DB before updating the LangGraph state.

## Usage

```ts
import { createDatabase, initializeSchema, TaskRepository } from "@devs/core";

const db = createDatabase();
initializeSchema(db);
const taskRepo = new TaskRepository(db);

// Persist a commit hash after successful implementation:
taskRepo.updateGitHash(dbTaskId, "abcdef1234567890abcdef1234567890abcdef12");

// Time-Travel rewind:
const task = taskRepo.getTaskByGitHash(sha);
if (task) {
  // exec(`git checkout ${task.git_commit_hash}`)
}
```

## Tests

14 integration tests in `packages/core/test/persistence/TaskRepository.test.ts`:
- `updateGitHash`: stores hash, overwrites existing, throws for non-existent, does not affect siblings.
- `getTask`: retrieves by id, returns null for missing, shows hash after update.
- `getTaskByGitHash`: returns task by hash, null for unknown, supports multi-task rewind lookup.
- Full round-trip: pending → completed → hash stored → hash retrieved via both methods.

## Related Modules

- `packages/core/src/persistence/state_repository.ts` — general-purpose multi-entity repository; also has `updateTaskGitCommitHash` (used internally by `GitAtomicManager`)
- `packages/core/src/orchestration/ImplementationNode.ts` — calls `TaskRepository.updateGitHash` when snapshot succeeds
- `packages/core/src/orchestration/GitAtomicManager.ts` — atomic git+DB coordinator using `StateRepository`
- `packages/core/src/persistence/schema.ts` — DDL: `tasks.git_commit_hash TEXT`
