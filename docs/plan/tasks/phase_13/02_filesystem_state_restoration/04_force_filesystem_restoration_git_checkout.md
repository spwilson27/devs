# Task: Implement Force Filesystem Restoration via `git checkout --force` (Sub-Epic: 02_Filesystem State Restoration)

## Covered Requirements
- [8_RISKS-REQ-069]

## 1. Initial Test Written
- [ ] In `src/rewind/__tests__/filesystem-restorer.test.ts`, write unit tests for `FilesystemRestorer`:
  - `restore({ cwd, commitHash })` calls `git checkout <commitHash> --force` with the correct arguments and `cwd`.
  - If `commitHash` does not exist in the repo, a `GitCheckoutError` is thrown with the message containing the hash and the underlying git stderr output.
  - If `commitHash` is an empty string or not a 40-char hex string, an `InvalidCommitHashError` is thrown **before** any git command is executed.
  - `restore` resolves to `{ restoredHash: string, previousHash: string }` where `previousHash` is the HEAD before the checkout.
- [ ] In `src/rewind/__tests__/filesystem-restorer.integration.test.ts`, write an integration test:
  - Create a temp git repo with two commits (`commit-A`, `commit-B`).
  - Call `FilesystemRestorer.restore({ cwd, commitHash: commitA.sha })`.
  - Assert `git rev-parse HEAD` in the temp repo equals `commitA.sha`.
  - Assert the file written only in `commit-B` does not exist in the working tree after restore.
- [ ] In `src/rewind/__tests__/dirty-workspace.test.ts`, write a test:
  - If the working tree has uncommitted changes (`git status --porcelain` is non-empty), `restore` throws `DirtyWorkspaceError` **before** executing the checkout (unless `force: true` is explicitly passed).

## 2. Task Implementation
- [ ] **FilesystemRestorer Module**: Create `src/rewind/filesystem-restorer.ts`:
  ```typescript
  export interface RestoreResult { restoredHash: string; previousHash: string; }
  export class GitCheckoutError extends Error { commitHash: string; stderr: string; }
  export class InvalidCommitHashError extends Error {}
  export class DirtyWorkspaceError extends Error { untrackedFiles: string[]; }

  export class FilesystemRestorer {
    static async restore(opts: {
      cwd: string;
      commitHash: string;
      force?: boolean; // default false; if true, bypasses dirty-workspace check
    }): Promise<RestoreResult>
  }
  ```
  Implementation steps inside `restore`:
  1. Validate `commitHash` matches `/^[0-9a-f]{40}$/i`; throw `InvalidCommitHashError` if not.
  2. Run `git status --porcelain`; if output non-empty and `force !== true`, throw `DirtyWorkspaceError`.
  3. Capture `previousHash` via `git rev-parse HEAD`.
  4. Execute `git checkout <commitHash> --force` via `execa`.
  5. On non-zero exit, throw `GitCheckoutError`.
  6. Return `{ restoredHash: commitHash, previousHash }`.
- [ ] **Rewind Command Integration**: In `src/cli/commands/rewind.ts`, wire `FilesystemRestorer.restore`:
  - Retrieve `git_commit_hash` from `tasksRepository.getTaskById(targetTaskId)`.
  - Call `FilesystemRestorer.restore({ cwd: projectCwd, commitHash: task.git_commit_hash })`.
  - On `DirtyWorkspaceError`, prompt user (via `src/ui/prompts.ts`) to confirm force-restore or abort.
- [ ] **Post-restore Verification**: After `git checkout --force`, call `getCurrentHeadHash(cwd)` and assert it equals the requested `commitHash`; throw `RestoreVerificationError` if mismatch.

## 3. Code Review
- [ ] Confirm the `--force` flag on `git checkout` discards tracked file changes but does NOT delete untracked files. Document this behavior in `filesystem-restorer.agent.md` as a known limitation.
- [ ] Verify `DirtyWorkspaceError` captures the list of modified files for display to the user in the CLI output.
- [ ] Confirm the post-restore hash verification step exists and is not skippable.
- [ ] Check that `execa` calls use `reject: false` and manual exit-code inspection so errors are wrapped in typed exceptions, not raw `ExecaError`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="filesystem-restorer|dirty-workspace"` and confirm all tests pass.
- [ ] Run `tsc --noEmit` for zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/rewind/filesystem-restorer.agent.md` documenting: the restore algorithm, the known limitation that untracked files are NOT removed by `git checkout --force`, and the expected usage by the `rewind` command.
- [ ] Update `docs/commands/rewind.md` to describe the filesystem restoration step, including the dirty-workspace safety gate and how to bypass it with `--force`.

## 6. Automated Verification
- [ ] Run `npm test -- --ci --testPathPattern="filesystem-restorer|dirty-workspace"` and assert exit code `0`.
- [ ] Run the integration test suite; after restore, run `git rev-parse HEAD` in the temp repo and pipe to `grep -E "^[0-9a-f]{40}$"` — assert exit code `0`.
- [ ] Run `devs rewind --task-id <test-task-id> --dry-run` against a test project and assert it outputs the correct `commitHash` without modifying the working tree.
