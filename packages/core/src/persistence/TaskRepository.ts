/**
 * @devs/core persistence/TaskRepository.ts
 *
 * Focused repository for task-specific persistence operations.
 *
 * `TaskRepository` provides targeted read/write access to the `tasks` table,
 * complementing the general-purpose `StateRepository` with two capabilities
 * that are specific to the Git Integration & Snapshot Strategy:
 *
 *  1. **Git hash persistence** — `updateGitHash(taskId, hash)` stores the
 *     SHA-1 commit hash that implements a task. Throws `TaskNotFoundError`
 *     if the task does not exist, ensuring the caller receives an explicit
 *     signal rather than a silent no-op.
 *
 *  2. **Time-Travel (rewind) lookup** — `getTaskByGitHash(hash)` allows the
 *     `devs rewind <sha>` command to find which task a commit implements so
 *     it can perform a `git checkout <sha>` and restore the exact project
 *     state at that point.
 *
 * All write methods are ACID-compliant: they wrap their SQLite statements in
 * `this.transaction()` so callers can compose them into larger atomic units
 * without extra ceremony.
 *
 * Prepared statements are compiled once in the constructor and reused on
 * every method call, matching the pattern established by `StateRepository`.
 *
 * Requirements: [TAS-095], [TAS-114], [9_ROADMAP-REQ-015]
 */

import type Database from "better-sqlite3";
import type { Statement } from "better-sqlite3";

// ── Error types ───────────────────────────────────────────────────────────────

/**
 * Thrown by `TaskRepository.updateGitHash` when the target task id does not
 * exist in the `tasks` table.
 *
 * A specific error class (rather than a generic `Error`) lets callers
 * distinguish "task not found" from unexpected DB failures without parsing
 * message strings.
 */
export class TaskNotFoundError extends Error {
  /** The numeric task id that was not found. */
  readonly taskId: number;

  constructor(taskId: number) {
    super(`Task with id ${taskId} not found`);
    this.name = "TaskNotFoundError";
    this.taskId = taskId;
  }
}

// ── TaskRow ───────────────────────────────────────────────────────────────────

/**
 * A raw row from the `tasks` table as returned by better-sqlite3.
 *
 * All columns are present; nullable columns use `string | null`.
 */
export interface TaskRow {
  /** Numeric primary key (AUTOINCREMENT). */
  id: number;
  /** FK → epics(id). */
  epic_id: number;
  /** Short task title. */
  title: string;
  /** Optional detailed description. */
  description: string | null;
  /** Lifecycle status: 'pending' | 'in_progress' | 'completed' | 'failed'. */
  status: string;
  /**
   * Full SHA-1 (40 hex chars) of the git commit that implements this task.
   * `null` until the task is successfully committed.
   */
  git_commit_hash: string | null;
}

// ── TaskRepository ────────────────────────────────────────────────────────────

/**
 * Focused repository for task-scoped git hash persistence and rewind lookup.
 *
 * Construct with an open, schema-initialised `Database.Database` instance.
 * The database must have `foreign_keys = ON` (set by `createDatabase()`).
 *
 * @example
 * ```ts
 * import { createDatabase, initializeSchema, TaskRepository } from "@devs/core";
 *
 * const db = createDatabase();
 * initializeSchema(db);
 * const taskRepo = new TaskRepository(db);
 *
 * // After a successful git snapshot:
 * taskRepo.updateGitHash(dbTaskId, commitSha);
 *
 * // For `devs rewind <sha>`:
 * const task = taskRepo.getTaskByGitHash(sha);
 * if (task) {
 *   // git checkout task.git_commit_hash
 * }
 * ```
 */
export class TaskRepository {
  private readonly db: Database.Database;

  // ── Prepared statements (compiled once, reused on every call) ─────────────

  private readonly _stmtUpdateGitHash: Statement;
  private readonly _stmtGetTask: Statement;
  private readonly _stmtGetTaskByGitHash: Statement;

  constructor(db: Database.Database) {
    this.db = db;

    // UPDATE returns `changes = 0` when no row matched the WHERE clause.
    // We use this to detect non-existent task ids without a separate SELECT.
    this._stmtUpdateGitHash = db.prepare(
      "UPDATE tasks SET git_commit_hash = ? WHERE id = ?"
    );

    this._stmtGetTask = db.prepare("SELECT * FROM tasks WHERE id = ?");

    // Used by `devs rewind <sha>` to locate the task a given commit implements.
    this._stmtGetTaskByGitHash = db.prepare(
      "SELECT * FROM tasks WHERE git_commit_hash = ?"
    );
  }

  // ── Transaction helper ────────────────────────────────────────────────────

  /**
   * Wraps a callback in a SQLite transaction.
   *
   * Delegates to `db.transaction(cb)()` from better-sqlite3. On nested calls
   * (while another transaction is already active on this connection),
   * better-sqlite3 automatically uses a SQLite SAVEPOINT so the inner call
   * can fail independently without rolling back the outer transaction.
   */
  private transaction<T>(cb: () => T): T {
    return this.db.transaction(cb)();
  }

  // ── Write methods ─────────────────────────────────────────────────────────

  /**
   * Stores the git commit SHA against a task in the `git_commit_hash` column.
   *
   * This method is called by the orchestration layer (e.g. `ImplementationNode`
   * or `GitAtomicManager`) after a successful `git commit`, ensuring that the
   * `tasks` table always reflects the exact commit that implemented each task.
   *
   * The update is wrapped in `this.transaction()`, so it participates in any
   * outer transaction the caller has opened.
   *
   * @param taskId - The numeric primary-key id of the task (from the DB).
   * @param hash   - The full 40-character SHA-1 git commit hash.
   *
   * @throws {TaskNotFoundError} If no task with `taskId` exists in the DB.
   *
   * Requirements: [TAS-095], [TAS-114], [9_ROADMAP-REQ-015]
   */
  updateGitHash(taskId: number, hash: string): void {
    this.transaction(() => {
      const result = this._stmtUpdateGitHash.run(hash, taskId);
      if (result.changes === 0) {
        throw new TaskNotFoundError(taskId);
      }
    });
  }

  // ── Query methods ─────────────────────────────────────────────────────────

  /**
   * Retrieves a task row by its numeric primary key.
   *
   * @param taskId - The numeric primary-key id of the task.
   * @returns The `TaskRow`, or `null` if no task with that id exists.
   */
  getTask(taskId: number): TaskRow | null {
    return (this._stmtGetTask.get(taskId) as TaskRow | undefined) ?? null;
  }

  /**
   * Retrieves the task whose `git_commit_hash` matches the given SHA.
   *
   * This is the primary lookup for the `devs rewind <sha>` time-travel
   * command. The caller can then perform `git checkout <hash>` to restore
   * the generated project to its state at that commit.
   *
   * @param hash - A full 40-character SHA-1 git commit hash.
   * @returns The `TaskRow` whose `git_commit_hash` equals `hash`, or `null`
   *          if no task has been associated with that commit.
   *
   * Requirements: [9_ROADMAP-REQ-015]
   */
  getTaskByGitHash(hash: string): TaskRow | null {
    return (
      (this._stmtGetTaskByGitHash.get(hash) as TaskRow | undefined) ?? null
    );
  }
}
