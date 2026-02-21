# Task: Implement State Pollution Prevention with Read-Only Tools and ROLLBACK Support (Sub-Epic: 07_Sandbox Bridge & Injection)

## Covered Requirements
- [3_MCP-RISK-202]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/state-pollution.test.ts`, write unit tests for the `DbBridge` and tool mutability enforcement:
  - Test that calling a tool registered as `mutability: 'read-only'` (e.g., `inspect_state`, `execute_query` with `SELECT`) does not modify any state in the sandbox database.
  - Test that calling a write tool (e.g., `execute_query` with `INSERT`) outside of a transaction raises a `WriteOutsideTransactionError`.
  - Test that `DbBridge.beginTransaction()` returns a `TransactionHandle` and that `TransactionHandle.rollback()` reverts all writes made within the transaction.
  - Test that after a successful `TransactionHandle.rollback()`, subsequent reads confirm the data was not persisted.
  - Test that `DbBridge.beginTransaction()` followed by `TransactionHandle.commit()` persists changes correctly.
  - Test that if a `SandboxRetryExhaustedError` is caught by the orchestrator mid-transaction, an automatic `ROLLBACK` is issued before rethrowing the error.
- [ ] In `packages/core/src/sandbox/__tests__/tool-registry-scoping.test.ts`, write unit tests for tool scoping:
  - Test that `ToolRegistry.resolve(toolName, agentRole, projectPhase)` returns only tools available for the given role and phase.
  - Test that a `read-only` tool cannot be re-registered as `mutable` without explicit `forceOverride: true` flag (default preference for read-only).
  - Test that attempting to register a `mutable` tool where a `read-only` equivalent exists logs a `ToolMutabilityWarning`.

## 2. Task Implementation
- [ ] Create `packages/core/src/sandbox/db-bridge.ts`:
  - Export `DbBridge` class with constructor `(sandboxSession: SandboxSession, dbPath: string)`.
  - Implement `async beginTransaction(): Promise<TransactionHandle>` which issues `BEGIN TRANSACTION` to the sandbox's SQLite database via the MCP `execute_query` tool.
  - Export `TransactionHandle` class with methods:
    - `async commit(): Promise<void>` — issues `COMMIT` to the sandbox DB.
    - `async rollback(): Promise<void>` — issues `ROLLBACK` to the sandbox DB.
    - `async execute(sql: string, params?: unknown[]): Promise<QueryResult>` — executes SQL within the open transaction; throws `WriteOutsideTransactionError` if called after commit/rollback.
  - Enforce that `INSERT`, `UPDATE`, `DELETE`, `DROP`, and `ALTER` statements can only be executed via a `TransactionHandle`, not directly on `DbBridge`.
- [ ] Create `packages/core/src/sandbox/tool-registry.ts`:
  - Export `ToolRegistry` class managing a map of `ToolDefinition[]` indexed by name.
  - `ToolDefinition` interface: `{ name: string; schema: ZodSchema; mutability: 'read-only' | 'mutable'; allowedRoles: AgentRole[]; allowedPhases: AgentPhase[] }`.
  - Implement `resolve(name: string, role: AgentRole, phase: AgentPhase): ToolDefinition` — throws `ToolNotFoundError` or `ToolAccessDeniedError` as appropriate.
  - Implement `register(def: ToolDefinition, options?: { forceOverride?: boolean }): void` — logs `ToolMutabilityWarning` if registering a `mutable` tool when a `read-only` version already exists, unless `forceOverride: true`.
  - Default all introspection tools (`inspect_state`, `execute_query` for reads, `run_profiler`) to `mutability: 'read-only'`.
- [ ] Update `packages/core/src/orchestrator/server.ts`:
  - Wrap all write tool calls dispatched during the TDD cycle in a `DbBridge` transaction.
  - On `SandboxRetryExhaustedError`, call `transactionHandle.rollback()` before propagating the error.
- [ ] Export `WriteOutsideTransactionError` and `ToolMutabilityWarning` from `packages/core/src/sandbox/errors.ts`.

## 3. Code Review
- [ ] Verify that `DbBridge` never exposes raw database connection handles outside the `TransactionHandle` API.
- [ ] Confirm that all destructive SQL operations are gated behind `TransactionHandle.execute()` and cannot bypass the transaction check.
- [ ] Verify that `ToolRegistry.resolve()` always checks both `allowedRoles` and `allowedPhases` — failing either must throw `ToolAccessDeniedError`.
- [ ] Confirm that `ToolMutabilityWarning` is emitted via the structured logger (not `console.warn`) so it is captured in the audit log.
- [ ] Ensure `DbBridge` handles concurrent transaction requests gracefully (only one active transaction per `SandboxSession` — subsequent `beginTransaction()` calls while one is open must queue or throw `TransactionConflictError`).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="state-pollution"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="tool-registry-scoping"` and confirm all tests pass.
- [ ] Verify ≥ 90% branch coverage on `db-bridge.ts` and `tool-registry.ts`.

## 5. Update Documentation
- [ ] Create `packages/core/src/sandbox/db-bridge.agent.md` documenting: the purpose of `DbBridge`, transaction lifecycle, how ROLLBACK is triggered automatically on retry exhaustion, and SQL mutation restrictions.
- [ ] Update `packages/core/src/sandbox/sandbox.agent.md` to add a section on State Pollution Prevention, referencing `DbBridge` and `ToolRegistry` mutability enforcement.
- [ ] Add `3_MCP-RISK-202` to `docs/requirements-coverage.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/core test -- --ci --forceExit` and confirm exit code `0`.
- [ ] Run `node scripts/verify-req-coverage.js --ids 3_MCP-RISK-202` and confirm the ID is marked as covered.
- [ ] Execute a manual smoke test: start a sandbox session, begin a transaction, execute an `INSERT`, call `rollback()`, then `SELECT` the inserted row — confirm the row is absent. Record the test output in `docs/smoke-test-results/state-pollution.log`.
