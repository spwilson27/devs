# Task: Implement Strategy Blacklist Pre-Flight Enforcement in Agent Task Dispatch (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [3_MCP-TAS-052]

## 1. Initial Test Written
- [ ] Create `packages/agents/src/__tests__/strategy-blacklist-enforcement.test.ts` with the following test cases:
  - When `TaskDispatcher.dispatch(task)` is called and `LessonLearnedService.isStrategyBlacklisted(task.id, task.strategy)` returns `true`, the dispatcher rejects the dispatch by throwing a `BlacklistedStrategyError` with the matched lesson's `rca_summary` included in the error message.
  - When `isStrategyBlacklisted` returns `false`, dispatch proceeds normally and `TaskRunner.runTask()` is invoked.
  - When the task has no `strategy` field (undefined or empty string), the blacklist check is skipped and a `DEBUG` log is emitted.
  - `BlacklistedStrategyError` includes a `lesson: LessonLearned` field on the error object containing the full lesson record.
  - Confirm that `BlacklistedStrategyError` is caught by the caller and results in a `TaskResult` with `status: 'BLOCKED_BY_BLACKLIST'` and `block_reason` set to the lesson's `rca_summary`.
  - Use `jest.spyOn` to mock `LessonLearnedService`; no real SQLite I/O.

## 2. Task Implementation
- [ ] Create `packages/agents/src/errors/BlacklistedStrategyError.ts`:
  ```ts
  import { LessonLearned } from '@devs/memory';

  export class BlacklistedStrategyError extends Error {
    readonly lesson: LessonLearned;
    constructor(lesson: LessonLearned) {
      super(
        `Strategy is blacklisted for task "${lesson.task_id}": ${lesson.rca_summary}`
      );
      this.name = 'BlacklistedStrategyError';
      this.lesson = lesson;
    }
  }
  ```
- [ ] In `packages/agents/src/TaskDispatcher.ts` (or equivalent dispatch function), add a pre-flight check:
  1. Before calling `TaskRunner.runTask()`, call `this.lessonService.isStrategyBlacklisted(task.id, task.strategy ?? '')`.
  2. If `true`, retrieve the matching lesson via `this.lessonService.listLessonsForTask(task.id)` (take the first match whose `strategy_description` is a substring of `task.strategy`).
  3. Throw `BlacklistedStrategyError(matchedLesson)`.
- [ ] In the caller of `TaskDispatcher.dispatch()` (e.g., `EpicOrchestrator`), catch `BlacklistedStrategyError` and return:
  ```ts
  {
    status: 'BLOCKED_BY_BLACKLIST',
    task_id: task.id,
    block_reason: err.lesson.rca_summary,
    lesson_id: err.lesson.id,
  }
  ```
- [ ] Add `'BLOCKED_BY_BLACKLIST'` to the `TaskStatus` union type in `packages/agents/src/types.ts`.
- [ ] Export `BlacklistedStrategyError` from `packages/agents/src/index.ts`.

## 3. Code Review
- [ ] Confirm the blacklist check is the FIRST operation in `dispatch()`, before any sandbox provisioning, token allocation, or tool setup, to avoid wasting resources on a blocked task.
- [ ] Confirm `BlacklistedStrategyError` is not caught inside `TaskDispatcher` itself — it must propagate to the orchestrator level.
- [ ] Confirm the substring match logic in the dispatcher mirrors the `LIKE '%' || ? || '%'` behavior in `LessonLearnedService.isStrategyBlacklisted()` to avoid false negatives.
- [ ] Confirm `'BLOCKED_BY_BLACKLIST'` is handled in all switch/exhaustive-check statements that consume `TaskStatus`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/agents test -- --testPathPattern="strategy-blacklist-enforcement"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/agents test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Update `packages/agents/AGENT.md` to describe the pre-flight blacklist check: when it runs, what inputs it reads, and what `BlacklistedStrategyError` signals to the orchestrator.
- [ ] Add `BlacklistedStrategyError` to the error catalog in `packages/agents/src/errors/README.md` (create if absent).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/agents test -- --coverage --testPathPattern="strategy-blacklist-enforcement"` and confirm exit code 0.
- [ ] Run `pnpm tsc --noEmit --project packages/agents/tsconfig.json` and confirm zero TypeScript errors.
- [ ] Run a smoke-test integration: seed one `lessons_learned` row into a test `.devs/state.db` and dispatch a task whose `strategy` matches — assert the returned `TaskResult.status === 'BLOCKED_BY_BLACKLIST'`.
