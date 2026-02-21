# Task: Implement ResumeManager Git-DB Consistency Verification on Startup (Sub-Epic: 06_Crash Recovery and Resume)

## Covered Requirements
- [8_RISKS-REQ-042], [8_RISKS-REQ-095]

## 1. Initial Test Written
- [ ] In `src/orchestrator/__tests__/ResumeManager.test.ts`, write unit tests for a `ResumeManager` class covering the `verifyGitDbConsistency()` method:
  - **Happy path**: mock `git rev-parse HEAD` returning commit hash `abc123`; mock the SQLite query for the last completed task returning `{ git_commit_hash: 'abc123', task_id: 'task_42' }`; assert `verifyGitDbConsistency()` resolves with `{ consistent: true, taskId: 'task_42' }`.
  - **Mismatch path**: HEAD is `def456` but DB has `abc123`; assert the method resolves with `{ consistent: false, headCommit: 'def456', dbCommit: 'abc123', lastTaskId: 'task_42' }` and emits a structured `error`-level log entry.
  - **No completed tasks in DB**: DB query returns `null`; assert the method resolves with `{ consistent: true, taskId: null }` (fresh project, no resume needed).
  - **Git command failure** (not in a git repo): mock `git rev-parse HEAD` rejecting with `ENOENT`; assert the method throws a `GitNotAvailableError` with a descriptive message.
  - **SQLite query failure**: mock `db.prepare(...).get()` throwing; assert the error propagates as a `DatabaseError`.
  - Write an integration test using an actual in-memory SQLite database and a temp Git repo (created with `git init` + one commit): insert a task row with the correct `git_commit_hash`, call `verifyGitDbConsistency()`, and assert `consistent: true`.

## 2. Task Implementation
- [ ] Create `src/orchestrator/ResumeManager.ts`:
  - Import `execa` (or Node's `child_process.execFile`) for shell commands, and `better-sqlite3` `Database` type.
  - Define custom error classes `GitNotAvailableError` and `DatabaseError` (extend `Error`).
  - Implement `ResumeManager` constructor accepting `db: Database`, `projectRoot: string`, `logger: Logger`.
  - Implement `async verifyGitDbConsistency(): Promise<ConsistencyResult>`:
    1. Run `git -C <projectRoot> rev-parse HEAD` to obtain `headCommit`. Catch `ENOENT`/non-zero exit and throw `GitNotAvailableError`.
    2. Query SQLite: `SELECT git_commit_hash, task_id FROM tasks WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 1`. If no row, return `{ consistent: true, taskId: null }`.
    3. Compare `headCommit` to `row.git_commit_hash`. If mismatch, log error and return `{ consistent: false, headCommit, dbCommit: row.git_commit_hash, lastTaskId: row.task_id }`.
    4. Return `{ consistent: true, taskId: row.task_id }`.
  - Define and export `ConsistencyResult` as a discriminated union type.
- [ ] In `src/startup/bootstrap.ts`, after lockfile cleanup and before starting the orchestrator:
  - Instantiate `ResumeManager`.
  - Await `verifyGitDbConsistency()`.
  - If `consistent: false`, emit a user-visible CLI warning and prompt: `"Git HEAD does not match last known DB state. The project may have been modified manually. Run 'devs status' for details. Continue? [y/N]"`. Abort startup if user inputs `N` or if running in non-interactive CI mode (`--no-interactive` flag or `CI=true` env).

## 3. Code Review
- [ ] Verify `git rev-parse HEAD` is called with `-C <projectRoot>` so the command works from any working directory.
- [ ] Confirm the SQLite query uses a prepared statement (not string interpolation) to prevent injection.
- [ ] Verify the mismatch condition does not automatically modify Git or SQLite state — it only reports and prompts.
- [ ] Confirm `ConsistencyResult` is a discriminated union with a `consistent` boolean discriminant, enabling exhaustive type checking at call sites.
- [ ] Confirm custom error classes have a `name` property set to the class name for reliable `instanceof` checks.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=ResumeManager` and confirm all tests pass with no skipped cases.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation
- [ ] Add `src/orchestrator/ResumeManager.agent.md` documenting: the Git-DB consistency check algorithm, the `ConsistencyResult` type contract, error classes, and the bootstrap integration point.
- [ ] Update `docs/architecture/startup-sequence.md` to describe the Git-DB verification step and reference `8_RISKS-REQ-042` and `8_RISKS-REQ-095`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=ResumeManager --coverage` and assert line coverage ≥ 90% for `ResumeManager.ts`.
- [ ] In CI, run the integration test against a real temp Git repo and assert it exits 0.
