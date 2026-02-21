# Task: Implement Orchestrator Auto-Retry Protocol for GREEN/VERIFY Phase Failures (Sub-Epic: 10_Retry and Tool Error Protocol)

## Covered Requirements
- [3_MCP-TAS-090]

## 1. Initial Test Written

- [ ] Create `src/orchestrator/__tests__/retryProtocol.test.ts`. Import and instantiate the `RetryProtocol` class (to be created at `src/orchestrator/retryProtocol.ts`).
- [ ] Write a unit test: given a mock command executor that returns exit code `1` twice, then `0` on the third attempt, assert that `RetryProtocol.executeWithRetry(cmd, maxRetries=2)` returns a successful result and the executor was called exactly 3 times.
- [ ] Write a unit test: given a mock command executor that always returns exit code `1`, assert that `RetryProtocol.executeWithRetry(cmd, maxRetries=2)` throws/rejects with a `MaxRetriesExceededError` after exactly 3 total attempts (initial + 2 retries).
- [ ] Write a unit test: given a mock command executor that returns exit code `0` on the first try, assert the executor is called exactly once and no retry occurs.
- [ ] Write an integration test in `src/orchestrator/__tests__/retryProtocol.integration.test.ts` that wires `RetryProtocol` into the orchestrator's `GreenPhaseRunner` and `VerifyPhaseRunner`. Mock the underlying `ToolProxy` to return non-zero exit codes, verify retry attempts are recorded in the SQLite `task_attempts` table (columns: `task_id`, `attempt_number`, `exit_code`, `timestamp`, `phase`).
- [ ] Write a test asserting that retry attempts are only triggered during the `GREEN` and `VERIFY` lifecycle phases (not during `RED`, `REVIEW`, or `COMMIT` phases).

## 2. Task Implementation

- [ ] Create `src/orchestrator/retryProtocol.ts`. Export a class `RetryProtocol` with a static async method `executeWithRetry(executor: CommandExecutor, maxRetries: number = 2): Promise<ExecutionResult>`.
- [ ] Inside `executeWithRetry`, run `executor.run()`. If exit code is non-zero and `attemptCount < maxRetries`, increment `attemptCount` and retry. If `attemptCount === maxRetries` and still non-zero, throw `MaxRetriesExceededError`.
- [ ] Define and export `MaxRetriesExceededError` (extends `Error`) with fields: `command`, `attempts`, `lastExitCode`, `lastOutput`.
- [ ] Create `src/orchestrator/types/executionResult.ts` if not present. Ensure `ExecutionResult` has: `exitCode: number`, `stdout: string`, `stderr: string`, `durationMs: number`.
- [ ] Add a SQLite migration (e.g., `migrations/013_task_attempts.sql`) creating the `task_attempts` table with columns: `id INTEGER PRIMARY KEY`, `task_id TEXT NOT NULL`, `phase TEXT NOT NULL CHECK(phase IN ('GREEN','VERIFY'))`, `attempt_number INTEGER NOT NULL`, `exit_code INTEGER NOT NULL`, `stdout TEXT`, `stderr TEXT`, `duration_ms INTEGER`, `timestamp TEXT NOT NULL DEFAULT (datetime('now'))`.
- [ ] In `src/orchestrator/phases/greenPhaseRunner.ts` and `src/orchestrator/phases/verifyPhaseRunner.ts`, replace direct `ToolProxy.run()` calls with `RetryProtocol.executeWithRetry(executor, 2)`. After each attempt (success or failure), persist an `task_attempts` record via `DatabaseService`.
- [ ] Ensure that between retries, a 1-second exponential back-off delay is applied (1s, 2s) using `setTimeout` wrapped in a `Promise`.
- [ ] Export retry phase restriction logic: a `PhaseGuard.isRetryEligible(phase: Phase): boolean` function that returns `true` only for `GREEN` and `VERIFY`.

## 3. Code Review

- [ ] Verify `RetryProtocol` is pure and has no direct I/O side effects; all persistence happens via injected `DatabaseService`.
- [ ] Confirm `MaxRetriesExceededError` includes sufficient diagnostic info (last stdout/stderr, attempt count) for downstream error handlers.
- [ ] Verify the `task_attempts` migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Confirm `PhaseGuard.isRetryEligible` is used in both `greenPhaseRunner` and `verifyPhaseRunner` and is not bypassed.
- [ ] Check that the exponential back-off is correctly implemented and not blocking the Node.js event loop.
- [ ] Verify there are no hard-coded `maxRetries` values outside of `RetryProtocol`'s default parameter; callers must explicitly pass or rely on the default.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/orchestrator/__tests__/retryProtocol.test.ts --coverage` and confirm all unit tests pass with 100% branch coverage of `RetryProtocol`.
- [ ] Run `npx jest src/orchestrator/__tests__/retryProtocol.integration.test.ts` and confirm all integration tests pass.
- [ ] Run the full test suite `npx jest --passWithNoTests` and confirm no regressions.
- [ ] Run the database migration in a test SQLite instance and validate the `task_attempts` table schema with `PRAGMA table_info(task_attempts)`.

## 5. Update Documentation

- [ ] Create or update `src/orchestrator/retryProtocol.agent.md` (AOD file) documenting: purpose, retry count default (2), phases where retry is active (GREEN, VERIFY), the `task_attempts` schema, and the `MaxRetriesExceededError` contract.
- [ ] Update `src/orchestrator/phases/greenPhaseRunner.agent.md` and `verifyPhaseRunner.agent.md` to note that all command execution now goes through `RetryProtocol`.
- [ ] Add an entry to the project's `CHANGELOG.md` or phase-level `docs/phase_13_progress.md` noting the implementation of the retry protocol.

## 6. Automated Verification

- [ ] Run `npx jest --testPathPattern="retryProtocol" --json --outputFile=/tmp/retry_results.json && node -e "const r=require('/tmp/retry_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"` to confirm zero failures.
- [ ] Execute `sqlite3 /tmp/test.db '.read migrations/013_task_attempts.sql' && sqlite3 /tmp/test.db "PRAGMA table_info(task_attempts);" | grep -c "phase"` and assert output is `1`.
- [ ] Verify `PhaseGuard.isRetryEligible` rejects non-GREEN/VERIFY phases by running `npx ts-node -e "import { PhaseGuard } from './src/orchestrator/phaseGuard'; console.assert(!PhaseGuard.isRetryEligible('RED')); console.assert(PhaseGuard.isRetryEligible('GREEN'));"`.
