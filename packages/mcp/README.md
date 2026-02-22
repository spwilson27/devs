# @devs/mcp

MCP server tools for debugging and profiling.

## run_shell_monitored

Input schema: { command: string }

Kill conditions:
- RSS > 4 GiB
- CPU ≥ 100% sustained for 10s

On kill, tool throws ResourceLimitExceededError with fields: pid, reason, value, limit.
