# Task: Implement DirectiveHistoryService for Human Intervention Logging (Sub-Epic: 12_Strategy_Blacklist_and_Lesson_Learned)

## Covered Requirements
- [4_USER_FEATURES-REQ-068], [8_RISKS-REQ-077]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/directive-history-service.test.ts` with the following test cases:
  - `DirectiveHistoryService.logIntervention(input)` inserts a row into `directive_history` and returns the complete record with a UUID `id` and ISO-8601 `created_at`.
  - `DirectiveHistoryService.getInterventionsForTask(taskId)` returns all rows for a given `task_id`, ordered by `created_at DESC`.
  - `DirectiveHistoryService.setVectorId(id, vectorId)` updates `lancedb_vector_id` for an existing row; returns `true` on success, `false` if the row is not found.
  - `DirectiveHistoryService.listAllInterventions(limit, offset)` supports pagination and returns rows ordered by `created_at DESC`.
  - Inserting with an unrecognized `intervention_type` value raises a typed `InvalidInterventionTypeError` (not a raw SQLite CHECK constraint error).
  - All tests use an in-memory SQLite database seeded by the `004_lessons_learned.sql` migration.

## 2. Task Implementation
- [ ] Define types in `packages/memory/src/types/directive-history.ts`:
  ```ts
  export type InterventionType = 'MANUAL_FIX' | 'FEEDBACK' | 'OVERRIDE' | 'ESCALATION';

  export interface DirectiveHistoryEntry {
    id: string;
    task_id: string;
    intervention_type: InterventionType;
    description: string;
    actor: string;
    lancedb_vector_id: string | null;
    created_at: string;
  }

  export interface LogInterventionInput {
    task_id: string;
    intervention_type: InterventionType;
    description: string;
    actor?: string; // defaults to 'USER'
  }
  ```
- [ ] Create `packages/memory/src/errors/InvalidInterventionTypeError.ts`:
  ```ts
  export class InvalidInterventionTypeError extends Error {
    constructor(value: string) {
      super(`"${value}" is not a valid InterventionType.`);
      this.name = 'InvalidInterventionTypeError';
    }
  }
  ```
- [ ] Create `packages/memory/src/services/DirectiveHistoryService.ts`:
  - Constructor accepts a `better-sqlite3` `Database` instance.
  - `logIntervention(input: LogInterventionInput): DirectiveHistoryEntry` — validates `intervention_type` against the allowed set before inserting; throws `InvalidInterventionTypeError` for invalid values.
  - `getInterventionsForTask(taskId: string): DirectiveHistoryEntry[]`
  - `listAllInterventions(limit?: number, offset?: number): DirectiveHistoryEntry[]` — default `limit = 50`, `offset = 0`.
  - `setVectorId(id: string, vectorId: string): boolean`
  - All SQL uses prepared statements; no string interpolation.
- [ ] Export all types, errors, and `DirectiveHistoryService` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Confirm `logIntervention` validates `intervention_type` using a Set/array membership check in TypeScript BEFORE executing the SQL, not relying solely on the SQLite `CHECK` constraint.
- [ ] Confirm `setVectorId` uses `db.prepare(...).run(vectorId, id).changes` to determine whether the row was found (returns `1` if updated, `0` if not found).
- [ ] Confirm `listAllInterventions` uses `LIMIT ? OFFSET ?` in SQL (not slice in JS) to avoid loading unbounded data.
- [ ] Confirm the service is NOT responsible for triggering DNA encoding — that responsibility stays in `DnaEncoder` (separation of concerns).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="directive-history-service"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test` to confirm zero regressions.

## 5. Update Documentation
- [ ] Add `## DirectiveHistoryService` section to `packages/memory/AGENT.md` describing: its role, the `directive_history` table it targets, and that `lancedb_vector_id` is populated asynchronously by `DnaEncoder`.
- [ ] Document `InvalidInterventionTypeError` in `packages/memory/src/errors/README.md`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test -- --coverage --testPathPattern="directive-history-service"` and confirm exit code 0 with branch coverage ≥ 85% for `DirectiveHistoryService.ts`.
- [ ] Run `pnpm tsc --noEmit --project packages/memory/tsconfig.json` and confirm zero TypeScript errors.
