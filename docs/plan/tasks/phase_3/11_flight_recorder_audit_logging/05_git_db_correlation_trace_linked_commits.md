# Task: Implement Git-DB Correlation & Trace-Linked Commit Messages (Sub-Epic: 11_Flight Recorder & Audit Logging)

## Covered Requirements
- [3_MCP-TAS-039], [5_SECURITY_DESIGN-REQ-SEC-SD-073], [8_RISKS-REQ-059]

## 1. Initial Test Written
- [ ] In `packages/core/src/flight-recorder/__tests__/gitDbCorrelation.test.ts`, write unit tests that:
  - Assert `commitTaskCompletion()` updates the `tasks` table row for the given `task_id` with the `git_commit_hash` of the newly created commit (HEAD SHA after the commit).
  - Assert that the Git commit message produced by `commitTaskCompletion()` matches the pattern: `feat(task): <TASK-ID> — <short description>\n\nTrace-ID: <trace_id>\nReasoning-Log: agent_logs WHERE task_id='<TASK-ID>'\n\nCo-authored-by: devs <devs@localhost>`.
  - Assert that if the Git commit fails (mock `git commit` to exit non-zero), `commitTaskCompletion()` rolls back the `tasks` table update (i.e., `git_commit_hash` remains NULL) using a SQLite transaction.
  - Assert that the `tasks` table has a `git_commit_hash` column of type TEXT (verify via `PRAGMA table_info(tasks)`).
  - Assert that `queryReasoningTrace(taskId)` returns all `agent_logs` rows for the given `task_id`, ordered by `(turn_index ASC, saop_phase ASC)`, and that the result is serializable to JSON.
- [ ] In `packages/core/src/flight-recorder/__tests__/gitDbCorrelation.integration.test.ts`, write an integration test that:
  - Initialises a temporary Git repo (`git init`, `git commit --allow-empty -m "init"`).
  - Persists 3 SAOP turns via `persistSaopTurn()` with a given `task_id`.
  - Calls `commitTaskCompletion()` and asserts:
    - `git log --oneline -1` output contains the TASK-ID.
    - `SELECT git_commit_hash FROM tasks WHERE id = ?` returns a 40-char hex string matching `git rev-parse HEAD`.
    - `queryReasoningTrace(taskId)` returns exactly 9 rows (3 turns × 3 SAOP phases).

## 2. Task Implementation
- [ ] Create `packages/core/src/flight-recorder/gitDbCorrelation.ts` exporting:
  - `commitTaskCompletion(db: Database, params: { taskId: string; traceId: string; shortDescription: string; repoRoot: string; }): Promise<string>`:
    1. Begin a SQLite transaction.
    2. Build the commit message using the required format (TASK-ID + trace reference).
    3. Execute `git -C <repoRoot> commit -m <message>` via `execFile`.
    4. On success: run `git -C <repoRoot> rev-parse HEAD` to get the new commit SHA; UPDATE `tasks SET git_commit_hash = ?, status = 'COMPLETED' WHERE id = ?`; commit the transaction; return the SHA.
    5. On failure: rollback the transaction; throw `FlightRecorderError` wrapping the Git error.
  - `queryReasoningTrace(db: Database, taskId: string): Promise<AgentLogRecord[]>`:
    - Executes `SELECT * FROM agent_logs WHERE task_id = ? ORDER BY turn_index ASC, saop_phase ASC`.
    - Returns a typed array of `AgentLogRecord`.
- [ ] Add migration `004_tasks_git_hash.sql` (if not already present from Phase 2 tasks): `ALTER TABLE tasks ADD COLUMN git_commit_hash TEXT;` — wrapped in `IF NOT EXISTS` guard.
- [ ] Wire `commitTaskCompletion` into the `ImplementationLoop` completion handler in `packages/core/src/orchestrator/implementationLoop.ts`: replace any existing plain `git commit` call with `commitTaskCompletion()`.
- [ ] Add JSDoc on all exports referencing `[3_MCP-TAS-039]`, `[5_SECURITY_DESIGN-REQ-SEC-SD-073]`, and `[8_RISKS-REQ-059]`.

## 3. Code Review
- [ ] Confirm the Git commit and DB UPDATE are wrapped in a single SQLite transaction so that a Git failure leaves the DB unchanged.
- [ ] Confirm the commit message format includes: TASK-ID, `Trace-ID`, and `Reasoning-Log` clause referencing `agent_logs`.
- [ ] Confirm `commitTaskCompletion` uses `execFile` (not `exec`) to prevent shell injection in TASK-ID or description strings.
- [ ] Confirm `queryReasoningTrace` orders by `turn_index ASC, saop_phase ASC` — not by insertion order (`rowid`), which may differ.
- [ ] Confirm `tasks.git_commit_hash` migration is idempotent (uses `IF NOT EXISTS` or is guarded by the migration runner).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="gitDbCorrelation"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core build` and confirm no TypeScript errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/flight-recorder.md` with a section **Git-DB Correlation**: describe the atomic commit+DB-write pattern and how `queryReasoningTrace` enables post-hoc inspection of every commit's "why."
- [ ] Update `docs/agent-memory/long-term.md` to note that `tasks.git_commit_hash` is the primary key linking Git history to the reasoning log, referencing `[3_MCP-TAS-039]` and `[8_RISKS-REQ-059]`.
- [ ] Add the required commit message format to `docs/contributing/commit-conventions.md` (or create it) so human contributors follow the same convention.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:ci` and assert exit code is `0`.
- [ ] Run the integration test and assert `git log --oneline -1` output contains the TASK-ID string.
- [ ] Run `sqlite3 /tmp/devs-test.sqlite "SELECT git_commit_hash FROM tasks LIMIT 1;"` (in the integration test teardown) and assert the value is a 40-character hex string matching `/^[0-9a-f]{40}$/`.
