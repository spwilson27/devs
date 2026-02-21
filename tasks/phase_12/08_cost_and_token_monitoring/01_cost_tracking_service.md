# Task: Implement Core Cost Tracking Service (Sub-Epic: 08_Cost and Token Monitoring)

## Covered Requirements
- [4_USER_FEATURES-REQ-085]

## 1. Initial Test Written
- [ ] In `packages/core/src/cost/__tests__/CostTracker.test.ts`, write unit tests for a `CostTracker` class covering:
  - `recordTokenUsage(agentId: string, taskId: string, epicId: string, inputTokens: number, outputTokens: number, modelId: string): void` correctly stores usage records.
  - `getCurrentTaskCost(taskId: string): CostSnapshot` returns an object with `{ inputTokens, outputTokens, estimatedUsdCost }` where `estimatedUsdCost` is computed from a per-model pricing table.
  - `getEpicSpend(epicId: string): CostSnapshot` returns aggregated cost across all tasks belonging to that epic.
  - `reset(taskId: string): void` clears accumulated cost for a given task.
  - Tests must use a mock pricing table: `{ 'gemini-2.5-pro': { inputPer1kTokens: 0.00125, outputPer1kTokens: 0.005 } }`.
  - Edge cases: zero tokens, unknown model (should throw `UnknownModelError`), multiple agents contributing to the same task.
- [ ] In `packages/core/src/cost/__tests__/CostStore.test.ts`, write integration tests for a `CostStore` (SQLite-backed persistence) verifying:
  - Usage records written via `CostTracker` are persisted and survive process restart.
  - `listTaskCosts(epicId: string): TaskCostRecord[]` returns all tasks in the epic with their cumulative costs.

## 2. Task Implementation
- [ ] Create `packages/core/src/cost/types.ts` defining:
  ```ts
  export interface CostSnapshot { inputTokens: number; outputTokens: number; estimatedUsdCost: number; }
  export interface TaskCostRecord { taskId: string; epicId: string; snapshot: CostSnapshot; }
  export interface ModelPricing { inputPer1kTokens: number; outputPer1kTokens: number; }
  export class UnknownModelError extends Error {}
  ```
- [ ] Create `packages/core/src/cost/pricingTable.ts` with a default exported `Map<string, ModelPricing>` containing pricing for at least: `gemini-2.5-pro`, `gemini-2.5-flash`, `gpt-4o`, `gpt-4o-mini`, `claude-3-5-sonnet`, `claude-3-haiku`. Values should be sourced from provider public pricing pages as of the implementation date; include a comment noting the reference date.
- [ ] Create `packages/core/src/cost/CostTracker.ts`:
  - In-memory accumulation of `{ taskId -> { epicId, inputTokens, outputTokens } }`.
  - `getCurrentTaskCost` and `getEpicSpend` compute USD cost using `pricingTable`.
  - Emits an `EventBus` event `cost:updated` with `{ taskId, epicId, snapshot }` after each `recordTokenUsage` call.
- [ ] Create `packages/core/src/cost/CostStore.ts`:
  - Uses the project's existing SQLite adapter (from `@devs/core/db`).
  - Schema: `CREATE TABLE IF NOT EXISTS cost_events (id TEXT PRIMARY KEY, agent_id TEXT, task_id TEXT, epic_id TEXT, model_id TEXT, input_tokens INTEGER, output_tokens INTEGER, recorded_at INTEGER)`.
  - Provides `persist(record)` and `listTaskCosts(epicId)` methods.
  - `CostTracker` calls `CostStore.persist` on every `recordTokenUsage` invocation.
- [ ] Export all public symbols from `packages/core/src/cost/index.ts` and re-export from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Verify `CostTracker` has no direct file I/O or network calls — all I/O is delegated to `CostStore`.
- [ ] Confirm `pricingTable` is imported as a dependency injected into `CostTracker` constructor (not a hard-coded import inside methods) to allow test mocking.
- [ ] Ensure `cost:updated` event payload matches the `CostSnapshot` interface exactly (no extra fields, no missing fields).
- [ ] Confirm `UnknownModelError` is exported and includes the unknown model ID in its message.
- [ ] Check that `CostStore` uses parameterized SQL queries — no string interpolation in SQL statements.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=cost` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core build` and confirm the TypeScript compiler emits no errors.

## 5. Update Documentation
- [ ] Create `packages/core/src/cost/CostTracker.agent.md` (AOD doc) describing: purpose, public API, event emissions, pricing table update process, and an example usage snippet.
- [ ] Add an entry to `packages/core/CHANGELOG.md` under `[Unreleased]` noting the new `CostTracker` and `CostStore` modules.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=cost` and confirm line coverage for `src/cost/` is ≥ 90%.
- [ ] Run `grep -r "cost:updated" packages/core/src/cost/CostTracker.ts` and confirm the event emission is present.
- [ ] Run `node -e "const { CostTracker } = require('./packages/core/dist/cost'); console.log(typeof CostTracker)"` and confirm output is `function`.
