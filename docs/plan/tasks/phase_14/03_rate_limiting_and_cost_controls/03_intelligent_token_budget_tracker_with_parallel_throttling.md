# Task: Implement Intelligent Real-Time Token Budget Tracker with Parallel Throttling (Sub-Epic: 03_Rate Limiting and Cost Controls)

## Covered Requirements
- [8_RISKS-REQ-031]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/budget/__tests__/TokenBudgetTracker.test.ts`.
- [ ] Write a unit test verifying that `TokenBudgetTracker.recordUsage({ taskId, tokens })` correctly increments the running total token count.
- [ ] Write a unit test verifying that `TokenBudgetTracker.getUsagePercent()` returns the correct ratio of `totalUsed / hardLimitTokens * 100`.
- [ ] Write a unit test verifying that when `getUsagePercent()` returns a value ≥ 90 (i.e., within 10% of the hard limit), `TokenBudgetTracker.shouldThrottle()` returns `true`.
- [ ] Write a unit test verifying that when usage is below 90%, `shouldThrottle()` returns `false`.
- [ ] Write a unit test verifying that when `shouldThrottle()` is `true`, the `ParallelTaskScheduler` reduces its `maxConcurrency` from its configured maximum (e.g., 4) down to 1.
- [ ] Write a unit test verifying that once token usage drops back below 90% (e.g., after a task completes without consuming more), `ParallelTaskScheduler` restores `maxConcurrency` to its configured maximum.
- [ ] Write a unit test verifying that the `hardLimitTokens` is loaded from `devs.config.json` field `tokenBudget.hardLimitTokens` and has no default (must be explicitly set; throw `ConfigurationError` if absent).
- [ ] Write an integration test that runs 6 parallel tasks via `ParallelTaskScheduler`, with simulated token usage that pushes the tracker above 90% after task 4, and asserts that tasks 5 and 6 are serialized (max concurrency = 1).

## 2. Task Implementation
- [ ] Create `src/orchestrator/budget/TokenBudgetTracker.ts`:
  - Constructor accepts `hardLimitTokens: number`.
  - `recordUsage(params: { taskId: string; tokens: number }): void` — atomically increments shared counter.
  - `getUsagePercent(): number` — returns `(totalUsed / hardLimitTokens) * 100` rounded to 2 decimal places.
  - `shouldThrottle(): boolean` — returns `getUsagePercent() >= 90`.
  - `getRemainingTokens(): number` — returns `hardLimitTokens - totalUsed`.
  - Persists running total to SQLite `token_budget` table (`total_used INTEGER, hard_limit INTEGER, updated_at TEXT`) on every `recordUsage` call for crash recovery.
- [ ] Create `src/orchestrator/budget/ParallelTaskScheduler.ts`:
  - Wraps a configurable concurrency semaphore (use `p-limit` or equivalent).
  - Exposes `setMaxConcurrency(n: number): void` to dynamically adjust the concurrency cap at runtime.
  - On each task slot acquisition, queries `tokenBudgetTracker.shouldThrottle()` and adjusts concurrency before releasing the semaphore.
  - Emits `CONCURRENCY_THROTTLED` event (via event bus) when concurrency is reduced, with payload `{ from: number; to: number; usagePercent: number }`.
  - Emits `CONCURRENCY_RESTORED` event when concurrency is increased back to the configured max.
- [ ] Wire `TokenBudgetTracker` into `TaskRunner.ts`: after each LLM call, extract total tokens from response and call `tokenBudgetTracker.recordUsage(...)`.
- [ ] Load `tokenBudget.hardLimitTokens` from `devs.config.json` during bootstrap; throw `ConfigurationError` if missing.
- [ ] Export everything through `src/orchestrator/budget/index.ts`.

## 3. Code Review
- [ ] Verify that `recordUsage` is safe for concurrent calls: use an atomic counter pattern or mutex (e.g., `async-mutex`) to prevent race conditions when multiple tasks report usage simultaneously.
- [ ] Verify `shouldThrottle` threshold (90%) is expressed as a named constant `TOKEN_THROTTLE_THRESHOLD_PERCENT = 90` and documented.
- [ ] Verify `CONCURRENCY_THROTTLED` and `CONCURRENCY_RESTORED` events include all required fields and are typed with `EventPayload` discriminated unions.
- [ ] Verify SQLite persistence uses a transaction to prevent partial writes to `token_budget`.
- [ ] Verify requirement annotation `// [8_RISKS-REQ-031]` appears in `TokenBudgetTracker.ts`, `ParallelTaskScheduler.ts`, and `TaskRunner.ts`.
- [ ] Ensure no `any` types; strict TypeScript compliance across all new files.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="budget"` and confirm all unit tests pass.
- [ ] Run `npm test -- --testPathPattern="TokenBudgetTracker.integration"` and confirm the integration test passes (serial execution enforced after 90% threshold).
- [ ] Run `npm run test:coverage -- --collectCoverageFrom="src/orchestrator/budget/**"` and assert ≥ 90% line coverage.
- [ ] Run `npm run lint` and confirm zero lint errors.
- [ ] Run `npm run typecheck` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Intelligent Token Budget Tracking` section to `docs/orchestrator.md` explaining the 90% throttle threshold, dynamic concurrency reduction, and crash-recovery via SQLite.
- [ ] Document the required `tokenBudget.hardLimitTokens` config field in `docs/configuration.md`.
- [ ] Add an entry to `docs/agent-memory/phase_14_decisions.md` recording the throttle-to-serial strategy and why 90% (not 95% or 80%) was chosen.
- [ ] Update `specs/8_risks_mitigation.md` traceability table to mark `[8_RISKS-REQ-031]` as implemented in Phase 14 / Task 03.

## 6. Automated Verification
- [ ] Execute `scripts/validate-all.sh` and confirm exit code 0.
- [ ] Run `node scripts/check-req-coverage.js --req 8_RISKS-REQ-031` and assert `status: covered`.
- [ ] Run `npm run test -- --ci --forceExit` and confirm zero failing test suites.
- [ ] Run `grep -r "8_RISKS-REQ-031" src/orchestrator/budget/ src/orchestrator/TaskRunner.ts --include="*.ts" -l` and confirm at least 3 files listed.
- [ ] Run `node scripts/db-check.js --table token_budget` and confirm exit code 0, verifying the table schema is present.
