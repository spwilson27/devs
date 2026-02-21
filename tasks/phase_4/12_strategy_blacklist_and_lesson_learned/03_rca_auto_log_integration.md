# Task: Integrate RCA Pipeline to Auto-Log Lessons Learned on Task Failure (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [3_MCP-TAS-052]

## 1. Initial Test Written
- [ ] Create `packages/agents/src/__tests__/rca-lesson-integration.test.ts` with the following test cases:
  - When `TaskRunner.runTask()` completes with a `FAILED` status and a non-null `rca` object, `LessonLearnedService.createLesson()` is called exactly once with `task_id`, `strategy_description` derived from `rca.failed_strategy`, `rca_summary` from `rca.root_cause`, `failure_type` mapped from `rca.category`, and `source_agent` set to the agent's `agentId`.
  - When `TaskRunner.runTask()` completes with a `SUCCESS` status, `LessonLearnedService.createLesson()` is NOT called.
  - When `LessonLearnedService.createLesson()` throws `LessonAlreadyExistsError`, the error is swallowed and logged (does NOT propagate to crash the TaskRunner).
  - When `rca` is `null` or `rca.failed_strategy` is empty, no lesson is created and a `WARN` log line is emitted.
  - Use `jest.spyOn` to mock `LessonLearnedService` — no real SQLite I/O in these tests.

## 2. Task Implementation
- [ ] In `packages/agents/src/TaskRunner.ts` (or its equivalent orchestrator class), after task completion logic:
  - Import `LessonLearnedService` from `@devs/memory`.
  - Add a private `lessonService: LessonLearnedService` field injected via constructor.
  - Add a private async method `_autoLogLesson(result: TaskResult): Promise<void>` that:
    1. Returns immediately if `result.status !== 'FAILED'` or `!result.rca?.failed_strategy`.
    2. Maps `result.rca.category` to `FailureType` using a local `RCA_CATEGORY_TO_FAILURE_TYPE` lookup map (default: `'UNKNOWN'`).
    3. Calls `this.lessonService.createLesson(...)`.
    4. Catches `LessonAlreadyExistsError` and logs at `WARN` level using the project logger (`@devs/logger`).
    5. Catches any other error and logs at `ERROR` level without re-throwing.
  - Call `await this._autoLogLesson(result)` at the end of the failure handling block in `runTask()`.
- [ ] Define or extend the `TaskResult` type in `packages/agents/src/types.ts` to include:
  ```ts
  rca?: {
    root_cause: string;
    failed_strategy: string;
    category: string;
  };
  ```

## 3. Code Review
- [ ] Confirm `_autoLogLesson` is called AFTER all task cleanup/teardown steps so the lesson is logged even if teardown partially fails.
- [ ] Confirm the error-swallowing behavior for `LessonAlreadyExistsError` is explicit (the catch block checks `instanceof LessonAlreadyExistsError`) and does not swallow other error types silently.
- [ ] Confirm the `RCA_CATEGORY_TO_FAILURE_TYPE` map is defined as a `const` object at module scope (not inline inside the method) for readability and testability.
- [ ] Confirm `LessonLearnedService` is injected via the `TaskRunner` constructor, not instantiated inside `_autoLogLesson`, preserving the DI pattern.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/agents test -- --testPathPattern="rca-lesson-integration"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/agents test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Update `packages/agents/AGENT.md` to document the `_autoLogLesson` integration: when it fires, what RCA fields it reads, and how it maps to `FailureType`.
- [ ] Add a flow diagram (Mermaid) to `packages/agents/AGENT.md` showing the `runTask → FAILED → RCA → autoLogLesson → LessonLearnedService` sequence.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/agents test -- --coverage --testPathPattern="rca-lesson-integration"` and confirm exit code 0.
- [ ] Run `pnpm tsc --noEmit --project packages/agents/tsconfig.json` and confirm zero TypeScript errors.
