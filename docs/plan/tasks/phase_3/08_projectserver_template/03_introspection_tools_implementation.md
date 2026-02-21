# Task: Implement Core Introspection Tools for the ProjectServer Template (Sub-Epic: 08_ProjectServer Template)

## Covered Requirements
- [4_USER_FEATURES-REQ-012], [3_MCP-TAS-003], [TAS-043]

## 1. Initial Test Written
- [ ] In `packages/devs-core/src/templates/__tests__/introspectionTools.test.ts`, write unit and integration tests for each of the five core introspection tools. For each tool, scaffold the `mcp-server/` template into a temp directory, install dependencies, compile, and start the server process. Send MCP `tools/call` requests over STDIO and assert the responses:

  **`inspect_state` tool:**
  - Call with `{ path: "process.env.NODE_ENV", depth: 1 }` and assert the response is a valid `JSON` object with a `value` field.
  - Call with a non-existent path (e.g. `{ path: "nonexistent.deep.key" }`) and assert the response contains an `error` or `null` value (not a thrown exception).

  **`run_test_task` tool:**
  - Call with `{ test_path: "__tests__/smoke.test.ts", reporter: "json" }` in a project that has a minimal Jest/Vitest test file, and assert the response is a `StructuredTestReport` with fields `passed: number`, `failed: number`, `tests: TestResult[]`.
  - Call with a non-existent test path and assert a structured error report is returned (not a crash).

  **`db_bridge` tool:**
  - Call with `{ action: "schema", payload: "" }` in a project with a SQLite database and assert the response includes a list of table names.
  - Call with `{ action: "query", payload: "SELECT 1 AS n" }` and assert `rows: [{ n: 1 }]` is returned.
  - Call with `{ action: "seed", payload: "INSERT INTO test_table (val) VALUES ('x')" }` and assert `{ affected: 1 }` is returned.

  **`capture_trace` tool:**
  - Call with `{ duration_ms: 500, type: "cpu" }` and assert the response contains a `ProfileData` object with `type: "cpu"` and a `data` field (base64 or URL string).
  - Call with `{ duration_ms: 200, type: "heap" }` and assert `type: "heap"` in the response.

  **`get_logs` tool:**
  - Call with `{ level: "info", limit: 10 }` and assert the response is `LogEntry[]` where each entry has `level`, `message`, and `timestamp` fields.
  - Call with `{ level: "error", limit: 5, follow: false }` and assert at most 5 entries are returned.

- [ ] Write a negative test: sending a `tools/call` for an unknown tool name MUST return a JSON-RPC error with code `-32601` (Method not found), not a process crash.

## 2. Task Implementation
- [ ] Create the following tool implementation files inside the scaffolder's template strings (these become files in `mcp-server/src/tools/` of the generated project):

  **`src/tools/inspectState.ts`**:
  - Export `registerInspectStateTool(server: McpServer): void`.
  - Register the tool with `server.tool("inspect_state", { path: z.string(), depth: z.number().int().min(1).max(10).optional().default(3) }, async ({ path, depth }) => { ... })`.
  - Implementation: use `path.split('.')` to traverse `globalThis` (or a project-specific state singleton if available) up to `depth` levels. Return `{ value: resolvedValue }` as JSON content. If traversal fails, return `{ value: null, error: "Path not found" }`.

  **`src/tools/runTestTask.ts`**:
  - Export `registerRunTestTaskTool(server: McpServer): void`.
  - Register the tool with `server.tool("run_test_task", { test_path: z.string(), reporter: z.enum(["json", "tap"]) }, async ({ test_path, reporter }) => { ... })`.
  - Implementation: spawn `npx vitest run --reporter=${reporter} ${test_path}` (or `npx jest --json ${test_path}` as fallback) from the project root via `child_process.spawn`. Capture stdout/stderr. Parse the JSON output into a `StructuredTestReport` (`{ passed, failed, tests: [{ name, status, error? }] }`). Return as JSON content.
  - Enforce a 120-second timeout; kill the child process on timeout and return `{ error: "Test runner timed out after 120s" }`.

  **`src/tools/dbBridge.ts`**:
  - Export `registerDbBridgeTool(server: McpServer): void`.
  - Register the tool with `server.tool("db_bridge", { action: z.enum(["query", "schema", "seed"]), payload: z.string() }, async ({ action, payload }) => { ... })`.
  - Implementation: open the project's SQLite database at `process.env.DB_PATH ?? './app.db'` using `better-sqlite3` (add as generated dependency). For `"schema"`: run `SELECT name FROM sqlite_master WHERE type='table'`. For `"query"`: run the SQL in `payload` and return `{ rows }`. For `"seed"`: run the SQL in `payload` and return `{ affected: stmt.changes }`. Wrap all DB operations in a `try/catch`; return `{ error: err.message }` on failure. **Never** allow DDL (`DROP`, `ALTER`) in `"query"` or `"seed"` actions—reject with `{ error: "DDL not permitted via db_bridge query/seed actions" }`.

  **`src/tools/captureTrace.ts`**:
  - Export `registerCaptureTraceTool(server: McpServer): void`.
  - Register the tool with `server.tool("capture_trace", { duration_ms: z.number().int().min(100).max(30000), type: z.enum(["cpu", "heap", "network"]) }, async ({ duration_ms, type }) => { ... })`.
  - Implementation: for `"cpu"`: use `v8-profiler-next` (add as generated dev dependency) to start/stop a CPU profile; serialize the profile to JSON and return as base64. For `"heap"`: use `v8.writeHeapSnapshot()` and return the file path. For `"network"`: return `{ error: "network trace not supported in current runtime" }` (placeholder for future implementation).

  **`src/tools/getLogs.ts`**:
  - Export `registerGetLogsTool(server: McpServer): void`.
  - Register the tool with `server.tool("get_logs", { level: z.enum(["debug", "info", "warn", "error"]), limit: z.number().int().min(1).max(500), follow: z.boolean().optional().default(false) }, async ({ level, limit, follow }) => { ... })`.
  - Implementation: read from the project's structured log file at `process.env.LOG_PATH ?? './app.log'`. Parse each line as NDJSON. Filter by `level`. Return the last `limit` matching entries as `LogEntry[]`. The `follow` parameter is accepted but treated as `false` for now (streaming requires SSE; mark as future work in a `TODO` comment).

