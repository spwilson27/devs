# Task: Implement Automatic Git Commit on Successful Task Completion (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-023]

## 1. Initial Test Written
- [ ] Create unit tests in `src/git/__tests__/auto_commit.test.ts`:
  - Mock the Git execution wrapper and test `GitCommitService.commitTask(taskId, metadata)` is invoked with a well-formed commit message containing `Task:<taskId>` and optional metadata (task title, timestamp).
  - Test that after `commitTask` succeeds, the returned `commitHash` is persisted to the `tasks` table in SQLite (mock DB client).
  - Test failure mode: when commit fails, service returns structured error and does not persist a `git_commit_hash`.
- [ ] Create an integration test `src/git/__tests__/auto_commit.integration.test.ts` that runs against a temp git repo and verifies a real commit is created with the expected message and author/email from CI config.

## 2. Task Implementation
- [ ] Implement `src/git/auto_commit.ts` exporting `GitCommitService` with `async commitTask(taskId: string, options?: { message?: string, author?: string })`:
  - Stage changes relevant to the task (determine files via TaskContext or `git add -A` within workspace subset) and run `git commit -m "Task Complete: <taskId> - <short description>" --no-verify`.
  - Return `{ commitHash }` on success and persist `commitHash` to the `tasks` table.
  - Implement retries on transient git errors and backoff configuration.
- [ ] Wire `GitCommitService.commitTask` to the task completion pipeline so that successful TDD passes trigger a commit automatically.

## 3. Code Review
- [ ] Verify commit messages follow the canonical format and include a machine-parseable prefix (e.g., `TaskComplete: <taskId>`).
- [ ] Confirm the service respects `.gitignore` and does not commit secrets; verify scanning integration if present.
- [ ] Ensure commit persistence to DB is done atomically with the commit step: write DB only after commit success.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="auto_commit"` and ensure tests pass.
- [ ] Run `npm run lint` and `npm run build`.

## 5. Update Documentation
- [ ] Add `docs/git/AUTO_COMMIT.md` documenting commit format, when commits are created, and how to opt-out or configure commit behavior.
- [ ] Update `docs/security.md` section to note that auto-commit operations will exclude large secrets and adhere to repository lockfile policies.

## 6. Automated Verification
- [ ] CI step that runs a sample task, waits for commit, then runs `git log -1 --pretty=%B` and asserts the commit message contains the expected `Task Complete` prefix and the `taskId`.
- [ ] Run a CI-level audit that the `tasks` table row now contains the new `git_commit_hash` matching `git rev-parse HEAD`.
