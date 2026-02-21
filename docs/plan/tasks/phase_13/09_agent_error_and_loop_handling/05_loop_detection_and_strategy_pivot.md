# Task: Implement Loop Detection and Automatic Strategy Pivot ("Reason from First Principles") (Sub-Epic: 09_Agent Error and Loop Handling)

## Covered Requirements
- [4_USER_FEATURES-REQ-079]

## 1. Initial Test Written
- [ ] In `src/orchestration/__tests__/loopDetection.test.ts`, write unit and integration tests:
  - **Entropy counter increment**: `incrementEntropyCount(taskId)` increments the `entropy_count` column in the `tasks` table for the given task. Assert `getEntropyCount(taskId)` returns the updated value.
  - **Loop detection threshold**: `isLoopDetected(taskId)` returns `true` when `entropy_count >= LOOP_DETECTION_THRESHOLD` (default: 3, configurable via `DEVS_LOOP_THRESHOLD` env var), `false` otherwise.
  - **Pivot issuance**: `issuePivotDirective(taskId)` returns a system prompt string containing the mandatory "Reason from First Principles" instruction that explicitly tells the agent to ignore its previous attempts and start fresh reasoning.
  - **Pivot directive content**: Assert the pivot directive string includes the phrase "Ignore all previous implementation attempts" and "Reason from first principles" (case-insensitive).
  - **Pivot logging**: After `issuePivotDirective` is called, a row is inserted into `strategy_pivots` table (`task_id, pivot_count, triggered_at, entropy_count_at_trigger`) to record the pivot event.
  - **Reset after pivot**: `resetEntropyCount(taskId)` sets `entropy_count = 0` for the task. Assert `isLoopDetected` returns `false` after reset.
  - **Orchestrator integration**: Simulate 3 consecutive agent turns that each produce the same failed output (identical LLM response hash). Assert the orchestrator calls `issuePivotDirective` after the third failure and prepends it to the next turn's system prompt.
  - **Hard limit**: When `pivot_count` for a task reaches `MAX_PIVOTS` (default: 2, configurable via `DEVS_MAX_PIVOTS`), the orchestrator transitions the task to `PAUSED_FOR_INTERVENTION` instead of issuing another pivot.
- [ ] Write an E2E test: run a mock agent that returns an identical failing response 3 times. Assert the fourth turn receives the pivot directive in its system prompt. Assert the fifth turn (if the agent still fails) triggers `PAUSED_FOR_INTERVENTION`.

## 2. Task Implementation
- [ ] Add column `entropy_count INTEGER NOT NULL DEFAULT 0` and `pivot_count INTEGER NOT NULL DEFAULT 0` to the `tasks` table via migration `src/db/migrations/XXXX_add_entropy_columns.sql`.
- [ ] Add table `strategy_pivots` via the same migration:
  ```sql
  CREATE TABLE IF NOT EXISTS strategy_pivots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    task_id TEXT NOT NULL,
    pivot_count INTEGER NOT NULL,
    entropy_count_at_trigger INTEGER NOT NULL,
    triggered_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pivots_task ON strategy_pivots(task_id);
  ```
- [ ] Create `src/orchestration/loopDetection.ts`:
  - `incrementEntropyCount(taskId: string): number` — increments and returns the new `entropy_count`.
  - `resetEntropyCount(taskId: string): void` — sets `entropy_count = 0`.
  - `getEntropyCount(taskId: string): number` — returns current count.
  - `isLoopDetected(taskId: string): boolean` — returns `entropy_count >= LOOP_DETECTION_THRESHOLD`.
  - `issuePivotDirective(taskId: string): string`:
    1. Reads current `entropy_count` and `pivot_count` for the task.
    2. Inserts into `strategy_pivots` (in a transaction, also increments `tasks.pivot_count`).
    3. Resets `entropy_count` to 0.
    4. Returns the pivot system prompt string.
  - `getPivotCount(taskId: string): number` — returns current `pivot_count`.
  - Constants: `LOOP_DETECTION_THRESHOLD = parseInt(process.env.DEVS_LOOP_THRESHOLD ?? '3', 10)`, `MAX_PIVOTS = parseInt(process.env.DEVS_MAX_PIVOTS ?? '2', 10)`.
