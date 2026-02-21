# Task: Implement Medium-Term SQLite Memory Repository (Sub-Epic: 04_Short_and_Medium_Term_Memory)

## Covered Requirements
- [TAS-017], [3_MCP-TAS-017]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/medium_term_memory.test.ts`, write integration tests using an in-memory SQLite database that cover:
  - **logTask**: After calling `logTask(summary)`, `getEpicSummaries(epicId)` returns the logged `TaskSummary` with all fields intact.
  - **getEpicSummaries ordering**: Multiple `logTask` calls for the same `epicId` return results ordered by `timestamp` ascending.
  - **getEpicSummaries isolation**: Summaries from `epicId: 'epic-A'` do not appear in results for `epicId: 'epic-B'`.
  - **logFailedStrategy**: After calling `logFailedStrategy(record)`, `getFailedStrategies(epicId)` returns the record.
  - **getFailedStrategies ordering**: Multiple failures for the same epic are returned ordered by `timestamp` ascending.
  - **getEpicSummaries limit**: Calling `getEpicSummaries(epicId, { limit: 5 })` on a dataset of 20 entries returns exactly 5.
  - **setEpicOverride / getEpicOverride**: Setting a key-value override for an epic and then retrieving it returns the latest value.
  - **getEpicOverrides**: Returns all overrides for a given `epicId` as `Record<string, string>`.
  - **clearEpic**: After `clearEpic(epicId)`, `getEpicSummaries` and `getFailedStrategies` return empty arrays for that epic.
  - **concurrent writes**: Simulating two sequential writes in a tight loop does not throw (WAL mode handles this).
- [ ] Tests must reference `MediumTermMemory` before the class is implemented (red phase).

## 2. Task Implementation
- [ ] Create `packages/memory/src/medium_term_memory.ts` implementing `IMediumTermMemory`:
  ```ts
  export class MediumTermMemory implements IMediumTermMemory {
    private db: Database;

    constructor(dbOrPath: Database | string) {
      this.db = typeof dbOrPath === 'string' ? openDatabase(dbOrPath) : dbOrPath;
      runMigrations(this.db);
    }

    async logTask(summary: TaskSummary): Promise<void> { /* ... */ }
    async getEpicSummaries(epicId: string, opts?: { limit?: number }): Promise<TaskSummary[]> { /* ... */ }
    async logFailedStrategy(record: StrategyFailure): Promise<void> { /* ... */ }
    async getFailedStrategies(epicId: string): Promise<StrategyFailure[]> { /* ... */ }
    async setEpicOverride(epicId: string, key: string, value: string): Promise<void> { /* ... */ }
    async getEpicOverride(epicId: string, key: string): Promise<string | null> { /* ... */ }
    async getEpicOverrides(epicId: string): Promise<Record<string, string>> { /* ... */ }
    async clearEpic(epicId: string): Promise<void> { /* ... */ }
  }
  ```
- [ ] All database operations use `better-sqlite3` synchronous statements (`.prepare().run()`, `.prepare().all()`, `.prepare().get()`) wrapped in `Promise.resolve()` to satisfy the async interface without blocking the event loop beyond a single tick.
- [ ] `logTask` inserts a row into `agent_task_logs` with a generated `crypto.randomUUID()` id.
- [ ] `logFailedStrategy` inserts into `strategy_failures` with a generated UUID.
- [ ] `setEpicOverride` uses `INSERT OR REPLACE` into `epic_overrides` keyed on `(epic_id, key)`. Add a `UNIQUE(epic_id, key)` constraint in a new migration `002_epic_override_unique.sql` if not already present.
- [ ] `clearEpic` deletes from `agent_task_logs`, `strategy_failures`, and `epic_overrides` where `epic_id = ?` within a single `db.transaction`.
- [ ] Export `MediumTermMemory` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify that `MediumTermMemory` constructor accepts both a `Database` object (for injection in tests) and a file path string (for production use).
- [ ] Verify that `clearEpic` uses a `db.transaction` so all three deletions are atomic.
- [ ] Verify that all SQL parameters are passed as bind parameters (never string-interpolated) to prevent SQL injection.
- [ ] Verify that `MediumTermMemory` correctly implements `IMediumTermMemory` — TypeScript must enforce this.
- [ ] Verify that `getEpicSummaries` maps raw SQLite row columns (snake_case) back to `TaskSummary` fields (camelCase) correctly.
- [ ] Confirm the `async` wrapper pattern (sync DB ops wrapped in `Promise.resolve`) is documented inline.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test medium_term_memory` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/medium_term_memory.agent.md` documenting:
  - The relationship between `MediumTermMemory` and TAS-017: Epic-scoped log of task outcomes and failed strategies.
  - `3_MCP-TAS-017`: note that MCP tool wrappers for this class will be implemented in the next task.
  - The `clearEpic` atomicity guarantee and when to call it (e.g., after a rewind operation).
  - The constructor overload pattern (path vs. Database instance) and which to use in production vs. tests.
  - The `setEpicOverride` / `getEpicOverride` use case: storing Epic-level TAS overrides decided mid-run.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test medium_term_memory --reporter=json > /tmp/medium_term_results.json`.
- [ ] Assert: `node -e "const r = require('/tmp/medium_term_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` exits with `0`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` — must exit with code `0`.
