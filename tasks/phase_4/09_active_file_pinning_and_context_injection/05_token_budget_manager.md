# Task: Implement Real-Time Token Usage Tracking and Intelligent Token Budgeting (Sub-Epic: 09_Active_File_Pinning_and_Context_Injection)

## Covered Requirements
- [8_RISKS-REQ-031], [RISK-802]

## 1. Initial Test Written
- [ ] Create `packages/orchestrator/src/token-budget/__tests__/TokenBudgetManager.test.ts`.
- [ ] Write a unit test that `TokenBudgetManager` is constructed with a `hardLimitTokens` (e.g., `1_000_000`) and `throttleThresholdPct` (default `0.10`, meaning 10%).
- [ ] Write a test that `recordUsage(tokens: number)` increments the internal cumulative counter and `getCurrentUsage()` returns the updated sum.
- [ ] Write a test that `isThrottleRequired()` returns `false` when `currentUsage < hardLimit * (1 - throttleThresholdPct)`.
- [ ] Write a test that `isThrottleRequired()` returns `true` when `currentUsage >= hardLimit * (1 - throttleThresholdPct)` (i.e., within 10% of the limit).
- [ ] Write a test that `isHardLimitExceeded()` returns `true` when `currentUsage >= hardLimitTokens`.
- [ ] Write a test that `getRemainingBudget()` returns `hardLimitTokens - currentUsage` (clamped to `0`).
- [ ] Write a test that `reset()` resets `currentUsage` to `0`.
- [ ] Write an integration test that the `Orchestrator` calls `tokenBudgetManager.recordUsage(responseTokens)` after each agent turn, using a spy, and verifies the cumulative count increases per turn.
- [ ] Write a test that when `isThrottleRequired()` is `true`, the orchestrator reduces its parallel task concurrency from the configured max (e.g., `5`) down to `1` before scheduling the next turn.

## 2. Task Implementation
- [ ] Create `packages/orchestrator/src/token-budget/TokenBudgetManager.ts`:
  - `TokenBudgetOptions`: `{ hardLimitTokens: number; throttleThresholdPct?: number }` (default `throttleThresholdPct: 0.10`).
  - `class TokenBudgetManager`:
    - Private `currentUsage: number = 0`.
    - `recordUsage(tokens: number): void` — adds `tokens` to `currentUsage`.
    - `getCurrentUsage(): number`.
    - `getRemainingBudget(): number` — `Math.max(0, hardLimitTokens - currentUsage)`.
    - `isThrottleRequired(): boolean` — `currentUsage >= hardLimitTokens * (1 - throttleThresholdPct)`.
    - `isHardLimitExceeded(): boolean` — `currentUsage >= hardLimitTokens`.
    - `reset(): void` — sets `currentUsage = 0`.
    - Emits a `"throttle:required"` event (extend `EventEmitter`) when `isThrottleRequired()` transitions from `false` to `true` (only once per threshold crossing, not on every subsequent call).
    - Emits a `"limit:exceeded"` event when `isHardLimitExceeded()` transitions from `false` to `true`.
- [ ] Persist `currentUsage` to SQLite (table `token_budget_log`, columns: `session_id TEXT`, `turn_number INTEGER`, `tokens_used INTEGER`, `cumulative INTEGER`, `recorded_at INTEGER`) so usage survives process restarts.
  - Add `logTurn(sessionId: string, turnNumber: number, tokensUsed: number): void` which inserts a row.
  - `initialize(db: Database): void` — creates the table if not exists.
- [ ] In `packages/orchestrator/src/Orchestrator.ts`:
  - After each agent API response, extract `response.usage.totalTokens` (or equivalent from the AI SDK) and call `tokenBudgetManager.recordUsage(totalTokens)` and `tokenBudgetManager.logTurn(sessionId, turnNumber, totalTokens)`.
  - Before scheduling the next parallel batch, check `tokenBudgetManager.isThrottleRequired()`; if `true`, set concurrency to `1` and log a `WARN` message.
  - If `tokenBudgetManager.isHardLimitExceeded()`, halt the loop and emit a `"session:halt"` event.
- [ ] Export from `packages/orchestrator/src/token-budget/index.ts`.

## 3. Code Review
- [ ] Confirm that `recordUsage` is always called with the **actual** token count returned by the AI API, never an estimate; estimates are only used for pre-flight checks.
- [ ] Confirm that the throttle concurrency reduction is applied **before** the next turn is dispatched, not retroactively after.
- [ ] Confirm that `"throttle:required"` fires only on the state transition (false → true), using a private `_throttleEmitted: boolean` flag to prevent repeat emissions.
- [ ] Confirm the `token_budget_log` table write is non-blocking (fire-and-forget via `queueMicrotask` or similar); it must not add latency to the agent turn.
- [ ] Verify TypeScript strict mode: `pnpm tsc --noEmit` in `packages/orchestrator`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern="TokenBudgetManager"` and confirm all tests pass.
- [ ] Confirm ≥ 90% branch coverage on `TokenBudgetManager.ts`.
- [ ] Run the integration test: confirm the spy-based orchestrator test passes verifying `recordUsage` is called once per turn.

## 5. Update Documentation
- [ ] Create `packages/orchestrator/src/token-budget/TokenBudgetManager.agent.md`:
  - Document `hardLimitTokens`, `throttleThresholdPct`, and the concurrency throttle behaviour.
  - Document the two emitted events: `"throttle:required"` and `"limit:exceeded"` and their payloads.
  - Document the `token_budget_log` SQLite table schema.
  - Clarify that `reset()` does NOT clear the SQLite log.
- [ ] Update `packages/orchestrator/README.md` to include the token budget section in the architecture overview.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/orchestrator test --ci` and confirm exit code `0`.
- [ ] Run `node scripts/validate-token-budget.js` — a script that runs the orchestrator against a fixture task, injects a mock AI client returning `{ usage: { totalTokens: 950_000 } }` in the second turn (simulating near-limit usage), and asserts that the log shows concurrency reduced to `1` on the subsequent turn.
- [ ] Confirm `pnpm tsc --noEmit` exits `0`.
