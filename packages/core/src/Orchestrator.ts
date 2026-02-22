/**
 * @devs/core — Orchestrator
 *
 * Minimal Orchestrator implementation providing a `rewind` method that
 * restores the filesystem to a task's commit and rolls back relational state
 * and LangGraph checkpoints to the corresponding snapshot.
 */

import type Database from "better-sqlite3";
import { createDatabase } from "./persistence/database.js";
import { GitClient } from "./git/GitClient.js";
import { TaskRepository } from "./persistence/TaskRepository.js";
import { rollbackToSnapshot } from "./persistence/RelationalRollback.js";

export interface OrchestratorOptions {
  db?: Database.Database;
  gitClient?: GitClient;
  projectPath?: string;
}

export class Orchestrator {
  private readonly db: Database.Database;
  private readonly gitClient: GitClient;

  constructor(opts?: OrchestratorOptions) {
    this.db = opts?.db ?? createDatabase({ fromDir: opts?.projectPath ?? process.cwd() });
    this.gitClient = opts?.gitClient ?? new GitClient(opts?.projectPath ?? process.cwd());
  }

  /**
   * Rewind the workspace and DB state to the snapshot associated with targetTaskId.
   *
   * Steps:
   *  1. Find the git commit hash for the task.
   *  2. Checkout the commit (force=true to discard local changes).
   *  3. Find the LangGraph checkpoint associated with the task.
   *  4. In a DB transaction: rollback relational tables and delete checkpoints newer than snapshot.
   */
  async rewind(targetTaskId: string, options?: { force?: boolean }): Promise<void> {
    const taskId = Number(targetTaskId);
    if (Number.isNaN(taskId)) throw new Error(`Invalid task id: ${targetTaskId}`);

    const taskRepo = new TaskRepository(this.db);
    const task = taskRepo.getTask(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    if (!task.git_commit_hash) throw new Error(`Task ${taskId} has no git_commit_hash`);

    const commitHash = task.git_commit_hash;

    // Resolve numeric project id for the task via epic join.
    const projRow = this.db.prepare(
      "SELECT e.project_id FROM epics e JOIN tasks t ON t.epic_id = e.id WHERE t.id = ? LIMIT 1"
    ).get(taskId) as { project_id?: number } | undefined;

    if (!projRow || projRow.project_id === undefined) {
      throw new Error(`Project not found for task ${taskId}`);
    }

    const projectId = projRow.project_id;

    // Check workspace state — disallow untracked files unless forced.
    const ws = await this.gitClient.status();
    if (!options?.force && ws.untracked.length > 0) {
      throw new Error(
        `Workspace has untracked files (${ws.untracked.length}); pass { force: true } to proceed`
      );
    }

    // Perform destructive checkout.
    await this.gitClient.checkout(commitHash, true);

    // Find the checkpoint associated with this task.
    const cpRow = this.db.prepare(
      `SELECT c.checkpoint_id, c.created_at
       FROM checkpoints c
       JOIN checkpoint_writes cw
        ON cw.thread_id = c.thread_id AND cw.checkpoint_ns = c.checkpoint_ns AND cw.checkpoint_id = c.checkpoint_id
       WHERE cw.task_id = ? AND c.thread_id = ?
       ORDER BY rowid DESC
       LIMIT 1`
    ).get(String(taskId), String(projectId)) as { checkpoint_id?: string; created_at?: string } | undefined;

    if (!cpRow || !cpRow.checkpoint_id || !cpRow.created_at) {
      throw new Error(`Checkpoint for task ${taskId} not found`);
    }

    const snapshotId = cpRow.checkpoint_id;
    const snapshotTs = cpRow.created_at;

    // Execute DB rollback and checkpoint deletion inside a single transaction for ACID guarantees.
    this.db.transaction(() => {
      // 1) Rollback relational state (agent_logs, tasks, requirements).
      rollbackToSnapshot(this.db, projectId, snapshotId);

      // 2) Delete checkpoint_writes newer than the snapshot (best-effort).
      this.db.prepare(
        "DELETE FROM checkpoint_writes WHERE thread_id = ? AND checkpoint_id IN (SELECT checkpoint_id FROM checkpoints WHERE thread_id = ? AND created_at > ?)"
      ).run(String(projectId), String(projectId), snapshotTs);

      // 3) Delete checkpoints newer than the snapshot so LangGraph state is reset.
      this.db.prepare("DELETE FROM checkpoints WHERE thread_id = ? AND created_at > ?").run(String(projectId), snapshotTs);
    })();
  }
}
