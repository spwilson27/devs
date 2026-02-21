---
package: "@devs/core"
module: "persistence/database"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-066", "TAS-010", "4_USER_FEATURES-REQ-086"]
---

# persistence/database.ts — @devs/core Database Connection Manager

## Purpose

Provides factory and singleton access to a `better-sqlite3` Database instance
backed by `.devs/state.sqlite` at the project root. Manages WAL mode and
synchronous pragma configuration for the Flight Recorder SQLite state store.

## Exports

| Symbol           | Signature                                          | Description                                                  |
|------------------|----------------------------------------------------|--------------------------------------------------------------|
| `DatabaseOptions`| `interface { fromDir?: string; dbPath?: string }`  | Options for path resolution (dbPath bypasses root walk)      |
| `createDatabase` | `(options?: DatabaseOptions) => Database.Database` | Factory: opens a new DB connection with WAL + NORMAL pragmas |
| `getDatabase`    | `(options?: DatabaseOptions) => Database.Database` | Singleton: returns shared instance, initialising on first call |
| `closeDatabase`  | `() => void`                                       | Closes singleton; next `getDatabase()` call creates fresh one |

## Design Decisions

- **WAL mode** (`journal_mode = WAL`): required for concurrent access by CLI and
  VSCode Extension — readers are never blocked by a writer.
- **`synchronous = NORMAL`**: flushes at critical checkpoints only; avoids
  excessive fsync calls while maintaining durability on normal shutdown.
- **`foreign_keys = ON`**: SQLite disables FK enforcement by default; this
  PRAGMA must be set per connection. Applied in `createDatabase()` so all
  callers get referential integrity automatically (added in Phase 1, Task 02).
- **`dbPath` override**: intended exclusively for tests that write to isolated
  temp directories. When provided, project-root resolution via `resolveStatePath`
  is skipped entirely.
- **Factory + Singleton pattern**: `createDatabase` is the test-friendly factory;
  `getDatabase` is the production singleton entry point.
- **Directory creation**: `fs-extra ensureDirSync` guarantees the parent dir
  (`.devs/`) exists before opening the database file.

## Usage Rules

- Production code: use `getDatabase()` (singleton).
- Tests: use `createDatabase({ dbPath: tmpPath })` for full isolation; always
  call `closeDatabase()` in `afterEach` / `afterAll` to prevent handle leaks.
- Never call `db.close()` directly on the singleton — use `closeDatabase()`.

## Related Modules

- `persistence.ts` — provides `resolveStatePath()` called by `createDatabase`
- `constants.ts` — defines `STATE_FILE_PATH` used by `resolveStatePath`
