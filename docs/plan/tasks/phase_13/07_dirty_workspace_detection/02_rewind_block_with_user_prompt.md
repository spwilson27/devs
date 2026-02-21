# Task: Implement Dirty Workspace Rewind Block with User Prompt (Sub-Epic: 07_Dirty Workspace Detection)

## Covered Requirements
- [4_USER_FEATURES-REQ-041], [8_RISKS-REQ-072]

## 1. Initial Test Written

- [ ] Create test file at `src/commands/rewind/rewind-guard.test.ts`.
- [ ] Write a unit test `blocksRewind_whenWorkspaceIsDirty` that:
  1. Mocks `DirtyWorkspaceDetector.isDirty` to return `true`.
  2. Mocks `DirtyWorkspaceDetector.getDirtyFiles` to return a list of two fake dirty files.
  3. Mocks the user prompt (inject a `promptFn` dependency returning `'stash'`).
  4. Calls `RewindGuard.check(workspacePath)` and asserts it does NOT throw when user selects `'stash'`.
  5. Asserts the `GitStashService.stash()` method (mocked) was called exactly once.
- [ ] Write a unit test `blocksRewind_userSelectsDiscard` that mocks prompt returning `'discard'` and asserts `GitResetService.hardReset()` (mocked) was called.
- [ ] Write a unit test `blocksRewind_userSelectsCommit` that mocks prompt returning `'commit'` and asserts `GitCommitService.commitAll(message)` (mocked) was called with a non-empty commit message provided by the prompt.
- [ ] Write a unit test `allowsRewind_whenWorkspaceIsClean` that mocks `isDirty` returning `false` and asserts `RewindGuard.check()` resolves without calling any git action.
- [ ] Write a unit test `throwsRewindBlockedError_whenUserCancels` that mocks prompt returning `'cancel'` and asserts `RewindGuard.check()` throws a `RewindBlockedError`.
- [ ] Write an E2E test `rewindCommand_blockedByDirtyWorkspace_e2e` that:
  1. Creates a temporary git repo with one uncommitted file.
  2. Invokes the `devs rewind` CLI handler with a mocked interactive prompt that returns `'stash'`.
  3. Asserts exit code is `0` and `git stash list` shows one stash entry.

## 2. Task Implementation

- [ ] Create `src/commands/rewind/rewind-guard.ts`.
- [ ] Define and export `class RewindGuard` with a static async method `check(workspacePath: string, promptFn?: PromptFn): Promise<void>` where `PromptFn` is `(dirtyFiles: DirtyFile[]) => Promise<'stash' | 'discard' | 'commit' | 'cancel'>`.
- [ ] Inside `check`:
  1. Instantiate `DirtyWorkspaceDetector` and call `isDirty(workspacePath)`.
  2. If clean, return immediately.
  3. If dirty, call `getDirtyFiles(workspacePath)` and invoke `promptFn` (defaulting to `defaultDirtyWorkspacePrompt`).
  4. Based on result: call `GitStashService.stash(workspacePath)`, `GitResetService.hardReset(workspacePath)`, or `GitCommitService.commitAll(workspacePath, message)`.
  5. If `'cancel'`, throw `new RewindBlockedError('Rewind blocked: workspace has uncommitted changes.')`.
- [ ] Create `src/commands/rewind/rewind-blocked-error.ts` exporting `class RewindBlockedError extends Error`.
- [ ] Create `src/ui/prompts/dirty-workspace-prompt.ts` implementing `defaultDirtyWorkspacePrompt` using `@inquirer/select` and `@inquirer/input` for the commit message sub-prompt (only shown if user picks `'commit'`).
- [ ] Wire `RewindGuard.check()` into the existing `devs rewind` command handler (in `src/commands/rewind/index.ts` or equivalent) as the first step before any state restoration logic.
- [ ] Add `@inquirer/select` and `@inquirer/input` to `package.json` if not already present. Run `npm install`.

## 3. Code Review

- [ ] Verify `RewindGuard` depends on `DirtyWorkspaceDetector`, `GitStashService`, `GitResetService`, `GitCommitService`, and `PromptFn` exclusively via constructor/parameter injection (no direct imports from concrete classes inside the method body, except defaults).
- [ ] Verify `RewindBlockedError` extends `Error` and has `name = 'RewindBlockedError'` set in the constructor.
- [ ] Verify `defaultDirtyWorkspacePrompt` presents all three action choices (`Commit`, `Stash`, `Discard`) plus `Cancel` and displays the list of dirty files before the prompt.
- [ ] Verify the commit sub-prompt is only triggered when user selects `'commit'`.
- [ ] Verify all async paths have proper `try/catch` with rethrow for unexpected git errors.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=rewind-guard` and confirm all unit tests pass.
- [ ] Run the E2E test: `npm test -- --testPathPattern=rewindCommand_blockedByDirtyWorkspace_e2e` and confirm it passes.
- [ ] Run `npm run coverage -- src/commands/rewind/rewind-guard.ts` and confirm branch coverage is ≥ 95%.

## 5. Update Documentation

- [ ] Add a "Dirty Workspace Rewind Block" section to `docs/commands/rewind.agent.md` (create if absent) documenting:
  - The guard lifecycle (detect → prompt → act → proceed/block).
  - The three resolution strategies (Commit, Stash, Discard) and their effects.
  - The `RewindBlockedError` thrown on cancel.
- [ ] Update `src/commands/rewind/index.ts` top-level comment to reference the guard step.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="rewind-guard|rewindCommand_blockedByDirtyWorkspace" --reporter=json > test-results/rewind-guard.json` and verify `numFailedTests === 0`.
- [ ] Run `git -C <tmp_repo> stash list` as part of the E2E teardown assertion and confirm stash was created (validates that the stash action was not merely mocked at the wrong layer).
