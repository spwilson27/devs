# Task: Store Git HEAD Commit Hash in Tasks Table (Sub-Epic: 02_Filesystem State Restoration)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-074]

## 1. Initial Test Written
- [ ] In `src/db/__tests__/tasks.repository.test.ts`, write unit tests that verify:
  - `createTask(payload)` persists a `git_commit_hash` column alongside the task record.
  - `getTaskById(taskId)` returns the `git_commit_hash` field.
  - `getLastCompletedTask()` returns the task with the most recent `completed_at` timestamp, including its `git_commit_hash`.
  - A test that inserts a task without `git_commit_hash` and asserts a validation error is thrown (field is NOT NULL).
- [ ] In `src/orchestrator/__tests__/task-runner.integration.test.ts`, write an integration test that:
  - Stubs `git rev-parse HEAD` to return a known SHA (e.g., `"abc1234"`).
  - Runs a task to completion via `TaskRunner.run(task)`.
  - Queries the SQLite `tasks` table directly and asserts `git_commit_hash === "abc1234"` for the completed task row.

## 2. Task Implementation
- [ ] **Schema Migration**: Create `src/db/migrations/0013_add_git_commit_hash_to_tasks.sql`:
  ```sql
  ALTER TABLE tasks ADD COLUMN git_commit_hash TEXT NOT NULL DEFAULT '';
  ```
  Register this migration in `src/db/migrator.ts` migration array so it runs automatically on startup.
- [ ] **Repository Layer**: In `src/db/tasks.repository.ts`:
  - Add `git_commit_hash: string` to the `Task` TypeScript interface.
  - Update `createTask(payload: CreateTaskPayload)` to accept and INSERT `git_commit_hash`.
  - Update `SELECT` queries in `getTaskById`, `listTasks`, and `getLastCompletedTask` to include `git_commit_hash`.
- [ ] **Git Utility**: Create `src/git/git.utils.ts` exporting:
  ```typescript
  export async function getCurrentHeadHash(cwd: string): Promise<string> {
    // Executes: git rev-parse HEAD
    // Throws GitError if command fails or output is empty
  }
  ```
- [ ] **TaskRunner Integration**: In `src/orchestrator/task-runner.ts`, after a task transitions to `status = 'completed'`:
  - Call `getCurrentHeadHash(projectCwd)`.
  - Pass the returned hash to `tasksRepository.updateTask(taskId, { git_commit_hash: hash })`.

## 3. Code Review
- [ ] Verify `git_commit_hash` is a NOT NULL column with a meaningful default (`''`) and that the migration is backward-compatible with SQLite's `ALTER TABLE` limitations.
- [ ] Confirm `getCurrentHeadHash` throws a typed `GitError` (not a generic Error) and is covered by the unit test suite.
- [ ] Ensure no raw SQL string concatenation is used — all queries must use parameterized statements via the existing `db.prepare()` pattern.
- [ ] Confirm the `Task` interface change is reflected in all consuming code (no TypeScript compilation errors: run `tsc --noEmit`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="tasks.repository|task-runner.integration"` and confirm all new tests pass with zero failures.
- [ ] Run `tsc --noEmit` to confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Update `src/db/tasks.repository.agent.md` to document the `git_commit_hash` field: its purpose (correlating DB task state to Git tree state for rewind fidelity), type, and nullability constraints.
- [ ] Add an entry to `docs/architecture/state-management.md` under "Git-DB Correlation" explaining that every completed task stores the Git HEAD at the moment of completion, enabling `devs rewind` to restore a precise filesystem snapshot.

## 6. Automated Verification
- [ ] Run `npm test -- --ci --coverage --testPathPattern="tasks.repository|task-runner.integration"` and assert exit code is `0`.
- [ ] Run `node -e "const db = require('./src/db'); const t = db.getLastCompletedTask(); console.assert(t.git_commit_hash.length === 40, 'hash must be 40-char SHA1');"` against a seeded test database to verify the field is populated with a valid SHA.
