/**
 * @devs/core persistence/SqliteManager.ts
 *
 * Hardened SQLite connection manager for the Flight Recorder state store.
 *
 * Extends the base database connection with security enforcement:
 *   - The `.devs/` directory is created on first use (idempotent).
 *   - The database file is pre-created with 0600 permissions (owner r/w only)
 *     before better-sqlite3 opens it, preventing the SQLite library from
 *     creating it with the looser 0644/0666 default.
 *   - A startup permission check throws if the file is found with permissions
 *     wider than 0600, catching externally-loosened files before they are used.
 *   - WAL (Write-Ahead Logging) mode is applied for concurrent CLI + VSCode
 *     Extension access without blocking reads during writes.
 *   - synchronous = NORMAL balances durability and performance.
 *   - A module-level singleton ensures better-sqlite3 is initialised once and
 *     reused across the process lifetime.
 *
 * Requirements: TAS-070, 8_RISKS-REQ-093
 */

import {
  existsSync,
  openSync,
  closeSync,
  statSync,
} from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { ensureDirSync } from "fs-extra";
import { resolveStatePath } from "../persistence.js";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum allowed file permission bits (octal). Owner r/w, no group/other. */
const REQUIRED_MODE = 0o600;

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * Options accepted by `SqliteManager`, `getSqliteManager`, etc.
 */
export interface SqliteManagerOptions {
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

// ── SqliteManager class ───────────────────────────────────────────────────────

/**
 * Hardened SQLite connection manager.
 *
 * Lifecycle:
 * 1. Construct with optional path options.
 * 2. Call `open()` to initialise the database (idempotent).
 * 3. Access the live connection via the returned `Database` from `open()`.
 * 4. Call `close()` to release the connection (test cleanup / graceful shutdown).
 */
export class SqliteManager {
  private _db: Database.Database | null = null;
  private readonly _dbPath: string;

  constructor(options: SqliteManagerOptions = {}) {
    this._dbPath =
      options.dbPath !== undefined
        ? options.dbPath
        : resolveStatePath(options.fromDir);
  }

  /**
   * The resolved database file path.
   */
  get path(): string {
    return this._dbPath;
  }

  /**
   * Opens and configures the database. Safe to call multiple times — returns
   * the same connection on successive calls (idempotent).
   *
   * Steps:
   * 1. Ensure the parent directory (`.devs/`) exists.
   * 2. Pre-create the file with 0600 permissions if it does not yet exist.
   * 3. Assert that the file permissions are no wider than 0600.
   * 4. Open with better-sqlite3.
   * 5. Apply `PRAGMA journal_mode = WAL`.
   * 6. Apply `PRAGMA synchronous = NORMAL`.
   *
   * @returns The open, configured `Database` instance.
   * @throws {Error} If the file permissions are looser than 0600.
   */
  open(): Database.Database {
    if (this._db !== null) {
      return this._db;
    }

    // 1. Ensure .devs/ (or whatever parent dir) exists.
    ensureDirSync(dirname(this._dbPath));

    // 2. Pre-create the database file with 0600 permissions.
    //    better-sqlite3 would create it with 0644 (via default umask).
    //    By pre-creating an empty file with the correct mode, we ensure
    //    SQLite opens an already-existing file and never changes its mode.
    if (!existsSync(this._dbPath)) {
      const fd = openSync(this._dbPath, "w", REQUIRED_MODE);
      closeSync(fd);
    }

    // 3. Reject the file if its permissions are looser than 0600.
    this._assertPermissions();

    // 4. Open the database.
    this._db = new Database(this._dbPath);

    // 5. WAL mode: concurrent reads alongside a single writer.
    this._db.pragma("journal_mode = WAL");

    // 6. NORMAL synchronous: flush at critical checkpoints only.
    this._db.pragma("synchronous = NORMAL");

    // Run an initial WAL checkpoint to merge any pending WAL into the main DB (recovery handler).
    this._db.pragma("wal_checkpoint(TRUNCATE)");

    return this._db;
  }

  /**
   * Returns the open database connection.
   *
   * @throws {Error} If `open()` has not been called yet.
   */
  get db(): Database.Database {
    if (this._db === null) {
      throw new Error(
        "SqliteManager: database is not open. Call open() first."
      );
    }
    return this._db;
  }

  /**
   * Closes the database connection and releases all resources.
   * Safe to call when the database is already closed (no-op).
   */
  close(): void {
    if (this._db !== null) {
      this._db.close();
      this._db = null;
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  /**
   * Checks that the database file's UNIX permission bits are no wider than
   * 0600. Throws a descriptive error if the file is accessible to group or
   * other users (or has the execute bit set).
   *
   * Uses a bitwise mask (`mode & 0o177`) rather than a numeric greater-than
   * comparison so that modes like 0o440 (group-readable, numerically < 0o600)
   * are correctly rejected alongside the more common 0o644/0o666 cases.
   *
   * Accepted:  0o000, 0o200, 0o400, 0o600  (no group/other/execute bits)
   * Rejected:  0o644, 0o660, 0o666, 0o444, 0o440, 0o700, etc.
   *
   * @throws {Error} When `(mode & 0o177) !== 0`.
   */
  private _assertPermissions(): void {
    const stat = statSync(this._dbPath);
    const mode = stat.mode & 0o777;

    // Reject if any group, other, or owner-execute bits are set.
    if ((mode & 0o177) !== 0) {
      throw new Error(
        `SqliteManager: insecure file permissions 0${mode.toString(8)} ` +
          `on ${this._dbPath}. ` +
          `Expected 0600 (owner read/write only) or stricter. ` +
          `Run: chmod 600 "${this._dbPath}"`
      );
    }
  }
}

// ── Module-level singleton ────────────────────────────────────────────────────

/** Singleton instance. `null` until first `getSqliteManager()` call. */
let _instance: SqliteManager | null = null;

/**
 * Returns the shared singleton `SqliteManager`, opening the database on first
 * call. Options passed on the first call determine the database path; subsequent
 * calls ignore `options` and return the existing instance.
 *
 * @param options - Optional path overrides forwarded to the constructor.
 * @returns The open, shared `SqliteManager` instance.
 */
export function getSqliteManager(
  options?: SqliteManagerOptions
): SqliteManager {
  if (_instance === null) {
    _instance = new SqliteManager(options);
    _instance.open();
  }
  return _instance;
}

/**
 * Closes and disposes the singleton `SqliteManager`.
 *
 * After this call, the next `getSqliteManager()` invocation creates a fresh
 * connection. Primarily intended for test `afterEach`/`afterAll` hooks and
 * graceful shutdown handlers.
 */
export function closeSqliteManager(): void {
  if (_instance !== null) {
    _instance.close();
    _instance = null;
  }
}
