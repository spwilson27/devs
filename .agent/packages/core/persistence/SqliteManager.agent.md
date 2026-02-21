---
package: "@devs/core"
module: "persistence/SqliteManager"
type: module-doc
status: active
created: 2026-02-21
requirements: ["TAS-070", "8_RISKS-REQ-093"]
---

# persistence/SqliteManager.ts — @devs/core Hardened SQLite Manager

## Purpose

Provides a security-hardened SQLite connection manager that enforces strict file
permissions (`0600`) and WAL mode on the Flight Recorder state store. Complements
`persistence/database.ts` with explicit security guarantees required by TAS-070
and 8_RISKS-REQ-093.

## Exports

| Symbol                | Signature                                                     | Description                                                        |
|-----------------------|---------------------------------------------------------------|--------------------------------------------------------------------|
| `SqliteManagerOptions`| `interface { fromDir?: string; dbPath?: string }`             | Path resolution options; `dbPath` bypasses project-root walk       |
| `SqliteManager`       | `class`                                                       | Hardened connection manager with permission enforcement + WAL      |
| `SqliteManager#open`  | `() => Database.Database`                                     | Opens and configures the DB (idempotent; same instance on repeats) |
| `SqliteManager#close` | `() => void`                                                  | Closes the connection; no-op if already closed                     |
| `SqliteManager#db`    | `get db(): Database.Database`                                 | Throws if `open()` not yet called                                  |
| `SqliteManager#path`  | `get path(): string`                                          | Resolved database file path                                        |
| `getSqliteManager`    | `(options?: SqliteManagerOptions) => SqliteManager`           | Module singleton: opens on first call, returns same instance after |
| `closeSqliteManager`  | `() => void`                                                  | Closes singleton; next `getSqliteManager()` creates fresh instance |

## Design Decisions

- **Pre-create with 0600**: `openSync(path, 'w', 0o600)` creates the file before
  better-sqlite3 opens it. This prevents SQLite from creating a 0644 file via
  the default umask. Only applied when the file does not yet exist.
- **Startup permission check**: `_assertPermissions()` reads `statSync` and
  throws `"insecure file permissions"` if `mode & 0o777 > 0o600`. This catches
  externally-loosened files (e.g. `chmod 644 state.sqlite`) before any queries.
- **WAL mode** (`journal_mode = WAL`): required for concurrent access by the CLI
  and VSCode Extension — readers are never blocked by a writer.
- **`synchronous = NORMAL`**: flushes at critical checkpoints only; avoids
  excessive fsync calls while maintaining durability on normal shutdown.
- **Singleton**: `getSqliteManager()` maintains a module-level `_instance` so
  better-sqlite3 is initialised exactly once per process. `closeSqliteManager()`
  is used in tests and graceful shutdown.
- **Distinction from `database.ts`**: `database.ts` satisfies TAS-066/TAS-010
  (general connection manager). `SqliteManager.ts` adds the security layer
  required by TAS-070/8_RISKS-REQ-093. Both modules coexist.

## Usage Rules

- Production code: use `getSqliteManager()` (singleton).
- Tests: use `new SqliteManager({ dbPath: tmpPath })` for isolation; always call
  `closeSqliteManager()` in `afterEach`/`afterAll` to prevent handle leaks.
- Never call `db.close()` on the singleton directly — use `closeSqliteManager()`.
- The permission check runs every time `open()` is called on a file that already
  exists. To tighten a file from the outside, run `chmod 600 state.sqlite`.

## Related Modules

- `persistence/database.ts` — general-purpose factory/singleton (TAS-066)
- `persistence.ts` — `resolveStatePath()` used for project-root resolution
- `constants.ts` — `STATE_FILE_PATH` constant consumed by `resolveStatePath`
