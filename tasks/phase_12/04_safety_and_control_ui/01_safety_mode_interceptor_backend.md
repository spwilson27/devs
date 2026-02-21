# Task: Safety Mode Tool Call Interceptor — Backend Core (Sub-Epic: 04_Safety and Control UI)

## Covered Requirements
- [1_PRD-REQ-UI-007], [5_SECURITY_DESIGN-REQ-SEC-SD-071]

## 1. Initial Test Written
- [ ] In `packages/core/src/safety/__tests__/SafetyInterceptor.test.ts`, write unit tests for a `SafetyInterceptor` class:
  - Test that when Safety Mode is `disabled`, tool calls are passed through immediately without blocking.
  - Test that when Safety Mode is `enabled`, a filesystem write tool call (e.g., `tool_name: "write_file"`) triggers a pending approval state and does NOT execute until `approve()` is called.
  - Test that when Safety Mode is `enabled`, a network request tool call (e.g., `tool_name: "http_request"`) triggers a pending approval state.
  - Test that calling `deny()` on a pending intercepted call rejects the tool call with a `ToolCallDeniedError`.
  - Test that calling `approve()` on a pending intercepted call resolves and executes the underlying tool.
  - Test that the interceptor emits a `hitl:awaiting_approval` event on the `EventBus` when blocking a tool call, with the payload `{ callId, toolName, args, timestamp }`.
  - Test that the interceptor emits a `hitl:approved` event when a call is approved.
  - Test that the interceptor emits a `hitl:denied` event when a call is denied.
  - Test tool classification logic: `isRestrictedTool(toolName)` returns `true` for `write_file`, `delete_file`, `move_file`, `http_request`, `execute_shell` and `false` for `read_file`, `list_directory`.
  - Write integration tests ensuring the interceptor hooks into the orchestrator's tool dispatch pipeline when Safety Mode is `enabled`.

## 2. Task Implementation
- [ ] Create `packages/core/src/safety/SafetyInterceptor.ts`:
  - Export a `SafetyMode` enum: `DISABLED = "disabled"`, `ENABLED = "enabled"`.
  - Export a `ToolCallDeniedError` class extending `Error`.
  - Define `RestrictedToolCategories`: an array of tool name patterns/strings that require approval (e.g. `write_file`, `delete_file`, `move_file`, `http_request`, `execute_shell`, `run_tests`).
  - Implement `isRestrictedTool(toolName: string): boolean` — returns `true` if the tool name matches any restricted category.
  - Implement the `SafetyInterceptor` class:
    - Constructor accepts `(eventBus: EventBus, initialMode?: SafetyMode)`.
    - `setMode(mode: SafetyMode): void` — toggles Safety Mode at runtime.
    - `getMode(): SafetyMode`.
    - `intercept(call: ToolCall): Promise<ToolCallResult>` — the primary hook:
      - If mode is `DISABLED` or `!isRestrictedTool(call.toolName)`, execute the call directly.
      - If mode is `ENABLED` and `isRestrictedTool(call.toolName)`:
        - Generate a UUID `callId`.
        - Store the pending call in a `Map<callId, { resolve, reject, call }>`.
        - Emit `hitl:awaiting_approval` event on `eventBus` with `{ callId, toolName: call.toolName, args: call.args, timestamp: Date.now() }`.
        - Return a `Promise` that stays pending until `approve(callId)` or `deny(callId)` is called.
    - `approve(callId: string): Promise<void>` — resolves the pending call, emits `hitl:approved`.
    - `deny(callId: string): void` — rejects with `ToolCallDeniedError`, emits `hitl:denied`.
- [ ] Export `SafetyInterceptor` from `packages/core/src/index.ts`.
- [ ] Wire the `SafetyInterceptor` into the orchestrator's tool dispatch in `packages/core/src/orchestrator/Orchestrator.ts`:
  - Inject `SafetyInterceptor` via constructor.
  - Replace direct `toolDispatcher.execute(call)` calls with `safetyInterceptor.intercept(call)`.

## 3. Code Review
- [ ] Verify `SafetyInterceptor` is stateless regarding tool results — it only gates execution, never mutates tool call arguments.
- [ ] Confirm that the pending calls `Map` is bounded — add a configurable `timeoutMs` (default: 5 minutes) after which a pending call is auto-denied and `hitl:timeout` is emitted.
- [ ] Ensure no `any` types are used; all `ToolCall` and `ToolCallResult` types must be imported from `@devs/types`.
- [ ] Confirm that `isRestrictedTool` is a pure function with no side effects.
- [ ] Check that the `EventBus` is used for all state transitions (no direct callbacks or global state).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="SafetyInterceptor"` and confirm all tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/core test:coverage` and confirm the `safety/SafetyInterceptor.ts` module has ≥ 90% line and branch coverage.

## 5. Update Documentation
- [ ] Create `packages/core/src/safety/SafetyInterceptor.agent.md` documenting:
  - Purpose: gates restricted tool calls behind human approval in Safety Mode.
  - The `RestrictedToolCategories` list with rationale for each category.
  - The event contract (`hitl:awaiting_approval`, `hitl:approved`, `hitl:denied`, `hitl:timeout`).
  - How to wire the interceptor into a new orchestrator.
- [ ] Update `packages/core/README.md` to reference the Safety Mode section.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="SafetyInterceptor" --json --outputFile=/tmp/safety_interceptor_results.json` and verify the output file contains `"numFailedTests": 0`.
- [ ] Run `grep -r "safetyInterceptor.intercept" packages/core/src/orchestrator/Orchestrator.ts` and confirm the hook is present (exit code 0).
