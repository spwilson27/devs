# PreflightService

Purpose: Inject a host project snapshot, task manifest, and MCP configuration into a sandbox workspace prior to executing an assigned task.

Sequence:
1. injectCodebase — sync host project into sandbox /workspace, excluding .git/ and .devs/
2. injectTaskRequirements — write task manifest JSON to /workspace/.devs/task.json
3. injectMcpTools — write MCP server configuration to /workspace/.devs/mcp_config.json

Constants used (SANDBOX_PATHS):
- workspace: /workspace
- devsDir: /workspace/.devs
- taskManifest: /workspace/.devs/task.json
- mcpConfig: /workspace/.devs/mcp_config.json

Error contract (PreflightError):
- Extends Error and carries typed properties `sandboxId: string` and `step: string` to indicate which sandbox and which injection step failed.
