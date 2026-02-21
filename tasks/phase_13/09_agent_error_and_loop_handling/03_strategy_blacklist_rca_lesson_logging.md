# Task: Implement Strategy Blacklist via RCA Lesson Logging (Sub-Epic: 09_Agent Error and Loop Handling)

## Covered Requirements
- [3_MCP-TAS-052]

## 1. Initial Test Written
- [ ] In `src/orchestration/__tests__/strategyBlacklist.test.ts`, write unit tests:
  - **Logging a lesson**: `logLessonLearned(taskId, failedStrategy, rcaSummary)` inserts a row into the `lessons_learned` SQLite table with columns `(id, task_id, failed_strategy, rca_summary, logged_at)`. Assert the row is retrievable by `task_id`.
  - **Blacklist enforcement**: `isStrategyBlacklisted(taskId, candidateStrategy)` returns `true` if a matching `failed_strategy` exists in `lessons_learned` for that `task_id`, `false` otherwise.
  - **Semantic similarity match**: If `candidateStrategy` is semantically equivalent (fuzzy string match, e.g., Levenshtein distance < 20% of string length) to a blacklisted strategy, `isStrategyBlacklisted` still returns `true`.
  - **Cross-task isolation**: A lesson logged for `task_id = 'A'` does NOT blacklist strategies for `task_id = 'B'`.
  - **Agent prompt injection**: `getBlacklistDirective(taskId)` returns a formatted system prompt string listing all blacklisted strategies for the given task, or an empty string if none exist.
  - **Idempotence**: Logging the same failed strategy twice for the same task results in only one row (upsert or deduplication logic).
- [ ] Write an integration test: simulate an agent failing a task twice with the same strategy. Assert the second attempt is blocked before any LLM call is made, and the task is moved to `PAUSED_FOR_INTERVENTION`.

## 2. Task Implementation
- [ ] Add migration `src/db/migrations/XXXX_add_lessons_learned.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS lessons_learned (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    task_id TEXT NOT NULL,
    failed_strategy TEXT NOT NULL,
    rca_summary TEXT NOT NULL,
    logged_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(task_id, failed_strategy)
  );
  CREATE INDEX IF NOT EXISTS idx_lessons_task_id ON lessons_learned(task_id);
  ```
- [ ] Create `src/orchestration/strategyBlacklist.ts`:
  - `logLessonLearned(taskId: string, failedStrategy: string, rcaSummary: string): void` — upserts into `lessons_learned`. On conflict (same `task_id` + `failed_strategy`), update `rca_summary` and `logged_at`.
  - `isStrategyBlacklisted(taskId: string, candidateStrategy: string): boolean` — queries all `failed_strategy` values for the task; returns true if any match exactly or fuzzy-match (Levenshtein distance ≤ floor(candidateStrategy.length * 0.20)).
  - `getBlacklistDirective(taskId: string): string` — formats all blacklisted strategies as a `SYSTEM: The following strategies have already failed and MUST NOT be used: ...` prompt prefix.
  - Export a `BlacklistEntry` type: `{ taskId: string, failedStrategy: string, rcaSummary: string, loggedAt: string }`.
- [ ] Implement Levenshtein distance in `src/utils/levenshtein.ts` (pure function, no external libraries).
- [ ] In the orchestrator's task implementation turn (`src/orchestration/orchestrator.ts`):
  1. Before invoking the LLM, call `getBlacklistDirective(taskId)` and prepend the result to the system prompt.
  2. After an RCA identifies a failed strategy (from `src/orchestration/rcaAnalyzer.ts`), call `logLessonLearned(taskId, failedStrategy, rcaSummary)`.
  3. Before the next retry, call `isStrategyBlacklisted(taskId, nextStrategy)`. If `true`, skip the LLM call, increment the entropy counter, and emit `task:blacklisted_strategy_attempted` event.

## 3. Code Review
- [ ] Verify that `logLessonLearned` operates inside a SQLite transaction and is atomic.
- [ ] Confirm `isStrategyBlacklisted` does not make LLM calls — it must be a pure local computation (SQLite query + Levenshtein).
- [ ] Ensure `getBlacklistDirective` output is escaped properly to prevent prompt injection (no raw user content interpolated without sanitization).
- [ ] Check that the Levenshtein implementation handles empty strings, Unicode, and very long strategy strings (> 2000 chars) without crashing or causing excessive CPU usage.
- [ ] Verify cross-task isolation: the `task_id` filter is always applied in every query — no query fetches lessons across all tasks.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=strategyBlacklist` and confirm all tests pass.
- [ ] Run `npm test -- --coverage --testPathPattern=strategyBlacklist` and confirm line coverage ≥ 90% for `src/orchestration/strategyBlacklist.ts` and `src/utils/levenshtein.ts`.

## 5. Update Documentation
- [ ] Create `src/orchestration/strategyBlacklist.agent.md`:
  - Intent: prevent agents from repeating failed implementation strategies by logging RCA findings to SQLite and enforcing the blacklist on every retry.
  - Edge Cases: empty strategy strings, RCA with no identified strategy, very long strategy descriptions.
  - Testability: fully unit-testable with in-memory SQLite; no LLM calls required.
- [ ] Add a section to `docs/error-handling.md` titled "Strategy Blacklist" describing how lessons are logged, how the blacklist is enforced, and the fuzzy-match threshold.

## 6. Automated Verification
- [ ] Add CI step: `npm test -- --testPathPattern=strategyBlacklist --ci` must pass.
- [ ] Add a schema assertion script `scripts/verify_lessons_schema.ts` that opens the dev SQLite DB and asserts the `lessons_learned` table exists with the correct columns. Run it in CI.
- [ ] Add a contract test: after a simulated agent failure with a known strategy string, query SQLite and assert the row exists with the correct `task_id`, `failed_strategy`, and non-empty `rca_summary`.
