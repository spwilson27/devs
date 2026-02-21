# Task: Implement Dependency Deadlock Mitigation via TAS-Aware Package Validation (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [3_MCP-RISK-302]

## 1. Initial Test Written
- [ ] Create `src/agents/reviewer/__tests__/dependencyGuard.test.ts` with Vitest.
- [ ] Write a unit test `validatePackageJsonDiff_allowsCompliant` that provides a mock `package.json` diff adding a library listed in `TAS.allowed_libraries` and asserts the guard returns `{ status: 'APPROVED' }`.
- [ ] Write a unit test `validatePackageJsonDiff_blocksConflicting` that provides a diff adding a library **not** in `TAS.allowed_libraries` and asserts the guard returns `{ status: 'REJECTED', reason: string }`.
- [ ] Write a unit test `validatePackageJsonDiff_blocksVersionConflict` that provides a diff upgrading an allowed library to a version outside the TAS-pinned range and asserts `{ status: 'REJECTED' }`.
- [ ] Write an integration test `reviewerAgent_rejectsConflictingDependency` using a mocked `LangGraph` node harness: simulate a Developer Agent commit containing a prohibited package and assert the `ReviewerAgent` emits a `DEPENDENCY_CONFLICT` event and does **not** call `git commit`.
- [ ] Write a test `auditLog_recordsDependencyRejection` asserting that a rejection event is persisted to `state.sqlite` table `dependency_audits` with columns `(id, task_id, package_name, version, reason, timestamp)`.

## 2. Task Implementation
- [ ] Create `src/agents/reviewer/dependencyGuard.ts` exporting a pure function `validatePackageJsonDiff(diff: PackageJsonDiff, tas: TASAllowedLibraries): ValidationResult`.
  - Parse the diff to extract added/updated dependency entries (both `dependencies` and `devDependencies`).
  - For each entry, check membership in `TAS.allowed_libraries` (exact name match, semver range check via `semver` package).
  - Return `{ status: 'APPROVED' }` or `{ status: 'REJECTED', conflicts: ConflictDetail[] }`.
- [ ] Extend `TASAllowedLibraries` type in `src/types/tas.ts` to include `allowed_libraries: Record<string, string>` (package name → semver range).
- [ ] Integrate `validatePackageJsonDiff` into the `ReviewerAgent` LangGraph node (`src/agents/reviewer/reviewerNode.ts`):
  - Before evaluating test results, extract `package.json` diff from the active sandbox.
  - If result is `REJECTED`, set node output state `{ reviewOutcome: 'DEPENDENCY_CONFLICT', conflicts }` and route to the `HumanInTheLoop` gate—do not advance to `commit` node.
- [ ] Add a DB migration in `src/db/migrations/` creating table `dependency_audits(id TEXT PRIMARY KEY, task_id TEXT, package_name TEXT, version TEXT, reason TEXT, timestamp INTEGER)`.
- [ ] On every validation call (approved or rejected), write an audit row via the `StateManager`.

## 3. Code Review
- [ ] Verify `validatePackageJsonDiff` is a **pure function** with no side effects; all I/O lives in the calling node.
- [ ] Confirm the semver range validation uses the project-standard `semver` package (not a hand-rolled parser).
- [ ] Ensure the `ReviewerAgent` node routes to `HumanInTheLoop` (not a crash/throw) on rejection—verify via graph edge inspection in code.
- [ ] Check that `dependency_audits` migration is idempotent (`CREATE TABLE IF NOT EXISTS`).
- [ ] Confirm the audit record is written regardless of approval/rejection status (coverage for both paths).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/agents/reviewer/__tests__/dependencyGuard.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full test suite and verify no regressions.

## 5. Update Documentation
- [ ] Add or update `src/agents/reviewer/reviewer.agent.md` with a section describing the Dependency Guard: its trigger, the `allowed_libraries` schema location in TAS, and the `dependency_audits` table schema.
- [ ] Update `docs/architecture/reviewer-agent.md` to include a sequence diagram (Mermaid) showing the package.json diff validation path and the HITL escalation route.
- [ ] Update `CHANGELOG.md` with entry: `feat(reviewer): TAS-aware dependency deadlock guard [3_MCP-RISK-302]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/dependency-guard.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/dependency-guard.json` (or equivalent CI script) to confirm all reported tests have `status: "passed"` and no tests are skipped.
