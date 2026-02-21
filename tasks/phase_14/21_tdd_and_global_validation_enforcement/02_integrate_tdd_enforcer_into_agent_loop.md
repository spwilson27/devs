# Task: Integrate TDD Enforcer into the Agent Orchestration Loop (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/agentLoop.tdd.test.ts`, write integration tests for the agent task-execution loop:
  - Test: Attempting to transition a task from `pending` to `in_progress` (implementation phase) without a recorded failing-test artifact results in the loop throwing `TDDViolationError` and the task state remaining `pending`.
  - Test: Submitting a passing test artifact before any implementation artifact correctly advances the task to phase `Green`.
  - Test: Marking a task `done` without a code-review artifact causes the loop to throw `TDDViolationError` and keep the task in phase `Refactor`.
  - Test: A fully compliant Red→Green→Refactor→Complete cycle successfully marks the task `done` in the state store.
  - Test: A `TDDViolationError` emitted from the loop is captured in the structured audit log with ISO-8601 timestamp, `taskId`, and `violatedPhase` fields.
  - All tests must initially FAIL (Red phase).

## 2. Task Implementation
- [ ] In `src/orchestrator/agentLoop.ts` (or equivalent orchestration entry point), import `tddEnforcer` from `./tddEnforcer`.
- [ ] Before the "run implementation" agent step, call `tddEnforcer.enforceRedPhase(taskId, hasFailingTest)` where `hasFailingTest` is derived from inspecting the task's artifact store for a test-result artifact with `status: 'failing'`.
- [ ] Before the "mark task done" step, call `tddEnforcer.enforceRefactorPhase(taskId, reviewArtifact)` where `reviewArtifact` is the code-review output stored in the task's artifact store.
- [ ] Wrap all `TDDViolationError` throws in a `try/catch` in the loop's main error handler:
  - Log the violation to the structured audit log (`src/audit/auditLogger.ts`) with fields: `{ event: 'tdd_violation', taskId, violatedPhase, timestamp: new Date().toISOString() }`.
  - Re-throw or surface the error so the calling agent or UI is notified.
- [ ] Ensure the loop does NOT silently swallow `TDDViolationError`; it must always propagate to the audit log.

## 3. Code Review
- [ ] Confirm the orchestration loop does not have a conditional path that bypasses `enforceRedPhase` (e.g., no `if (skipTDD)` flags in production code paths).
- [ ] Verify that `TDDViolationError` events in the audit log include all three required fields: `taskId`, `violatedPhase`, `timestamp`.
- [ ] Confirm there are no unhandled promise rejections: all async calls within the loop that may raise `TDDViolationError` are properly awaited and wrapped.
- [ ] Ensure TypeScript strict mode is satisfied.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="agentLoop.tdd"` and confirm all integration tests pass.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.

## 5. Update Documentation
- [ ] Update `src/orchestrator/agentLoop.agent.md` (create if missing) to include:
  - A section "TDD Enforcement" describing when and how `TDDEnforcer` is called within the loop.
  - The state-transition diagram (Mermaid) showing the TDD phase gate positions within the full agent task lifecycle.
- [ ] Update `src/audit/auditLogger.agent.md` (create if missing) to document the `tdd_violation` audit event schema.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="agentLoop.tdd" --coverage` and confirm all tests pass with ≥ 90% branch coverage on the loop's TDD enforcement paths.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Execute a dry-run smoke test: `npx ts-node src/orchestrator/smokeTest.ts` (or equivalent) that intentionally skips the Red phase and assert the process exits non-zero with a `TDDViolationError` message in stderr.
