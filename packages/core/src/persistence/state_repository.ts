/**
 * @devs/core persistence/state_repository.ts
 *
 * Repository pattern for reading and writing all core Flight Recorder entities
 * to the SQLite state store.
 *
 * The StateRepository is the single authoritative interface for persisting
 * agent state. ALL write operations are wrapped in better-sqlite3 transactions
 * to guarantee ACID semantics: either the entire operation commits or nothing
 * does. A public `transaction<T>()` method allows callers to compose multiple
 * writes into a single atomic unit.
 *
 * Entity hierarchy (mirrors the DB schema):
 *   Project → Document / Requirement / Epic → Task → AgentLog / EntropyEvent
 *
 * Query methods support state recovery after an interrupted run and provide
 * the audit trail required by the loop-detection subsystem.
 *
 * Design notes:
 * - `transaction<T>(cb)` wraps `cb` in `db.transaction(cb)()`. When nested,
 *   better-sqlite3 automatically uses SQLite SAVEPOINTs so the outer
 *   transaction always wins: an inner failure only rolls back its savepoint
 *   without touching the outer transaction.
 * - `transactionAsync<T>(cb)` provides async-safe transaction management via
 *   explicit SQLite SAVEPOINT commands. This allows async operations (e.g.,
 *   git commits) to be included in a single atomic unit alongside synchronous
 *   DB writes. Any exception from `cb` — including async failures — triggers
 *   a ROLLBACK TO SAVEPOINT before the error is re-thrown. [8_RISKS-REQ-041]
 * - Every write method calls `this.transaction()` internally, so individual
 *   method calls are always atomic and callers can compose them into larger
 *   atomic units without any extra ceremony.
 * - No raw `stmt.run()` call outside of `this.transaction()` exists in this
 *   module — this is the "no non-transactional writes" invariant.
 *
 * Requirements: 2_TAS-REQ-017, TAS-105 through TAS-111,
 *               [TAS-067], [8_RISKS-REQ-115], [3_MCP-REQ-REL-004],
 *               [8_RISKS-REQ-041], [8_RISKS-REQ-094]
 */

import type Database from "better-sqlite3";
import type { Statement } from "better-sqlite3";

// ── Entity types ──────────────────────────────────────────────────────────────

/** Top-level project entity. [TAS-105] */
export interface Project {
  /** Omit when inserting; provide when updating. */
  id?: number;
  name: string;
  /** Defaults to 'pending' on insert. */
  status?: string;
  current_phase?: string | null;
  /** JSON-serialised arbitrary metadata. */
  metadata?: string | null;
}

/** A versioned document (PRD, TAS, etc.) attached to a project. [TAS-106] */
export interface Document {
  id?: number;
  project_id: number;
  name: string;
  content?: string | null;
  /** Defaults to 1 on insert. */
  version?: number;
  /** Defaults to 'draft' on insert. */
  status?: string;
}

/** An atomic requirement distilled from project documents. [TAS-107] */
export interface Requirement {
  id?: number;
  project_id: number;
  description: string;
  /** Defaults to 'medium' on insert. */
  priority?: string;
  /** Defaults to 'pending' on insert. */
  status?: string;
  metadata?: string | null;
}

/** An ordered high-level phase (epic) within a project. [TAS-108] */
export interface Epic {
  id?: number;
  project_id: number;
  name: string;
  /** Defaults to 0 on insert. */
  order_index?: number;
  /** Defaults to 'pending' on insert. */
  status?: string;
}

/** An atomic implementation task within an epic. [TAS-109] */
export interface Task {
  id?: number;
  epic_id: number;
  title: string;
  description?: string | null;
  /** Defaults to 'pending' on insert. */
  status?: string;
  /** SHA of the git commit that implements this task, once completed. */
  git_commit_hash?: string | null;
}

/**
 * One agent interaction step recorded in the Glass-Box audit trail. [TAS-110, TAS-046]
 *
 * The `content` field is a JSON blob that can represent any interaction type
 * (thought, tool invocation, tool result, observation) without requiring
 * schema changes. `content_type` is the discriminator that tells consumers
 * how to parse `content`.
 *
 * Supported content_type values: 'THOUGHT', 'ACTION', 'OBSERVATION'
 */
