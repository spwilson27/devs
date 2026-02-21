# Task: Tool Timeout Enforcement (300s) (Sub-Epic: 12_Agent Turn Management & Error Recovery)

## Covered Requirements
- [3_MCP-TAS-073]

## 1. Initial Test Written
- [ ] In `packages/core/src/mcp/__tests__/tool-timeout-handler.test.ts`, write unit tests covering:
  - `ToolTimeoutHandler.execute()` resolves normally when the wrapped tool completes within 300 seconds.
  - `ToolTimeoutHandler.execute()` resolves with `{ status: 'TIMEOUT_EXCEEDED', toolName, elapsedMs: number }` observation when the wrapped tool takes longer than the configured timeout.
  - The underlying tool promise is aborted/cancelled via `AbortController` on timeout (verify `signal.aborted === true`).
  - Custom timeout values below 300s are respected for unit-test speed.
  - The observation returned on timeout conforms to `SAOPObservationSchema` with `status: 'TIMEOUT_EXCEEDED'`.
- [ ] In `packages/core/src/__tests__/tool-proxy-timeout.integration.test.ts`, write integration tests:
  - Instrument a real `ToolProxy` with a slow fake tool (sleeps 310s via timer mock); verify the proxy returns a `TIMEOUT_EXCEEDED` observation to the agent turn loop.
  - Verify the orchestrator does NOT terminate after a single timeout — the agent receives the `TIMEOUT_EXCEEDED` observation and must continue its turn (reassess strategy).

## 2. Task Implementation
- [ ] Create `packages/core/src/mcp/tool-timeout-handler.ts`:
  - Export class `ToolTimeoutHandler` with constructor `{ timeoutMs: number; logger: ILogger }` (default `timeoutMs: 300_000`).
  - Implement `async execute<T>(toolName: string, fn: (signal: AbortSignal) => Promise<T>): Promise<T | TimeoutObservation>`:
    1. Create `AbortController`; start a `setTimeout` for `timeoutMs` that calls `controller.abort()` and resolves with `{ status: 'TIMEOUT_EXCEEDED', toolName, elapsedMs: timeoutMs }`.
    2. Race the `fn(controller.signal)` promise against the timeout.
    3. Clear the timeout if `fn` completes first.
    4. Emit log event `{ event: 'TOOL_TIMEOUT_EXCEEDED', toolName, elapsedMs }` on timeout.
  - Export `TimeoutObservation` type: `{ status: 'TIMEOUT_EXCEEDED'; toolName: string; elapsedMs: number }`.
  - Add `// REQ: 3_MCP-TAS-073` comment at class definition.
- [ ] Update `packages/core/src/mcp/tool-proxy.ts` to wrap every tool execution through `ToolTimeoutHandler.execute()`.
- [ ] Add `TIMEOUT_EXCEEDED` as a valid `status` value in `SAOPObservationSchema` in `packages/core/src/protocol/saop-schema.ts`.
- [ ] Wire `ToolTimeoutHandler` into the DI container in `packages/core/src/container.ts`, reading `TOOL_TIMEOUT_MS` from environment/config (default `300000`).

## 3. Code Review
- [ ] Verify `AbortController.abort()` is called on timeout so that tools implementing `signal` awareness can clean up resources.
- [ ] Confirm the returned `TimeoutObservation` is structurally identical to a normal `SAOPObservation` (same top-level keys) so the agent's turn loop does not require special-casing.
- [ ] Verify no `Promise` is left dangling after timeout — confirm the tool's underlying promise rejection (if any) is caught and suppressed after abort to avoid unhandled rejections.
- [ ] Confirm `// REQ: 3_MCP-TAS-073` annotation is present.
- [ ] Verify `TOOL_TIMEOUT_MS` config value is documented and has a sensible production default of `300000`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="tool-timeout-handler|tool-proxy-timeout"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/mcp/tool-timeout-handler.agent.md` documenting:
  - Timeout value (300s default), `AbortController` usage, `TIMEOUT_EXCEEDED` observation shape.
  - Agent behavior expectation: on receiving `TIMEOUT_EXCEEDED`, the agent must reassess its strategy (break problem into smaller tool calls or choose a different approach).
  - Introspection point: `TOOL_TIMEOUT_EXCEEDED` log event with `toolName` and `elapsedMs`.
- [ ] Update `docs/architecture/error-recovery.md` with tool timeout section.
- [ ] Update `packages/core/src/mcp/tool-proxy.agent.md` to note timeout enforcement wrapping.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `tool-timeout-handler.ts` has ≥ 90% branch coverage.
- [ ] Run `grep -rn "REQ: 3_MCP-TAS-073" packages/core/src/mcp/tool-timeout-handler.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
- [ ] Run `grep "TIMEOUT_EXCEEDED" packages/core/src/protocol/saop-schema.ts` and assert it is present in the schema definition.
