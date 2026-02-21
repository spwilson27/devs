# Task: Build the Project MCP Server Template for Generated Codebases (Sub-Epic: 27_Self-Host and Agent-Ready Templates)

## Covered Requirements
- [9_ROADMAP-TAS-805]

## 1. Initial Test Written
- [ ] Create `src/templates/__tests__/mcpServerTemplate.test.ts`:
  - Write a test `"MCP server template exports all required tools"` that:
    - Imports the compiled shared MCP server template from `src/templates/shared/mcp-server/index.ts`.
    - Asserts that the exported `tools` array contains entries with names: `"get_project_status"`, `"inject_directive"`, `"rewind_to_task"`, `"inspect_state"`, `"run_profiler"`, `"execute_query"`.
  - Write a test `"get_project_status tool returns correct schema"` that:
    - Retrieves the `get_project_status` tool definition from the shared template.
    - Asserts `tool.inputSchema` is a valid JSON Schema object (has `type: "object"` and `properties`).
    - Asserts `tool.description` is a non-empty string.
  - Write a test `"inject_directive tool requires authorization header"` that:
    - Mocks an incoming MCP request without an `X-Agent-Token` header.
    - Calls the `inject_directive` handler.
    - Asserts it returns an MCP error response with code `-32001` (Unauthorized).
  - Write a test `"execute_query tool rejects non-SELECT statements"` that:
    - Calls the `execute_query` handler with `{ sql: "DROP TABLE agent_logs" }`.
    - Asserts it returns an MCP error response with message containing `"Only SELECT queries are permitted"`.
  - Write a test `"MCP server template scaffolded output passes tsc --noEmit"` that:
    - Scaffolds the shared MCP server template to `/tmp/test-mcp-server`.
    - Runs `tsc --noEmit` inside the scaffolded directory.
    - Asserts exit code 0.

## 2. Task Implementation
- [ ] Create `src/templates/shared/mcp-server/` with the following files:
  - `index.ts` — MCP server entry point using the `@modelcontextprotocol/sdk` TypeScript SDK:
    - Creates a `Server` instance with `{ name: "project-mcp-server", version: "1.0.0" }`.
    - Registers all six tools via `server.setRequestHandler(ListToolsRequestSchema, ...)` and individual `CallToolRequestSchema` handlers.
    - Starts with `StdioServerTransport`.
  - `tools/get_project_status.ts` — handler: reads `devs.config.ts` and the SQLite state DB; returns `{ status, tasks_pending, tasks_in_progress, tasks_done, current_phase }`.
  - `tools/inject_directive.ts` — handler: validates `X-Agent-Token` from MCP request metadata; if unauthorized, throws MCP error `-32001`; otherwise appends the directive to `.devs/directives.jsonl`.
  - `tools/rewind_to_task.ts` — handler: accepts `{ taskId: string }`; reads the SQLite state DB and resets the task status to `"pending"`, clearing downstream task statuses as well.
  - `tools/inspect_state.ts` — handler: accepts `{ scope: "task" | "phase" | "project" }`; returns a JSON dump of the relevant state rows from the SQLite DB.
  - `tools/run_profiler.ts` — handler: accepts `{ durationSeconds: number }`; uses Node.js `v8-profiler-next` to capture a CPU profile and returns it as a base64-encoded `.cpuprofile` JSON string.
  - `tools/execute_query.ts` — handler: accepts `{ sql: string, params?: unknown[] }`; validates the query starts with `SELECT` (case-insensitive, after stripping comments); executes against the project SQLite DB; returns rows as JSON array.
  - `tsconfig.json` — strict TypeScript config targeting the shared MCP server.
  - `package.json.ejs` — template with `@modelcontextprotocol/sdk`, `better-sqlite3`, `v8-profiler-next` as dependencies.
- [ ] Ensure all six tool handlers are re-exported from `src/templates/shared/mcp-server/tools/index.ts` so each language-specific template can import them by reference.
- [ ] Extend `TemplateEngine.scaffold()` to always copy the shared MCP server template into the generated project's `mcp-server/` directory, regardless of the template type (`nextjs`, `fastapi`, `go`).

## 3. Code Review
- [ ] Confirm `inject_directive.ts` uses a cryptographically secure token comparison (`crypto.timingSafeEqual`) to prevent timing attacks when validating `X-Agent-Token`.
- [ ] Confirm `execute_query.ts` strips SQL comments (`--` and `/* */`) before the `SELECT`-only check to prevent injection via comment-wrapped DML.
- [ ] Confirm `rewind_to_task.ts` wraps the DB reset in a SQLite transaction so partial rewinds are impossible.
- [ ] Confirm `run_profiler.ts` enforces a maximum `durationSeconds` of 30 to prevent resource exhaustion.
- [ ] Confirm the MCP server's `package.json.ejs` pins all dependency versions with exact semver (no `^` or `~` ranges).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- --testPathPattern=mcpServerTemplate` and confirm all five tests pass with zero failures.
- [ ] Run `npm run test -- --coverage --testPathPattern=mcpServerTemplate` and confirm ≥ 85% statement coverage across all six tool handler files.
- [ ] Run `npm run lint -- src/templates/shared/mcp-server/` and confirm zero errors.
- [ ] Scaffold the MCP server to `/tmp/verify-mcp-server`, run `tsc --noEmit` inside it, and confirm exit code 0.

## 5. Update Documentation
- [ ] Create `docs/templates/mcp-server.md` documenting:
  - The full file tree of the shared MCP server template.
  - The purpose and input/output schema of all six tools.
  - How to start the MCP server: `node mcp-server/index.js`.
  - Security notes for `inject_directive` (token auth) and `execute_query` (SELECT-only).
- [ ] Update `docs/agent_memory/phase_14.md`: "Shared MCP server template implemented with six tools; all language-specific templates now include MCP server via TemplateEngine."

## 6. Automated Verification
- [ ] Run `npm run test -- --ci --testPathPattern=mcpServerTemplate` and verify exit code 0.
- [ ] Run `node -e "const t = require('./dist/templates/shared/mcp-server/index'); const names = t.tools.map(x=>x.name); ['get_project_status','inject_directive','rewind_to_task','inspect_state','run_profiler','execute_query'].forEach(n=>{ if(!names.includes(n)){process.exit(1);} }); console.log('All tools registered OK');"` and confirm exit code 0.
