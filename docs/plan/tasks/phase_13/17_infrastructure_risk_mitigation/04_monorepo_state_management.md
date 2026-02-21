# Task: Implement Monorepo Root-Level State Management for Complexity Mitigation (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [RISK-601]

## 1. Initial Test Written
- [ ] Create `src/state/__tests__/monorepoStateManager.test.ts` with Vitest.
- [ ] Write a unit test `detectMonorepo_identifiesWorkspaceRoot` that creates a temp directory tree with `pnpm-workspace.yaml` and nested `package.json` files, calls `detectMonorepoRoot(dir)`, and asserts it returns the workspace root path.
- [ ] Write a unit test `detectMonorepo_returnsFalseForSinglePackage` that uses a flat single-package directory and asserts `detectMonorepoRoot` returns `null`.
- [ ] Write a unit test `packageGraph_buildsCorrectDependencyEdges` that provides mock workspace `package.json` files with cross-package `dependencies` and asserts `buildPackageGraph()` returns an adjacency list matching the declared dependencies.
- [ ] Write a unit test `stateManager_scopesTaskToPackage` asserting that when `StateManager.startTask(taskId, { scope: 'packages/core' })` is called, all subsequent file write locks are prefixed with `packages/core/`.
- [ ] Write a unit test `stateManager_rejectsOutOfScopeWrite` confirming that attempting to write a file outside the scoped package path throws a `ScopeViolationError`.
- [ ] Write an integration test `orchestrator_parallelTasksDoNotOverlapScopes` using a mock multi-package graph to verify two simultaneously-active tasks targeting different packages never produce overlapping `Write Lock` sets.

## 2. Task Implementation
- [ ] Create `src/state/monorepoDetector.ts` exporting:
  - `detectMonorepoRoot(startDir: string): string | null` — walks up the directory tree looking for `pnpm-workspace.yaml`, `lerna.json`, or root `package.json` with a `workspaces` field.
  - `listWorkspacePackages(root: string): WorkspacePackage[]` — reads workspace globs, expands them, and returns `{ name, path, packageJson }` entries.
- [ ] Create `src/state/packageGraph.ts` exporting `buildPackageGraph(packages: WorkspacePackage[]): PackageGraph` which builds a directed dependency graph (adjacency list) from cross-package `dependencies`/`devDependencies`.
- [ ] Extend `StateManager` (`src/state/stateManager.ts`):
  - Add `monorepoRoot: string | null` property, populated on construction via `detectMonorepoRoot`.
  - Add `startTask(taskId, options: { scope?: string })` overload that stores the package scope in `state.sqlite` `tasks` table (add `package_scope TEXT` column via migration).
  - Implement `assertWriteScope(filePath: string): void` that throws `ScopeViolationError` if `filePath` does not start with the current task's `package_scope` (when scope is set).
- [ ] Create DB migration `src/db/migrations/<timestamp>_add_package_scope.ts` adding `package_scope TEXT` column to `tasks` table.
- [ ] Integrate scope enforcement into the file-write wrapper used by all sandboxed agent tools (`src/sandbox/fileWriter.ts`), calling `stateManager.assertWriteScope(path)` before every write.

## 3. Code Review
- [ ] Verify `detectMonorepoRoot` has a depth limit (e.g., 20 levels) to prevent infinite traversal on misconfigured filesystems.
- [ ] Confirm `ScopeViolationError` is a typed, named error class (not a generic `Error`) so callers can distinguish it.
- [ ] Ensure `buildPackageGraph` handles circular dependencies gracefully (detect cycle and throw `CircularDependencyError` with the cycle path in the message).
- [ ] Verify the DB migration is idempotent (uses `ALTER TABLE … ADD COLUMN IF NOT EXISTS` or equivalent guard).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/state/__tests__/monorepoStateManager.test.ts` and confirm all tests pass.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full suite and verify no regressions.

## 5. Update Documentation
- [ ] Create or update `src/state/state.agent.md` with a "Monorepo Scoping" section describing `detectMonorepoRoot`, package graph construction, and scope enforcement.
- [ ] Add a Mermaid diagram in `docs/architecture/monorepo-support.md` showing the root detection flow and per-task scope locking.
- [ ] Update `CHANGELOG.md`: `feat(state): monorepo root detection and package-scoped write locking [RISK-601]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/monorepo-state.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/monorepo-state.json` and confirm all tests show `status: "passed"`.
