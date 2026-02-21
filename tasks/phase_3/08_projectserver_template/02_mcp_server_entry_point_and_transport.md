# Task: Implement the MCP Server Entry Point and Transport Layer for Generated Projects (Sub-Epic: 08_ProjectServer Template)

## Covered Requirements
- [3_MCP-TAS-043], [TAS-043], [3_MCP-TAS-003], [4_USER_FEATURES-REQ-012]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/templates/__tests__/projectServerEntry.test.ts`, write tests for the generated `src/index.ts` entry point that will be scaffolded into generated projects:
  - Copy the generated `src/index.ts` template into a temp directory, install dependencies with `npm install`, compile with `tsc`, then spawn the resulting `dist/index.js` process with the MCP STDIO transport.
  - Send a raw MCP `initialize` JSON-RPC request over stdin and assert that a valid `InitializeResult` response arrives on stdout within 2 seconds.
  - Send a `tools/list` JSON-RPC request and assert the response contains an array (initially empty, but well-formed as `{ tools: [] }`).
  - Assert that the process exits cleanly (code `0`) when stdin is closed.
- [ ] In `packages/devs-core/src/templates/__tests__/mcpNativeIntegration.test.ts`, write an integration test verifying that the MCP server template satisfies [3_MCP-TAS-003]:
  - Assert the server advertises a `serverInfo` object with `name` equal to `"project-mcp-server"` and a valid semver `version` in the `initialize` response.
  - Assert the `capabilities` field in the `initialize` response declares `{ tools: {} }` (tools capability enabled).

## 2. Task Implementation
- [ ] Update the `src/index.ts` template string inside `ProjectServerTemplateScaffolder` (created in task 01) to generate a fully functional MCP server entry point:
  ```typescript
  // Generated file – do not edit manually. Managed by devs ProjectServerTemplate.
  import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
  import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
  import { registerAllTools } from "./tools/index.js";

  async function main(): Promise<void> {
    const server = new McpServer({
      name: "project-mcp-server",
      version: "0.1.0",
    });

    registerAllTools(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
  }

  main().catch((err) => {
    console.error("ProjectServer fatal error:", err);
    process.exit(1);
  });
  ```
- [ ] Update the `src/tools/index.ts` template to export a `registerAllTools(server: McpServer): void` function (empty body initially—populated by downstream tasks 03):
  ```typescript
  import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

  export function registerAllTools(server: McpServer): void {
    // Tools are registered here by downstream task implementations.
    void server;
  }
  ```
- [ ] Ensure `ProjectServerTemplateScaffolder.scaffold()` writes both updated template strings when generating a new project's `mcp-server/` directory.
- [ ] Add a `"lint": "tsc --noEmit"` script to the generated `package.json` so downstream CI can validate the generated TypeScript without building artifacts.
- [ ] The generated server MUST bind only to the STDIO transport (per [5_SECURITY_DESIGN-REQ-SEC-SD-033] localhost MCP security). Do NOT include any HTTP or WebSocket listener in the template entry point.

## 3. Code Review
- [ ] Verify the template's `import` statements use the `.js` extension (ESM Node20 `NodeNext` module resolution requirement).
- [ ] Confirm there is NO hardcoded port number, hostname, or API key anywhere in the generated template files.
- [ ] Verify the `McpServer` constructor receives both `name` and `version` (required by the MCP SDK `InitializeResult` schema).
- [ ] Confirm the `main()` function is wrapped in a top-level `catch` that writes to `stderr` and calls `process.exit(1)`—preventing silent failures in sandbox runs.
- [ ] Verify `registerAllTools` is called before `server.connect(transport)` so tools are registered before the first client handshake.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="projectServerEntry|mcpNativeIntegration"` and confirm all tests pass (exit code `0`).
- [ ] Run the STDIO handshake smoke test directly:
  ```bash
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}' \
    | node /tmp/mcp-scaffold-verify/mcp-server/dist/index.js
  ```
  Assert the output contains `"result"` and `"serverInfo"`.

## 5. Update Documentation
- [ ] Update `.agent/index.agent.md` in the generated `mcp-server/` template to document the entry-point lifecycle: how the server starts, what transport it uses, and how `registerAllTools` is the extension point.
- [ ] Add a section `### MCP Entry Point` to `docs/architecture/templates.md` explaining the STDIO transport choice, the `McpServer` configuration, and the `registerAllTools` pattern.

## 6. Automated Verification
- [ ] Run the end-to-end MCP handshake as a CI step (can be added to `packages/devs-core/package.json` as `"test:mcp-smoke": "..."`):
  ```bash
  node -e "
    const { spawn } = require('child_process');
    const proc = spawn('node', ['/tmp/mcp-scaffold-verify/mcp-server/dist/index.js']);
    const req = JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'ci',version:'0.0.1'}}});
    proc.stdin.write(req + '\n');
    proc.stdout.once('data', (d) => {
      const resp = JSON.parse(d.toString());
      if (!resp.result || !resp.result.serverInfo) { console.error('FAIL', resp); process.exit(1); }
      console.log('PASS: MCP handshake OK');
      proc.kill();
    });
    setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 5000);
  "
  ```
