// @devs/mcp — MCP server entry point.
import { runShellMonitored, ResourceLimitExceededError } from './tools/run-shell-monitored.js';

export { runShellMonitored, ResourceLimitExceededError };

export const tools = {
  run_shell_monitored: async (input: { command: string }) => {
    return runShellMonitored(input.command, {});
  }
};
