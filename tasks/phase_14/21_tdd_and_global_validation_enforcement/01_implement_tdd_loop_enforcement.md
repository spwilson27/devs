# Task: Implement TDD Loop Enforcement Engine (Sub-Epic: 21_TDD and Global Validation Enforcement)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/tddEnforcer.test.ts`, write unit tests for a `TDDEnforcer` class:
  - Test: `enforceRedPhase()` throws `TDDViolationError` if a task implementation is submitted without a corresponding failing test recorded first.
  - Test: `enforceGreenPhase()` throws `TDDViolationError` if the implementation step is skipped and the task moves directly to "done".
  - Test: `enforceRefactorPhase()` confirms that a code review artifact must exist before a task is marked complete.
  - Test: `getPhaseState(taskId)` returns the correct current TDD phase (`red | green | refactor | complete`) for a given task ID.
  - Test: `resetPhase(taskId)` correctly resets a task's TDD state back to `red` when called.
  - All tests must initially FAIL (Red phase).

## 2. Task Implementation
- [ ] Create `src/orchestrator/tddEnforcer.ts`:
  - Define a `TDDPhase` enum: `Red = 'red'`, `Green = 'green'`, `Refactor = 'refactor'`, `Complete = 'complete'`.
  - Define a `TDDViolationError` class extending `Error` with a `phase: TDDPhase` property.
  - Implement the `TDDEnforcer` class:
    - Maintain an in-memory `Map<string, TDDPhase>` keyed by `taskId`.
    - `enforceRedPhase(taskId: string, hasFailingTest: boolean)`: if `hasFailingTest` is false, throw `TDDViolationError` with phase `Red`.  Advance state to `Green`.
    - `enforceGreenPhase(taskId: string, implementationArtifact: string | null)`: if `implementationArtifact` is null, throw `TDDViolationError` with phase `Green`. Advance state to `Refactor`.
    - `enforceRefactorPhase(taskId: string, reviewArtifact: string | null)`: if `reviewArtifact` is null, throw `TDDViolationError` with phase `Refactor`. Advance state to `Complete`.
    - `getPhaseState(taskId: string): TDDPhase`: return current phase or default to `Red` if not found.
    - `resetPhase(taskId: string): void`: set phase back to `Red`.
  - Export `TDDEnforcer` as a singleton via a module-level `export const tddEnforcer = new TDDEnforcer()`.
- [ ] Register `TDDViolationError` in `src/orchestrator/errors.ts` (or create this file) so it is importable across the orchestrator.

## 3. Code Review
- [ ] Verify the `TDDEnforcer` has zero side-effects outside its internal `Map`; it must not touch the filesystem or database.
- [ ] Confirm `TDDViolationError` carries enough context (phase + taskId) for upstream error handlers to surface actionable messages.
- [ ] Confirm TypeScript strict mode (`"strict": true` in `tsconfig.json`) is satisfied with no `any` types.
- [ ] Ensure the singleton export pattern does not cause cross-test pollution (tests should instantiate their own `TDDEnforcer` instances, not import the singleton).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="tddEnforcer"` and confirm all tests pass (Green phase).
- [ ] Confirm zero TypeScript compile errors: `npx tsc --noEmit`.

## 5. Update Documentation
- [ ] Create `src/orchestrator/tddEnforcer.agent.md` documenting:
  - Purpose: enforces the Red-Green-Refactor TDD cycle for every orchestrated task.
  - Public API of `TDDEnforcer` with parameter descriptions.
  - `TDDPhase` enum values and valid state transitions.
  - `TDDViolationError` structure and how callers should handle it.
- [ ] Add a reference to `tddEnforcer.agent.md` in the project's root `AGENTS.md` (or equivalent AOD index).

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="tddEnforcer" --coverage` and confirm:
  - All tests pass.
  - Statement coverage for `tddEnforcer.ts` is ≥ 95%.
- [ ] Run `npx tsc --noEmit` and confirm exit code is `0`.
- [ ] Confirm `src/orchestrator/tddEnforcer.agent.md` exists: `test -f src/orchestrator/tddEnforcer.agent.md && echo "AOD OK"`.