- [ ] Update `src/tools/index.ts` template to import and call all five `register*` functions:
  ```typescript
  import { registerInspectStateTool } from "./inspectState.js";
  import { registerRunTestTaskTool } from "./runTestTask.js";
  import { registerDbBridgeTool } from "./dbBridge.js";
  import { registerCaptureTraceTool } from "./captureTrace.js";
  import { registerGetLogsTool } from "./getLogs.js";
  import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

  export function registerAllTools(server: McpServer): void {
    registerInspectStateTool(server);
    registerRunTestTaskTool(server);
    registerDbBridgeTool(server);
    registerCaptureTraceTool(server);
    registerGetLogsTool(server);
  }
  ```
- [ ] Add `better-sqlite3` and `v8-profiler-next` to the generated `package.json` dependencies.
- [ ] Add `zod` (`^3.22.0`) as a generated dependency for schema validation in all tools.

## 3. Code Review
- [ ] Verify every tool uses `zod` for parameter validation—no raw `any` types in tool handler parameters.
- [ ] Verify that `db_bridge` rejects DDL operations in `query`/`seed` modes with a clear error message (security requirement per [3_MCP-REQ-SEC-001]).
- [ ] Verify `run_test_task` enforces a hard timeout (120s) and never leaves zombie child processes (use `proc.kill('SIGKILL')` in the timeout handler).
- [ ] Verify `capture_trace` returns structured errors for unsupported trace types rather than throwing.
- [ ] Confirm no tool handler imports application source files directly (tools must be runtime-agnostic; they interact with the app only via spawned processes, file I/O, or DB connections).
- [ ] Verify all tool names exactly match the names specified in `[3_MCP-TAS-080]`: `inspect_state`, `run_test_task`, `db_bridge`, `capture_trace`, `get_logs`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="introspectionTools"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm TypeScript compilation succeeds with zero errors.
- [ ] Manually call the `inspect_state` tool via the STDIO smoke test (extends the script from task 02's verification step) and assert a valid response.

## 5. Update Documentation
- [ ] Populate the `## Tools` table in the generated `.agent/index.agent.md` template with all five tools, their parameters, return types, and descriptions (as specified in `[3_MCP-TAS-080]`).
- [ ] Populate the `## Introspection Points` section listing what each tool inspects (process state, test runner, DB, profiler, logs).
- [ ] Add a `### Introspection Tools` section to `docs/architecture/templates.md` documenting the tool contract and the extension pattern for project-specific overrides.

## 6. Automated Verification
- [ ] Run the tool registration smoke test over the compiled template:
  ```bash
  node -e "
    const { spawn } = require('child_process');
    const proc = spawn('node', ['/tmp/mcp-scaffold-verify/mcp-server/dist/index.js']);
    const lines = [];
    proc.stdout.on('data', d => lines.push(...d.toString().split('\n').filter(Boolean)));

    const send = (msg) => proc.stdin.write(JSON.stringify(msg) + '\n');
    send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'ci',version:'0.1.0'}}});
    setTimeout(() => {
      send({jsonrpc:'2.0',id:2,method:'tools/list',params:{}});
      setTimeout(() => {
        const resp = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
        const toolsResp = resp.find(r => r.id === 2);
        const names = toolsResp?.result?.tools?.map(t => t.name) ?? [];
        const expected = ['inspect_state','run_test_task','db_bridge','capture_trace','get_logs'];
        const missing = expected.filter(n => !names.includes(n));
        if (missing.length) { console.error('MISSING TOOLS:', missing); process.exit(1); }
        console.log('PASS: all tools registered');
        proc.kill();
      }, 500);
    }, 500);
  "
  ```
