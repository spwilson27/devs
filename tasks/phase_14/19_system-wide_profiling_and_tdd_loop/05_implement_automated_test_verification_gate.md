# Task: Implement Automated Test Verification Gate (Anti-Lie Enforcement) (Sub-Epic: 19_System-Wide Profiling and TDD Loop)

## Covered Requirements
- [3_MCP-REQ-GOAL-005]

## 1. Initial Test Written
- [ ] Create `src/tdd/__tests__/AutomatedVerificationGate.test.ts`.
- [ ] Write a unit test `should return PASS when the test runner exits with code 0` — mock a `ChildProcess` that emits `close` with code `0`; assert `AutomatedVerificationGate.verify()` resolves to `{ passed: true, exitCode: 0, output: '' }`.
- [ ] Write a unit test `should return FAIL when the test runner exits with non-zero code` — mock exit code `1`; assert result is `{ passed: false, exitCode: 1, output: '<stderr content>' }`.
- [ ] Write a unit test `should capture stdout and stderr in the output field` — mock stdout emitting `"3 tests failed"` and stderr emitting `"TypeError: ..."` ; assert `output` contains both strings.
- [ ] Write a unit test `should timeout and return FAIL if the test runner hangs` — mock a process that never emits `close`; configure a 30-second timeout and assert the gate resolves to `{ passed: false, exitCode: -1, output: 'Timeout exceeded.' }` within the configured limit (use fake timers).
- [ ] Write a unit test `should record the verification result in the database` — spy on `DatabaseService.run()` and assert one INSERT into `tdd_verifications` occurs with `passed`, `exit_code`, and `task_id` fields.
- [ ] Write an integration test `should run the actual vitest CLI and detect a known failing test` — write a temporary test file that intentionally fails, point the gate at it, assert `passed: false`.

## 2. Task Implementation
- [ ] Create `src/tdd/AutomatedVerificationGate.ts`.
- [ ] Define and export interface `VerificationResult { passed: boolean; exitCode: number; output: string; taskId?: string }`.
- [ ] Implement `AutomatedVerificationGate` class with constructor accepting:
  - `dbService: DatabaseService`
  - `testCommand: string` (default: `'npx vitest run'`)
  - `timeoutMs: number` (default: `30_000`)
  - `spawnFn: typeof spawn` (injectable for testing; defaults to Node.js `child_process.spawn`)
- [ ] Implement `async verify(taskId: string, workingDir: string): Promise<VerificationResult>`:
  1. Spawn the `testCommand` in `workingDir` using `spawnFn`.
  2. Collect all `stdout` and `stderr` data chunks into a single `output` string.
  3. Race the `close` event promise against a `setTimeout(timeoutMs)` promise.
  4. If timeout fires, kill the child process and return `{ passed: false, exitCode: -1, output: 'Timeout exceeded.', taskId }`.
  5. On `close`, set `passed = exitCode === 0`.
  6. INSERT a row into `tdd_verifications`: `(task_id, passed, exit_code, output_snippet, verified_at)` where `output_snippet` is the last 2000 characters of `output`.
  7. Return `{ passed, exitCode, output, taskId }`.
- [ ] Create migration `migrations/014_tdd_verifications.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS tdd_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL,
    passed INTEGER NOT NULL,
    exit_code INTEGER NOT NULL,
    output_snippet TEXT,
    verified_at TEXT DEFAULT (datetime('now'))
  );
  ```
- [ ] Export `AutomatedVerificationGate` from `src/tdd/index.ts`.
- [ ] Integrate the gate into `TddLoopOrchestrator.execute()` — after each `testRunner.run()` call, also invoke `autoVerificationGate.verify(task.id, task.workingDir)` and treat a `passed: false` as a `TddViolationError`.

## 3. Code Review
- [ ] Verify `spawnFn` is injectable and the default is `require('child_process').spawn` — no hard-coded imports that block mocking.
- [ ] Confirm `output_snippet` is truncated to 2000 characters to prevent unbounded DB row sizes.
- [ ] Confirm the timeout path calls `childProcess.kill('SIGTERM')` before resolving, to prevent zombie processes.
- [ ] Verify the DB INSERT uses parameterised statements (no string concatenation).
- [ ] Confirm `verify()` never rejects (all errors are caught and encoded into `VerificationResult`).

## 4. Run Automated Tests to Verify
- [ ] Run `npx vitest run src/tdd/__tests__/AutomatedVerificationGate.test.ts --reporter=verbose`.
- [ ] Assert exit code is `0` and all tests pass.
- [ ] Run the full test suite `npx vitest run` to confirm no regressions.

## 5. Update Documentation
- [ ] Add a sub-section `### Automated Verification Gate` to `docs/architecture/tdd-loop.md` describing how it prevents agents from self-reporting false test results, the DB schema for `tdd_verifications`, and the timeout mechanism.
- [ ] Update `docs/agent-memory/phase_14.md` with: `AutomatedVerificationGate implemented; runs testCommand in subprocess, captures exit code, persists to tdd_verifications; integrated into TddLoopOrchestrator.`

## 6. Automated Verification
- [ ] Run `npx vitest run --coverage src/tdd` and assert line coverage ≥ 90% for `AutomatedVerificationGate.ts`.
- [ ] Run `npx tsc --noEmit` and assert exit code is `0`.
- [ ] Run `node -e "const db=require('better-sqlite3')(':memory:'); const sql=require('fs').readFileSync('migrations/014_tdd_verifications.sql','utf8'); db.exec(sql); console.log(db.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all())" | grep -q tdd_verifications && echo PASS || echo FAIL` to verify migration is valid.
