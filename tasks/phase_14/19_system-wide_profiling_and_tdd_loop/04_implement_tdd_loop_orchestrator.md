# Task: Implement TDD Loop Orchestrator Enforcing Red-Green-Refactor (Sub-Epic: 19_System-Wide Profiling and TDD Loop)

## Covered Requirements
- [3_MCP-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create `src/tdd/__tests__/TddLoopOrchestrator.test.ts`.
- [ ] Write a unit test `should reject task execution if no tests are written first` — mock the `TestAgent` to report `testsWritten: false`; assert the orchestrator throws (or returns a structured error) `TddViolationError: Tests must be written before implementation.`
- [ ] Write a unit test `should execute implementation only after tests are in RED state` — mock `TestRunner.run()` returning `{ status: 'red', failCount: 3 }`; assert the orchestrator proceeds to call `ImplementationAgent.execute()`.
- [ ] Write a unit test `should block implementation if tests pass before implementation (no RED state)` — mock `TestRunner.run()` returning `{ status: 'green', failCount: 0 }` on the first run; assert the orchestrator throws `TddViolationError: Tests must fail (RED) before implementation begins.`
- [ ] Write a unit test `should confirm GREEN state after implementation and run tests again` — mock `TestRunner.run()` returning `red` on first call and `green` on second call; assert the orchestrator invokes `TestRunner.run()` exactly twice and returns `{ status: 'green' }`.
- [ ] Write a unit test `should trigger refactor agent after reaching GREEN` — assert `RefactorAgent.execute()` is called exactly once after the second `TestRunner.run()` returns `green`.
- [ ] Write a unit test `should record phase metrics for test-writing, implementation, and refactor stages` — assert `ProfilingService.startPhase` and `endPhase` are called for `'tdd:write-tests'`, `'tdd:implementation'`, and `'tdd:refactor'`.
- [ ] Write an integration test `full TDD loop completes successfully with real agents stubbed at the boundary` — wire a real `TddLoopOrchestrator` with test-double agents, execute a loop, and assert final state is `{ status: 'green', refactored: true }`.

## 2. Task Implementation
- [ ] Create `src/tdd/TddLoopOrchestrator.ts`.
- [ ] Define and export interface `TddLoopResult { status: 'green' | 'error'; refactored: boolean; phaseMetrics: PhaseMetric[] }`.
- [ ] Define and export class `TddViolationError extends Error` with a `code: 'TDD_VIOLATION'` property.
- [ ] Implement `TddLoopOrchestrator` constructor accepting:
  - `testAgent: TestAgent` (writes the initial failing tests)
  - `implementationAgent: ImplementationAgent` (implements code to pass tests)
  - `refactorAgent: RefactorAgent` (cleans up code while keeping tests green)
  - `testRunner: TestRunner` (runs the test suite and returns status + counts)
  - `profilingService: ProfilingService`
- [ ] Implement `async execute(task: Task): Promise<TddLoopResult>` with this exact sequence:
  1. `profilingService.startPhase('tdd:write-tests')`; call `testAgent.writeTests(task)`; `profilingService.endPhase('tdd:write-tests')`.
  2. Run `testRunner.run()` → must be `red`; if `green`, throw `TddViolationError`.
  3. `profilingService.startPhase('tdd:implementation')`; call `implementationAgent.execute(task)`; `profilingService.endPhase('tdd:implementation')`.
  4. Run `testRunner.run()` → must be `green`; if still `red`, throw `TddViolationError('Implementation did not reach GREEN state.')`.
  5. `profilingService.startPhase('tdd:refactor')`; call `refactorAgent.execute(task)`; `profilingService.endPhase('tdd:refactor')`.
  6. Run `testRunner.run()` a third time to confirm refactor didn't break tests; if `red`, throw `TddViolationError('Refactor broke tests.')`.
  7. Return `{ status: 'green', refactored: true, phaseMetrics: profilingService.getMetrics() }`.
- [ ] Export `TddLoopOrchestrator` from `src/tdd/index.ts`.

## 3. Code Review
- [ ] Verify that `TddLoopOrchestrator` does not directly import `TestAgent`, `ImplementationAgent`, or `RefactorAgent` implementations — it must depend only on interfaces (dependency inversion principle).
- [ ] Confirm all three `profilingService.startPhase` / `endPhase` pairs are correctly matched (no orphaned starts).
- [ ] Confirm `TddViolationError` is a proper subclass of `Error` with `name = 'TddViolationError'` set in the constructor.
- [ ] Verify that if `implementationAgent.execute()` throws, `endPhase` is still called (use `try/finally`).
- [ ] Confirm the orchestrator does not swallow the third `testRunner.run()` result — refactor correctness must be validated.

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/tdd/__tests__/TddLoopOrchestrator.test.ts --reporter=verbose`.
- [ ] Assert exit code is `0` and all tests pass.
- [ ] Run the full test suite `npx vitest run` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `docs/architecture/tdd-loop.md` documenting the Red-Green-Refactor cycle, the `TddLoopOrchestrator` sequence diagram (Mermaid), and the `TddViolationError` contract.
- [ ] Update `docs/agent-memory/phase_14.md` with: `TddLoopOrchestrator implemented; enforces strict Red→Green→Refactor with TddViolationError on violations; integrates ProfilingService for per-stage metrics.`

## 6. Automated Verification
- [ ] Run `npx vitest run --coverage src/tdd` and assert line coverage ≥ 90% for `TddLoopOrchestrator.ts`.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
- [ ] Run `grep -r "TddViolationError" src/tdd/ | wc -l | awk '{if($1>=3) print "PASS"; else print "FAIL"}'` to confirm the error class is used in at least 3 guard locations within the implementation.
