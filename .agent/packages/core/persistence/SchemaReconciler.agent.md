---
package: "@devs/core"
module: "persistence/SchemaReconciler"
type: module-doc
status: active
created: 2026-02-21
requirements: ["8_RISKS-REQ-073"]
---

# persistence/SchemaReconciler.ts — @devs/core Schema Drift Reconciliation

## Purpose

Detects and reverts unexpected database schema changes introduced by a failing
task. When a task involves a schema migration, the orchestrator takes a schema
`snapshot()` before execution and calls `revert(snapshot)` if the task fails.
This prevents schema drift from accumulating when tasks abort mid-migration.

Captures **schema only** — no row data is ever read, stored, or modified beyond
what is necessary to preserve rows during table recreation.

## Exports

| Symbol              | Signature                                   | Description                                                                 |
|---------------------|---------------------------------------------|-----------------------------------------------------------------------------|
| `ColumnInfo`        | `interface`                                 | Column metadata from `PRAGMA table_info` (cid, name, type, notnull, pk)     |
| `IndexInfo`         | `interface`                                 | Explicit CREATE INDEX metadata (name, unique, sql)                          |
| `TableSchema`       | `interface`                                 | Per-table schema: `name`, `sql` (DDL), `columns`, `indexes`                 |
| `SchemaSnapshot`    | `interface`                                 | Point-in-time schema capture: `tables` map + `capturedAt` ISO timestamp     |
| `TableDiff`         | `interface`                                 | Per-table diff: added/removed columns, added/removed indexes                |
| `SchemaDiff`        | `interface`                                 | Full diff: addedTables, removedTables, modifiedTables, hasChanges           |
| `SchemaReconciler`  | `class`                                     | Core reconciler; construct with `Database.Database`                         |
| `SchemaReconciler#snapshot` | `() => SchemaSnapshot`            | Captures current schema from `sqlite_master` + PRAGMAs                     |
| `SchemaReconciler#diff`     | `(baseline: SchemaSnapshot) => SchemaDiff` | Compares current schema vs baseline; returns structured diff   |
| `SchemaReconciler#revert`   | `(baseline: SchemaSnapshot) => void`       | Restores schema to baseline state                              |

## Design Decisions

- **Schema-only**: `snapshot()` reads `sqlite_master.sql` (DDL) and
  `PRAGMA table_info` / `PRAGMA index_list`. No `SELECT` on user tables.
- **Only explicit indexes captured**: `PRAGMA index_list` returns indexes with
  `origin = 'c'` (CREATE INDEX), `'u'` (UNIQUE constraint), and `'pk'` (PRIMARY
  KEY). Only `'c'` indexes are captured — UNIQUE/PK constraint indexes are
  already embedded in the table DDL and would cause "already exists" errors
  if re-applied during revert.
- **Table recreation for column changes**: SQLite 3.35+ supports
  `ALTER TABLE DROP COLUMN`, but not all environments guarantee that version.
  `revert()` always uses the safe "rename → create → copy → drop" approach,
  which handles both added and removed columns reliably on any SQLite version.
- **FK enforcement suspended during revert**: `PRAGMA foreign_keys = OFF` is
  set before the revert transaction so tables can be dropped/recreated in any
  order without FK constraint violations. It is restored in a `finally` block.
- **Multi-pass table drop**: Tables added by the task may have FK dependencies
  among themselves. A multi-pass loop retries dropping failed tables until all
  are gone or no progress is made (preventing infinite loops).
- **Row preservation on column revert**: When reverting a column addition, rows
  from the pre-existing columns are copied from the renamed temp table into the
  recreated original table. Task-added column data is discarded; task-removed
  columns reappear with NULL / default values.
- **No StateRepository coupling**: `SchemaReconciler` accepts any
  `Database.Database` instance. Integration with `StateRepository` or
  `TaskRunner` is the caller's responsibility (avoids circular dependencies).

## Usage Example

```typescript
import Database from "better-sqlite3";
import { SchemaReconciler } from "@devs/core";

const db = new Database(".devs/state.sqlite");
const reconciler = new SchemaReconciler(db);

// Before task execution:
const baseline = reconciler.snapshot();

try {
  runTaskMigration(db);   // may CREATE TABLE / ALTER TABLE
  await runTask();
} catch (err) {
  // Schema reconciliation on failure:
  reconciler.revert(baseline);
  throw err;
}

// Optionally, verify no unexpected drift after success:
const diff = reconciler.diff(baseline);
if (diff.hasChanges) {
  // Log or audit unexpected schema changes
}
```

## Test Coverage

26 unit tests in `packages/core/test/persistence/SchemaReconciler.test.ts`:
- `snapshot()`: empty DB, capturedAt format, table/column/index capture,
  exclusion of sqlite_* tables, data isolation.
- `diff()`: no-op on identical schema, new table, removed table, new column,
  new index, multiple simultaneous changes.
- `revert()`: no-op, drop added table, remove added column, preserve rows
  during column revert, drop added index, multiple changes atomically.
- Integration: failing migration, multi-snapshot comparison, FK relationships,
  snapshot-after-revert matches original.

## Related Modules

- `persistence/SqliteManager.ts` — hardened connection manager (WAL + 0600)
- `persistence/schema.ts` — DDL for core Flight Recorder tables
- `persistence/state_repository.ts` — entity write/query layer
- `scripts/simulate_failed_migration.ts` — end-to-end simulation script
