# Task: Integrate Dirty Workspace Detection into Resume Command (Sub-Epic: 07_Dirty Workspace Detection)

## Covered Requirements
- [8_RISKS-REQ-072], [4_USER_FEATURES-REQ-041]

## 1. Initial Test Written

- [ ] Create `src/commands/resume/resume-guard.test.ts`.
- [ ] Write unit test `resumeGuard_blocksDirtyWorkspace` that:
  1. Mocks `DirtyWorkspaceDetector.isDirty` to return `true`.
  2. Mocks the prompt to return `'stash'`.
  3. Calls `ResumeGuard.check(workspacePath)` and asserts it resolves without throwing.
  4. Asserts `GitStashService.stash()` was called.
- [ ] Write unit test `resumeGuard_allowsCleanWorkspace` that mocks `isDirty` returning `false` and asserts `ResumeGuard.check()` resolves immediately.
- [ ] Write unit test `resumeGuard_throwsOnCancel` that mocks prompt returning `'cancel'` and asserts `ResumeGuard.check()` throws a `ResumeBlockedError`.
- [ ] Write E2E test `resumeCommand_blockedByDirtyWorkspace_e2e` that:
  1. Creates a temporary git repo with an uncommitted file.
  2. Seeds the SQLite DB with a paused task record.
  3. Invokes the `devs resume` CLI handler with a mocked prompt returning `'discard'`.
  4. Asserts the resume proceeds (SQLite task status updated to `'in_progress'`) and the working tree is clean after the hard reset.

## 2. Task Implementation

- [ ] Create `src/commands/resume/resume-guard.ts` mirroring the structure of `RewindGuard` but for the resume flow:
  - Export `class ResumeGuard` with `static async check(workspacePath: string, promptFn?: PromptFn): Promise<void>`.
  - Reuse `DirtyWorkspaceDetector`, `GitStashService`, `GitResetService`, `GitCommitService`, and `defaultDirtyWorkspacePrompt` from prior tasks.
- [ ] Create `src/commands/resume/resume-blocked-error.ts` exporting `class ResumeBlockedError extends Error`.
- [ ] Wire `ResumeGuard.check()` into the `devs resume` command handler (in `src/commands/resume/index.ts` or equivalent) as the first step before `ResumeManager` runs.
- [ ] Ensure the prompt displayed to the user for the resume command context references "resume" instead of "rewind" in its descriptive text (pass a `context: 'resume' | 'rewind'` argument to `defaultDirtyWorkspacePrompt`). Update the prompt function accordingly.

## 3. Code Review

- [ ] Verify `ResumeGuard` and `RewindGuard` share `defaultDirtyWorkspacePrompt` (no code duplication of prompt logic).
- [ ] Verify `defaultDirtyWorkspacePrompt` correctly uses the `context` parameter to display contextual wording (`"resume"` vs `"rewind"`) in the prompt header.
- [ ] Verify `ResumeBlockedError` and `RewindBlockedError` are separate error classes (so callers can distinguish the source of the block).
- [ ] Verify the resume command handler catches `ResumeBlockedError` and exits with a non-zero code with a clear user-facing message.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=resume-guard` and confirm all unit tests pass.
- [ ] Run the E2E test: `npm test -- --testPathPattern=resumeCommand_blockedByDirtyWorkspace_e2e` and confirm it passes.
- [ ] Run `npm run coverage -- src/commands/resume/resume-guard.ts` and confirm branch coverage ≥ 95%.

## 5. Update Documentation

- [ ] Add a "Dirty Workspace Resume Block" section to `docs/commands/resume.agent.md` (create if absent) documenting:
  - The guard lifecycle for `devs resume`.
  - How the prompt context differs from the `devs rewind` prompt.
  - The `ResumeBlockedError` and exit behavior.
- [ ] Cross-reference `docs/commands/rewind.agent.md` and `docs/commands/resume.agent.md` from each other.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="resume-guard|resumeCommand_blockedByDirtyWorkspace" --reporter=json > test-results/resume-guard.json` and verify `numFailedTests === 0`.
- [ ] In the E2E test, verify using `simple-git` that the working tree is clean after `discard` resolution by asserting `git status --porcelain` returns an empty string.