export interface AgentLog {
  id?: number;
  task_id: number;
  /** Optional direct FK to the parent epic for efficient epic-scoped queries. */
  epic_id?: number | null;
  /** ISO-8601 timestamp; auto-populated by the DB default when omitted. */
  timestamp?: string;
  /** Agent persona (e.g., 'researcher', 'developer', 'reviewer'). */
  role: string;
  /** Interaction type discriminator: 'THOUGHT' | 'ACTION' | 'OBSERVATION'. */
  content_type: string;
  /** JSON blob containing the interaction payload (thought text, tool call, result, etc.). */
  content: string;
  /** Optional git commit SHA linking the log entry to the current repository state. */
  commit_hash?: string | null;
}

/** A repeating failure record used by the loop-prevention subsystem. [TAS-111] */
export interface EntropyEvent {
  id?: number;
  task_id: number;
  /**
   * Rolling SHA-256 of the last N error outputs. When this value stabilises
   * across successive events the system detects an entropy loop.
   */
  hash_chain: string;
  error_output?: string | null;
  /** ISO-8601 timestamp; auto-populated by the DB default when omitted. */
  timestamp?: string;
}

/** Snapshot of all state for a project, used for state recovery. */
export interface ProjectState {
  project: Project & { id: number };
  requirements: Requirement[];
  epics: Epic[];
  tasks: Task[];
  agent_logs: AgentLog[];
}

// ── StateRepository ───────────────────────────────────────────────────────────

/**
 * Repository for reading and writing all core Flight Recorder entities.
 *
 * Construct with an open, schema-initialised `Database.Database` instance.
 * The database must have `foreign_keys = ON` (set by `createDatabase()`).
 *
 * Prepared statements are compiled once in the constructor and reused on
 * every method call, avoiding per-call parse overhead.
 *
 * ALL write methods wrap their statements inside `this.transaction()` so
 * that no raw, non-transactional writes can occur. [TAS-067]
 *
 * Use `transaction<T>(cb)` to compose multiple write methods into a single
 * atomic operation. Nested calls automatically use SQLite SAVEPOINTs.
 */
export class StateRepository {
  private readonly db: Database.Database;

  // ── Prepared statements (compiled once, reused on every call) ─────────────

  // Write statements
  private readonly _stmtUpsertProject: Statement;
  private readonly _stmtInsertProject: Statement;
  private readonly _stmtInsertDocument: Statement;
  private readonly _stmtInsertRequirement: Statement;
  private readonly _stmtInsertEpic: Statement;
  private readonly _stmtInsertTask: Statement;
  private readonly _stmtUpdateTaskStatus: Statement;
  private readonly _stmtUpdateTaskGitHash: Statement;
  private readonly _stmtInsertAgentLog: Statement;
  private readonly _stmtInsertEntropyEvent: Statement;

  // Query statements
  private readonly _stmtGetProject: Statement;
  private readonly _stmtGetRequirements: Statement;
  private readonly _stmtGetEpics: Statement;
  private readonly _stmtGetTasks: Statement;
  private readonly _stmtGetAgentLogs: Statement;
  private readonly _stmtGetTaskLogs: Statement;

