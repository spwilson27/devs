# Task: Integrate Protocol Freeze Trigger into Phase Lifecycle (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [9_ROADMAP-REQ-043]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/phaseLifecycle.protocolFreeze.test.ts`, write integration tests for the phase-transition logic:
  - Test: When the orchestrator completes Phase 1 (all P1 tasks marked `done`), the `ProtocolFreezeGuard.freeze('P1-complete')` is automatically called.
  - Test: After Phase 1 completes, `ProtocolFreezeGuard.isFrozen()` returns `true`.
  - Test: Attempting to start an agent task in Phase 6+ that modifies `src/orchestrator/agentLoop.ts` causes the loop to catch `ProtocolFrozenError` and surface it as a `phase_frozen_violation` audit log event (not silently swallowed).
  - Test: A Phase 6+ task that modifies only `src/ui/components/Dashboard.tsx` proceeds without error even when the freeze is active.
  - Test: The orchestrator surfaces a user-facing notification (webview message or CLI warning) when a `ProtocolFrozenError` is caught, including the `milestone` and `attemptedChange` fields.
  - All tests must initially FAIL (Red phase).

## 2. Task Implementation
- [ ] In `src/orchestrator/phaseLifecycle.ts` (create if missing), implement a `PhaseLifecycleManager`:
  - `async onPhaseComplete(phaseId: string): Promise<void>`:
    - If `phaseId === 'phase_1'`, call `protocolFreezeGuard.freeze('P1-complete')`.
    - Emit a `phase_complete` event to the audit log with `{ phaseId, frozenAt: timestamp }`.
  - `async onTaskStart(taskId: string, changedFilePaths: string[]): Promise<void>`:
    - Call `protocolFreezeGuard.checkForBreakingChange(changedFilePaths)`.
    - Wrap in `try/catch`: on `ProtocolFrozenError`, log a `phase_frozen_violation` audit event and emit a user-facing notification via the existing `NotificationService` (webview message bus or CLI stderr).
- [ ] Wire `PhaseLifecycleManager.onPhaseComplete` into the existing phase-completion code path in `agentLoop.ts`.
- [ ] Wire `PhaseLifecycleManager.onTaskStart` into the task-start code path in `agentLoop.ts`, passing the list of files the agent intends to modify (derived from the task's declared scope in its task manifest).

## 3. Code Review
- [ ] Confirm there is no code path in `agentLoop.ts` that completes Phase 1 without calling `onPhaseComplete('phase_1')`.
- [ ] Confirm the `phase_frozen_violation` audit event is persisted even if the downstream notification fails (i.e., the audit log write is not inside the notification `try/catch`).
- [ ] Confirm `PhaseLifecycleManager` is unit-testable by accepting `ProtocolFreezeGuard` and `AuditLogger` via constructor injection (no hard-coded singletons).
- [ ] Ensure TypeScript strict mode is satisfied.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="phaseLifecycle.protocolFreeze"` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.

## 5. Update Documentation
- [ ] Update `src/orchestrator/agentLoop.agent.md` with a new section "Phase Lifecycle & Protocol Freeze" describing:
  - When `onPhaseComplete` is called and what it triggers.
  - When `onTaskStart` is called and what breaking-change check it performs.
- [ ] Create `src/orchestrator/phaseLifecycle.agent.md` documenting:
  - The `PhaseLifecycleManager` API.
  - The Mermaid state diagram showing Phase 1 → Freeze → Phase 6+ task-start check.
  - The `phase_frozen_violation` audit event schema.
- [ ] Add `phaseLifecycle.agent.md` to the root `AGENTS.md` AOD index.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="phaseLifecycle.protocolFreeze" --coverage` and confirm all tests pass with ≥ 90% branch coverage on phase-lifecycle paths.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Confirm audit log captures the freeze event: execute the integration test suite and grep the output artifact store for `phase_complete` with `frozenAt` field set.
- [ ] Confirm `src/orchestrator/phaseLifecycle.agent.md` exists: `test -f src/orchestrator/phaseLifecycle.agent.md && echo "AOD OK"`.
