/**
 * @devs/core — ImplementationNode
 *
 * A LangGraph node that runs after a task completes successfully. It:
 *  1. Initializes the project git repository (idempotent).
 *  2. Creates a task-completion snapshot commit via `SnapshotManager.createTaskSnapshot`.
 *  3. Updates the active `TaskRecord.gitHash` field in the orchestrator state.
 *
 * The node enforces the "Snapshot-at-Commit" strategy (TAS-054):
 *  - Only project files are staged (`.devs/` is excluded by `.gitignore`).
 *  - The commit message is always `task: complete task {taskId}`.
 *  - If the workspace is clean (no changes), the snapshot is silently skipped.
 *
 * Requirements: TAS-054, TAS-055
 */

import {
  SnapshotManager,
  type SnapshotContext,
} from "../git/SnapshotManager.js";
import type { GraphState, TaskRecord } from "./types.js";

// ---------------------------------------------------------------------------
// ImplementationNodeConfig
// ---------------------------------------------------------------------------

/**
 * Configuration for the `ImplementationNode` factory.
 *
 * @param projectPath    - Absolute path to the generated project root.
 * @param snapshotManager - Optional injected `SnapshotManager` (used in tests).
 */
export interface ImplementationNodeConfig {
  /** Absolute path to the generated project root. */
  projectPath: string;
  /**
   * Optional `SnapshotManager` instance for dependency injection.
   * If omitted, a new instance is created from `projectPath`.
   */
  snapshotManager?: SnapshotManager;
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

    // Update the active task's gitHash in the orchestrator state.
    const updatedTasks: readonly TaskRecord[] = tasks.map((task) =>
      task.taskId === activeTaskId ? { ...task, gitHash: commitHash } : task
    );

    return { tasks: updatedTasks };
  };
}
