# Task: Implement Dependency Deadlock Blocker (Sub-Epic: 39_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-BLOCKER-003]

## 1. Initial Test Written
- [ ] Create `tests/orchestrator/dependency_deadlock.test.ts`.
- [ ] Write a test `should detect a circular dependency in the task DAG and throw a DependencyDeadlockError`.
- [ ] Write a test `should allow a valid DAG without circular dependencies to pass validation`.
- [ ] Write a test `should trigger a user intervention request when a deadlock is detected during runtime`.

## 2. Task Implementation
- [ ] Implement `detectCircularDependencies(dag)` in `src/orchestrator/dag_validator.ts` using a cycle detection algorithm (e.g., Tarjan's or Kahn's algorithm).
- [ ] Integrate this validation step into the `DistillerAgent`'s DAG generation phase.
- [ ] If a cycle is detected, pause orchestration and emit a `DEPENDENCY_DEADLOCK` event to prompt the user.

## 3. Code Review
- [ ] Ensure the cycle detection algorithm runs in $O(V + E)$ time to prevent performance bottlenecks on large project DAGs.
- [ ] Verify that the error messages clearly indicate which tasks form the cycle to aid the user in resolving the deadlock.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test -- tests/orchestrator/dependency_deadlock.test.ts` and ensure it passes.

## 5. Update Documentation
- [ ] Update `docs/orchestrator.md` to document the DAG validation process and the user intervention flow for deadlocks.

## 6. Automated Verification
- [ ] Run a synthetic DAG generation script `scripts/test_synthetic_dags.ts` that includes known cycles and verify it exits with the expected error code.
