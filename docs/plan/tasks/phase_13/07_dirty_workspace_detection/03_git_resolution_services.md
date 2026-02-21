# Task: Implement Git Stash and Hard Reset Resolution Services (Sub-Epic: 07_Dirty Workspace Detection)

## Covered Requirements
- [8_RISKS-REQ-072], [4_USER_FEATURES-REQ-041]

## 1. Initial Test Written

- [ ] Create `src/state/git-stash-service.test.ts`.
- [ ] Write unit test `stash_callsGitStashWithMessage` that mocks `simple-git`, calls `GitStashService.stash(workspacePath, 'devs: pre-rewind auto-stash')`, and asserts `git.stash(['push', '-m', 'devs: pre-rewind auto-stash'])` was called.
- [ ] Write unit test `stash_throwsOnGitError` that mocks `simple-git` to throw and asserts `GitStashService.stash()` rethrows with a message containing "stash failed".
- [ ] Write integration test `stash_integration` that creates a real temp git repo with an uncommitted change, calls `GitStashService.stash()`, then checks `git stash list` shows one entry and the working tree is clean.
- [ ] Create `src/state/git-reset-service.test.ts`.
- [ ] Write unit test `hardReset_callsGitResetHard` that mocks `simple-git` and asserts `git.reset(['--hard', 'HEAD'])` is called by `GitResetService.hardReset(workspacePath)`.
- [ ] Write unit test `hardReset_throwsOnGitError` that mocks `simple-git` to throw and asserts the error is rethrown with a message containing "reset failed".
- [ ] Write integration test `hardReset_integration` that creates a real temp git repo with a modified tracked file, calls `GitResetService.hardReset()`, and asserts the file is restored to its committed content.
- [ ] Create `src/state/git-commit-service.test.ts`.
- [ ] Write unit test `commitAll_stagesAndCommitsAllFiles` that mocks `simple-git` and asserts `git.add('.')` then `git.commit(message)` are called in order.
- [ ] Write integration test `commitAll_integration` that creates a real temp git repo with an untracked file, calls `GitCommitService.commitAll(workspacePath, 'test commit')`, and asserts `git log --oneline` shows the new commit.

## 2. Task Implementation

- [ ] Create `src/state/git-stash-service.ts` exporting `class GitStashService` with:
  - `async stash(workspacePath: string, message?: string): Promise<void>` — calls `simpleGit(workspacePath).stash(['push', '-m', message ?? 'devs: pre-rewind auto-stash'])`. Wraps errors in a new `Error('Git stash failed: ' + originalMessage)`.
- [ ] Create `src/state/git-reset-service.ts` exporting `class GitResetService` with:
  - `async hardReset(workspacePath: string): Promise<void>` — calls `simpleGit(workspacePath).reset(ResetMode.HARD, ['HEAD'])`. Wraps errors in a new `Error('Git reset failed: ' + originalMessage)`.
- [ ] Create `src/state/git-commit-service.ts` exporting `class GitCommitService` with:
  - `async commitAll(workspacePath: string, message: string): Promise<void>` — calls `simpleGit(workspacePath).add('.')` then `.commit(message)`. Wraps errors in a new `Error('Git commit failed: ' + originalMessage)`.
- [ ] Export all three services from `src/state/index.ts`.
- [ ] Use `ResetMode` enum from `simple-git` for type-safe reset calls.

## 3. Code Review

- [ ] Verify each service class wraps `simple-git` errors with a descriptive, service-specific error message prefix.
- [ ] Verify `GitResetService.hardReset` uses `ResetMode.HARD` (not a raw string `'--hard'`) to ensure type safety.
- [ ] Verify `GitStashService.stash` uses a default stash message that includes `'devs:'` prefix for traceability.
- [ ] Verify all three service classes have no side effects outside of `simple-git` calls (no file I/O, no process spawning).
- [ ] Verify exported types match the signatures used in `RewindGuard` (task 02).

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="git-stash-service|git-reset-service|git-commit-service"` and confirm all tests pass.
- [ ] Run `npm run coverage -- src/state/git-stash-service.ts src/state/git-reset-service.ts src/state/git-commit-service.ts` and confirm branch coverage ≥ 90% for each file.

## 5. Update Documentation

- [ ] Add entries for `GitStashService`, `GitResetService`, and `GitCommitService` to `docs/state-recovery.agent.md` under a "Resolution Services" subsection, documenting each public method and its error wrapping behavior.
- [ ] Update `src/state/index.ts` barrel file exports.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="git-stash-service|git-reset-service|git-commit-service" --reporter=json > test-results/git-resolution-services.json` and verify `numFailedTests === 0`.
- [ ] In the integration tests, programmatically verify the git state (via `simple-git`) after each operation to confirm the actual repo state matches the expected outcome—not just that no error was thrown.
