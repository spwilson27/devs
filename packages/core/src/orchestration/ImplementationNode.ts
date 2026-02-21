/**
 * @devs/core — ImplementationNode
 *
 * A LangGraph node that runs after a task completes successfully. It:
 *  1. Initializes the project git repository (idempotent).
 *  2. Creates a task-completion snapshot commit via `SnapshotManager.createTaskSnapshot`.
 *  3. Updates the active `TaskRecord.gitHash` field in the orchestrator state.
 *  4. Optionally persists the git commit hash to the `tasks` SQLite table via
 *     `TaskRepository.updateGitHash`, when `taskRepository` and `dbTaskId`
 *     are supplied in the config. [TAS-095, 9_ROADMAP-REQ-015]
 *
 * The node enforces the "Snapshot-at-Commit" strategy (TAS-054):
 *  - Only project files are staged (`.devs/` is excluded by `.gitignore`).
 *  - The commit message is always `task: complete task {taskId}`.
 *  - If the workspace is clean (no changes), the snapshot is silently skipped.
 *
 * Requirements: TAS-054, TAS-055, TAS-095, 9_ROADMAP-REQ-015
 */

import {
  SnapshotManager,
  type SnapshotContext,
} from "../git/SnapshotManager.js";
import type { GraphState, TaskRecord } from "./types.js";
import type { TaskRepository } from "../persistence/TaskRepository.js";

// ---------------------------------------------------------------------------
// ImplementationNodeConfig
// ---------------------------------------------------------------------------

/**
 * Configuration for the `ImplementationNode` factory.
 *
 * @param projectPath     - Absolute path to the generated project root.
 * @param snapshotManager - Optional injected `SnapshotManager` (used in tests).
 * @param taskRepository  - Optional `TaskRepository` for persisting the git hash
 *                          to the `tasks` table. Required together with `dbTaskId`.
 * @param dbTaskId        - Numeric primary-key id of the current task in the DB.
 *                          Required when `taskRepository` is provided.
 */
export interface ImplementationNodeConfig {
  /** Absolute path to the generated project root. */
  projectPath: string;
  /**
   * Optional `SnapshotManager` instance for dependency injection.
   * If omitted, a new instance is created from `projectPath`.
   */
  snapshotManager?: SnapshotManager;
  /**
   * Optional `TaskRepository` used to persist the git commit hash to the
   * `tasks` SQLite table after a successful snapshot. When provided,
   * `dbTaskId` must also be set.
   *
   * Requirements: [TAS-095], [9_ROADMAP-REQ-015]
   */
  taskRepository?: TaskRepository;
  /**
   * Numeric primary-key id of the active task in the `tasks` DB table.
   * Used together with `taskRepository` to call `updateGitHash(dbTaskId, hash)`.
   * Ignored when `taskRepository` is omitted.
   */
  dbTaskId?: number;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a LangGraph node function that implements the task snapshot logic.
 *
 * Usage:
 * ```ts
 * import { StateGraph, START, END } from "@langchain/langgraph";
 * import { OrchestratorAnnotation } from "@devs/core";
 * import { createImplementationNode } from "@devs/core";
 *
 * const implementationNode = createImplementationNode({
 *   projectPath: "/path/to/generated/project",
 * });
 *
 * const graph = new StateGraph(OrchestratorAnnotation)
 *   .addNode("implementation", implementationNode)
 *   .addEdge(START, "implementation")
 *   .addEdge("implementation", END)
 *   .compile();
 * ```
 *
 * @param config - Node configuration (project path + optional injected snapshot manager).
 * @returns An async LangGraph node function compatible with `StateGraph.addNode()`.
 */
export function createImplementationNode(
  config: ImplementationNodeConfig
): (state: GraphState) => Promise<Partial<GraphState>> {
  const snapshot =
    config.snapshotManager ??
    new SnapshotManager({ projectPath: config.projectPath });

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { activeTaskId, tasks } = state;

    if (!activeTaskId) {
      // No active task — nothing to snapshot.
      return {};
    }

    // Ensure the git repository and .gitignore are properly configured.
    // `initialize()` is idempotent — safe to call on every task completion.
    await snapshot.initialize();

    const context: SnapshotContext = {
      taskName: tasks.find((t) => t.taskId === activeTaskId)?.name,
    };

    const commitHash = await snapshot.createTaskSnapshot(activeTaskId, context);

    if (!commitHash) {
      // Workspace was clean — no files changed, no snapshot needed.
      return {};
    }

    // Persist the git hash to the DB when a TaskRepository + dbTaskId are supplied.
    // This records the commit SHA in `tasks.git_commit_hash` so the `devs rewind`
    // time-travel command can later look up the task for any given commit.
    // [TAS-095, 9_ROADMAP-REQ-015]
    if (config.taskRepository !== undefined && config.dbTaskId !== undefined) {
      config.taskRepository.updateGitHash(config.dbTaskId, commitHash);
    }

    // Update the active task's gitHash in the orchestrator state.
    const updatedTasks: readonly TaskRecord[] = tasks.map((task) =>
      task.taskId === activeTaskId ? { ...task, gitHash: commitHash } : task
    );

    return { tasks: updatedTasks };
  };
}
