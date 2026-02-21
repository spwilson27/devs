/**
 * packages/core/src/recovery/RecoveryManager.ts
 *
 * Crash recovery engine for deterministic resume of interrupted LangGraph runs.
 *
 * ## Purpose
 *
 * `RecoveryManager` bridges the LangGraph checkpoint layer (`SqliteSaver`) and
 * the business-logic persistence layer (`StateRepository`) to provide a unified
 * interface for detecting, preparing, and executing crash recovery.
 *
 * When a devs process is interrupted (SIGKILL, OOM, power loss, etc.), the WAL
 * journal ensures that the last committed LangGraph checkpoint row is intact on
 * disk. `RecoveryManager` detects that checkpoint and provides the
 * `RunnableConfig` needed to resume execution from the exact node and state the
 * graph was in before the interruption — with zero data loss.
 *
 * ## Recovery flow
 *
 * ```
 * 1. Open a fresh DB connection to `.devs/state.sqlite`.
 * 2. Construct RecoveryManager(db).
 * 3. Call hasCheckpoint(projectId) — returns true if a prior run exists.
 * 4. Call recoverProject(projectId) — returns a RunnableConfig for resume.
 * 5. Optionally call markInProgressTasksAsResumed(dbProjectId) to audit
 *    business-logic tasks that were mid-flight at crash time.
 * 6. Construct a new OrchestrationGraph(new SqliteSaver(db)).
 * 7. Invoke graph.invoke(new Command({ resume: signal }), recoveryConfig).
 * ```
 *
 * ## Thread isolation
 *
 * The `thread_id` in the `checkpoints` table equals the `projectId` UUID
 * (set via `OrchestrationGraph.configForProject()`). All queries in this class
 * are scoped to a single `thread_id`, guaranteeing that two projects sharing
 * the same SQLite file never interfere with each other.
 *
 * ## Relationship to the business-logic `tasks` table
 *
 * The LangGraph `checkpoints` table (UUID thread_id) and the business-logic
 * `tasks` table (integer FK hierarchy) use different key spaces. When the
 * caller knows the numeric project id from the `projects` table, it can call
 * `markInProgressTasksAsResumed(numericProjectId)` to flag tasks that were
 * `in_progress` at crash time. This provides an audit trail in the
 * Glass-Box observability layer without coupling the LangGraph state to the
 * entity graph IDs.
 *
 * Requirements: [1_PRD-REQ-REL-003], [1_PRD-REQ-SYS-002],
 *               [1_PRD-REQ-MET-014], [1_PRD-REQ-CON-002]
 */

import type Database from "better-sqlite3";
import type { Statement } from "better-sqlite3";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { CheckpointTuple } from "@langchain/langgraph";
import { SqliteSaver } from "../orchestration/SqliteSaver.js";
import { OrchestrationGraph } from "../orchestration/graph.js";

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * Information about the most recent checkpoint available for a project.
 *
 * Returned by `getLatestCheckpoint()` when a prior run exists for the given
 * project ID. Callers can use `config` directly to resume graph execution.
 */
export interface RecoveryInfo {
  /** The project UUID (= `thread_id` in the `checkpoints` table). */
  projectId: string;
  /** The checkpoint_id of the most recent committed checkpoint row. */
  checkpointId: string;
  /** The deserialized `CheckpointTuple` — contains the full node state. */
  checkpointTuple: CheckpointTuple;
  /**
   * A `RunnableConfig` pre-populated with `thread_id` and `checkpoint_id`.
   * Pass this directly to `graph.invoke(Command({ resume: signal }), config)`
   * to resume from the exact checkpoint.
   */
  config: RunnableConfig;
}

// ── RecoveryManager ───────────────────────────────────────────────────────────

/**
 * Crash recovery engine for the devs orchestration pipeline.
 *
 * Construct with an open `better-sqlite3` Database instance (WAL + FK PRAGMAs
 * must be set before construction — use `createDatabase()` or `openDatabase()`).
 *
 * The `RecoveryManager` creates its own `SqliteSaver` instance internally so
 * that it can query the `checkpoints` and `checkpoint_writes` tables directly.
 * It does NOT own the database connection — the caller is responsible for
 * closing the DB after recovery is complete.
 *
 * @example
 * ```ts
 * import { createDatabase, RecoveryManager, OrchestrationGraph, SqliteSaver } from "@devs/core";
 * import { Command } from "@langchain/langgraph";
 *
 * const db = createDatabase({ dbPath: ".devs/state.sqlite" });
 * const manager = new RecoveryManager(db);
 *
 * const projectId = "my-project-uuid";
 *
 * if (await manager.hasCheckpoint(projectId)) {
 *   const recoveryConfig = await manager.recoverProject(projectId);
 *   const graph = new OrchestrationGraph(new SqliteSaver(db));
 *   await graph.graph.invoke(
 *     new Command({ resume: { approved: true, approvedAt: new Date().toISOString() } }),
 *     recoveryConfig,
 *   );
 * }
 * ```
 */
export class RecoveryManager {
  private readonly db: Database.Database;
  private readonly saver: SqliteSaver;

  /** Compiled statement for fast checkpoint count lookups. */
  private readonly _stmtCheckpointCount: Statement;

