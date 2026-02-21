# Task: Implement Soft Rewind — Revert Application Code While Retaining New Failing Tests (Sub-Epic: 02_Filesystem State Restoration)

## Covered Requirements
- [8_RISKS-REQ-087]

## 1. Initial Test Written
- [ ] In `src/rewind/__tests__/soft-rewind.test.ts`, write unit tests for `SoftRewinder`:
  - `softRewind({ cwd, targetCommitHash, testFiles })` calls `git checkout <targetCommitHash> --force -- <src/**>` (source paths only) and does NOT checkout the `testFiles` paths.
  - After the operation, the test file that was added in the failing commit still exists at HEAD with its new content, while the production source files are reverted to `targetCommitHash`.
  - If `testFiles` is empty, `softRewind` throws `NoTestFilesSpecifiedError`.
  - `softRewind` returns a `SoftRewindResult` containing `{ revertedSourceFiles: string[], retainedTestFiles: string[] }`.
- [ ] In `src/rewind/__tests__/soft-rewind.integration.test.ts`, write an integration test:
  - Commit `commit-A`: `src/calculator.ts` (passing impl) + `tests/calculator.test.ts` (passing test).
  - Commit `commit-B`: `src/calculator.ts` (regressed impl) + `tests/calculator.regression.test.ts` (new failing test).
  - Call `SoftRewinder.softRewind({ cwd, targetCommitHash: commitA.sha, testFiles: ['tests/calculator.regression.test.ts'] })`.
  - Assert `src/calculator.ts` contains `commit-A` content.
  - Assert `tests/calculator.regression.test.ts` still exists with `commit-B` content.
  - Assert `git status --short` shows `tests/calculator.regression.test.ts` as modified (staged relative to HEAD).
- [ ] In `src/rewind/__tests__/soft-rewind.test.ts`, also verify:
  - The resulting state is **not** automatically committed — caller must commit after inspection.
  - A `DirtyWorkspaceError` is thrown if uncommitted changes exist before `softRewind` is called.

## 2. Task Implementation
- [ ] **SoftRewinder Module**: Create `src/rewind/soft-rewinder.ts`:
  ```typescript
  export interface SoftRewindOptions {
    cwd: string;
    targetCommitHash: string;
    testFiles: string[];         // paths to test files to RETAIN at current HEAD content
    sourceGlobs?: string[];      // globs for source paths to revert; defaults to ['src/**']
  }
  export interface SoftRewindResult {
    revertedSourceFiles: string[];
    retainedTestFiles: string[];
  }
  export class NoTestFilesSpecifiedError extends Error {}
  export class SoftRewinder {
    static async softRewind(opts: SoftRewindOptions): Promise<SoftRewindResult>
  }
  ```
  Implementation steps inside `softRewind`:
  1. Validate `testFiles.length > 0`; throw `NoTestFilesSpecifiedError` if empty.
  2. Validate `targetCommitHash` matches `/^[0-9a-f]{40}$/i`.
  3. Check `git status --porcelain`; throw `DirtyWorkspaceError` if non-empty.
  4. Snapshot `testFiles` content to a temp in-memory map: `Map<path, content>`.
  5. Execute `git checkout <targetCommitHash> --force -- <sourceGlobs>` via `execa`.
  6. Re-write each `testFile` from the in-memory snapshot back to disk (overwriting any revert).
  7. Stage all test files: `git add <testFiles>`.
  8. Return `SoftRewindResult`.
- [ ] **CLI Command**: In `src/cli/commands/rewind.ts`, add a `--soft` flag:
  - When `--soft` is passed, call `SoftRewinder.softRewind` instead of `FilesystemRestorer.restore`.
  - Prompt the user to specify (or auto-detect from `git diff --name-only HEAD~1 HEAD -- 'tests/**'`) which test files to retain.
  - After soft rewind, print: `"Soft rewind complete. Review retained tests and run the test suite before committing."`
- [ ] **Auto-detection of new test files**: In `src/rewind/soft-rewinder.ts`, export a helper:
  ```typescript
  export async function detectNewTestFiles(cwd: string, sinceCommit: string): Promise<string[]>
  // runs: git diff --name-only <sinceCommit> HEAD -- 'tests/**' '**/*.test.ts' '**/*.spec.ts'
  ```

## 3. Code Review
- [ ] Confirm step 4 (snapshot to memory) handles binary files gracefully — `softRewind` should throw `UnsupportedBinaryTestFileError` if any test file in `testFiles` is binary (check via `git check-attr -a`).
- [ ] Verify the `git checkout -- <sourceGlobs>` does NOT include test directories (`tests/`, `**/__tests__/`, `**/*.test.ts`, `**/*.spec.ts`) in `sourceGlobs` by default.
- [ ] Confirm the result is left in an **unstaged/staged but uncommitted** state so the user or subsequent agent can inspect before committing.
- [ ] Check that `detectNewTestFiles` correctly scopes to test file patterns and does not return production source files.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="soft-rewind"` and confirm all tests pass.
- [ ] Run `tsc --noEmit` for zero TypeScript errors.

## 5. Update Documentation
- [ ] Create `src/rewind/soft-rewinder.agent.md` documenting: the soft rewind algorithm, the distinction from a hard rewind, the binary file limitation, and expected use case (regression introduced by agent, new failing test written, need to revert impl without losing the test).
- [ ] Update `docs/commands/rewind.md` to add a `--soft` flag section with a worked example showing the before/after git state.
- [ ] Update `docs/architecture/state-management.md` with a "Soft Rewind" subsection cross-referencing `8_RISKS-REQ-087`.

## 6. Automated Verification
- [ ] Run `npm test -- --ci --testPathPattern="soft-rewind"` and assert exit code `0`.
- [ ] Run the integration test: after `softRewind`, execute `git diff --name-only HEAD` in the temp repo and assert output contains the retained test file and does NOT contain any `src/` path.
- [ ] Run `devs rewind --soft --task-id <test-task-id> --dry-run` and assert it outputs the list of files that would be reverted and retained without modifying the working tree.
