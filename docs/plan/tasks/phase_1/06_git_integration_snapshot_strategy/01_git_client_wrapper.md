# Task: Implement Git Client Wrapper (Sub-Epic: 06_Git Integration & Snapshot Strategy)

## Covered Requirements
- [TAS-012]

## 1. Initial Test Written
- [ ] Write unit tests for a new `GitClient` class in `@devs/core/git`.
- [ ] Test `initRepository(path)` ensures a git repository is initialized if not present.
- [ ] Test `status()` returns a structured representation of the workspace state (clean, dirty, untracked files).
- [ ] Test `add(files)` correctly stages specified files.
- [ ] Test `commit(message)` creates a commit and returns the hash.
- [ ] Mock `simple-git` using `jest.mock` or a similar tool to verify internal calls.

## 2. Task Implementation
- [ ] Create `@devs/core/src/git/GitClient.ts`.
- [ ] Use `simple-git` as the underlying library for git operations.
- [ ] Implement `initRepository` to run `git init` in the target directory.
- [ ] Implement `status` using `simple-git.status()`.
- [ ] Implement `add` to stage files, handling both specific paths and wildcard patterns.
- [ ] Implement `commit` with support for descriptive messages.
- [ ] Ensure all methods handle errors and throw descriptive `GitError` exceptions.

## 3. Code Review
- [ ] Verify that `GitClient` is a thin, typed wrapper over `simple-git`.
- [ ] Ensure no host git configuration (like user.name/email) is assumed; handle defaults if missing.
- [ ] Check that paths are normalized using `upath` before being passed to git.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test -- @devs/core/src/git/GitClient.test.ts` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the `GitClient` interface in the `@devs/core` README or internal AOD (`.agent.md`).

## 6. Automated Verification
- [ ] Run a script that initializes a temporary directory, performs a git init via `GitClient`, and verifies the presence of the `.git` folder.
