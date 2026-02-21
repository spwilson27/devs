/**
 * @devs/core audit/DecisionLogger.ts
 *
 * Service for recording architectural and implementation decisions made by
 * AI agents into the `decision_logs` table.
 *
 * `DecisionLogger` provides a clean, structured API for agents to capture:
 *  1. Rejected alternatives — the options they considered and discarded.
 *  2. Confirmed selections — the approach they ultimately chose.
 *  3. Full decision records — combining alternative, rejection reason, and
 *     selection into a single atomic row.
 *
 * The `task_id` is bound at construction time so agents never have to pass
 * it on every call. The orchestrator creates a `DecisionLogger` instance per
 * task and hands it to the executing agent, ensuring all decisions are
 * automatically scoped to the correct task.
 *
 * `searchDecisions(query)` enables subsequent agent turns or users to query
 * the history of rejected strategies, preventing the same approach from
 * being re-evaluated in a future turn.
 *
 * All writes use the existing `better-sqlite3` persistence layer with WAL
 * enabled (configured by `createDatabase()`). Prepared statements are
 * compiled once in the constructor and reused on every call.
 *
 * Prerequisites: The database must have been initialised with both
 * `initializeSchema(db)` and `initializeAuditSchema(db)`.
 *
 * Requirements: [TAS-059]
 */

import type Database from "better-sqlite3";
import type { Statement } from "better-sqlite3";

// ── Public types ──────────────────────────────────────────────────────────────

/**
 * A raw decision log row as returned by the database.
 *
 * All text fields are nullable because `recordDecision` allows any subset of
 * the three content fields to be populated. `id` and `task_id` are always
 * present.
 */
export interface DecisionLog {
  /** Numeric primary key (AUTOINCREMENT). */
  id: number;
  /** FK → tasks(id). Auto-scoped from constructor. */
  task_id: number;
  /** ISO-8601 timestamp; populated by DB default. */
  timestamp: string;
  /** The option that was considered and rejected, or `null` if not applicable. */
  alternative_considered: string | null;
  /** Why the alternative was rejected, or `null` if not applicable. */
  reasoning_for_rejection: string | null;
  /** The option that was selected, or `null` if not yet confirmed. */
  selected_option: string | null;
}

/** Input to `recordDecision()`. All fields are optional. */
export interface DecisionRecord {
  /** The alternative option that was considered. */
  alternative?: string;
  /** Why the alternative was rejected. Supports Markdown. */
  reasonForRejection?: string;
  /** The approach that was ultimately selected. Supports Markdown. */
  selection?: string;
}

// ── DecisionLogger ────────────────────────────────────────────────────────────

/**
 * Service for persisting agent decision data to the `decision_logs` table.
 *
 * Construct once per task. The `taskId` is captured at construction time and
 * applied automatically to every write — agents do not need to track or pass
 * the task id themselves.
 *
 * @example
 * ```ts
 * import { createDatabase, initializeSchema, initializeAuditSchema } from "@devs/core";
 * import { DecisionLogger } from "@devs/core";
 *
 * const db = createDatabase();
 * initializeSchema(db);
 * initializeAuditSchema(db);
 *
 * const logger = new DecisionLogger(db, currentTaskId);
 *
 * // During agent reasoning:
 * logger.logAlternative("Use Redis", "Overkill for our scale");
 * logger.logAlternative("Use Memcached", "No persistence on restart");
 * logger.confirmSelection("In-memory Map with LRU eviction");
 *
 * // Before choosing a strategy, check what was rejected before:
 * const priorRejections = logger.searchDecisions("Redis");
 * ```
 */
export class DecisionLogger {
  private readonly db: Database.Database;

  /** The task_id bound at construction time. */
  readonly taskId: number;

  // ── Prepared statements (compiled once, reused on every call) ─────────────

  private readonly _stmtInsert: Statement;
  private readonly _stmtGetAll: Statement;
  private readonly _stmtSearch: Statement;
  private readonly _stmtCheckTask: Statement;