  /**
   * Lazily compiled statement for marking in-progress tasks as 'resumed'.
   *
   * Intentionally NOT compiled in the constructor because the `tasks` and
   * `epics` tables only exist after `initializeSchema(db)` has been called.
   * The `checkpoints` table (needed by the constructor) is always created by
   * `SqliteSaver`, but the business-logic schema is optional — a caller may
   * use `RecoveryManager` for checkpoint queries only and never call
   * `markInProgressTasksAsResumed()`.
   */
  private _stmtMarkResumed: Statement | null = null;

  constructor(db: Database.Database) {
    this.db = db;
    this.saver = new SqliteSaver(db);

    // Pre-compile the checkpoint count statement. SqliteSaver has already
    // created the `checkpoints` table via CREATE TABLE IF NOT EXISTS.
    this._stmtCheckpointCount = db.prepare(
      "SELECT COUNT(*) as n FROM checkpoints WHERE thread_id = ?"
    );
  }

  /**
   * Returns the compiled statement for marking tasks as resumed, compiling
   * it on first use. Throws if the `tasks` or `epics` tables do not exist.
   *
   * Note: uses a sub-SELECT because SQLite's UPDATE does not support JOIN
   * syntax directly. The sub-SELECT is fast for typical project sizes (< 1000
   * tasks) and avoids a separate round-trip.
   */
  private _getMarkResumedStmt(): Statement {
    if (this._stmtMarkResumed === null) {
      this._stmtMarkResumed = this.db.prepare(`
        UPDATE tasks
        SET    status = 'resumed'
        WHERE  status = 'in_progress'
          AND  epic_id IN (
            SELECT id FROM epics WHERE project_id = ?
          )
      `);
    }
    return this._stmtMarkResumed;
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Returns `true` if at least one checkpoint exists for the given project.
   *
   * Use this as the first check in a `devs resume` command before attempting
   * to reconstruct the full checkpoint state.
   *
   * @param projectId - The project UUID (= `thread_id` in the checkpoints table).
   */
  async hasCheckpoint(projectId: string): Promise<boolean> {
    const count = this.getCheckpointCount(projectId);
    return count > 0;
  }

  /**
   * Returns the count of committed checkpoint rows for the given project.
   *
   * Synchronous — no serde deserialization required, just a COUNT query.
   *
   * @param projectId - The project UUID.
   */
  getCheckpointCount(projectId: string): number {
    const row = this._stmtCheckpointCount.get(projectId) as { n: number };
    return row.n;
  }

  /**
   * Returns the most recent `RecoveryInfo` for the given project, or
   * `undefined` if no checkpoints exist.
   *
   * The returned `RecoveryInfo.checkpointId` is the `checkpoint_id` of the row
   * with the highest `rowid` in the `checkpoints` table for this `thread_id`.
   * This is always the last successfully committed node transition.
   *
   * @param projectId - The project UUID (= `thread_id`).
   */
  async getLatestCheckpoint(projectId: string): Promise<RecoveryInfo | undefined> {
    const baseConfig = OrchestrationGraph.configForProject(projectId);
    const tuple = await this.saver.getTuple(baseConfig);

    if (tuple === undefined) {
      return undefined;
    }

    const checkpointId = tuple.config.configurable?.checkpoint_id as string;

    return {
      projectId,
      checkpointId,
      checkpointTuple: tuple,
      config: tuple.config,
    };
  }

  /**
   * Returns a `RunnableConfig` suitable for resuming the graph from its last
   * committed checkpoint, or `undefined` if no checkpoints exist.
   *
   * The returned config has both `thread_id` (= projectId) and `checkpoint_id`
   * (= latest checkpoint row) set in `configurable`. Passing it directly to
   * `graph.invoke(Command({ resume }), config)` ensures LangGraph loads the
   * exact checkpoint state and resumes the interrupted node rather than
   * restarting the graph from the beginning.
   *
   * @param projectId - The project UUID.
   */
  async recoverProject(projectId: string): Promise<RunnableConfig | undefined> {
    const info = await this.getLatestCheckpoint(projectId);
    if (info === undefined) {
      return undefined;
    }
    return info.config;
  }

  /**
   * Marks all `in_progress` tasks in the business-logic `tasks` table for the
   * given **numeric** project id as `"resumed"`.
   *
   * This is an auditing step — it flags tasks that were mid-flight at crash
   * time so that the Glass-Box observability layer can surface them in reports.
   * The actual graph resume happens via the LangGraph checkpoint mechanism
   * (see `recoverProject()`); this method only updates the business entity status.
   *
   * Wrapped in a `better-sqlite3` transaction for atomicity. Returns the number
   * of task rows updated.
   *
   * **Pre-condition:** The `tasks` and `epics` tables must exist (call
   * `initializeSchema(db)` before calling this method). If the tables do not
   * exist this method will throw.
   *
   * @param numericProjectId - The integer primary key from the `projects` table.
   *   This is NOT the UUID `projectId` used in LangGraph — it is the SQLite
   *   autoincrement id assigned by `StateRepository.upsertProject()`.
   * @returns The number of task rows updated to `"resumed"`.
   */
  markInProgressTasksAsResumed(numericProjectId: number): number {
    const result = this.db.transaction(() => {
      return this._getMarkResumedStmt().run(numericProjectId);
    })();
    return result.changes;
  }
}
