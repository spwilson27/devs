/**
 * StateTransitionGuard
 *
 * Minimal guard that ensures a PRE_TOOL_EXECUTION audit entry is persisted
 * to the Flight Recorder state database before invoking a tool.
 *
 * The implementation is intentionally small and dependency-injected so tests
 * can pass mocks or the real StateRepository implementation.
 */

import type { StateRepository } from "../persistence/state_repository.js";

export type ToolFunction<T = unknown> = (...args: any[]) => Promise<T>;

export class StateTransitionGuard {
  private repo: StateRepository;

  constructor(repo: StateRepository) {
    this.repo = repo;
  }

  /**
   * Persist a PRE_TOOL_EXECUTION audit row (durable) and then invoke the tool.
   * If the DB write fails the tool is not invoked and the error is propagated.
   *
   * @param toolFn Async function implementing the tool call
   * @param toolArgs Array of arguments forwarded to the tool function
   * @param taskId Numeric task id used for the agent_logs FK
   */
  async runWithGuard<T = unknown>(
    toolFn: ToolFunction<T>,
    toolArgs: any[],
    taskId: number
  ): Promise<T> {
    // Append a PRE_TOOL_EXECUTION entry; appendAgentLog is transactional
    // and will throw on failure which prevents the tool from being executed.
    this.repo.appendAgentLog({
      task_id: taskId,
      epic_id: null,
      role: "system",
      content_type: "PRE_TOOL_EXECUTION",
      content: JSON.stringify({ timestamp: new Date().toISOString() }),
      commit_hash: null,
    } as any);

    // Only after the write has completed should the tool be invoked.
    return await toolFn(...toolArgs);
  }
}