  constructor(db: Database.Database, taskId: number) {
    this.db = db;
    this.taskId = taskId;

    // Validate that the task exists before accepting the binding. This ensures
    // DecisionLogger always operates against a real FK target, preventing
    // silent ghost writes that would be rejected by the DB constraint anyway.
    this._stmtCheckTask = db.prepare(
      "SELECT id FROM tasks WHERE id = ?"
    );
    const taskRow = this._stmtCheckTask.get(taskId);
    if (taskRow === undefined) {
      throw new Error(
        `DecisionLogger: task with id ${taskId} does not exist in the database`
      );
    }

    // Insert a decision log entry. All content columns are optional (nullable).
    this._stmtInsert = db.prepare(`
      INSERT INTO decision_logs
        (task_id, alternative_considered, reasoning_for_rejection, selected_option)
      VALUES
        (@task_id, @alternative_considered, @reasoning_for_rejection, @selected_option)
    `);

    // Retrieve all entries for this task ordered by insertion id (ascending).
    this._stmtGetAll = db.prepare(
      "SELECT * FROM decision_logs WHERE task_id = ? ORDER BY id"
    );

    // Case-insensitive LIKE search across all three text fields.
    // Only returns entries for this logger's task_id.
    this._stmtSearch = db.prepare(`
      SELECT * FROM decision_logs
      WHERE task_id = ?
        AND (
          alternative_considered   LIKE ? COLLATE NOCASE
          OR reasoning_for_rejection LIKE ? COLLATE NOCASE
          OR selected_option         LIKE ? COLLATE NOCASE
        )
      ORDER BY id
    `);
  }

  // ── Write methods ─────────────────────────────────────────────────────────

  /**
   * Records an architectural or implementation decision with any combination
   * of alternative, rejection reason, and selection.
   *
   * The `task_id` is applied automatically from the constructor binding.
   * All fields are optional — pass only the fields relevant to the current
   * decision step.
   *
   * @param record - The decision data to persist.
   * @returns The new row's primary-key id.
   */
  recordDecision(record: DecisionRecord): number {
    const result = this.db.transaction(() => {
      return this._stmtInsert.run({
        task_id: this.taskId,
        alternative_considered: record.alternative ?? null,
        reasoning_for_rejection: record.reasonForRejection ?? null,
        selected_option: record.selection ?? null,
      });
    })();

    return Number(result.lastInsertRowid);
  }

  /**
   * Records a rejected alternative and the reason it was discarded.
   *
   * Agents should call this whenever they evaluate an option and decide
   * against it. This builds a rejection history that prevents re-evaluating
   * the same approach in future turns.
   *
   * Supports Markdown content in both fields.
   *
   * @param alternative - The option that was considered (e.g. "Use Redis").
   * @param reasonForRejection - Why it was rejected. Supports Markdown.
   * @returns The new row's primary-key id.
   */
  logAlternative(alternative: string, reasonForRejection: string): number {
    return this.recordDecision({ alternative, reasonForRejection });
  }

  /**
   * Records the approach that was ultimately selected for implementation.
   *
   * Typically called after one or more `logAlternative` calls, once the
   * agent has made its final decision. Supports Markdown content.
   *
   * @param selection - The chosen approach (e.g. "In-memory Map with LRU eviction").
   * @returns The new row's primary-key id.
   */
  confirmSelection(selection: string): number {
    return this.recordDecision({ selection });
  }

  // ── Query methods ─────────────────────────────────────────────────────────

  /**
   * Searches the decision history for the current task using a case-insensitive
   * substring match across all text fields.
   *
   * Intended for use by subsequent agent turns to check whether a candidate
   * approach was previously considered and rejected, avoiding wasted effort.
   *
   * @param query - The search string (case-insensitive, LIKE match).
   * @returns An array of matching `DecisionLog` entries ordered by id.
   */
  searchDecisions(query: string): DecisionLog[] {
    const pattern = `%${query}%`;
    return this._stmtSearch.all(
      this.taskId,
      pattern,
      pattern,
      pattern
    ) as DecisionLog[];
  }

  /**
   * Returns all decision log entries for the current task in insertion order.
   *
   * Provides a complete audit trail of every alternative considered and the
   * final selection made during the task's execution.
   *
   * @returns An array of all `DecisionLog` entries for this task.
   */
  getTaskDecisions(): DecisionLog[] {
    return this._stmtGetAll.all(this.taskId) as DecisionLog[];
  }
}
