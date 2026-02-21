# Task: Implement Filesystem Reset via Git Checkout (Sub-Epic: 05_Full Rewind Execution)

## Covered Requirements
- [3_MCP-TAS-095], [9_ROADMAP-REQ-038]

## 1. Initial Test Written
- [ ] In `src/rewind/__tests__/filesystem.resetter.test.ts`, write unit tests for `FilesystemResetter`:
  - Mock `child_process.execFile` (or the project's shell execution utility).
  - Test that `reset(gitHash)` executes `git checkout --force <gitHash>` with the correct arguments.
  - Test that `reset(gitHash)` throws `FilesystemResetError` if `git checkout` exits with a non-zero code, preserving the stderr output in the error message.
  - Test that `reset(gitHash)` throws `InvalidGitHashError` if `gitHash` is an empty string or does not match the SHA-1/SHA-256 pattern (`/^[0-9a-f]{40}$/i`).
  - Test that `reset(gitHash)` succeeds silently (resolves without value) when `git checkout` exits with code 0.
- [ ] In `src/rewind/__tests__/filesystem.resetter.integration.test.ts`, write an integration test using a real temporary Git repository:
  - `git init` a temp dir, make two commits, record commit hashes.
  - Write a file in commit 2 that does not exist in commit 1.
  - Call `FilesystemResetter.reset(commit1Hash)` and assert the file from commit 2 no longer exists on disk.
  - Assert the working tree is clean after the reset (`git status --porcelain` returns empty output).
- [ ] In `src/rewind/__tests__/filesystem.resetter.checksum.test.ts`, write a checksum fidelity test:
  - After reset, compute SHA-256 of every tracked file in the repository and compare against a pre-computed manifest captured at commit 1 creation time.
  - Assert 100% checksum match (zero mismatches), satisfying [9_ROADMAP-REQ-038].

## 2. Task Implementation
- [ ] Create `src/rewind/filesystem.resetter.ts` implementing the `FilesystemResetter` interface from `src/rewind/interfaces.ts`:
  - Export class `GitFilesystemResetter implements FilesystemResetter`.
  - Constructor accepts `{ repoPath: string; shellRunner: ShellRunner }` where `ShellRunner` is the project's abstraction over `child_process.execFile`.
  - Implement `async reset(gitHash: string): Promise<void>`:
    1. Validate `gitHash` against `/^[0-9a-f]{40}$/i`; throw `InvalidGitHashError` if invalid.
    2. Execute `git -C <repoPath> checkout --force <gitHash>` via `shellRunner`.
    3. If exit code is non-zero, throw `FilesystemResetError` with the captured stderr.
- [ ] Create `src/rewind/errors.ts` (extend existing file) with:
  - `FilesystemResetError extends Error` — includes `gitHash: string` and `stderr: string`.
  - `InvalidGitHashError extends Error` — includes `providedHash: string`.
- [ ] After `git checkout --force`, also run `git clean -fd` to remove any untracked files leftover from a partial prior run. Add a corresponding unit test for this additional command.
- [ ] Wire `GitFilesystemResetter` as the concrete implementation in the DI composition root (e.g., `src/rewind/composition-root.ts`).

## 3. Code Review
- [ ] Verify `git checkout --force` and `git clean -fd` are run as separate sequential shell calls, not combined in a shell pipeline (to preserve distinct error codes).
- [ ] Confirm that `gitHash` is passed as a positional argument via `execFile` (not interpolated into a shell string), preventing command injection.
- [ ] Verify the integration test uses a real temp directory (not mocks) and is tagged `@integration` so it can be excluded from fast unit test runs.
- [ ] Confirm that the `repoPath` is always an absolute path and validated as such in the constructor.
- [ ] Review that `git clean -fd` scope is limited to the `repoPath` root and does not accidentally clean parent directories.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="filesystem.resetter"` and confirm all unit and integration tests pass.
- [ ] Run the checksum fidelity test explicitly: `npm test -- --testPathPattern="filesystem.resetter.checksum"` and confirm 100% match assertion passes.
- [ ] Run `npm run lint` and `npm run build` with zero errors.

## 5. Update Documentation
- [ ] Update `src/rewind/REWIND.agent.md` with a section on `GitFilesystemResetter`:
  - Document the exact git commands executed, in order.
  - Document the `InvalidGitHashError` and `FilesystemResetError` error types and when each is thrown.
  - Note the security rationale for using `execFile` instead of shell interpolation.
- [ ] Add a note in `docs/architecture/rewind.md` (create if absent) explaining how Git is used as the filesystem state store and why `--force` is safe in this context (the orchestrator pre-validates dirty workspace in a prior gate).

## 6. Automated Verification
- [ ] Run the integration test in CI against a real temp Git repo: `npm test -- --testPathPattern="filesystem.resetter.integration" --runInBand`.
- [ ] Assert that after `FilesystemResetter.reset(hash)`, running `git -C <repoPath> rev-parse HEAD` returns the exact `hash` passed in (verify via shell in the integration test).
- [ ] Run `npm test -- --coverage --testPathPattern="filesystem.resetter"` and assert branch coverage ≥ 90% for `filesystem.resetter.ts`.