  constructor(db: Database.Database) {
    this.db = db;

    // Upsert for projects with an existing id: in-place update (no cascade delete).
    // Using INSERT INTO ... ON CONFLICT(id) DO UPDATE SET avoids the DELETE+re-INSERT
    // that INSERT OR REPLACE would perform, which would cascade-delete child rows.
    this._stmtUpsertProject = db.prepare(`
      INSERT INTO projects (id, name, status, current_phase, metadata)
      VALUES (@id, @name, @status, @current_phase, @metadata)
      ON CONFLICT(id) DO UPDATE SET
        name          = excluded.name,
        status        = excluded.status,
        current_phase = excluded.current_phase,
        metadata      = excluded.metadata
    `);

    // Insert for new projects (id not known yet — let AUTOINCREMENT assign it).
    this._stmtInsertProject = db.prepare(`
      INSERT INTO projects (name, status, current_phase, metadata)
      VALUES (@name, @status, @current_phase, @metadata)
    `);

    this._stmtInsertDocument = db.prepare(`
      INSERT INTO documents (project_id, name, content, version, status)
      VALUES (@project_id, @name, @content, @version, @status)
    `);

    this._stmtInsertRequirement = db.prepare(`
      INSERT INTO requirements (project_id, description, priority, status, metadata)
      VALUES (@project_id, @description, @priority, @status, @metadata)
    `);

    this._stmtInsertEpic = db.prepare(`
      INSERT INTO epics (project_id, name, order_index, status)
      VALUES (@project_id, @name, @order_index, @status)
    `);

    this._stmtInsertTask = db.prepare(`
      INSERT INTO tasks (epic_id, title, description, status, git_commit_hash)
      VALUES (@epic_id, @title, @description, @status, @git_commit_hash)
    `);

    // Status update for a single task — used by the orchestrator to transition
    // task lifecycle states (pending → in_progress → completed / failed).
    this._stmtUpdateTaskStatus = db.prepare(
      "UPDATE tasks SET status = ? WHERE id = ?"
    );

    // Git commit hash update — records the SHA of the commit that implements
    // this task once the Git-Atomic transaction succeeds. [8_RISKS-REQ-041]
    this._stmtUpdateTaskGitHash = db.prepare(
      "UPDATE tasks SET git_commit_hash = ? WHERE id = ?"
    );

    this._stmtInsertAgentLog = db.prepare(`
      INSERT INTO agent_logs (task_id, epic_id, role, content_type, content, commit_hash)
      VALUES (@task_id, @epic_id, @role, @content_type, @content, @commit_hash)
    `);

    this._stmtInsertEntropyEvent = db.prepare(`
      INSERT INTO entropy_events (task_id, hash_chain, error_output)
      VALUES (@task_id, @hash_chain, @error_output)
    `);

    this._stmtGetProject = db.prepare(
      "SELECT * FROM projects WHERE id = ?"
    );

    this._stmtGetRequirements = db.prepare(
      "SELECT * FROM requirements WHERE project_id = ? ORDER BY id"
    );

    this._stmtGetEpics = db.prepare(
      "SELECT * FROM epics WHERE project_id = ? ORDER BY order_index, id"
    );

    // Tasks are scoped to a project by joining through epics.
    this._stmtGetTasks = db.prepare(`
      SELECT t.*
      FROM tasks t
      JOIN epics e ON t.epic_id = e.id
      WHERE e.project_id = ?
      ORDER BY t.id
    `);

    // Agent logs are scoped to a project by joining through tasks → epics.
    this._stmtGetAgentLogs = db.prepare(`
      SELECT al.*
      FROM agent_logs al
      JOIN tasks t  ON al.task_id = t.id
      JOIN epics e  ON t.epic_id  = e.id
      WHERE e.project_id = ?
      ORDER BY al.id
    `);

    this._stmtGetTaskLogs = db.prepare(
      "SELECT * FROM agent_logs WHERE task_id = ? ORDER BY id"
    );
  }

  // ── Transaction manager ───────────────────────────────────────────────────

  /**
   * Wraps a callback in a SQLite transaction.
   *
   * On success the transaction is committed and the callback's return value is
   * returned. On any thrown exception the transaction is automatically rolled
   * back and the exception is re-thrown — no partial data is ever committed.
   *
   * When `transaction()` is called while another `transaction()` is already
   * active on this connection, better-sqlite3 automatically demotes the inner
   * call to a SAVEPOINT. The inner savepoint can be rolled back independently
   * without affecting the outer transaction. [TAS-067, 8_RISKS-REQ-115]
   *
   * @param cb - The callback containing one or more write operations.
   * @returns The value returned by `cb`.
   */
  transaction<T>(cb: () => T): T {
    return this.db.transaction(cb)();
  }

