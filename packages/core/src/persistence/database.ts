/**
 * @devs/core persistence/database.ts
 *
 * Database connection manager for the Flight Recorder SQLite state store.
 * Provides factory and singleton access to a better-sqlite3 Database instance
 * backed by `.devs/state.sqlite` at the project root.
 *
 * Design decisions:
 * - WAL (Write-Ahead Logging) mode is required for concurrent access by both
 *   the CLI and the VSCode Extension without blocking reads during writes.
 * - synchronous = NORMAL gives a good balance of durability and performance:
 *   it flushes at the most critical moments while avoiding excessive fsync calls.
 * - The `.devs/` directory is created on first use (idempotent via ensureDirSync).
 * - A module-level singleton is exported for general use; a standalone factory
 *   function is also exported to support isolated testing.
 *
 * Requirements: TAS-066, TAS-010, 4_USER_FEATURES-REQ-086
 */

import { dirname } from "node:path";
import Database from "better-sqlite3";
import { ensureDirSync } from "fs-extra";
import { resolveStatePath } from "../persistence.js";
import { reconstructStateFromProject } from "../recovery/HeuristicReconstructor.js";

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * Options accepted by `createDatabase` and `getDatabase`.
 */
export interface DatabaseOptions {
  /**
   * Directory from which to walk upward to locate the project root.
   * Defaults to `process.cwd()` when omitted.
   * Ignored when `dbPath` is provided.
   */
  fromDir?: string;

  /**
   * Explicit path to the SQLite file.
   * When provided, `fromDir` is ignored and no project-root resolution occurs.
   * Intended for tests that write to isolated temporary directories.
   */
  dbPath?: string;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates and initialises a new better-sqlite3 Database instance.
 *
 * Steps performed:
 * 1. Resolve the database file path (from `options.dbPath` or project root).
 * 2. Ensure the parent directory (`.devs/`) exists, creating it if necessary.
 * 3. Open the database with better-sqlite3.
 * 4. Apply PRAGMA journal_mode = WAL.
 * 5. Apply PRAGMA synchronous = NORMAL.
 *
 * @param options - Optional path overrides.
 * @returns An open, configured `Database` instance.
 */
import { existsSync, openSync, closeSync } from "node:fs";

export function createDatabase(
  options: DatabaseOptions = {}
): Database.Database {
  const dbPath =
    options.dbPath !== undefined
      ? options.dbPath
      : resolveStatePath(options.fromDir);

  // If the database file does not exist yet, attempt heuristic reconstruction
  // from project documents and comments. This creates a populated state.sqlite
  // when possible so the orchestrator can continue operating without manual
  // initialization.
  if (!existsSync(dbPath)) {
    try {
      // Pre-create the parent .devs directory so the reconstructor can write files.
      ensureDirSync(dirname(dbPath));
      // Call the reconstructor (best-effort). It will create and initialize the DB.
      // The reconstructor is statically imported at module top to avoid dynamic import
      // complexity and to keep this function synchronous.

      // Use provided fromDir or process.cwd() as the starting point.
      reconstructStateFromProject(options.fromDir ?? process.cwd());
    } catch (err) {
      // Silently ignore reconstruction failures and fall back to creating an empty DB.
    }
  }

  // Guarantee the .devs/ directory (or whatever parent dir) exists.
  ensureDirSync(dirname(dbPath));

  const db = new Database(dbPath);

  // WAL mode: allows concurrent reads alongside a single writer.
  db.pragma("journal_mode = WAL");

  // NORMAL synchronous: flush at critical checkpoints, not after every write.
  db.pragma("synchronous = NORMAL");

  // Run an initial WAL checkpoint to merge any pending WAL into the main DB (recovery handler).
  db.pragma("wal_checkpoint(TRUNCATE)");

  // Enable foreign key constraint enforcement. SQLite disables FK checks by
  // default; this PRAGMA must be set per connection. [TAS-105 through TAS-111]
  db.pragma("foreign_keys = ON");

  return db;
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Module-level singleton instance. `null` until first `getDatabase()` call. */
let _instance: Database.Database | null = null;

/**
 * Returns the shared singleton Database instance, initialising it on first call.
 *
 * Options passed on the first call are used to create the instance; subsequent
 * calls ignore the `options` argument and return the existing instance.
 *
 * @param options - Options forwarded to `createDatabase` on first call only.
 * @returns The shared `Database` instance.
 */
export function getDatabase(
  options: DatabaseOptions = {}
): Database.Database {
  if (_instance === null) {
    _instance = createDatabase(options);
  }
  return _instance;
}

/**
 * Closes and disposes the singleton Database instance.
 *
 * After this call, the next `getDatabase()` invocation will create a fresh
 * connection. Primarily intended for use in test `afterEach` / `afterAll`
 * hooks and graceful shutdown handlers.
 */
export function closeDatabase(): void {
  if (_instance !== null) {
    _instance.close();
    _instance = null;
  }
}
