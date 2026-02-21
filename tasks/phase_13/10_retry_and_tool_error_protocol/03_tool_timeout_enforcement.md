# Task: Implement MCP Tool Timeout Enforcement with TIMEOUT_EXCEEDED Status Injection (Sub-Epic: 10_Retry and Tool Error Protocol)

## Covered Requirements
- [3_MCP-TAS-073]

## 1. Initial Test Written

- [ ] Create `src/mcp/__tests__/toolTimeoutHandler.test.ts`. Import `ToolTimeoutHandler` from `src/mcp/toolTimeoutHandler.ts`.
- [ ] Write a unit test: given a mock tool executor that resolves after 400ms, and a timeout of 300s (300000ms), assert that `ToolTimeoutHandler.runWithTimeout(executor, 300000)` resolves normally before the timeout.
- [ ] Write a unit test: given a mock tool executor that never resolves (hangs indefinitely), assert that `ToolTimeoutHandler.runWithTimeout(executor, 300000)` rejects with a `ToolTimeoutError` after exactly `300000ms` (use Jest's fake timers to advance time).
- [ ] Write a unit test asserting that when timeout occurs, the returned `ToolObservation` object has `status: 'TIMEOUT_EXCEEDED'`, `tool_name: string`, `duration_ms: 300000`, and `message: 'Tool exceeded the 300s timeout limit. Reassess strategy.'`.
- [ ] Write a unit test confirming that `ToolTimeoutHandler` cleans up (clears the internal `setTimeout`) after a successful execution to prevent memory leaks.
- [ ] Write a unit test confirming that the `ToolObservation` type's `status` field can hold both `'SUCCESS'` and `'TIMEOUT_EXCEEDED'` and that TypeScript enforces this union type (compile-time check via `tsc --noEmit`).
- [ ] Write an integration test in `src/mcp/__tests__/toolTimeoutHandler.integration.test.ts`: inject `ToolTimeoutHandler` into the `ToolProxy` and simulate an MCP `run_command` tool call that hangs. Assert that the agent's next turn receives a structured `ToolObservation` with `status: 'TIMEOUT_EXCEEDED'` rather than an unhandled Promise rejection.
- [ ] Write an integration test verifying that timeout events are persisted to the `tool_execution_log` SQLite table with `status='TIMEOUT_EXCEEDED'`.

## 2. Task Implementation

- [ ] Create `src/mcp/toolTimeoutHandler.ts`. Export `ToolTimeoutHandler` class with static async method `runWithTimeout<T extends ToolObservation>(executor: ToolExecutor, timeoutMs: number = 300_000): Promise<T>`.
- [ ] Inside `runWithTimeout`, use `Promise.race([executor.run(), timeoutPromise])`. The `timeoutPromise` uses `setTimeout` to reject after `timeoutMs` milliseconds.
- [ ] On timeout, do NOT reject with an unhandled error — instead catch the timeout and return a `ToolObservation` with `status: 'TIMEOUT_EXCEEDED'`, `tool_name: executor.toolName`, `duration_ms: timeoutMs`, `stdout: ''`, `stderr: ''`, `message: 'Tool exceeded the 300s timeout limit. Reassess strategy.'`.
- [ ] Export `ToolTimeoutError` (extends `Error`) with fields: `toolName: string`, `timeoutMs: number`, `startedAt: Date` for use in logging/persistence layers.
- [ ] Update `src/mcp/types/toolObservation.ts` to add `status: 'SUCCESS' | 'TIMEOUT_EXCEEDED' | 'ERROR'` as a required field. Ensure all existing `ToolObservation` construction sites are updated to set `status: 'SUCCESS'` or `status: 'ERROR'` explicitly.
- [ ] Add a SQLite migration (e.g., `migrations/015_tool_execution_log.sql`) if `tool_execution_log` does not already exist. Columns: `id INTEGER PRIMARY KEY`, `task_id TEXT`, `tool_name TEXT NOT NULL`, `phase TEXT`, `status TEXT NOT NULL`, `duration_ms INTEGER`, `started_at TEXT`, `completed_at TEXT`.
- [ ] In `src/mcp/toolProxy.ts`, wrap every `executor.run()` invocation with `ToolTimeoutHandler.runWithTimeout(executor, 300_000)`. After each call (success or timeout), persist a record to `tool_execution_log` via `DatabaseService`.
- [ ] In `src/orchestrator/agentLoop.ts` (or equivalent agent turn handler), detect `ToolObservation.status === 'TIMEOUT_EXCEEDED'` and include it verbatim in the agent's next observation payload, ensuring the LLM sees the structured `TIMEOUT_EXCEEDED` signal.

## 3. Code Review

- [ ] Verify `ToolTimeoutHandler.runWithTimeout` correctly clears the timeout `setTimeout` handle on both success and failure paths to prevent dangling timers.
- [ ] Confirm `ToolObservation.status` is a discriminated union, not a string enum, so TypeScript exhaustiveness checks work in switch statements.
- [ ] Verify the timeout value (300_000ms) is defined as a named constant `TOOL_TIMEOUT_MS` in a shared constants file (e.g., `src/mcp/constants.ts`), not hard-coded inline.
- [ ] Confirm `tool_execution_log` migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Check that `ToolTimeoutHandler` does not `process.exit()` or log to `console` directly — all side effects go through injected `DatabaseService` and `EventBus`.
- [ ] Verify that the `TIMEOUT_EXCEEDED` observation message is agent-friendly (imperative, actionable: "Reassess strategy") per the MCP Design spec.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/mcp/__tests__/toolTimeoutHandler.test.ts --coverage` (with `--fakeTimers` where applicable) and confirm all unit tests pass with 100% branch coverage.
- [ ] Run `npx jest src/mcp/__tests__/toolTimeoutHandler.integration.test.ts` and confirm integration tests pass.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript errors from the updated `ToolObservation` type.
- [ ] Run `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation

- [ ] Create `src/mcp/toolTimeoutHandler.agent.md` documenting: the 300s timeout constant, the `TIMEOUT_EXCEEDED` observation contract, and the requirement that agents receiving this status must not retry automatically but must reassess strategy.
- [ ] Update `src/mcp/toolProxy.agent.md` (or create it) to document that all tool calls are wrapped in `ToolTimeoutHandler`.
- [ ] Update `src/mcp/types/toolObservation.agent.md` to document the full `status` union and what each value means for downstream agent behavior.
- [ ] Add a note to the agent memory / `docs/phase_13_progress.md` that `TOOL_TIMEOUT_MS = 300_000` is the project-wide enforced MCP tool timeout.

## 6. Automated Verification

- [ ] Run `npx jest --testPathPattern="toolTimeoutHandler" --json --outputFile=/tmp/timeout_results.json && node -e "const r=require('/tmp/timeout_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Verify the constant: `npx ts-node -e "import { TOOL_TIMEOUT_MS } from './src/mcp/constants'; console.assert(TOOL_TIMEOUT_MS === 300_000);"`.
- [ ] Run `sqlite3 /tmp/test.db '.read migrations/015_tool_execution_log.sql' && sqlite3 /tmp/test.db "PRAGMA table_info(tool_execution_log);" | grep -c "status"` and assert output is `1`.
- [ ] Run `npx tsc --noEmit 2>&1 | grep -c "ToolObservation"` and assert output is `0` (no type errors related to `ToolObservation`).
