# Task: ToolProxy – Sandbox Bridge & Execution Flow (Sub-Epic: 06_Tool Registry & Proxy)

## Covered Requirements
- [2_TAS-REQ-032], [TAS-072], [5_SECURITY_DESIGN-REQ-SEC-SD-013]

## 1. Initial Test Written
- [ ] Create `packages/core/src/tool-proxy/__tests__/tool-proxy.test.ts`.
- [ ] Write a unit test that constructs a `ToolProxy` with a mock `ToolRegistry`, mock `SandboxExecutor`, and mock `AuditLogger`, then calls `execute({ toolName: 'read_file', args: { path: 'src/index.ts' }, context })`. Assert:
  - `validateToolArgs` was called before `SandboxExecutor.execute`.
  - `SandboxExecutor.execute` received the sanitized, validated args.
  - The returned `ToolResult` matches the mock sandbox response.
  - `AuditLogger.log` was called once with `event: 'TOOL_EXECUTED'` including `toolName`, `agentId`, `turnIndex`, `durationMs`.
- [ ] Write a unit test where schema validation fails. Assert:
  - `SandboxExecutor.execute` is **not** called.
  - `AuditLogger.log` is called with `event: 'TOOL_ARG_VALIDATION_FAILURE'`.
  - The returned `ToolResult` has `isError: true`.
- [ ] Write a unit test where `SandboxExecutor.execute` throws. Assert:
  - `AuditLogger.log` is called with `event: 'TOOL_EXECUTION_ERROR'` containing the error message.
  - The returned `ToolResult` has `isError: true` with a safe error message (not a raw stack trace).
- [ ] Write a unit test asserting that calling `execute` with an unknown `toolName` returns `isError: true` and logs `event: 'UNKNOWN_TOOL'` without calling the sandbox.
- [ ] Create `packages/core/src/tool-proxy/__tests__/agent-logs.test.ts`.
- [ ] Write a test asserting that every successful tool execution writes a structured record to `agent_logs` (mock the `AgentLogRepository` and assert it was called with the correct fields: `toolName`, `agentId`, `turnIndex`, `phaseId`, `epicId`, `input`, `output`, `durationMs`).
- [ ] Write a test asserting that failed tool executions also write to `agent_logs` with `isError: true`.
- [ ] All tests must fail before implementation.

## 2. Task Implementation
- [ ] Create `packages/core/src/tool-proxy/types.ts`:
  - `ToolCallRequest`: `{ toolName: string; args: unknown; context: ToolExecutionContext }`.
  - `SandboxExecutor` interface: `{ execute(tool: RegisteredTool, args: unknown, context: ToolExecutionContext): Promise<ToolResult> }`.
  - `AgentLogRepository` interface: `{ append(record: AgentLogRecord): Promise<void> }`.
  - `AgentLogRecord`: `{ id: string; toolName: string; agentId: string; turnIndex: number; phaseId: string; epicId: string; input: unknown; output: ToolResult; durationMs: number; isError: boolean; timestamp: string }`.
- [ ] Create `packages/core/src/tool-proxy/ToolProxy.ts`:
  - Constructor: `(registry: ToolRegistry, sandbox: SandboxExecutor, auditLogger: AuditLogger, agentLogs: AgentLogRepository)`.
  - `async execute(request: ToolCallRequest): Promise<ToolResult>`:
    1. Look up tool via `registry.getTool(request.toolName)`; return `ACCESS_DENIED` result and log `UNKNOWN_TOOL` if not found.
    2. Call `validateToolArgs(request.toolName, request.args, registry, auditLogger)`; return error result on failure.
    3. Record `startTime = performance.now()`.
    4. Call `sandbox.execute(tool, validatedArgs, request.context)` wrapped in a `try/catch`.
    5. On success: compute `durationMs`, call `auditLogger.log({ event: 'TOOL_EXECUTED', ... })`, call `agentLogs.append(...)`, return result.
    6. On error: log `TOOL_EXECUTION_ERROR`, append error record to `agentLogs`, return `{ isError: true, content: [{ type: 'error', text: '<safe message>' }] }`.
- [ ] Create `packages/mcp/src/orchestrator/handlers/call-tool.ts`:
  - Handle the MCP `tools/call` request.
  - Extract `toolName` and `arguments` from the MCP request.
  - Build a `ToolExecutionContext` from the MCP session metadata (agentId, turnIndex, phaseId, epicId).
  - Delegate to `ToolProxy.execute({ toolName, args: arguments, context })`.
  - Map the returned `ToolResult` to the MCP `CallToolResult` wire format.
- [ ] Register `call-tool` handler in `OrchestratorServer.ts`.
- [ ] Export `ToolProxy` and all types from `packages/core/src/tool-proxy/index.ts`; add barrel export to `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify that `ToolProxy` never calls `sandbox.execute` before `validateToolArgs` returns a valid result – this is the security gate required by `[5_SECURITY_DESIGN-REQ-SEC-SD-013]`.
- [ ] Verify that raw error stack traces are never included in `ToolResult.content` returned to the agent – only sanitized messages.
- [ ] Confirm that `agentLogs.append` is always called (success or failure) to maintain the audit trail per `[TAS-072]`.
- [ ] Confirm that `ToolProxy` depends only on interfaces (`SandboxExecutor`, `AgentLogRepository`), not concrete implementations – enabling mock injection in tests.
- [ ] Check that `durationMs` is computed using `performance.now()` (monotonic clock) not `Date.now()` for precision.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern "(tool-proxy|agent-logs)" --ci` – all tests pass.
- [ ] Run `pnpm test --filter @devs/mcp -- --testPathPattern call-tool --ci` – all tests pass.
- [ ] Run `pnpm tsc --noEmit` – zero errors across monorepo.

## 5. Update Documentation
- [ ] Add a "ToolProxy & Execution Flow" section to `docs/architecture/mcp-tool-registry.md` with a Mermaid sequence diagram illustrating: Agent → OrchestratorServer → ToolProxy → validateToolArgs → SandboxExecutor → AgentLogRepository.
- [ ] Reference `[2_TAS-REQ-032]` and `[TAS-072]` explicitly in the diagram caption.
- [ ] Update `packages/core/README.md` with a "ToolProxy" API section.
- [ ] Update `memory/phase_3/decisions.md`: "ToolProxy is the single chokepoint for all agent tool calls; no tool may bypass it. SandboxExecutor is injected, not imported directly."

## 6. Automated Verification
- [ ] CI: `pnpm test --filter @devs/core -- --testPathPattern "(tool-proxy|agent-logs)" --ci` exits 0.
- [ ] CI: `pnpm test --filter @devs/mcp -- --testPathPattern call-tool --ci` exits 0.
- [ ] CI: `pnpm tsc --noEmit` exits 0.
- [ ] Run integration smoke test: `pnpm run mcp:smoke-test` (or equivalent) which starts the MCP server, issues a `tools/call` for `read_file` with a valid path, and asserts a non-error response is returned – exit 0 on success.
