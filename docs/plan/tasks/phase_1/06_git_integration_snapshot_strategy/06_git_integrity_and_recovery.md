# Task: Implement Git Integrity and Recovery Checks (Sub-Epic: 06_Git Integration & Snapshot Strategy)

## Covered Requirements
- [8_RISKS-REQ-127]

## 1. Initial Test Written
- [ ] Write integration tests for `GitIntegrityChecker.verifyWorkspace(path)`.
- [ ] Test detection of a "dirty" workspace (unstaged changes before a task starts).
- [ ] Test detection of a corrupted git history (e.g., missing HEAD, detached HEAD in a way that prevents snapshots).
- [ ] Test that the orchestrator pauses and triggers a `SECURITY_PAUSE` or error if integrity is compromised.
- [ ] Mock a git failure during commit and verify the system's recovery/retry logic.

## 2. Task Implementation
- [ ] Create `@devs/core/src/git/GitIntegrityChecker.ts`.
- [ ] Implement `verifyWorkspace()`:
    - Check if the workspace is "dirty" using `git status --porcelain`.
    - Verify that the current branch is correct and the HEAD is reachable.
- [ ] Implement `Git history corruption mitigation` (8_RISKS-REQ-127):
    - Before every snapshot, check the integrity of the git object store (`git fsck` or similar lightweight check).
    - If a conflict or corruption is detected, abort the implementation cycle and notify the user.
- [ ] Integrate these checks into the `ImplementationNode`'s pre-start and post-success transitions.

## 3. Code Review
- [ ] Ensure that integrity checks are performant and do not significantly slow down the task loop.
- [ ] Verify that the "Dirty Workspace Detection" is robust and doesn't trigger on ignored files.
- [ ] Confirm that recovery logic doesn't result in data loss in SQLite.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- @devs/core/src/git/GitIntegrityChecker.test.ts`.

## 5. Update Documentation
- [ ] Document the error codes and recovery procedures for Git integrity failures.

## 6. Automated Verification
- [ ] Manually modify a file in a test repo and run the orchestrator; verify that it detects the dirty state and refuses to proceed with the next task until the state is resolved.