- [ ] Define the pivot directive template in `src/prompts/pivotDirective.ts`:
  ```
  SYSTEM OVERRIDE — STRATEGY PIVOT REQUIRED:
  You have failed to complete this task {{pivotCount}} time(s).
  Ignore all previous implementation attempts.
  Reason from first principles: re-read the task requirements, identify the core constraint, and derive a completely new approach without reference to what you have tried before.
  Your new plan must differ structurally from all prior attempts.
  ```
- [ ] In `src/orchestration/orchestrator.ts`, after each failed agent turn:
  1. Call `incrementEntropyCount(taskId)`.
  2. Call `isLoopDetected(taskId)`. If `true`:
     a. Check `getPivotCount(taskId) >= MAX_PIVOTS`. If so, call `suspendAgent(taskId, 'MAX_PIVOTS_EXCEEDED')` and return.
     b. Otherwise, call `issuePivotDirective(taskId)` and prepend the result to the next turn's system prompt.
  3. On a successful turn, call `resetEntropyCount(taskId)`.

## 3. Code Review
- [ ] Verify `issuePivotDirective` is atomic — the `strategy_pivots` insert, `pivot_count` increment, and `entropy_count` reset MUST all occur in a single SQLite transaction.
- [ ] Confirm `LOOP_DETECTION_THRESHOLD` and `MAX_PIVOTS` are read once at module load, not on every call (avoid repeated `process.env` reads in hot paths).
- [ ] Verify the pivot directive template does not include any prior-turn message content (it must not accidentally reinforce the failed strategy by quoting it).
- [ ] Confirm the orchestrator resets `entropy_count` on task success, not just on pivot — prevent stale counts affecting the next task run.
- [ ] Ensure the "identical LLM response hash" detection (for E2E loop detection) is computed as a stable hash (e.g., SHA-256) of the trimmed LLM text output, stored in `tasks.last_response_hash`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=loopDetection` and confirm all tests pass.
- [ ] Run `npm test -- --coverage --testPathPattern=loopDetection` and confirm line coverage ≥ 90% for `src/orchestration/loopDetection.ts` and `src/prompts/pivotDirective.ts`.

## 5. Update Documentation
- [ ] Create `src/orchestration/loopDetection.agent.md`:
  - Intent: detect agentic loops by counting consecutive failures; automatically issue a "reason from first principles" pivot directive to break the loop.
  - Edge Cases: entropy count not reset between tasks (bug risk), pivot directive sent when task is already suspended, MAX_PIVOTS = 0 (immediate suspension on first loop).
  - Testability: all logic exercised with in-memory SQLite; E2E test covers full orchestrator loop.
- [ ] Update `docs/error-handling.md` with a "Loop Detection & Pivot" section describing the entropy counter, threshold, MAX_PIVOTS limit, and the pivot directive template.
- [ ] Add a Mermaid state diagram to `docs/error-handling.md` showing: `IN_PROGRESS → (entropy++) → LOOP_DETECTED → PIVOT_ISSUED → IN_PROGRESS` and `LOOP_DETECTED → MAX_PIVOTS_EXCEEDED → PAUSED_FOR_INTERVENTION`.

## 6. Automated Verification
- [ ] Add CI step: `npm test -- --testPathPattern=loopDetection --ci` must pass with zero failures.
- [ ] Add contract test script `scripts/test_loop_detection_contract.ts` that:
  1. Creates a test task in SQLite.
  2. Calls `incrementEntropyCount` 3 times and asserts `isLoopDetected` returns `true`.
  3. Calls `issuePivotDirective` and asserts a `strategy_pivots` row exists and `entropy_count` is reset to 0.
  4. Calls `issuePivotDirective` again (to hit MAX_PIVOTS=2) and asserts `getPivotCount` returns 2.
  5. Asserts that at MAX_PIVOTS, the orchestrator mock receives a `suspendAgent` call.
- [ ] Run `npx ts-node scripts/test_loop_detection_contract.ts` in CI and assert exit code 0.
