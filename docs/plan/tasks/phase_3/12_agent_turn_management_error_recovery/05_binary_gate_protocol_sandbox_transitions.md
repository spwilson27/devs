# Task: Binary Gate Protocol for Sandbox State Transitions (Sub-Epic: 12_Agent Turn Management & Error Recovery)

## Covered Requirements
- [3_MCP-TAS-041]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/binary-gate.test.ts`, write unit tests covering:
  - `BinaryGate.evaluate(exitCode: number)` returns `{ passed: true }` when `exitCode === 0`.
  - `BinaryGate.evaluate(exitCode: number)` returns `{ passed: false, reason: 'NON_ZERO_EXIT', exitCode }` for any non-zero exit code.
  - `BinaryGate.evaluate()` called with `null` (process killed/timeout) returns `{ passed: false, reason: 'PROCESS_KILLED' }`.
  - `BinaryGateOrchestrator.transition(nodeId, gate)` advances the node graph to the next node when `gate.passed === true`.
  - `BinaryGateOrchestrator.transition()` keeps the state machine in the current node and emits a `GATE_FAILED` event when `gate.passed === false`.
  - Attempting to advance past the final node returns `{ complete: true }`.
  - A gate failure after `maxConsecutiveFailures` (default 3) transitions the orchestrator to `ESCALATION` state.
- [ ] Write integration tests in `packages/core/src/__tests__/sandbox-gate.integration.test.ts`:
  - Run a real sandboxed process that exits 0; confirm the DAG advances to the next node.
  - Run a sandboxed process that exits 1; confirm the DAG stays at current node and `GATE_FAILED` is logged.
  - Simulate 3 consecutive gate failures; confirm `ESCALATION` state transition and `USER_ESCALATION` notification.

## 2. Task Implementation
- [ ] Create `packages/core/src/sandbox/binary-gate.ts`:
  - Export pure function `evaluate(exitCode: number | null): GateResult` where `GateResult = { passed: true } | { passed: false; reason: 'NON_ZERO_EXIT'; exitCode: number } | { passed: false; reason: 'PROCESS_KILLED' }`.
  - Add `// REQ: 3_MCP-TAS-041` comment at function definition.
- [ ] Create `packages/core/src/sandbox/binary-gate-orchestrator.ts`:
  - Export class `BinaryGateOrchestrator` with constructor `{ dag: TaskDAG; logger: ILogger; maxConsecutiveFailures: number }` (default `maxConsecutiveFailures: 3`).
  - Maintain `consecutiveFailures: number` (instance state per orchestration run, not class-level singleton).
  - Implement `transition(currentNodeId: string, result: GateResult): TransitionResult`:
    - If `result.passed`: reset `consecutiveFailures = 0`, return next node ID from DAG or `{ complete: true }`.
    - If `!result.passed`: increment `consecutiveFailures`; emit `{ event: 'GATE_FAILED', nodeId: currentNodeId, reason: result.reason, consecutiveFailures }` log event; if `consecutiveFailures >= maxConsecutiveFailures`, emit `{ event: 'ESCALATION_TRIGGERED' }` and return `{ escalate: true }`.
  - Export `TransitionResult` as a discriminated union: `{ advance: true; nextNodeId: string } | { complete: true } | { stay: true; reason: string } | { escalate: true }`.
- [ ] In `packages/core/src/orchestrator/orchestrator.ts`, after each sandbox execution step, call `BinaryGate.evaluate(exitCode)` and `BinaryGateOrchestrator.transition()` to control DAG advancement.
- [ ] Ensure `TaskDAG` (from Phase 3's existing DAG implementation) is used for node adjacency lookups — do not reimplement adjacency logic.

## 3. Code Review
- [ ] Verify `evaluate()` is a pure function with no side effects (no logger calls, no throws) — all side effects live in `BinaryGateOrchestrator.transition()`.
- [ ] Confirm `consecutiveFailures` is scoped per orchestration run and is reset to 0 on any successful gate — verify this cannot carry over between unrelated task runs.
- [ ] Verify `ESCALATION_TRIGGERED` event is emitted before returning `{ escalate: true }` so the log captures the reason prior to any state change.
- [ ] Confirm `// REQ: 3_MCP-TAS-041` annotation is present in `binary-gate.ts`.
- [ ] Ensure the `TaskDAG` adjacency lookup uses a read-only view and does not mutate the DAG.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="binary-gate|sandbox-gate"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test` (full suite) and confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/sandbox/binary-gate.agent.md` documenting:
  - Gate evaluation rules (exit code 0 = pass, anything else or null = fail).
  - Escalation threshold (`maxConsecutiveFailures = 3` default).
  - Introspection points: `GATE_FAILED`, `ESCALATION_TRIGGERED` log events.
  - Mermaid state diagram showing transitions: `RUNNING -> GATE_PASS -> NEXT_NODE`, `RUNNING -> GATE_FAIL -> RETRY / ESCALATION`.
- [ ] Update `docs/architecture/sandbox.md` with binary gate protocol section.
- [ ] Append entry for `BinaryGate` and `BinaryGateOrchestrator` to `packages/core/src/sandbox/index.agent.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `binary-gate.ts` and `binary-gate-orchestrator.ts` each have ≥ 90% branch coverage.
- [ ] Run `grep -n "REQ: 3_MCP-TAS-041" packages/core/src/sandbox/binary-gate.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero TypeScript errors.
