# Task: Implement Entropy Pause (Max-Retry Threshold) Logic and CLI Presentation (Sub-Epic: 15_CLI and UI State Controls)

## Covered Requirements
- [1_PRD-REQ-UI-012]

## 1. Initial Test Written
- [ ] In `src/core/__tests__/entropyPause.test.ts`, write unit tests for the `EntropyPauseGuard`:
  - Test that after exactly 3 consecutive TDD loop failures for the same task, `EntropyPauseGuard.check(taskId)` returns `{ shouldPause: true, failureCount: 3, report: FailureAnalysisReport }`.
  - Test that fewer than 3 failures returns `{ shouldPause: false }`.
  - Test that `FailureAnalysisReport` contains: `taskId`, `failureCount`, `failedStrategies: string[]` (the implementation strategy descriptions that failed), and `lastError: string`.
  - Test that after a successful task completion, the failure counter for that task resets to 0.
  - Test that failure counts are persisted in the `task_failures` SQLite table (columns: `task_id TEXT`, `failure_count INTEGER`, `last_error TEXT`, `failed_strategies TEXT` as JSON) so counts survive process restarts.
- [ ] In `src/cli/__tests__/entropyPausePresentation.test.ts`, write tests for CLI output:
  - Test that when `shouldPause` is true, the CLI prints a formatted `FailureAnalysisReport` block to stdout, including a header `"⚠ ENTROPY PAUSE — Max retry threshold reached"`, the task ID, failure count, failed strategies list, and last error.
  - Test that the CLI then sets `run_state.status = 'PAUSED'` before exiting the loop.
  - Test that the user sees a prompt: `"Run \`devs rewind <taskId>\` to revert or \`devs skip\` to skip this task."`.

## 2. Task Implementation
- [ ] Create `src/core/EntropyPauseGuard.ts`:
  - `check(taskId: string): Promise<EntropyPauseResult>`:
    1. Query `task_failures WHERE task_id = taskId`.
    2. If `failure_count >= 3`, build a `FailureAnalysisReport` and return `{ shouldPause: true, ... }`.
    3. Otherwise return `{ shouldPause: false }`.
  - `recordFailure(taskId: string, strategy: string, error: string): Promise<void>`: upserts into `task_failures` incrementing `failure_count` and appending strategy to the JSON array.
  - `resetFailures(taskId: string): Promise<void>`: deletes or zeroes the row.
- [ ] Create the `task_failures` table migration in `src/db/migrations/`:
  ```sql
  CREATE TABLE IF NOT EXISTS task_failures (
    task_id TEXT PRIMARY KEY,
    failure_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    failed_strategies TEXT NOT NULL DEFAULT '[]'
  );
  ```
- [ ] In the `OrchestrationLoop`, after each failed TDD cycle:
  1. Call `EntropyPauseGuard.recordFailure(taskId, strategy, error)`.
  2. Call `EntropyPauseGuard.check(taskId)`.
  3. If `shouldPause`, call `EntropyPausePresenter.present(report)` then `StateController.pause()` and break the loop.
- [ ] Implement `src/cli/presenters/EntropyPausePresenter.ts` with `present(report: FailureAnalysisReport): void` that formats and prints the report to stdout.
- [ ] On success, call `EntropyPauseGuard.resetFailures(taskId)` at the end of the TDD cycle.

## 3. Code Review
- [ ] Verify the `ENTROPY_PAUSE_THRESHOLD` (3) is a named constant in a config file, not hardcoded inline.
- [ ] Verify `task_failures` writes are transactional and do not leave partial state.
- [ ] Confirm `EntropyPausePresenter` writes to stdout only and has no side effects.
- [ ] Verify the failure counter is per-task (keyed by `task_id`), not global.
- [ ] Confirm `resetFailures` is called only on confirmed task success, not on skip or rewind.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="entropyPause"` and confirm all tests pass.
- [ ] Run `npm test -- --testPathPattern="OrchestrationLoop"` to confirm the loop correctly integrates entropy pause without regressions.

## 5. Update Documentation
- [ ] Update `src/core/EntropyPauseGuard.agent.md` (AOD) with the module's threshold constant, DB schema, and interaction with `OrchestrationLoop`.
- [ ] Update `src/cli/presenters/EntropyPausePresenter.agent.md` (AOD).
- [ ] Add an entry in `docs/error-handling.md` describing the Entropy Pause mechanism, threshold, and user recovery steps.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="EntropyPauseGuard"` and confirm ≥ 90% line coverage.
- [ ] Write a fixture that simulates 3 consecutive failures and run `npm run test:e2e -- --grep "entropy pause"` to confirm `run_state.status = 'PAUSED'` after the third failure.
