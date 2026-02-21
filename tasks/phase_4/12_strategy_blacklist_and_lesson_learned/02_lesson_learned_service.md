# Task: Implement LessonLearnedService with CRUD and Blacklist Query (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [3_MCP-TAS-052]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/lesson-learned-service.test.ts` with the following test cases:
  - `createLesson()`: inserts a row into `lessons_learned` and returns the full record including a UUID `id` and ISO-8601 `created_at` / `updated_at`.
  - `getLesson(id)`: retrieves a single lesson by primary key; returns `null` if not found.
  - `listLessonsForTask(taskId)`: returns all active (`is_active = 1`) lessons for a given `task_id`, ordered by `created_at DESC`.
  - `deactivateLesson(id)`: sets `is_active = 0` and updates `updated_at`; does NOT delete the row (audit trail preservation).
  - `isStrategyBlacklisted(taskId, strategyDescription)`: returns `true` when a matching active lesson exists (case-insensitive substring match on `strategy_description` within the same `task_id`); returns `false` otherwise.
  - `listAllActiveLessons()`: returns all rows where `is_active = 1`, ordered by `created_at DESC`.
  - Duplicate insertion (same `task_id` + `strategy_description`) raises a `LessonAlreadyExistsError` rather than a raw SQLite constraint error.
  - All tests use an in-memory SQLite database seeded by the `004_lessons_learned.sql` migration.

## 2. Task Implementation
- [ ] Create `packages/memory/src/services/LessonLearnedService.ts`:
  - Define TypeScript types:
    ```ts
    export type FailureType =
      | 'ARCHITECTURAL_MISUNDERSTANDING'
      | 'TOOL_MISUSE'
      | 'DEPENDENCY_CONFLICT'
      | 'LOGIC_ERROR'
      | 'UNKNOWN';

    export interface LessonLearned {
      id: string;
      task_id: string;
      strategy_description: string;
      rca_summary: string;
      failure_type: FailureType;
      source_agent: string;
      is_active: 0 | 1;
      created_at: string;
      updated_at: string;
    }

    export interface CreateLessonInput {
      task_id: string;
      strategy_description: string;
      rca_summary: string;
      failure_type: FailureType;
      source_agent: string;
    }
    ```
  - Implement `LessonLearnedService` class accepting a `better-sqlite3` `Database` instance via constructor injection.
  - Implement all methods described in the test cases above using prepared statements (no raw string interpolation into SQL queries).
  - Throw a typed `LessonAlreadyExistsError extends Error` (with `code: 'LESSON_ALREADY_EXISTS'`) when a unique constraint violation is caught.
  - Use `crypto.randomUUID()` for `id` generation.
  - Use `new Date().toISOString()` for timestamps.
- [ ] Export `LessonLearnedService`, `LessonAlreadyExistsError`, and all types from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] All SQL queries in `LessonLearnedService` MUST use prepared statements (via `db.prepare()`); no template-literal SQL injection risk.
- [ ] `isStrategyBlacklisted` must use `LIKE '%' || ? || '%'` for substring matching — confirm it does NOT use JS-side string interpolation.
- [ ] The class must NOT own or open the database connection; the `Database` instance is always injected (Dependency Inversion Principle).
- [ ] `deactivateLesson` must be verified to update `updated_at` in the same SQL statement, not a separate query.
- [ ] Confirm `LessonAlreadyExistsError` is caught from `better-sqlite3`'s `SQLITE_CONSTRAINT_UNIQUE` error code, not from a pre-check SELECT.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="lesson-learned-service"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Create `packages/memory/src/services/AGENT.md` (or append to existing) documenting `LessonLearnedService`: its intent, constructor signature, every public method's signature and side-effects, and which SQLite table it targets.
- [ ] Add usage example to `packages/memory/README.md` under a `## Strategy Blacklist` heading showing how to instantiate and call `isStrategyBlacklisted()`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="lesson-learned-service"` and confirm exit code 0 with branch coverage ≥ 85% for `LessonLearnedService.ts`.
- [ ] Run `pnpm tsc --noEmit --project packages/memory/tsconfig.json` and confirm zero TypeScript errors.
