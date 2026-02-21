# Task: Implement Flaky Test Heuristic Detector for Cross-Retry Error Analysis (Sub-Epic: 10_Retry and Tool Error Protocol)

## Covered Requirements
- [3_MCP-TAS-091]

## 1. Initial Test Written

- [ ] Create `src/orchestrator/__tests__/flakyTestDetector.test.ts`. Import `FlakyTestDetector` from `src/orchestrator/flakyTestDetector.ts`.
- [ ] Write a unit test: given three `TaskAttemptResult` objects with distinct `stderr` fingerprints (different error messages), assert `FlakyTestDetector.analyze(attempts)` returns `{ verdict: 'FLAKY', confidence: number, uniqueErrorCount: 3 }`.
- [ ] Write a unit test: given three `TaskAttemptResult` objects with identical `stderr` fingerprints (same error message), assert `FlakyTestDetector.analyze(attempts)` returns `{ verdict: 'CONSISTENT_FAILURE' }`.
- [ ] Write a unit test: given two attempts with the same error and one with a different error (2:1 ratio), verify the verdict is `FLAKY` when the uniqueErrorCount ≥ 2.
- [ ] Write a unit test: given a single attempt (first run, no retries yet), assert `FlakyTestDetector.analyze(attempts)` returns `{ verdict: 'INSUFFICIENT_DATA' }`.
- [ ] Write a unit test for `ErrorFingerprinter.fingerprint(stderr: string): string` — given two stderr strings differing only by line numbers and memory addresses, assert the returned fingerprints are identical (i.e., numeric noise is normalized).
- [ ] Write an integration test confirming that when `RetryProtocol` exhausts retries with mixed errors, it invokes `FlakyTestDetector.analyze()` and, on `FLAKY` verdict, emits a `HUMAN_INTERVENTION_REQUIRED` event with payload `{ taskId, verdict: 'FLAKY', attempts }` stored in the `human_intervention_requests` SQLite table.
- [ ] Write a test that `HUMAN_INTERVENTION_REQUIRED` events are NOT emitted when verdict is `CONSISTENT_FAILURE` (escalates to `MaxRetriesExceededError` path instead).

## 2. Task Implementation

- [ ] Create `src/orchestrator/flakyTestDetector.ts`. Export `FlakyTestDetector` class with a static method `analyze(attempts: TaskAttemptResult[]): FlakyAnalysisResult`.
- [ ] Define `FlakyAnalysisResult` type: `{ verdict: 'FLAKY' | 'CONSISTENT_FAILURE' | 'INSUFFICIENT_DATA'; uniqueErrorCount?: number; confidence?: number; fingerprints?: string[] }`.
- [ ] Implement analysis: extract `ErrorFingerprinter.fingerprint(attempt.stderr)` for each attempt, deduplicate into a `Set<string>`, and determine verdict: if `attempts.length < 2` → `INSUFFICIENT_DATA`; if `Set.size >= 2` → `FLAKY`; else → `CONSISTENT_FAILURE`.
- [ ] Create `src/orchestrator/errorFingerprinter.ts`. Export `ErrorFingerprinter` with a static method `fingerprint(raw: string): string`. Implementation must normalize: all decimal numbers → `<NUM>`, all hex addresses → `<ADDR>`, all file paths with line numbers → strip line numbers, UUIDs → `<UUID>`, timestamps → `<TS>`.
- [ ] Add a SQLite migration (e.g., `migrations/014_human_intervention_requests.sql`) creating `human_intervention_requests` with columns: `id INTEGER PRIMARY KEY`, `task_id TEXT NOT NULL`, `phase TEXT NOT NULL`, `verdict TEXT NOT NULL`, `attempt_count INTEGER`, `fingerprints TEXT` (JSON array), `created_at TEXT NOT NULL DEFAULT (datetime('now'))`, `resolved_at TEXT`, `resolution TEXT`.
- [ ] In `RetryProtocol.executeWithRetry`, after `MaxRetriesExceededError`, call `FlakyTestDetector.analyze(recordedAttempts)`. If verdict is `FLAKY`, emit a `HUMAN_INTERVENTION_REQUIRED` event via `EventBus` and persist a record to `human_intervention_requests` via `DatabaseService`. Re-throw a `FlakyTestError` (extends `MaxRetriesExceededError`) containing the `FlakyAnalysisResult`.
- [ ] Create `src/orchestrator/events/humanInterventionEvent.ts` defining the `HumanInterventionRequiredEvent` payload type and event name constant `'HUMAN_INTERVENTION_REQUIRED'`.
- [ ] Ensure `HumanInTheLoopManager` (from `[2_TAS-REQ-019]`) subscribes to `HUMAN_INTERVENTION_REQUIRED` events and halts the orchestrator, persisting graph state while awaiting user resolution.

## 3. Code Review

- [ ] Verify `ErrorFingerprinter.fingerprint` uses a deterministic regex pipeline — confirm no stateful regex objects that could produce different results across calls.
- [ ] Confirm `FlakyTestDetector.analyze` does not mutate the input `attempts` array.
- [ ] Verify the `human_intervention_requests` table migration is idempotent.
- [ ] Confirm `FlakyTestError` carries the full `FlakyAnalysisResult` so consumers can display the fingerprints to the user.
- [ ] Check that `HumanInTheLoopManager` integration properly suspends the LangGraph graph state (not just halts the Node.js process) and writes the suspension point to SQLite.
- [ ] Verify confidence score in `FlakyAnalysisResult` is meaningful: `confidence = uniqueErrorCount / attempts.length` normalized to `[0, 1]`.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/orchestrator/__tests__/flakyTestDetector.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `FlakyTestDetector` and `ErrorFingerprinter`.
- [ ] Run the integration test `npx jest --testPathPattern="flakyTestDetector.integration"` and confirm `HUMAN_INTERVENTION_REQUIRED` events are correctly emitted and persisted.
- [ ] Run `npx jest --passWithNoTests` to confirm no regressions in the full suite.

## 5. Update Documentation

- [ ] Create `src/orchestrator/flakyTestDetector.agent.md` documenting: the FLAKY vs CONSISTENT_FAILURE verdict logic, the `ErrorFingerprinter` normalization rules (what patterns are stripped), and the `human_intervention_requests` table schema.
- [ ] Create `src/orchestrator/errorFingerprinter.agent.md` listing every regex normalization applied with examples.
- [ ] Update `src/orchestrator/retryProtocol.agent.md` to note that exhausted retries invoke `FlakyTestDetector` and may emit `HUMAN_INTERVENTION_REQUIRED`.
- [ ] Update `HumanInTheLoopManager`'s AOD file to document that it subscribes to `HUMAN_INTERVENTION_REQUIRED` events from the retry protocol.

## 6. Automated Verification

- [ ] Run `npx jest --testPathPattern="flakyTestDetector" --json --outputFile=/tmp/flaky_results.json && node -e "const r=require('/tmp/flaky_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Verify fingerprinting is deterministic: `npx ts-node -e "import { ErrorFingerprinter } from './src/orchestrator/errorFingerprinter'; const a=ErrorFingerprinter.fingerprint('Error at line 42: 0xDEAD'); const b=ErrorFingerprinter.fingerprint('Error at line 99: 0xBEEF'); console.assert(a===b, 'Fingerprints must match');"`.
- [ ] Run the migration and verify table: `sqlite3 /tmp/test.db '.read migrations/014_human_intervention_requests.sql' && sqlite3 /tmp/test.db "PRAGMA table_info(human_intervention_requests);" | grep -c "verdict"` asserts `1`.
