# Task: Implement Dirty Workspace Rewind Block (Sub-Epic: 32_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-041]

## 1. Initial Test Written
- [ ] Write a unit test in `src/orchestrator/rewind.test.ts` that mocks a dirty git workspace (uncommitted changes).
- [ ] Ensure the test asserts that `rewindManager.rewind(taskId)` throws a `DirtyWorkspaceError`.
- [ ] Write a secondary test that mocks a clean workspace and asserts `rewindManager.rewind(taskId)` proceeds without throwing `DirtyWorkspaceError`.
- [ ] Write an integration test for the CLI `devs rewind` command that verifies it prompts the user with "Commit, Stash, or Discard" when a dirty workspace is detected.

## 2. Task Implementation
- [ ] Implement a `checkWorkspaceStatus()` function in `src/git/git-manager.ts` that uses `git status --porcelain` to check for uncommitted changes.
- [ ] Update `src/orchestrator/rewind.ts` to call `checkWorkspaceStatus()` before attempting any rewind operations.
- [ ] If the workspace is dirty, throw a `DirtyWorkspaceError`.
- [ ] Update the CLI command handler for `devs rewind` in `src/cli/commands/rewind.ts` to catch `DirtyWorkspaceError`.
- [ ] Implement an interactive prompt in the CLI (using a library like `enquirer` or `inquirer`) asking the user to choose between "Commit", "Stash", or "Discard".
- [ ] Implement the logic to execute the chosen action (`git commit`, `git stash`, or `git reset --hard`) before proceeding with the rewind.

## 3. Code Review
- [ ] Ensure `git status` checks are robust and handle edge cases (e.g., untracked files vs modified files).
- [ ] Verify that the interactive prompt is only displayed in a TTY environment; in non-TTY environments, it should fail gracefully with an informative error message.
- [ ] Ensure error handling does not expose internal stack traces to the CLI user unless in debug mode.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- src/orchestrator/rewind.test.ts` and `npm test -- src/cli/commands/rewind.test.ts` to ensure all tests pass.
- [ ] Verify code coverage for the newly added branching logic in the rewind command.

## 5. Update Documentation
- [ ] Update the `devs rewind` command documentation in `docs/cli.md` to explain the dirty workspace protection and the interactive prompt.
- [ ] Add an entry in the agent memory summarizing the implementation of the `DirtyWorkspaceError` and prompt flow.

## 6. Automated Verification
- [ ] Execute a script that runs `devs rewind` in a mock project with a modified file and pipes input to simulate a "Stash" choice, verifying the file is stashed and rewind succeeds.