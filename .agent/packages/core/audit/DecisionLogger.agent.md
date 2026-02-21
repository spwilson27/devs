---
module: packages/core/src/audit/DecisionLogger.ts
package: "@devs/core"
layer: audit
status: implemented
requirements:
  - TAS-059
---

# DecisionLogger

Structured service for persisting agent architectural and implementation decisions to the `decision_logs` table.

## Purpose

Agents often consider multiple approaches before choosing one. Without explicit recording, these rejected alternatives are lost — future turns or future runs may re-evaluate the same options and waste tokens. `DecisionLogger` provides a clean API that captures:

1. **Rejected alternatives** — options the agent considered and discarded, with reasoning.
2. **Confirmed selections** — the approach ultimately chosen.
3. **Searchable history** — so subsequent agent turns can query what was already rejected.

The `task_id` is bound at **construction time** — agents never pass it per-call. The orchestrator creates a `DecisionLogger` for each task and passes it to the executing agent, ensuring automatic task-scoping without manual ID tracking.

## Public API

### `DecisionLog` (interface)

A raw row from `decision_logs` as returned by the database:

| Field | Type | Notes |
|---|---|---|
| `id` | `number` | Primary key |
| `task_id` | `number` | FK → tasks(id) |
| `timestamp` | `string` | ISO-8601, auto-populated |
| `alternative_considered` | `string \| null` | Rejected option, or null |
| `reasoning_for_rejection` | `string \| null` | Why it was rejected; supports Markdown |
| `selected_option` | `string \| null` | Chosen approach, or null |

### `DecisionRecord` (interface)

Input to `recordDecision()`. All fields are optional:

| Field | Type | Notes |
|---|---|---|
| `alternative?` | `string` | Option considered |
| `reasonForRejection?` | `string` | Why it was rejected |
| `selection?` | `string` | Final chosen approach |

### `DecisionLogger` (class)

Constructor: `new DecisionLogger(db: Database.Database, taskId: number)`

Throws if `taskId` does not exist in the `tasks` table.

Exposes `logger.taskId: number` (readonly) for inspection.

| Method | Signature | Description |
|---|---|---|
| `recordDecision` | `(record: DecisionRecord): number` | Atomic write; any subset of fields; returns id. |
| `logAlternative` | `(alternative: string, reasonForRejection: string): number` | Convenience wrapper: rejected option + reason. Returns id. |
| `confirmSelection` | `(selection: string): number` | Convenience wrapper: chosen approach. Returns id. |
| `searchDecisions` | `(query: string): DecisionLog[]` | Case-insensitive LIKE across all text fields for this task. |
| `getTaskDecisions` | `(): DecisionLog[]` | All decisions for this task in insertion order. |

## Design Decisions

- **Task-id at construction time** — eliminates manual `taskId` passing on every call. The orchestrator is responsible for creating the `DecisionLogger` instance per task and injecting it into the agent's tool context.

- **Task existence validation in constructor** — `DecisionLogger` validates that the task exists via a `SELECT` before accepting the binding. This provides an early, explicit error rather than allowing the first write to fail on a FK constraint violation with a cryptic SQLite error message.

- **Separate rows for alternatives and selections** — `logAlternative` and `confirmSelection` each create independent rows. This approach is simpler than a two-phase "insert alternative then update with selection" pattern and allows multiple alternatives to be rejected before a selection is confirmed.

- **`recordDecision` is the atomic primitive** — `logAlternative` and `confirmSelection` are convenience wrappers around `recordDecision`. This keeps the core logic in one place while providing a clean, intent-revealing API for the two most common call patterns.

- **Prepared statements compiled once** — all 4 statements (`_stmtInsert`, `_stmtGetAll`, `_stmtSearch`, `_stmtCheckTask`) are compiled in the constructor and reused on every call, matching the pattern established by `StateRepository` and `TaskRepository`.

- **`searchDecisions` is task-scoped** — the LIKE query includes `WHERE task_id = ?` to prevent decisions from other tasks appearing in search results. This is important for multi-task DBs where the orchestrator is managing many tasks concurrently.

- **`COLLATE NOCASE`** — the SQLite `COLLATE NOCASE` modifier provides ASCII case-insensitive matching without requiring the caller to normalize query strings. Sufficient for the agent use case (searching for technology names, approach names).

- **All writes use `db.transaction()`** — `recordDecision` wraps its insert in `db.transaction(fn)()`. When called inside an outer transaction (e.g., a larger orchestration step), better-sqlite3 automatically uses a SAVEPOINT, preserving the "no raw non-transactional writes" invariant.

## Usage Pattern

```ts
import { createDatabase, initializeSchema, initializeAuditSchema, DecisionLogger } from "@devs/core";

const db = createDatabase();        // Opens SQLite with WAL + FK PRAGMAs
initializeSchema(db);               // Creates core tables (tasks, etc.)
initializeAuditSchema(db);          // Creates decision_logs + indices

// Orchestrator creates logger per task:
const logger = new DecisionLogger(db, currentTaskId);

// Agent records its reasoning:
logger.logAlternative("Use Redis", "Overkill for our scale; adds ops complexity");
logger.logAlternative("Use Memcached", "No persistence; loses cache on restart");
logger.confirmSelection("In-memory Map with LRU eviction");

// Future agent turn checks prior rejections:
const prior = logger.searchDecisions("Redis");
if (prior.length > 0) {
  // skip Redis — already rejected
}

// Full audit trail:
const all = logger.getTaskDecisions();
// [ { alternative_considered: "Use Redis", ... },
//   { alternative_considered: "Use Memcached", ... },
//   { selected_option: "In-memory Map with LRU eviction", ... } ]
```

## Verification

After a test run, verify decisions are persisted:

```bash
sqlite3 .devs/state.sqlite "SELECT * FROM decision_logs"
```

## Tests

28 integration tests in `packages/core/test/audit/decision_logger.test.ts`:

- **Constructor**: task_id binding, throws for non-existent task.
- **logAlternative**: persists alternative + reason, Markdown content, timestamp auto-population, multiple alternatives, unique ids.
- **confirmSelection**: persists selection, Markdown content, follows logAlternative sequence.
- **recordDecision**: full row with all fields, all-null row, auto task_id association.
- **searchDecisions**: matches in alternative_considered, reasoning_for_rejection, selected_option; case-insensitive; empty result; cross-task isolation; returned field types.
- **getTaskDecisions**: empty result, insertion order, cross-task isolation.
- **Cross-task isolation**: two loggers for different tasks are independent.
- **WAL mode**: database uses WAL journal mode.
- **ACID writes**: logAlternative and confirmSelection writes are immediately durable (verified via second DB connection).

## Related Modules

- `packages/core/src/persistence/audit_schema.ts` — creates `decision_logs` table + indices
- `packages/core/src/persistence/schema.ts` — creates `tasks` table (required FK target)
- `packages/core/src/persistence/database.ts` — `createDatabase()` configures WAL + FK PRAGMAs
- `packages/core/test/audit/decision_logger.test.ts` — integration test suite
