---
package: "@devs/core"
module: "persistence/schema"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-105", "TAS-106", "TAS-107", "TAS-108", "TAS-109", "TAS-110", "TAS-111", "9_ROADMAP-TAS-102", "9_ROADMAP-REQ-017"]
---

# persistence/schema.ts — @devs/core Core Tables Schema

## Purpose

DDL initialization for the 7 core Flight Recorder tables in `.devs/state.sqlite`.
Exports `initializeSchema(db)` which runs all `CREATE TABLE IF NOT EXISTS` statements
inside a single atomic transaction. Also exports `CORE_TABLES` for use in verification
scripts and tests.

## Exports

| Symbol             | Signature                             | Description                                              |
|--------------------|---------------------------------------|----------------------------------------------------------|
| `CORE_TABLES`      | `readonly string[]` (7 elements)      | Ordered list of all core table names                     |
| `CoreTable`        | `type`                                | Union type of all valid core table name strings          |
| `initializeSchema` | `(db: Database.Database) => void`     | Creates all 7 tables idempotently in a single transaction |

## Tables Created

| Table | Parent FK | Key Columns | Requirement |
|-------|-----------|-------------|-------------|
| `projects` | — | `id`, `name`, `status`, `current_phase`, `metadata` | TAS-105 |
| `documents` | `projects(id)` | `id`, `project_id`, `name`, `content`, `version`, `status` | TAS-106 |
| `requirements` | `projects(id)` | `id`, `project_id`, `description`, `priority`, `status`, `metadata` | TAS-107 |
| `epics` | `projects(id)` | `id`, `project_id`, `name`, `order_index`, `status` | TAS-108 |
| `tasks` | `epics(id)` | `id`, `epic_id`, `title`, `description`, `status`, `git_commit_hash` | TAS-109 |
| `agent_logs` | `tasks(id)` | `id`, `task_id`, `agent_role`, `thread_id`, `thought`, `action`, `observation`, `timestamp` | TAS-110 |
| `entropy_events` | `tasks(id)` | `id`, `task_id`, `hash_chain`, `error_output`, `timestamp` | TAS-111 |

## Design Decisions

- **`CREATE TABLE IF NOT EXISTS`**: all statements are idempotent; calling
  `initializeSchema` multiple times on the same database is safe.
- **Single transaction**: the entire DDL batch runs inside `db.transaction()`,
  so either all tables are created or none are (atomic schema migration).
- **`AUTOINCREMENT` PKs**: all tables use `INTEGER PRIMARY KEY AUTOINCREMENT`
  for monotonic, non-reused row IDs — important for audit log ordering.
- **`thread_id` in `agent_logs`**: groups all log entries for a single agent
  invocation so the full thought→action→observation chain can be replayed.
- **`git_commit_hash` in `tasks`**: enables precise correlation between a
  completed task record and the git commit that implements it (TAS-109).
- **`hash_chain` in `entropy_events`**: rolling SHA-256 of recent error outputs;
  stabilisation signals an entropy loop that the system must abort or escalate.
- **Caller-owned pragma**: `foreign_keys = ON` is set by `createDatabase()` in
  `database.ts`, not here. Schema initialization is deliberately decoupled from
  connection management.

## Usage Rules

- Always call `createDatabase()` (which enables `foreign_keys = ON`) before
  calling `initializeSchema()`.
- Calling `initializeSchema()` more than once is safe but unnecessary; the
  application entry point should call it exactly once at startup.

## Related Modules

- `persistence/database.ts` — opens the DB connection and sets PRAGMAs
- `constants.ts` — defines `STATE_FILE_PATH`
- `docs/architecture/database_schema.md` — ERD and full column reference
