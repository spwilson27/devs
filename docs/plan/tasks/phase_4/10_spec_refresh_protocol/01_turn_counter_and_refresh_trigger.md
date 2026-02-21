# Task: Implement Turn Counter and Spec Refresh Trigger (Sub-Epic: 10_Spec_Refresh_Protocol)

## Covered Requirements
- [3_MCP-TAS-050], [8_RISKS-REQ-011], [5_SECURITY_DESIGN-REQ-SEC-SD-084]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/specRefreshTrigger.test.ts`, write unit tests for a `SpecRefreshTrigger` class covering the following cases:
  - `getTurnCount()` returns 0 on initialization.
  - `incrementTurn()` increments the internal counter by 1 each call.
  - `shouldRefresh()` returns `false` when `turnCount % 10 !== 0` (e.g., turns 1–9).
  - `shouldRefresh()` returns `true` exactly when `turnCount % 10 === 0` and `turnCount > 0` (e.g., turns 10, 20, 30).
  - `reset()` resets the counter to 0.
  - Persisting the counter to SQLite: after calling `incrementTurn()` 5 times, destroy the instance, re-create it pointing at the same SQLite DB, and assert `getTurnCount()` returns 5.
  - Verify turn count is stored in the `agent_context` table under the key `spec_refresh_turn_count` (INTEGER).

## 2. Task Implementation
- [ ] Create `packages/memory/src/specRefreshTrigger.ts` exporting a `SpecRefreshTrigger` class:
  - Constructor accepts `db: BetterSqlite3.Database` and an optional `refreshInterval: number` (default `10`).
  - On construction, read the current `spec_refresh_turn_count` from the `agent_context` table (create the table and row if absent).
  - `getTurnCount(): number` — returns current counter value (from in-memory cache, not re-querying DB each call).
  - `incrementTurn(): void` — increments in-memory counter and persists to `agent_context` table atomically using a `BEGIN IMMEDIATE` SQLite transaction.
  - `shouldRefresh(): boolean` — returns `this.turnCount > 0 && this.turnCount % this.refreshInterval === 0`.
  - `reset(): void` — resets counter to 0 in both memory and DB.
- [ ] Schema: ensure migration `packages/memory/src/migrations/002_agent_context.sql` creates:
  ```sql
  CREATE TABLE IF NOT EXISTS agent_context (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  ```
- [ ] Export `SpecRefreshTrigger` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify the class has no side effects outside the `BetterSqlite3.Database` instance passed to it (pure dependency injection).
- [ ] Confirm `shouldRefresh()` is a pure computation with no I/O — it must not query the DB.
- [ ] Confirm `incrementTurn()` uses a single atomic `UPDATE OR INSERT` (upsert) rather than a separate SELECT + INSERT/UPDATE sequence.
- [ ] Verify the migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Confirm all public methods are documented with JSDoc.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=specRefreshTrigger` and confirm all tests pass with no skipped cases.
- [ ] Run `pnpm --filter @devs/memory test -- --coverage` and confirm `specRefreshTrigger.ts` has ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add a `## SpecRefreshTrigger` section to `packages/memory/README.md` describing the turn counter API, the SQLite schema it uses, and the `refreshInterval` default.
- [ ] Update `docs/architecture/context-management.md` to reference the turn counter as the trigger mechanism for Spec Refresh.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory build` and confirm TypeScript compiles with zero errors.
- [ ] Run `node -e "const {SpecRefreshTrigger} = require('./packages/memory/dist'); const db = require('better-sqlite3')(':memory:'); const t = new SpecRefreshTrigger(db); for(let i=0;i<10;i++) t.incrementTurn(); console.assert(t.shouldRefresh(), 'FAIL: should refresh at turn 10');"` and confirm it exits with code 0.
