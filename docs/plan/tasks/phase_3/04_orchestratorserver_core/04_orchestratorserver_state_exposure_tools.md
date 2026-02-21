# Task: OrchestratorServer State Machine & Requirement Status Exposure via MCP Tool (Sub-Epic: 04_OrchestratorServer Core)

## Covered Requirements
- [4_USER_FEATURES-REQ-011], [2_TAS-REQ-030], [3_MCP-TAS-036]

## 1. Initial Test Written
- [ ] In `packages/mcp/src/__tests__/tools/get-project-context.test.ts`, write tests that:
  - Start an `OrchestratorServer` with an injected `OrchestratorState` containing two requirements (one `"pending"`, one `"met"`) and an active epic at `progress: 42`.
  - Connect a test MCP `Client` (from `@modelcontextprotocol/sdk`) with the correct Bearer Token.
  - Call `client.callTool({ name: "get_project_context", arguments: {} })` and assert:
    - The response `content[0].type === "text"`.
    - Parsed JSON matches the injected `OrchestratorState.projectContext`.
    - `requirements` array contains exactly two entries with correct `id`, `status`, `doc_link` values.
    - `active_epic.progress === 42`.
  - Test that calling `get_project_context` **without** Bearer Token in the HTTP headers returns HTTP `401` (the MCP client throws an auth error).
  - Test that `get_project_context` is listed in the server's tool registry — call `client.listTools()` and assert the returned list contains an entry with `name: "get_project_context"`.
- [ ] In `packages/mcp/src/__tests__/tools/inject-directive.test.ts`, write tests that:
  - Call `client.callTool({ name: "inject_directive", arguments: { taskId: "task-001", directive: "Use Zod for validation" } })` and assert the response acknowledges the directive.
  - Assert the server's internal state reflects the injected directive (visible via a subsequent `get_project_context` call or a `getState()` test helper).
  - Assert that calling `inject_directive` with a missing `taskId` returns a structured error response (not a crash).
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] In `packages/mcp/src/tools/get-project-context.ts`, implement the `get_project_context` MCP tool:
  - Register via `mcpServer.tool("get_project_context", {}, async () => { ... })`.
  - Returns the current `OrchestratorState.projectContext` serialized as a JSON string in `content[0].text`.
  - Input schema: no parameters (empty Zod object `z.object({})`).
  - Output: `{ content: [{ type: "text", text: JSON.stringify(projectContext) }] }`.
- [ ] In `packages/mcp/src/tools/inject-directive.ts`, implement the `inject_directive` MCP tool:
  - Input schema: `z.object({ taskId: z.string().min(1), directive: z.string().min(1) })`.
  - Appends the directive to `OrchestratorState.agentMemory.shortTerm[taskId]` (as an array of strings).
  - Returns `{ content: [{ type: "text", text: JSON.stringify({ success: true, taskId, directive }) }] }`.
  - If `taskId` or `directive` is missing/invalid, return `{ isError: true, content: [{ type: "text", text: "<error message>" }] }` — do NOT throw.
- [ ] In `packages/mcp/src/orchestrator-server.ts`, add a `setState(state: OrchestratorState): void` method and a `getState(): OrchestratorState` method to support test injection and external state updates from the devs engine.
- [ ] Register both tools in `orchestrator-server.ts` during `start()` by calling `registerTools(this.mcpServer, this.state)`.
- [ ] Create `packages/mcp/src/tools/index.ts` that exports `registerTools(server: Server, stateRef: { current: OrchestratorState }): void` — iterates and registers all tools.
- [ ] Use a mutable state reference (`{ current: OrchestratorState }`) passed to tool handlers so tools always read live state, not a stale snapshot.

## 3. Code Review
- [ ] Confirm `get_project_context` returns a structured JSON string — not raw TypeScript objects. The MCP protocol transmits text content.
- [ ] Verify `inject_directive` uses `{ isError: true, content: [...] }` (not a thrown exception) for validation failures — MCP tool errors must be returned as structured responses, not crashes.
- [ ] Confirm tools do NOT have direct access to Node.js `fs`, `process`, or `child_process` — all state access goes through the shared state reference.
- [ ] Verify input schemas use Zod and are passed as the second argument to `mcpServer.tool(name, zodSchema, handler)` per the MCP SDK API.
- [ ] Confirm `registerTools` is idempotent-safe — calling it twice does not register duplicate tools (guard with a `registered` flag or SDK's built-in deduplication behavior).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp test` — all tool tests must pass.
- [ ] Specifically assert `get-project-context.test.ts` and `inject-directive.test.ts` show green.
- [ ] Run `pnpm --filter @devs/mcp build` — zero TypeScript errors.
- [ ] Use the MCP Inspector or a curl-equivalent test to manually verify `get_project_context` returns valid JSON:
  ```bash
  # Start the server locally, then call the tool via the MCP client test script
  node scripts/test-mcp-tool.mjs get_project_context
  ```

## 5. Update Documentation
- [ ] Add a `## Tools` section to `packages/mcp/README.md` documenting:
  - `get_project_context`: no parameters, returns `ProjectContext` JSON.
  - `inject_directive`: parameters `taskId` (string), `directive` (string); returns acknowledgment JSON.
- [ ] Update `docs/agent-memory/phase_3.md`: "OrchestratorServer exposes `get_project_context` and `inject_directive` MCP tools. State is held as a mutable reference `{ current: OrchestratorState }` and updated via `setState()`. Tool errors are returned as `{ isError: true }` — not thrown."
- [ ] Update the root `docs/mcp-tools-registry.md` (or create if absent) with rows for `get_project_context` and `inject_directive`, their parameter schemas, return types, and the requirement IDs they satisfy.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp test --reporter=json > /tmp/mcp-tools-results.json` and assert exit code `0`.
- [ ] Run `cat /tmp/mcp-tools-results.json | jq '[.testResults[].assertionResults[] | select(.status != "passed")] | length'` — must output `0`.
- [ ] Run `node -e "const {createOrchestratorServer}=require('./packages/mcp/dist'); ..."` smoke test that starts the server, calls `get_project_context` via SDK client, parses the response JSON, and asserts `requirements` is an array — exit code `0` on success.
