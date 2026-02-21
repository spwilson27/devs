# Task: Implement Dependency Deadlock Detection & TAS Reconciliation Gate (Sub-Epic: 11_Sandbox Security Monitoring & Breach Detection)

## Covered Requirements
- [TAS-025]

## 1. Initial Test Written

- [ ] Create `packages/orchestrator/src/review/__tests__/DependencyConflictDetector.test.ts`.
- [ ] Write a unit test that creates a `DependencyConflictDetector` with a mock `TasLoader` returning a TAS dependency constraint `{ package: "typescript", pinnedVersion: "5.3.x" }` and a proposed change `{ package: "typescript", proposedVersion: "4.9.5" }`, and asserts `detectConflict()` returns `{ conflict: true, reason: 'VERSION_CONFLICT', constraint: ... }`.
- [ ] Write a unit test that asserts `detectConflict()` returns `{ conflict: false }` when the proposed version satisfies the TAS semver constraint.
- [ ] Write a unit test that verifies a detected conflict results in `ReviewerAgent.blockCommit(commitId, reason)` being called on the mock `ReviewerAgent`.
- [ ] Write a unit test that verifies a blocked commit triggers `TasReconciliationWorkflow.trigger(conflictDetails)` on the mock workflow handler.
- [ ] Write a unit test for `TasReconciliationWorkflow` that verifies it emits a `RECONCILIATION_NEEDED` event with the conflict details when triggered.
- [ ] Write a unit test that verifies `DependencyConflictDetector` checks both `package.json` (npm) and `pyproject.toml` (pip) dependency manifests for conflicts against TAS constraints.
- [ ] Write a unit test that asserts `DependencyConflictDetector` passes (no conflict) when no TAS constraints exist for the changed packages.

## 2. Task Implementation

- [ ] Create `packages/orchestrator/src/review/DependencyConflictDetector.ts`.
- [ ] Define `TasConstraint` interface in `packages/orchestrator/src/review/types.ts`:
  ```ts
  interface TasConstraint {
    package: string;
    pinnedVersion: string;   // semver range, e.g. "^5.3.0"
    ecosystem: 'npm' | 'pip' | 'any';
    rationale: string;
  }
  interface ConflictResult {
    conflict: boolean;
    reason?: 'VERSION_CONFLICT' | 'BANNED_PACKAGE' | 'UNLISTED_PACKAGE';
    constraint?: TasConstraint;
    proposedVersion?: string;
  }
  ```
- [ ] Create `packages/orchestrator/src/review/TasLoader.ts` that reads TAS dependency constraints from `.agent/tas_constraints.json` (auto-generated from `specs/2_tas.md` by a separate script).
- [ ] Implement `DependencyConflictDetector` class:
  - Constructor accepts `{ tasLoader: TasLoader }`.
  - `detectConflicts(manifestPaths: string[]): Promise<ConflictResult[]>` — reads all given dependency manifest files, extracts package+version entries, loads TAS constraints via `tasLoader.getConstraints()`, and checks each package against constraints using `semver.satisfies(proposedVersion, constraint.pinnedVersion)`.
  - Returns all conflicts found (not just the first).
- [ ] Create `packages/orchestrator/src/review/TasReconciliationWorkflow.ts`:
  - Exposes `trigger(conflicts: ConflictResult[]): void`.
  - Emits a `RECONCILIATION_NEEDED` event on the shared `EventBus` with the conflict payload.
  - Logs the reconciliation trigger to the `SecurityEventLog` with `eventType: 'TAS_CONFLICT'`.
- [ ] Create `packages/orchestrator/src/review/ReviewerAgent.ts` (or extend existing if present):
  - `blockCommit(commitId: string, reason: string): void` — marks the commit as blocked in `CommitStateManager` and logs the block reason.
  - After blocking, calls `TasReconciliationWorkflow.trigger(conflicts)` if the block reason contains dependency conflicts.
- [ ] Wire `DependencyConflictDetector` into the pre-commit hook in `packages/orchestrator/src/hooks/preCommitHook.ts` so it runs before every commit during the agent TDD loop.

## 3. Code Review

- [ ] Verify `DependencyConflictDetector` uses the `semver` npm package (already in the dependency tree) for version comparison — do not implement manual semver parsing.
- [ ] Verify `TasLoader` caches the TAS constraints in memory after first load to avoid repeated file I/O on every commit.
- [ ] Verify `ReviewerAgent.blockCommit` is idempotent — calling it twice with the same `commitId` must not double-log.
- [ ] Verify `TasReconciliationWorkflow` does not throw when the `EventBus` has no listeners — use a safe emit pattern.
- [ ] Verify the pre-commit hook integration rejects the commit (non-zero exit) when `DependencyConflictDetector` returns any conflicts.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern="DependencyConflictDetector|TasReconciliation|ReviewerAgent"` and confirm all tests pass.
- [ ] Assert test coverage for `review/DependencyConflictDetector.ts` and `review/TasReconciliationWorkflow.ts` is ≥ 90%.
- [ ] Run the pre-commit hook manually against a fixture manifest with a known TAS conflict and assert exit code `1` with a descriptive error message.

## 5. Update Documentation

- [ ] Add a `## Dependency Conflict Detection` section to `packages/orchestrator/README.md` describing: TAS constraints file location (`.agent/tas_constraints.json`), how conflicts are detected, and the `RECONCILIATION_NEEDED` event payload shape.
- [ ] Document the `ReviewerAgent.blockCommit` API and `TasReconciliationWorkflow` trigger conditions in `packages/orchestrator/README.md`.
- [ ] Append to `.agent/memory/phase_2_decisions.md`: "TAS-025: DependencyConflictDetector uses semver.satisfies() to check package manifests against .agent/tas_constraints.json. Conflicts block commits and trigger TasReconciliationWorkflow via EventBus."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/orchestrator test -- --coverage --coverageReporters=json-summary` and assert `review/DependencyConflictDetector.ts` has `statements.pct >= 90`.
- [ ] Create a fixture `package.json` with `{ "dependencies": { "typescript": "4.9.5" } }` and a TAS constraint `{ package: "typescript", pinnedVersion: "^5.3.0" }`, run `DependencyConflictDetector.detectConflicts([fixturePath])`, and assert it returns a conflict with `reason: 'VERSION_CONFLICT'`.
- [ ] Run `pnpm --filter @devs/orchestrator lint` and assert zero lint errors.
