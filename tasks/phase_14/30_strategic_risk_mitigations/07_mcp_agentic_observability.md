# Task: Implement MCP-Native Agentic Observability Debugging Environment (Sub-Epic: 30_Strategic Risk Mitigations)

## Covered Requirements
- [8_RISKS-REQ-135]

## 1. Initial Test Written
- [ ] In `src/mcp/__tests__/agentic_observability.test.ts`, write unit tests covering:
  - `registerObservabilityTools(mcpServer: McpServer): void` — assert the server exposes exactly these tools: `get_agent_trace`, `diff_agent_state`, `replay_task`, `inspect_memory`, `profile_sandbox`.
  - `get_agent_trace({ taskId, agentId })` — mock the DB and assert the handler returns the correct `SAOP_Envelope` records for the given `taskId`/`agentId` combination.
  - `diff_agent_state({ taskId, fromCheckpoint, toCheckpoint })` — assert it returns a structured diff of SQLite `agent_logs` rows between two checkpoint IDs.
  - `replay_task({ taskId, dryRun: true })` — assert it returns a `ReplayPlan` listing the sequence of agent steps without executing them.
  - `profile_sandbox({ taskId })` — assert it returns `{ cpuUsage, memUsage, wallTime }` sourced from the sandbox resource metrics table.
  - Write an integration test: register tools on a real `McpServer` instance, call `get_agent_trace` via the MCP protocol, and assert the response conforms to the MCP tool result schema.

## 2. Task Implementation
- [ ] Create `src/mcp/observability_tools.ts` exporting `registerObservabilityTools(mcpServer)` which registers the 5 observability tools:
  - **`get_agent_trace`** — queries `agent_logs` JOIN `saop_envelopes` for the given `taskId`/`agentId`; returns paginated results (max 100 entries per call).
  - **`diff_agent_state`** — computes a before/after diff of `agent_logs` rows between two `checkpoint_id` values; returns structured JSON diff.
  - **`replay_task`** — when `dryRun: true`, reads the task's stored `SAOP_Envelope` sequence and returns a replay plan; when `dryRun: false`, re-executes the agent pipeline for the task in a fresh sandbox.
  - **`inspect_memory`** — queries the LanceDB vector store for all embeddings associated with the given `taskId`; returns top-10 most relevant memory entries.
  - **`profile_sandbox`** — reads the `sandbox_metrics` table for the given `taskId` and returns CPU/RAM/wall-time statistics.
- [ ] Register `registerObservabilityTools` in `src/mcp/project_server.ts` during server initialization, so that every generated project's MCP server exposes these tools by default.
- [ ] Create SQLite migration `migrations/017_sandbox_metrics.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS sandbox_metrics (
    id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    task_id    TEXT NOT NULL REFERENCES tasks(id),
    cpu_usage  REAL NOT NULL,
    mem_usage  REAL NOT NULL,
    wall_time  REAL NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );
  ```
- [ ] Add a `devs observe --task <taskId>` CLI subcommand in `src/cli/commands/observe.ts` that calls `get_agent_trace` via the local MCP client and streams the trace to stdout in a human-readable format.
- [ ] Expose `diff_agent_state` and `replay_task` in the Webview UI as buttons on the Task Detail panel: "Diff State" and "Replay (Dry Run)".

## 3. Code Review
- [ ] Verify each MCP tool handler validates its input parameters via Zod schemas before querying the DB.
- [ ] Confirm `replay_task` with `dryRun: false` creates an isolated sandbox and does NOT mutate the production SQLite state — use a forked in-memory DB copy for replay.
- [ ] Ensure `get_agent_trace` pagination is enforced; a call without `limit`/`offset` params defaults to `limit: 100` to prevent memory exhaustion.
- [ ] Confirm `profile_sandbox` data is collected by the existing sandbox monitor (integrate with the sandbox resource quota monitor from `[9_ROADMAP-TAS-207]`) rather than spawning a new process.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="agentic_observability"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="project_server"` to confirm MCP server integration tests pass.
- [ ] Run full suite `npm test`.

## 5. Update Documentation
- [ ] Add `docs/mcp_observability.md` documenting all 5 MCP tools with input/output schemas and example calls.
- [ ] Update `docs/mcp_server.md` with the new observability tools section.
- [ ] Update `src/mcp/mcp.agent.md` with the `observability_tools.ts` API.
- [ ] Add to `CHANGELOG.md` under `[Phase 14]`: "Added MCP-native agentic observability tools (get_agent_trace, diff_agent_state, replay_task, inspect_memory, profile_sandbox)".

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code `0`.
- [ ] Execute `node scripts/verify_requirement_coverage.js --req 8_RISKS-REQ-135` and confirm `covered`.
- [ ] Start the MCP server and call `get_agent_trace` via `devs observe --task <any-existing-task-id>`; confirm a valid JSON trace is printed without errors.
