# Task: Implement Git Dirty Workspace Detection Service (Sub-Epic: 07_Dirty Workspace Detection)

## Covered Requirements
- [8_RISKS-REQ-072], [4_USER_FEATURES-REQ-041]

## 1. Initial Test Written

- [ ] Create test file at `src/state/dirty-workspace-detector.test.ts`.
- [ ] Write a unit test `detectsDirtyWorkspace_withUntrackedFiles` that mocks `simple-git` and asserts `isDirty()` returns `true` when `git status --porcelain` returns untracked file lines (lines beginning with `??`).
- [ ] Write a unit test `detectsDirtyWorkspace_withModifiedTrackedFiles` that mocks `simple-git` and asserts `isDirty()` returns `true` when porcelain output contains modified file lines (e.g., `M  src/foo.ts`).
- [ ] Write a unit test `detectsDirtyWorkspace_withStagedChanges` that mocks `simple-git` and asserts `isDirty()` returns `true` when porcelain output contains staged lines (e.g., `A  src/new.ts`).
- [ ] Write a unit test `detectsCleanWorkspace` that mocks `simple-git` and asserts `isDirty()` returns `false` when porcelain output is empty.
- [ ] Write an integration test `detectsDirtyWorkspace_integration` that creates a real temporary Git repository via `tmp`, writes an uncommitted file, and asserts `isDirty()` returns `true`.
- [ ] Write an integration test `detectsCleanWorkspace_integration` that creates a real temporary Git repository, commits all files, and asserts `isDirty()` returns `false`.
- [ ] All tests must use `vitest` and `@vitest/coverage-v8`. Ensure 100% branch coverage on the service module.

## 2. Task Implementation

- [ ] Create `src/state/dirty-workspace-detector.ts`.
- [ ] Import `simpleGit` from `simple-git`. The service must be instantiated with a `workspacePath: string` parameter.
- [ ] Implement an async method `isDirty(workspacePath: string): Promise<boolean>` that:
  1. Calls `git.status()` on the given path using `simple-git`.
  2. Returns `true` if `StatusResult.files` array is non-empty (covers modified, staged, untracked, and deleted files).
  3. Returns `false` otherwise.
- [ ] Implement `getDirtyFiles(workspacePath: string): Promise<DirtyFile[]>` returning a typed array of `{ path: string; status: 'modified' | 'staged' | 'untracked' | 'deleted' }` objects derived from `StatusResult.files`.
- [ ] Export a `DirtyWorkspaceDetector` class with both methods.
- [ ] Export a `DirtyFile` TypeScript interface.
- [ ] Add `simple-git` to `package.json` dependencies if not already present. Run `npm install`.

## 3. Code Review

- [ ] Verify `DirtyWorkspaceDetector` depends only on `simple-git` and Node built-ins — no direct `child_process` calls.
- [ ] Verify `isDirty` and `getDirtyFiles` are both `async` and return `Promise`s.
- [ ] Verify all status categories (modified, staged, untracked, deleted, renamed) are correctly mapped by `getDirtyFiles`.
- [ ] Verify the `DirtyFile` interface is exported from a barrel file (`src/state/index.ts`) for use elsewhere.
- [ ] Confirm no `any` types are used; all `simple-git` response types are properly referenced.
- [ ] Verify error handling: if `simple-git` throws (e.g., not a git repo), the error propagates with a clear message indicating the path.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern=dirty-workspace-detector` and confirm all unit and integration tests pass with zero failures.
- [ ] Run `npm run coverage` and confirm branch coverage for `src/state/dirty-workspace-detector.ts` is 100%.

## 5. Update Documentation

- [ ] Add a section "Dirty Workspace Detector" to `docs/state-recovery.agent.md` (create if absent) describing: purpose, public API (`isDirty`, `getDirtyFiles`), and the `DirtyFile` type.
- [ ] Update `src/state/index.ts` barrel file exports to include `DirtyWorkspaceDetector` and `DirtyFile`.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern=dirty-workspace-detector --reporter=json > test-results/dirty-workspace-detector.json` and verify `numFailedTests` is `0` in the output JSON.
- [ ] Run `npm run coverage -- --reporter=json` and parse `coverage-summary.json` to assert `src/state/dirty-workspace-detector.ts` has `branches.pct === 100`.
