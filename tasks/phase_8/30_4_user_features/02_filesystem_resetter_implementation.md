# Task: Implement FilesystemResetter (Git-based Safe Checkout) (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-002]

## 1. Initial Test Written
- [ ] Create unit tests in `src/rewind/__tests__/filesystem.resetter.test.ts`:
  - Mock child-process invocation (use `execa` or `child_process.spawn`) to assert `git` commands executed: `git rev-parse --verify <hash>`, `git checkout --force <hash>`, and `git clean -fd` (or configured safe sequence).
  - Test that `FilesystemResetter.reset(gitHash)` verifies repo cleanliness (refuses to run if uncommitted changes by default) unless a `force` flag is provided.
  - Test that on invalid `gitHash` the method throws `FilesystemResetError` with underlying git stderr included.
- [ ] Create integration test `src/rewind/__tests__/filesystem.resetter.integration.test.ts` using a temporary repo (create temp dir, `git init`, create commits) and verify `reset` moves HEAD to the target commit.

## 2. Task Implementation
- [ ] Implement `src/rewind/filesystem.resetter.ts` exporting `FilesystemResetter` class with `async reset(gitHash: string, options?: { force?: boolean })`:
  - Validate `gitHash` exists (`git rev-parse --verify <hash>`).
  - If repo has uncommitted changes and `force` is not set, throw a `FilesystemDirtyError`.
  - Perform `git fetch --all` (if remote configured), `git checkout --force <hash>`, then `git clean -fd` to remove untracked files.
  - After checkout, run a verification step that `git rev-parse HEAD` equals provided `gitHash`.
  - Use `execa` or a tested child_process wrapper for invocations; wrap errors in `FilesystemResetError` with structured fields: `{ message, code, stderr }`.
- [ ] Add unit helper in `src/rewind/git.utils.ts` with small wrappers for `runGit(args[])` to centralize error handling and timeouts.

## 3. Code Review
- [ ] Ensure all external process calls are centralized and wrapped to allow deterministic mocking in tests.
- [ ] Verify the implementation refuses destructive operations when the repo is dirty unless explicitly forced; document the behavior.
- [ ] Confirm timeouts are present on external commands and output is captured for reproducible hashing and logging.
- [ ] Ensure errors preserve the original git stderr for debugging and entropy hashing.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="filesystem.resetter"` and confirm all tests pass.
- [ ] Run `npm run lint` and `npm run build` to ensure no lint/type errors.

## 5. Update Documentation
- [ ] Add `docs/rewind/FILESYSTEM_RESETTER.md` explaining the safe checkout sequence, configuration options (`force`, timeouts), and failure modes.
- [ ] Document `FilesystemResetError` fields and how the RewindOrchestrator should present them to users.

## 6. Automated Verification
- [ ] Create a CI job that creates a temporary git repo, makes 3 commits, and runs `FilesystemResetter.reset` to the second commit and asserts `git rev-parse HEAD` matches the expected hash.
- [ ] Run the integration test in a disposable container to ensure the operation is deterministic across OSes used in CI.
