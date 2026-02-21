# ACID Transactions — @devs/core State Integrity

## Overview

The `@devs/core` Flight Recorder uses SQLite (via `better-sqlite3`) as its
durable state store. All state mutations go through `StateRepository`, which
wraps every write in a SQLite transaction. This document explains the ACID
semantics, how `StateRepository.transaction()` works, and how the system
maintains state integrity across process crashes and multi-step agent operations.

**Requirements addressed:** [TAS-067], [8_RISKS-REQ-115], [3_MCP-REQ-REL-004]

---

## SQLite Transaction Fundamentals

SQLite transactions guarantee four ACID properties:

| Property | Meaning |
|----------|---------|
| **Atomicity** | Either all operations in a transaction commit, or none do. A crash mid-transaction leaves the database unchanged. |
| **Consistency** | The database moves from one valid state to another. Foreign key constraints, `NOT NULL`, and `UNIQUE` constraints are enforced per-transaction. |
| **Isolation** | In `better-sqlite3`'s synchronous model, a transaction executes to completion before any other code runs. No partial writes are visible to other statements. |
| **Durability** | Once committed, data survives process crashes. WAL mode (`PRAGMA journal_mode = WAL`) ensures committed writes are recorded before the process can exit. |

---

## WAL Mode and Crash Recovery

The Flight Recorder database is opened with `PRAGMA journal_mode = WAL`. WAL
(Write-Ahead Logging) provides the following guarantee:

> A transaction is only durable once a **COMMIT record** is appended to the
> WAL file. When a process dies mid-transaction (the COMMIT record was never
> written), the next connection to open the database performs **WAL recovery**
> — it replays only fully-committed transactions and silently discards the
> partial one.

This means that even a hard crash (`kill -9`, power loss, `process.exit(1)`)
inside a transaction leaves the database in its exact pre-transaction state.

This behaviour is verified by `scripts/simulate_crash_during_write.ts`.

---

## StateRepository Transaction API

### `transaction<T>(cb: () => T): T`

The central transaction primitive in `StateRepository`. All write methods call
`this.transaction()` internally — no raw `stmt.run()` call exists outside of a
transaction.

```typescript
// Usage: compose multiple writes into one atomic commit.
repo.transaction(() => {
  repo.updateTaskStatus(taskId, 'in_progress');
  repo.appendAgentLog({ task_id: taskId, agent_role: 'implementer', thought: 'Started' });
});
// Either both writes commit, or neither does.
```

**On success:** `cb` returns normally → transaction commits → `cb`'s return
value is forwarded.

**On failure:** `cb` throws → transaction automatically rolls back (no partial
data is committed) → the exception is re-thrown to the caller.

### Nested Transactions (SAVEPOINTs)

When `transaction()` is called while another `transaction()` is already active
on the same database connection, `better-sqlite3` automatically uses a SQLite
**SAVEPOINT** for the inner call:

```typescript
repo.transaction(() => {                             // outer → BEGIN
  repo.upsertProject({ id: pid, status: 'active' });

  try {
    repo.transaction(() => {                         // inner → SAVEPOINT sp1
      repo.saveEpics([{ project_id: pid, ... }]);
      throw new Error('inner failure');              // → ROLLBACK TO sp1
    });
  } catch { /* swallow inner error */ }
  // Outer transaction continues; inner savepoint is rolled back.
});                                                  // → COMMIT (outer change only)
```

The outer transaction governs the final commit. An inner failure only rolls
back to its own savepoint without touching the outer transaction.

---

## No Non-Transactional Writes

Every write method in `StateRepository` calls `this.transaction()`:

| Method | Transactional guarantee |
|--------|------------------------|
| `upsertProject` | Individually atomic; participates in outer transactions as a savepoint. |
| `addDocument` | Same as above. |
| `saveRequirements` | Bulk-insert: all rows commit together or none do. |
| `saveEpics` | Same as above. |
| `saveTasks` | Same as above. |
| `updateTaskStatus` | Single-row update; participates in outer transactions. |
| `appendAgentLog` | Single-row insert; participates in outer transactions. |
| `recordEntropyEvent` | Single-row insert; participates in outer transactions. |

This invariant is enforced at the code level: no `stmt.run()` call exists
outside a `this.transaction()` block in `state_repository.ts`.

---

## Parallel Agent Safety

The Flight Recorder is designed for use by a single Node.js process at a time.
`better-sqlite3` is synchronous — each statement executes to completion before
control returns to the caller. There is no opportunity for interleaved writes
within a single process.

For multi-process scenarios (e.g. VSCode Extension + CLI running concurrently),
WAL mode allows concurrent readers alongside a single writer. The single-writer
constraint is enforced at the OS level by SQLite's WAL lock. A second writer
attempting `BEGIN IMMEDIATE` while another writer holds the lock will receive
`SQLITE_BUSY` and must retry.

---

## Atomic Task Lifecycle Events

The primary use case for `transaction()` is recording task lifecycle events
atomically. A "task start" event consists of two writes:

1. `updateTaskStatus(taskId, 'in_progress')` — transitions the task.
2. `appendAgentLog(...)` — records the agent's first thought.

These must either both commit or neither commit. If the process crashes between
the two writes, the system could otherwise observe a task in `in_progress` with
no corresponding agent log — a partially-corrupted state. Wrapping them in a
single `transaction()` eliminates this risk.

```typescript
// Atomic task-start event (TAS-067).
repo.transaction(() => {
  repo.updateTaskStatus(taskId, 'in_progress');
  repo.appendAgentLog({
    task_id: taskId,
    agent_role: 'implementer',
    thread_id: threadId,
    thought: 'Starting task implementation',
  });
});
```

---

## Verification

| Script | Purpose |
|--------|---------|
| `scripts/simulate_crash_during_write.ts` | Spawns a child process that crashes mid-transaction; verifies the database remains in its pre-transaction state. Also verifies `StateRepository.transaction()` ACID equivalence. |
| `scripts/db_stress_test.ts` | 1000 bulk-writes + 1000 individual writes; WAL mode verification after 2000 operations. |
| `packages/core/test/persistence/StateRepository.test.ts` | 26 unit tests: multi-step commit, rollback, nested savepoints, `updateTaskStatus`, all write methods rollback verification. |

---

## Related Documents

- `docs/architecture/database_schema.md` — ERD and full column reference for the 7 core tables.
- `docs/architecture/state_sharing.md` — SQLite connection manager and `STATE_FILE_PATH` constant.
- `.agent/packages/core/persistence/state_repository.agent.md` — AOD for `StateRepository`.
