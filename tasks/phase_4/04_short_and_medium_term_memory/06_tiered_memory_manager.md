# Task: Implement TieredMemoryManager Integrating Short, Medium, and Long-Term Tiers (Sub-Epic: 04_Short_and_Medium_Term_Memory)

## Covered Requirements
- [TAS-016], [TAS-017], [TAS-018]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/tiered_memory_manager.test.ts`, write unit/integration tests (using mocks for `IMediumTermMemory` and `ILongTermMemory`) that cover:
  - **Construction**: `TieredMemoryManager` can be instantiated with mock implementations of all three tiers without throwing.
  - **`recordTurn`**: Calling `recordTurn(entry)` appends the entry to short-term memory and returns the updated token count.
  - **`getShortTermWindow`**: Returns the current in-context window from short-term memory.
  - **`promoteTaskToMediumTerm`**: Calling `promoteTaskToMediumTerm(summary)` calls `mediumTerm.logTask(summary)`.
  - **`recordFailedStrategy`**: Calls `mediumTerm.logFailedStrategy(record)`.
  - **`getEpicContext`**: Returns a combined object `{ summaries: TaskSummary[], failures: StrategyFailure[], overrides: Record<string, string> }` from `mediumTerm`.
  - **`promoteToLongTerm`**: Calling `promoteToLongTerm(doc)` calls `longTerm.upsert(doc)`.
  - **`searchLongTermMemory`**: Calls `longTerm.search(query, topK)` and returns results.
  - **`clearShortTerm`**: Delegates to `shortTerm.clear()`.
  - **`onTaskComplete` lifecycle hook**: Calling `onTaskComplete({ summary, lessons })` calls `mediumTerm.logTask(summary)` AND calls `longTerm.upsert(...)` for each lesson in `lessons`.
  - **`snapshotShortTerm` / `restoreShortTerm`**: Delegates to `shortTerm.snapshot()` / `shortTerm.restore()`.
- [ ] All tests must be written before the `TieredMemoryManager` class is implemented.

## 2. Task Implementation
- [ ] Create `packages/memory/src/tiered_memory_manager.ts`:
  ```ts
  export class TieredMemoryManager {
    constructor(
      private shortTerm: IShortTermMemory,
      private mediumTerm: IMediumTermMemory,
      private longTerm: ILongTermMemory,
    ) {}

    recordTurn(entry: ContextEntry): number { /* ... */ }
    getShortTermWindow(lastN?: number): ContextEntry[] { /* ... */ }
    clearShortTerm(): void { /* ... */ }
    snapshotShortTerm(): ShortTermSnapshot { /* ... */ }
    restoreShortTerm(snapshot: ShortTermSnapshot): void { /* ... */ }

    async promoteTaskToMediumTerm(summary: TaskSummary): Promise<void> { /* ... */ }
    async recordFailedStrategy(record: StrategyFailure): Promise<void> { /* ... */ }
    async getEpicContext(epicId: string): Promise<EpicContext> { /* ... */ }

    async promoteToLongTerm(doc: MemoryDocument): Promise<void> { /* ... */ }
    async searchLongTermMemory(query: string, topK?: number): Promise<MemoryDocument[]> { /* ... */ }

    async onTaskComplete(opts: {
      summary: TaskSummary;
      lessons?: MemoryDocument[];
    }): Promise<void> { /* ... */ }
  }
  ```
- [ ] Define `EpicContext` type in `types.ts`:
  ```ts
  export type EpicContext = {
    summaries: TaskSummary[];
    failures: StrategyFailure[];
    overrides: Record<string, string>;
  };
  ```
- [ ] `recordTurn` appends entry to `shortTerm` and returns `shortTerm.tokenCount()`.
- [ ] `onTaskComplete` must: (1) `await promoteTaskToMediumTerm(summary)`, then (2) for each lesson in `lessons ?? []`, `await promoteToLongTerm(lesson)`.
- [ ] `getEpicContext` concurrently fetches `getEpicSummaries`, `getFailedStrategies`, and `getEpicOverrides` via `Promise.all`.
- [ ] Export `TieredMemoryManager` and `EpicContext` from `packages/memory/src/index.ts`.
- [ ] Create a factory function `createTieredMemoryManager(config: TieredMemoryConfig): TieredMemoryManager` where `TieredMemoryConfig = { sqlitePath?: string; lanceDbPath?: string; maxShortTermTokens?: number }` that wires up concrete implementations of all three tiers. This function acts as the composition root. Export from `index.ts`.

## 3. Code Review
- [ ] Verify that `TieredMemoryManager` depends only on the three interfaces (`IShortTermMemory`, `IMediumTermMemory`, `ILongTermMemory`), not on concrete implementations — enabling full testability via mocks.
- [ ] Verify that `getEpicContext` uses `Promise.all` (parallel execution) rather than sequential `await` calls.
- [ ] Verify that `onTaskComplete` is the canonical lifecycle hook for persisting task outcomes and is the only place where medium-term promotion and long-term promotion are triggered together.
- [ ] Verify that `createTieredMemoryManager` is the only place where concrete classes (`ShortTermMemory`, `MediumTermMemory`, and the LanceDB adapter) are instantiated — nowhere else in the codebase should call `new ShortTermMemory()` directly.
- [ ] Verify `EpicContext` is exported and correctly typed with no `any` fields.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test tiered_memory_manager` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test` (full test suite) and confirm all tests across the package pass.
- [ ] Run `pnpm --filter @devs/memory build` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `packages/memory/src/tiered_memory_manager.agent.md` documenting:
  - The three-tier hierarchy and which requirement each tier satisfies: TAS-016 (short), TAS-017 (medium), TAS-018 (long).
  - The `onTaskComplete` lifecycle pattern and when agents must call it.
  - The `createTieredMemoryManager` factory and required environment variables (`DEVS_SQLITE_PATH`, `DEVS_LANCEDB_PATH`).
  - The `EpicContext` shape and how agents should use it to seed the beginning of a new task turn.
  - The `snapshotShortTerm` / `restoreShortTerm` pattern for context handoff between agent turns.
- [ ] Update `packages/memory/src/index.ts` docstring to describe the overall package architecture.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/tiered_manager_results.json`.
- [ ] Assert: `node -e "const r = require('/tmp/tiered_manager_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` exits with `0`.
- [ ] Run `pnpm --filter @devs/memory tsc --noEmit` — must exit with code `0`.
- [ ] Run `pnpm --filter @devs/memory test --coverage` and assert line coverage for `tiered_memory_manager.ts` is ≥ 90%.
