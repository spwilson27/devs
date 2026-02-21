# Task: Implement Discovery-to-Architecture Phase Transition Logic (Sub-Epic: 13_HITL Gate & Phase Transition)

## Covered Requirements
- [9_ROADMAP-REQ-007], [9_ROADMAP-DOD-P3], [1_PRD-REQ-UI-001]

## 1. Initial Test Written
- [ ] In `packages/core/src/phase-gate/__tests__/phase-transition.service.test.ts`, write unit tests that assert:
  - `PhaseTransitionService.executeTransition(gateId)` reads the gate from `IPhaseGateRepository.findById(gateId)`.
  - When gate state is `APPROVED`, `PhaseTransitionService.executeTransition()` calls `IPhaseRunner.startPhase('architecture')` and returns `{ success: true, nextPhase: 'architecture' }`.
  - When gate state is NOT `APPROVED` (e.g., `AWAITING_USER_APPROVAL`), `PhaseTransitionService.executeTransition()` throws `PhaseTransitionBlockedError` with `{ reason: 'Gate not approved', gateId, currentState }`.
  - When gate state is `REJECTED`, `PhaseTransitionService.executeTransition()` throws `PhaseTransitionBlockedError` with `{ reason: 'Gate rejected', rejectionReason }`.
  - `PhaseTransitionService.executeTransition()` emits a `PhaseTransitionInitiatedEvent` before calling `startPhase`.
  - `PhaseTransitionService.executeTransition()` emits a `PhaseTransitionCompletedEvent` after `startPhase` resolves.
  - `PhaseTransitionService.executeTransition()` emits a `PhaseTransitionFailedEvent` if `startPhase` rejects.
- [ ] In `packages/core/src/phase-gate/__tests__/phase-transition.service.integration.test.ts`, write an integration test that:
  - Creates a gate, transitions it to `APPROVED` via `HITLApprovalService.recordApproval()`.
  - Calls `PhaseTransitionService.executeTransition(gateId)` and asserts `{ success: true, nextPhase: 'architecture' }`.
  - Verifies that `IPhaseRunner.startPhase` was called with `'architecture'` exactly once.

## 2. Task Implementation
- [ ] Create `packages/core/src/phase-gate/phase-transition.service.ts`:
  - Define and export `IPhaseRunner` interface with `startPhase(phaseId: string): Promise<void>`.
  - Define and export `PhaseTransitionResult` type: `{ success: boolean; nextPhase: string }`.
  - Define and export `PhaseTransitionBlockedError` extending `Error` with fields: `gateId`, `currentState`, `reason`, `rejectionReason?`.
  - Define and export events: `PhaseTransitionInitiatedEvent`, `PhaseTransitionCompletedEvent`, `PhaseTransitionFailedEvent` (plain objects with `type` discriminant and relevant fields).
  - Implement `PhaseTransitionService` class accepting `IPhaseGateRepository`, `IPhaseRunner`, and `EventEmitter` via constructor.
  - Implement `async executeTransition(gateId: string): Promise<PhaseTransitionResult>`:
    1. Fetch gate via `repository.findById(gateId)`.
    2. If gate state is not `APPROVED`, throw `PhaseTransitionBlockedError`.
    3. Emit `PhaseTransitionInitiatedEvent`.
    4. Await `phaseRunner.startPhase('architecture')`.
    5. Emit `PhaseTransitionCompletedEvent`.
    6. Return `{ success: true, nextPhase: 'architecture' }`.
    7. On error from `startPhase`, emit `PhaseTransitionFailedEvent` and re-throw.
- [ ] Update `packages/core/src/phase-gate/index.ts` to export all new types, the service, and events.

## 3. Code Review
- [ ] Verify `PhaseTransitionService` has no hardcoded phase names other than `'architecture'` (the next phase after Discovery). The target phase should be injected as a constructor parameter (`nextPhaseId: string`) to allow reuse for future gates.
- [ ] Verify event emission happens in the correct order: `Initiated` before `startPhase`, `Completed` after.
- [ ] Verify `PhaseTransitionBlockedError` provides enough structured context for the orchestrator to log and surface a clear error message.
- [ ] Verify the service has no direct dependency on any notification adapter or UI framework.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="phase-transition"` and confirm all tests pass.
- [ ] Confirm both the unit and integration tests exercise the blocked and succeeded paths.

## 5. Update Documentation
- [ ] Append to `packages/core/src/phase-gate/phase-gate.agent.md`:
  - Section: **Phase Transition Service** — document `IPhaseRunner` extension point, `PhaseTransitionResult`, error types, and event shapes.
  - Add a Mermaid sequence diagram: `PhaseTransitionService → IPhaseGateRepository → IPhaseRunner → EventEmitter`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:coverage -- --testPathPattern="phase-transition"` and assert exit code 0 with ≥ 95% branch coverage.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0.
