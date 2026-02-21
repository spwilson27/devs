/**
 * @devs/core — ImplementationNode
 *
 * A LangGraph node that runs after a task completes successfully. It:
 *  1. Initializes the project git repository (idempotent).
 *  2. Runs pre-snapshot integrity checks via `GitIntegrityChecker` (if provided):
 *     a. Dirty workspace detection — any uncommitted changes that pre-date the
 *        current task would corrupt the snapshot history.
 *     b. HEAD reachability — detached HEAD or missing HEAD prevents commits.
 *     c. Object-store integrity — lightweight fsck before every snapshot.
 *     If any check fails, the node returns `status: "security_pause"` in the
 *     partial state and DOES NOT create a snapshot.
 *  3. Creates a task-completion snapshot commit via `SnapshotManager.createTaskSnapshot`.
 *  4. Updates the active `TaskRecord.gitHash` field in the orchestrator state.
 *  5. Optionally persists the git commit hash to the `tasks` SQLite table via
 *     `TaskRepository.updateGitHash`, when `taskRepository` and `dbTaskId`
 *     are supplied in the config. [TAS-095, 9_ROADMAP-REQ-015]
 *
 * The node enforces the "Snapshot-at-Commit" strategy (TAS-054):
 *  - Only project files are staged (`.devs/` is excluded by `.gitignore`).
 *  - The commit message is always `task: complete task {taskId}`.
 *  - If the workspace is clean (no changes), the snapshot is silently skipped.
 *
 * Requirements: TAS-054, TAS-055, TAS-095, 9_ROADMAP-REQ-015, 8_RISKS-REQ-127
 */

import {
  SnapshotManager,
  type SnapshotContext,
} from "../git/SnapshotManager.js";
import {
  GitIntegrityChecker,
  GitIntegrityViolationError,
} from "../git/GitIntegrityChecker.js";
import type { GraphState, TaskRecord, ProjectStatus } from "./types.js";
import type { TaskRepository } from "../persistence/TaskRepository.js";

// ---------------------------------------------------------------------------
// ImplementationNodeConfig
// ---------------------------------------------------------------------------

/**
 * Configuration for the `ImplementationNode` factory.
 *
 * @param projectPath      - Absolute path to the generated project root.
 * @param snapshotManager  - Optional injected `SnapshotManager` (used in tests).
 * @param integrityChecker - Optional injected `GitIntegrityChecker` (used in tests).
 *                           When omitted, integrity checks are skipped. Pass a real
 *                           `GitIntegrityChecker` instance in production to enable
 *                           pre-snapshot workspace and object-store verification.
 * @param taskRepository   - Optional `TaskRepository` for persisting the git hash
 *                           to the `tasks` table. Required together with `dbTaskId`.
 * @param dbTaskId         - Numeric primary-key id of the current task in the DB.
 *                           Required when `taskRepository` is provided.
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
   * Optional `GitIntegrityChecker` instance for dependency injection.
   * When provided, workspace integrity and object-store checks are run
   * before every snapshot. When omitted, all integrity checks are skipped
   * (useful in tests that only exercise snapshot logic).
   */
  integrityChecker?: GitIntegrityChecker;
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
 * Creates a LangGraph node function that implements the task snapshot logic
 * with optional pre-snapshot integrity checks.
 *
 * ## Integrity check integration (8_RISKS-REQ-127)
 *
 * When `integrityChecker` is provided, the node runs two integrity phases:
 *
 * **Pre-snapshot** (before creating the commit):
 *  1. `verifyWorkspace()` — dirty detection + HEAD reachability.
 *  2. `checkObjectStoreIntegrity()` — lightweight git fsck.
 * If either check fails, the node returns `{ status: "security_pause", projectConfig: { ...projectConfig, status: "security_pause" } }`
 * and NO snapshot is created. The caller (orchestrator graph) must detect this
 * status and pause the implementation cycle until the user resolves the issue.
 *
 * Usage:
 * ```ts
 * import { StateGraph, START, END } from "@langchain/langgraph";
 * import { OrchestratorAnnotation, GitIntegrityChecker } from "@devs/core";
 * import { createImplementationNode } from "@devs/core";
 *
 * const implementationNode = createImplementationNode({
 *   projectPath: "/path/to/generated/project",
 *   integrityChecker: new GitIntegrityChecker(),
 * });
 *
 * const graph = new StateGraph(OrchestratorAnnotation)
 *   .addNode("implementation", implementationNode)
 *   .addEdge(START, "implementation")
 *   .addEdge("implementation", END)
 *   .compile();
 * ```
 *
 * @param config - Node configuration (project path + optional injected dependencies).
 * @returns An async LangGraph node function compatible with `StateGraph.addNode()`.
 */
export function createImplementationNode(
  config: ImplementationNodeConfig
): (state: GraphState) => Promise<Partial<GraphState>> {
  const snapshot =
    config.snapshotManager ??
    new SnapshotManager({ projectPath: config.projectPath });

  const integrityChecker = config.integrityChecker;

  return async (state: GraphState): Promise<Partial<GraphState>> => {
    const { activeTaskId, tasks, projectConfig } = state;

    if (!activeTaskId) {
      // No active task — nothing to snapshot.
      return {};
    }

    // Ensure the git repository and .gitignore are properly configured.
    // `initialize()` is idempotent — safe to call on every task completion.
    await snapshot.initialize();

    // ── Pre-snapshot integrity checks (8_RISKS-REQ-127) ───────────────────
    if (integrityChecker !== undefined) {
      // 1. Workspace verification: dirty detection + HEAD reachability
      const workspaceResult = await integrityChecker.verifyWorkspace(
        config.projectPath
      );
      if (!workspaceResult.passed) {
        // Abort snapshot — signal orchestrator to pause for remediation.
        // Update both the top-level status field and the embedded projectConfig status
        // so that all graph consumers see the security pause consistently.
        const securityPauseStatus: ProjectStatus = "security_pause";
        return {
          status: securityPauseStatus,
          projectConfig: { ...projectConfig, status: securityPauseStatus },
        };
      }

      // 2. Object-store integrity: lightweight fsck before snapshot
      const objectStoreResult = await integrityChecker.checkObjectStoreIntegrity(
        config.projectPath
      );
      if (!objectStoreResult.passed) {
        // Abort snapshot — object store corruption detected
        const securityPauseStatus: ProjectStatus = "security_pause";
        return {
          status: securityPauseStatus,
          projectConfig: { ...projectConfig, status: securityPauseStatus },
        };
      }
    }

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

// Re-export for consumers that want to throw on violations programmatically.
export { GitIntegrityViolationError };
