# Task: Enforce Single-User Architecture Boundary for Multi-User Orchestration (Sub-Epic: 02_Out-of-Scope Manifest - Platform & Runtime Services)

## Covered Requirements
- [1_PRD-REQ-OOS-010]

## 1. Initial Test Written
- [ ] In `src/guards/__tests__/multi-user-boundary.guard.test.ts`, write unit tests covering:
  - `MultiUserBoundaryGuard.validate(request)` returns a `BoundaryViolation` with `requirementId: "1_PRD-REQ-OOS-010"` when `request.sessionContext.activeUserCount > 1`.
  - `MultiUserBoundaryGuard.validate(request)` returns `null` when `activeUserCount === 1` or `activeUserCount` is undefined.
  - `MultiUserBoundaryGuard.validate(request)` returns a `BoundaryViolation` when `request.intent` contains collaboration-oriented signals: `"collaborate"`, `"multi-user"`, `"shared session"`, `"invite user"`, `"team mode"`.
  - The returned violation's `suggestedAction` references the future roadmap item `9_ROADMAP-FUTURE-002` and instructs the user to track the feature request.
  - Test that a `BOUNDARY_VIOLATION` event is emitted via the system event bus when the guard triggers, and the event payload includes `{ requirementId: "1_PRD-REQ-OOS-010", futureRoadmapHook: "9_ROADMAP-FUTURE-002" }`.
- [ ] In `src/config/__tests__/single-user.config.test.ts`, write tests that:
  - Verify `MAX_CONCURRENT_USERS` config constant equals `1`.
  - Verify `SessionManager.getActiveSessionCount()` never exceeds `1` (mock the session store to simulate a second session creation attempt and assert it returns a `SESSION_LIMIT_EXCEEDED` error).

## 2. Task Implementation
- [ ] Create `src/guards/multi-user-boundary.guard.ts`:
  - Define `COLLABORATION_INTENT_SIGNALS: string[]`.
  - Implement `MultiUserBoundaryGuard.validate(request: OrchestratorRequest): BoundaryViolation | null`:
    - Check `request.sessionContext?.activeUserCount > 1` → violation.
    - Check intent string for collaboration signals → violation.
    - Violation message must include: `"devs is a single-user tool (1_PRD-REQ-OOS-010). Multi-user collaboration is planned for a future release."` and `suggestedAction` referencing `9_ROADMAP-FUTURE-002`.
  - Export singleton: `export const multiUserBoundaryGuard = new MultiUserBoundaryGuard()`.
- [ ] In `src/config/session.config.ts` (create if absent), export:
  ```typescript
  export const MAX_CONCURRENT_USERS = 1;
  ```
- [ ] In `src/session/session-manager.ts`, add a guard at the `createSession()` entry point:
  - Before creating a new session, call `sessionManager.getActiveSessionCount()`.
  - If count >= `MAX_CONCURRENT_USERS`, throw a `SessionLimitExceededError` with message referencing `1_PRD-REQ-OOS-010`.
- [ ] Register `MultiUserBoundaryGuard` in the orchestrator's request validation pipeline (same location as `AasBoundaryGuard`), ensuring it runs before agent invocation.
- [ ] Emit a `BOUNDARY_VIOLATION` event (with `futureRoadmapHook: "9_ROADMAP-FUTURE-002"`) on the system event bus when the guard triggers.

## 3. Code Review
- [ ] Verify `MAX_CONCURRENT_USERS = 1` is not hardcoded inline in `session-manager.ts`; it must be imported from `session.config.ts`.
- [ ] Verify that `SessionLimitExceededError` is a typed custom error class (extends `Error`) in `src/errors/` — not an untyped `throw new Error(...)`.
- [ ] Verify the `futureRoadmapHook` field is present in the `BoundaryViolation` type (update `boundary-violation.types.ts` from task 02 to include this optional field if not already present).
- [ ] Verify that the guard and session manager are independently testable (no tight coupling; the session manager should not import the guard directly).
- [ ] Verify TypeScript strict mode passes with no implicit `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/guards/__tests__/multi-user-boundary.guard.test.ts src/config/__tests__/single-user.config.test.ts --coverage` and confirm all tests pass.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/guards/multi-user-boundary.guard.agent.md` documenting: the guard's purpose, collaboration signals it detects, the `MAX_CONCURRENT_USERS` constraint, the future roadmap hook, and the `SessionLimitExceededError`.
- [ ] Update `docs/architecture/boundary-guards.md` with a row for `MultiUserBoundaryGuard`.
- [ ] Add a note to `docs/architecture/session-management.md` (create if absent) documenting the single-user session constraint and its future extensibility path toward Team Mode (`9_ROADMAP-FUTURE-002`).

## 6. Automated Verification
- [ ] Run the following smoke test:
  ```bash
  npx ts-node -e "
  import { multiUserBoundaryGuard } from './src/guards/multi-user-boundary.guard';
  const v = multiUserBoundaryGuard.validate({ intent: 'start a shared team session', sessionContext: { activeUserCount: 2 } });
  if (!v || v.requirementId !== '1_PRD-REQ-OOS-010') process.exit(1);
  const ok = multiUserBoundaryGuard.validate({ intent: 'generate a new project', sessionContext: { activeUserCount: 1 } });
  if (ok !== null) process.exit(1);
  console.log('MultiUserBoundaryGuard: PASS');
  "
  ```
  Confirm exit code 0 and output `MultiUserBoundaryGuard: PASS`.
