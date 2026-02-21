# Task: Implement Expert Debugger Mode via MCP `inspect_state` Tool (Sub-Epic: 08_State Machine and Integrity)

## Covered Requirements
- [3_MCP-TAS-092]

## 1. Initial Test Written
- [ ] In `packages/devs-mcp/src/__tests__/inspect-state-tool.test.ts`, write integration tests for the `inspect_state` MCP tool handler:
  - `inspect_state({ taskId: string, scope: 'VARIABLES' | 'STATE_MACHINE' | 'AGENT_LOGS' | 'ALL' })`:
    - `scope: 'STATE_MACHINE'`: returns `{ currentState: TaskState, transitionHistory: TransitionRecord[], lastTransitionAt: Date }` by querying the `task_runs` SQLite table.
    - `scope: 'VARIABLES'`: returns `{ variables: Record<string, unknown> }` from the in-memory snapshot stored by the `VariableCapture` middleware (see implementation notes).
    - `scope: 'AGENT_LOGS'`: returns the last 20 `agent_logs` rows for the given `taskId`, each with `{ turn_index, role, content_summary, timestamp }`.
    - `scope: 'ALL'`: merges all three scopes into a single response object.
    - Returns a `404`-equivalent MCP error `{ code: 'TASK_NOT_FOUND', message: string }` when `taskId` does not exist in SQLite.
    - Is only made available (registered) when the `CodeNode` turn count for the active task has exceeded 5 (i.e., `turn_index >= 5`) — assert that calling it before turn 5 returns `{ code: 'NOT_AVAILABLE', message: 'Expert Debugger mode activates after 5 failed turns' }`.
  - Write a test that simulates a `CodeNode` failing 5 consecutive times, then calls `inspect_state` and asserts it returns a valid `InspectStateResponse`.
  - Write a test asserting `inspect_state` is not listed in the MCP tool manifest until `turn_index >= 5`.

## 2. Task Implementation
- [ ] In `packages/devs-mcp/src/tools/inspect-state.tool.ts`, implement the `inspect_state` MCP tool handler:
  - Define the Zod input schema: `{ taskId: z.string(), scope: z.enum(['VARIABLES', 'STATE_MACHINE', 'AGENT_LOGS', 'ALL']) }`.
  - Inject `DatabaseService`, `OrchestrationStateMachine`, and `VariableCaptureStore`.
  - Guard: query `agent_logs` for `turn_index` of `taskId`; if `< 5`, return `{ code: 'NOT_AVAILABLE', message: '...' }`.
  - For `STATE_MACHINE`: query `SELECT * FROM task_runs WHERE task_id = ? ORDER BY created_at DESC LIMIT 20` and return the transition history.
  - For `VARIABLES`: call `VariableCaptureStore.getSnapshot(taskId)` which returns the last captured runtime variable snapshot.
  - For `AGENT_LOGS`: query `SELECT turn_index, role, substr(content, 1, 500) as content_summary, created_at FROM agent_logs WHERE task_id = ? ORDER BY turn_index DESC LIMIT 20`.
  - For `ALL`: merge all three responses.
- [ ] Create `packages/devs-mcp/src/middleware/variable-capture.ts`:
  - `VariableCaptureMiddleware` that wraps `CodeNode` execution and captures the return value of each tool call into `VariableCaptureStore` (an in-memory `Map<taskId, Record<string, unknown>>`).
  - `VariableCaptureStore` should be a singleton injected into both the middleware and the `inspect_state` tool.
- [ ] Register `inspect_state` tool in `packages/devs-mcp/src/server.ts` with conditional availability:
  - In the tool-listing handler (`tools/list`), include `inspect_state` in the response only when `ExpertDebuggerGate.isActive(taskId)` returns `true`.
  - `ExpertDebuggerGate.isActive(taskId)`: queries `agent_logs` for `COUNT(*) WHERE task_id = ? AND outcome = 'FAILED'` and returns `true` if count `>= 5`.

## 3. Code Review
- [ ] Verify `inspect_state` never returns raw `content` from `agent_logs` exceeding 500 characters per entry to prevent context window bloat.
- [ ] Confirm `VariableCaptureStore` is bounded: it keeps at most 100 entries per `taskId` (evict oldest); assert this in a unit test.
- [ ] Ensure `ExpertDebuggerGate.isActive()` is re-evaluated on every `tools/list` request, not cached for the session lifetime, so the tool becomes available dynamically.
- [ ] Confirm the `inspect_state` tool is documented in the MCP server's `tools/list` response with a clear `description` field explaining its purpose and when it activates.
- [ ] Verify the Zod schema validates `taskId` format (e.g., matches `TASK-\d+` pattern) and returns a typed validation error rather than a generic 500 if invalid.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter devs-mcp test -- --testPathPattern="inspect-state"` and confirm all tests pass.
- [ ] Run `pnpm --filter devs-mcp test -- --coverage --testPathPattern="(inspect-state|variable-capture|expert-debugger)"` and confirm ≥ 90% line/branch coverage.
- [ ] Run `pnpm --filter devs-mcp test -- --testPathPattern="server"` to confirm existing MCP server tests still pass (no regressions in tool listing).

## 5. Update Documentation
- [ ] Create `packages/devs-mcp/src/tools/inspect-state.agent.md` documenting:
  - When `inspect_state` becomes available (after 5 failed `CodeNode` turns for the active task).
  - The four `scope` values and exactly what data each returns.
  - The `VariableCaptureMiddleware` and how it populates the variable snapshot.
  - Example MCP call and response JSON.
  - The `ExpertDebuggerGate` logic and how it controls tool visibility.
- [ ] Update `docs/mcp/tools.md` with an `inspect_state` entry describing it as an "Expert Debugger" tool with conditional activation.

## 6. Automated Verification
- [ ] Run `pnpm --filter devs-mcp test:ci` and assert exit code is `0`.
- [ ] Start the MCP server in test mode (`pnpm --filter devs-mcp start:test`) and send a `tools/list` request via `curl`:
  ```bash
  curl -s -X POST http://localhost:3001/mcp \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  | jq '.result.tools | map(.name) | contains(["inspect_state"])' 
  ```
  The result should be `false` initially (before 5 failed turns), confirming the gate is working. Assert exit code `0` and result is `false`.