  /**
   * Wraps an async callback in a SQLite SAVEPOINT, enabling async operations
   * (such as git commits) to be included in a single atomic database unit.
   *
   * On success the SAVEPOINT is RELEASED (committed into the enclosing
   * transaction or the implicit outer transaction). On any exception — whether
   * synchronous or asynchronous — the SAVEPOINT is rolled back and then
   * released, and the exception is re-thrown.
   *
   * Why SAVEPOINT instead of BEGIN:
   *  - SAVEPOINT is nesting-safe: when called inside an active `transaction()`
   *    it creates a nested savepoint rather than conflicting with the outer
   *    BEGIN. At the top level, SQLite promotes a SAVEPOINT to a full
   *    transaction (autocommit disabled until RELEASE).
   *  - SQLite's `sqlite3_get_autocommit()` — used by better-sqlite3's
   *    `db.inTransaction` getter — returns 0 while a SAVEPOINT is active, so
   *    any inner `db.transaction(cb)()` calls will correctly detect the open
   *    transaction and use nested SAVEPOINTs.
   *  - Rolling back the outer SAVEPOINT also rolls back any changes made by
   *    inner savepoints that have already been RELEASEd, preserving full
   *    atomicity across the async boundary.
   *
   * Concurrency note: this method must NOT be called concurrently on the same
   * connection. Node.js is single-threaded and better-sqlite3 is synchronous,
   * so concurrent calls on the same DB connection are not possible in normal
   * usage. However, reentrant calls (calling transactionAsync from within an
   * async callback that is already inside a transactionAsync) ARE safe because
   * they nest as inner SAVEPOINTs.
   *
   * @param cb - The async callback containing write operations.
   * @returns The value returned by `cb`.
   *
   * Requirements: [8_RISKS-REQ-041], [8_RISKS-REQ-094]
   */
  async transactionAsync<T>(cb: () => Promise<T>): Promise<T> {
    const name = `sp_async_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.db.exec(`SAVEPOINT "${name}"`);
    try {
      const result = await cb();
      this.db.exec(`RELEASE "${name}"`);
      return result;
    } catch (err) {
      this.db.exec(`ROLLBACK TO SAVEPOINT "${name}"`);
      this.db.exec(`RELEASE "${name}"`);
      throw err;
    }
  }

  // ── Write methods ─────────────────────────────────────────────────────────

  /**
   * Inserts a new project or updates an existing one.
   *
   * - When `project.id` is omitted: performs a plain INSERT and returns the
   *   auto-assigned id.
   * - When `project.id` is provided: performs an `ON CONFLICT DO UPDATE` so
   *   child rows (documents, requirements, epics…) are preserved.
   *
   * @returns The project's primary-key id.
   */
  upsertProject(project: Project): number {
    return this.transaction(() => {
      if (project.id !== undefined) {
        this._stmtUpsertProject.run({
          id: project.id,
          name: project.name,
          status: project.status ?? "pending",
          current_phase: project.current_phase ?? null,
          metadata: project.metadata ?? null,
        });
        return project.id;
      }

      const result = this._stmtInsertProject.run({
        name: project.name,
        status: project.status ?? "pending",
        current_phase: project.current_phase ?? null,
        metadata: project.metadata ?? null,
      });
      return Number(result.lastInsertRowid);
    });
  }

  /**
   * Inserts a document attached to an existing project.
   *
   * @returns The new document's primary-key id.
   */
  addDocument(doc: Document): number {
    return this.transaction(() => {
      const result = this._stmtInsertDocument.run({
        project_id: doc.project_id,
        name: doc.name,
        content: doc.content ?? null,
        version: doc.version ?? 1,
        status: doc.status ?? "draft",
      });
      return Number(result.lastInsertRowid);
    });
  }

  /**
   * Bulk-inserts an array of requirements inside a single transaction.
   *
   * If any row fails (e.g. FK violation), the entire batch is rolled back
   * and the originating error is re-thrown. [2_TAS-REQ-017]
   */
  saveRequirements(reqs: Requirement[]): void {
    this.transaction(() => {
      for (const req of reqs) {
        this._stmtInsertRequirement.run({
          project_id: req.project_id,
          description: req.description,
          priority: req.priority ?? "medium",
          status: req.status ?? "pending",
          metadata: req.metadata ?? null,
        });
      }
    });
  }

  /**
   * Bulk-inserts an array of epics inside a single transaction.
   *
   * If any row fails, the entire batch is rolled back. [2_TAS-REQ-017]
   */
  saveEpics(epics: Epic[]): void {
    this.transaction(() => {
      for (const epic of epics) {
        this._stmtInsertEpic.run({
          project_id: epic.project_id,
          name: epic.name,
          order_index: epic.order_index ?? 0,
          status: epic.status ?? "pending",
        });
      }
    });
  }

  /**
   * Bulk-inserts an array of tasks inside a single transaction.
   *
   * If any row fails, the entire batch is rolled back. [2_TAS-REQ-017]
   */
  saveTasks(tasks: Task[]): void {
    this.transaction(() => {
      for (const task of tasks) {
        this._stmtInsertTask.run({
          epic_id: task.epic_id,
          title: task.title,
          description: task.description ?? null,
          status: task.status ?? "pending",
          git_commit_hash: task.git_commit_hash ?? null,
        });
      }
    });
  }

  /**
   * Updates the `status` field of a single task.
   *
   * Used by the orchestrator to transition task lifecycle states:
   * `pending → in_progress → completed | failed`.
   *
   * The update is wrapped in `this.transaction()`, so it participates in any
   * outer transaction the caller has opened (e.g. composing a task-start event
   * with an agent log in one atomic write). [TAS-067]
   *
   * @param taskId - The task's primary-key id.
   * @param status - The new status string.
   */
  updateTaskStatus(taskId: number, status: string): void {
    this.transaction(() => {
      this._stmtUpdateTaskStatus.run(status, taskId);
    });
  }

  /**
   * Records the git commit SHA that implements this task.
   *
   * Called by `GitAtomicManager.commitTaskChange()` after a successful git
   * commit, inside the same `transactionAsync()` block that updated the task
   * status. This guarantees that the `git_commit_hash` column is never
   * populated unless both the status update AND the git commit succeeded.
   *
   * @param taskId - The task's primary-key id.
   * @param hash   - The full SHA-1 hash of the git commit.
   *
   * Requirements: [8_RISKS-REQ-041]
   */
  updateTaskGitCommitHash(taskId: number, hash: string): void {
    this.transaction(() => {
      this._stmtUpdateTaskGitHash.run(hash, taskId);
    });
  }

  /**
   * Appends a single agent interaction log entry for a task.
   *
   * The `content` field is a JSON blob (serialize with `JSON.stringify()`).
   * `content_type` is the discriminator: 'THOUGHT' | 'ACTION' | 'OBSERVATION'.
   * `epic_id` and `commit_hash` are optional; pass `null` or omit them.
   *
   * @returns The new log entry's primary-key id.
   */
  appendAgentLog(log: AgentLog): number {
    return this.transaction(() => {
      const result = this._stmtInsertAgentLog.run({
        task_id: log.task_id,
        epic_id: log.epic_id ?? null,
        role: log.role,
        content_type: log.content_type,
        content: log.content,
        commit_hash: log.commit_hash ?? null,
      });
      return Number(result.lastInsertRowid);
    });
  }

  /**
   * Records a single entropy event for a task.
   *
   * @returns The new entropy event's primary-key id.
   */
  recordEntropyEvent(event: EntropyEvent): number {
    return this.transaction(() => {
      const result = this._stmtInsertEntropyEvent.run({
        task_id: event.task_id,
        hash_chain: event.hash_chain,
        error_output: event.error_output ?? null,
      });
      return Number(result.lastInsertRowid);
    });
  }

  // ── Query methods ─────────────────────────────────────────────────────────

  /**
   * Retrieves the complete state snapshot for a project, including all
   * requirements, epics, tasks, and agent logs associated with that project.
   *
   * Intended for state recovery after an interrupted orchestration run.
   *
   * @param id - The project's primary-key id.
   * @returns The full `ProjectState`, or `null` if no project with that id exists.
   */
  getProjectState(id: number): ProjectState | null {
    const project = this._stmtGetProject.get(id) as
      | (Project & { id: number })
      | undefined;

    if (project === undefined) {
      return null;
    }

    const requirements = this._stmtGetRequirements.all(id) as Requirement[];
    const epics = this._stmtGetEpics.all(id) as Epic[];
    const tasks = this._stmtGetTasks.all(id) as Task[];
    const agent_logs = this._stmtGetAgentLogs.all(id) as AgentLog[];

    return { project, requirements, epics, tasks, agent_logs };
  }

  /**
   * Reloads the project context from persistent state.
   *
   * This is a thin wrapper around `getProjectState` provided for consumers
   * that expect a `reloadProjectContext(projectId)` API. It returns the same
   * `ProjectState` structure used by the rest of the persistence layer.
   *
   * @param projectId - The project's primary-key id.
   */
  reloadProjectContext(projectId: number): ProjectState | null {
    return this.getProjectState(projectId);
  }

  /**
   * Retrieves all agent log entries for a specific task, ordered by insertion
   * time (ascending id) so the thought→action→observation chain can be replayed.
   *
   * @param taskId - The task's primary-key id.
   * @returns An array of `AgentLog` entries (may be empty).
   */
  getTaskLogs(taskId: number): AgentLog[] {
    return this._stmtGetTaskLogs.all(taskId) as AgentLog[];
  }
}
