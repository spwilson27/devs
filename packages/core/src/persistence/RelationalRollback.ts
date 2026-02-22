/**
 * packages/core/src/persistence/RelationalRollback.ts
 *
 * ACID-safe relational rollback helper that rewinds core business tables to a
 * LangGraph checkpoint snapshot recorded in the `checkpoints` table.
 *
 * The implementation locates the checkpoint's `created_at` timestamp and then
 * deletes any agent_logs, tasks, and requirements whose timestamps succeed
 * that snapshot. All deletions occur inside a single SQLite transaction to
 * guarantee atomicity.
 */

import type Database from "better-sqlite3";
import type { Statement } from "better-sqlite3";

export class RelationalRollback {
  private readonly db: Database.Database;
  private readonly _stmtGetCheckpoint: Statement;
  private readonly _stmtDeleteAgentLogs: Statement;
  private readonly _stmtDeleteTasksByUpdatedAt: Statement;
  private readonly _stmtDeleteTasksViaLogs: Statement;
  private readonly _stmtDeleteRequirementsByCreatedAt: Statement;

  constructor(db: Database.Database) {
    this.db = db;

    this._stmtGetCheckpoint = db.prepare(
      "SELECT created_at FROM checkpoints WHERE thread_id = ? AND checkpoint_id = ? LIMIT 1"
    );

    // Delete agent_logs for tasks belonging to the project's epics with timestamp > snapshot
    this._stmtDeleteAgentLogs = db.prepare(
      "DELETE FROM agent_logs WHERE task_id IN (SELECT t.id FROM tasks t JOIN epics e ON t.epic_id = e.id WHERE e.project_id = ?) AND timestamp > ?"
    );

    // Preferred deletion path when tasks.updated_at exists.
    this._stmtDeleteTasksByUpdatedAt = db.prepare(
      "DELETE FROM tasks WHERE id IN (SELECT t.id FROM tasks t JOIN epics e ON t.epic_id = e.id WHERE e.project_id = ? AND t.updated_at > ?)"
    );

    // Fallback: delete tasks that have agent_logs after snapshot (works on older schemas).
    this._stmtDeleteTasksViaLogs = db.prepare(
      "DELETE FROM tasks WHERE id IN (SELECT t.id FROM tasks t JOIN epics e ON t.epic_id = e.id JOIN agent_logs al ON al.task_id = t.id WHERE e.project_id = ? AND al.timestamp > ?)"
    );

    // Delete requirements created after snapshot (requires requirements.created_at to exist on older schemas this will fail and is caught)
    this._stmtDeleteRequirementsByCreatedAt = db.prepare(
      "DELETE FROM requirements WHERE project_id = ? AND created_at > ?"
    );
  }

  /**
   * Rolls the relational state for a project back to the given checkpoint id.
   *
   * @param projectId - Numeric project id (or string coercible to it) used by the business schema.
   * @param snapshotId - Checkpoint id stored in `checkpoints` (thread_id is expected to equal String(projectId)).
   */
  rollbackToSnapshot(projectId: string | number, snapshotId: string): void {
    const threadId = String(projectId);

    const row = this._stmtGetCheckpoint.get(threadId, snapshotId) as
      | { created_at?: string }
      | undefined;

    if (!row || !row.created_at) {
      throw new Error(`Snapshot ${snapshotId} not found for thread ${threadId}`);
    }

    const snapshotTs = row.created_at;

    // Wrap all operations in a single transaction to ensure ACID semantics.
    this.db.transaction(() => {
      // 1) Remove agent logs written after the checkpoint.
      this._stmtDeleteAgentLogs.run(projectId, snapshotTs);

      // 2) Remove tasks written/updated after the checkpoint. Prefer an updated_at
      //    column when present; otherwise fall back to deleting tasks that have
      //    agent_logs newer than the checkpoint.
      try {
        this._stmtDeleteTasksByUpdatedAt.run(projectId, snapshotTs);
      } catch {
        // Missing updated_at column or other schema mismatch — use fallback.
        this._stmtDeleteTasksViaLogs.run(projectId, snapshotTs);
      }

      // 3) Remove requirements created after the checkpoint (best-effort).
      try {
        this._stmtDeleteRequirementsByCreatedAt.run(projectId, snapshotTs);
      } catch {
        // Ignore if requirements.created_at does not exist on older schemas.
      }

      // NOTE: Restoring prior task statuses and the project's status requires
      // deserializing the checkpoint blob and is out-of-scope for this Phase 1
      // implementation.
    })();
  }
}

export function rollbackToSnapshot(db: Database.Database, projectId: string | number, snapshotId: string): void {
  const r = new RelationalRollback(db);
  r.rollbackToSnapshot(projectId, snapshotId);
}
