# Task: Uncommitted Changes Detection and Safeguard (Sub-Epic: 09_Determinism & Robustness Testing)

## Covered Requirements
- [8_RISKS-REQ-072]

## 1. Initial Test Written
- [ ] Write an integration test `tests/integration/dirty_workspace.test.ts`.
- [ ] Scenario 1: Clean workspace. `Orchestrator.startTask()` should proceed.
- [ ] Scenario 2: Create an untracked file or modify a tracked file. `Orchestrator.startTask()` should throw a `DirtyWorkspaceError`.
- [ ] Scenario 3: Provide a `--force` or `--stash` flag. Verify that the orchestrator either proceeds or automatically stashes changes.

## 2. Task Implementation
- [ ] Implement `GitManager.isWorkspaceDirty()` using `simple-git`. It should check for modified, deleted, or staged files (excluding `.devs` and `.agent` if possible, or following `.gitignore`).
- [ ] Add a pre-flight check in the `Orchestrator` execution loop.
- [ ] If the workspace is dirty:
    - In Interactive mode: Prompt the user to "Stash changes," "Discard changes," or "Abort."
    - In Headless/CI mode: Throw an error and exit with code `1`.
- [ ] Ensure that the "Dirty" check ignores files that are part of the `devs` internal state (e.g., `.devs/state.sqlite`).

## 3. Code Review
- [ ] Verify that `git status --porcelain` is used for consistent parsing.
- [ ] Ensure the UI/CLI provides a clear list of the files that are dirty.
- [ ] Confirm that the safeguard is applied before any `git commit` or `git checkout` operations are performed by the agent.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` for the `@devs/core` package.
- [ ] Manually test the CLI behavior by modifying a file and running a task.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to include "Rule: Always ensure workspace is clean before starting orchestration."
- [ ] Document the `--force-dirty` (if allowed) or `--stash` flags in the CLI help.

## 6. Automated Verification
- [ ] Execute `scripts/check_dirty_safeguard.sh` which modifies a file and asserts that `devs run` fails with the expected error message.
