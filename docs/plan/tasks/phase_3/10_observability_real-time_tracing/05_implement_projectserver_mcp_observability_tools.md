# Task: Implement the MCP-Native Observability Layer in Generated ProjectServer (Sub-Epic: 10_Observability & Real-Time Tracing)

## Covered Requirements
- [TAS-003], [1_PRD-REQ-OBS-001]

## 1. Initial Test Written

- [ ] In `packages/project-server-template/src/__tests__/observability-tools.test.ts`, write tests for the MCP introspection tools:
  - Test that `get_internal_state` tool returns a JSON object with fields `current_phase`, `active_task_id`, `last_test_result`, `memory_usage_mb`, and `uptime_s`.
  - Test that `get_logs` tool accepts parameters `{ level?: "DEBUG"|"INFO"|"WARN"|"ERROR", limit?: number, since_ns?: string }` and returns an array of log objects matching the filter.
  - Test that `get_logs` with `limit: 5` returns at most 5 log entries.
  - Test that `get_logs` with `since_ns` filters out entries whose `timestamp_ns` is less than the provided value.
  - Test that `get_profiling_data` tool returns a JSON object with `cpu_profile_url` (pointing to a local `.devs/profiles/` file), `heap_snapshot_url`, and `collected_at_ns`.
  - Test that if the profiling data file does not exist yet, `get_profiling_data` returns `{ available: false }` rather than throwing.
  - Test that each tool call response conforms to the `Observation` JSON standard (i.e., `validateObservation()` passes on the wrapped response).
  - Test that the MCP server starts on a randomly assigned port and writes the port to `.devs/mcp-server.port` on startup.

## 2. Task Implementation

- [ ] In `packages/project-server-template/src/tools/`, create the following MCP tool handlers:
  - `get-internal-state.tool.ts`:
    - Return `{ current_phase, active_task_id, last_test_result, memory_usage_mb, uptime_s }` from the project's in-memory `ProjectState` singleton.
    - Wrap the result using `createObservation()` from `@devs/core/protocol`.
  - `get-logs.tool.ts`:
    - Accept `{ level?, limit?, since_ns? }` as validated input (use `zod` for input validation).
    - Query `state.sqlite` `agent_logs` table: `SELECT * FROM agent_logs WHERE (level = ? OR ? IS NULL) AND timestamp_ns >= COALESCE(?, 0) ORDER BY timestamp_ns DESC LIMIT ?`.
    - Return results as an `Observation` with `stdout` set to `JSON.stringify(rows)`.
  - `get-profiling-data.tool.ts`:
    - Check for the existence of `.devs/profiles/latest-cpu.cpuprofile` and `.devs/profiles/latest-heap.heapsnapshot`.
    - If found, return `{ available: true, cpu_profile_url, heap_snapshot_url, collected_at_ns }`.
    - If not found, return `createObservation({ ..., stdout: JSON.stringify({ available: false }) })`.
- [ ] Register all three tools in `packages/project-server-template/src/server.ts` using the MCP SDK `server.tool()` registration API, matching the pattern established by other tools in Phase 3.
- [ ] On server startup in `packages/project-server-template/src/server.ts`:
  - Choose a random available port using `portfinder` (or `get-port` npm package).
  - Write the port number to `.devs/mcp-server.port` (create the file, overwrite if exists).
  - Log `"ProjectServer listening on port <port>"` at `INFO` level.

## 3. Code Review

- [ ] Confirm all three tools wrap their responses with `createObservation()` from `@devs/core/protocol`, guaranteeing `TAS-065` compliance.
- [ ] Confirm SQL query in `get-logs.tool.ts` uses parameterized queries (no string interpolation of user inputs).
- [ ] Confirm `get-profiling-data.tool.ts` only serves files from `.devs/profiles/` and rejects any `..` path traversal attempts (validate paths with `path.resolve` and assert they start with the expected prefix).
- [ ] Confirm the `mcp-server.port` file is written atomically (write to a `.tmp` file, then rename).
- [ ] Confirm that the `ProjectServer` template is self-contained and does not directly import from `@devs/mcp-orchestrator`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/project-server-template test -- --testPathPattern=observability-tools` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/project-server-template tsc --noEmit` to confirm no TypeScript compile errors.

## 5. Update Documentation

- [ ] In `docs/agent-memory/observability.md`, add a section "ProjectServer MCP Introspection Tools" documenting:
  - The three tool names and their input/output schemas.
  - How the AI developer agent should call `get_internal_state` before starting a task and `get_logs` after a failure.
  - The `.devs/mcp-server.port` file format and how to discover the server port at runtime.
- [ ] Update `packages/project-server-template/README.md` with a "Observability Tools" section listing the tools and their MCP tool registration names.
- [ ] Record in `docs/agent-memory/protocol-decisions.md` that `TAS-003` (native agentic observability) and `1_PRD-REQ-OBS-001` (MCP server integration in generated projects) are both satisfied by the ProjectServer template tools added in this task.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/project-server-template test -- --coverage --testPathPattern=observability-tools` and assert line coverage ≥ 90% for all files in `packages/project-server-template/src/tools/`.
- [ ] Execute the following smoke test and confirm it exits 0:
  ```bash
  node -e "
  const {startProjectServer} = require('./packages/project-server-template/dist/server');
  const fs = require('fs'), path = require('path'), os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-srv-'));
  process.chdir(tmp);
  startProjectServer().then(async ({client, close}) => {
    const result = await client.callTool('get_internal_state', {});
    const obs = JSON.parse(result.stdout || result.content[0].text);
    console.assert(typeof obs.uptime_s === 'number', 'Missing uptime_s');
    console.assert(fs.existsSync(path.join(tmp, '.devs', 'mcp-server.port')), 'Port file missing');
    await close();
    console.log('PASS');
    process.exit(0);
  }).catch(e => { console.error(e); process.exit(1); });
  "
  ```
