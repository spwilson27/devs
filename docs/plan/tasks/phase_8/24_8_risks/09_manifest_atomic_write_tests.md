# Task: Add comprehensive manifest atomic-write and rollback tests (Sub-Epic: 24_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-048]

## 1. Initial Test Written
- [ ] Create tests at tests/integration/manifest-atomic.spec.ts covering:
  - Normal application of queued changes results in atomic replacement of package.json (no partial content visible).
  - Simulated crash during write (throw after write temp but before rename) triggers orchestrator recovery and cleans temp files; subsequent recovery run reparses queued changes properly.
  - Concurrent requests produce deterministic final state (assert ordering) when applied through the orchestrator.

## 2. Task Implementation
- [ ] Implement test harness utilities under test/helpers/manifest-fixture.ts to create temporary manifest directories, launch DependencyOrchestrator against them, and simulate crashes by killing the worker between steps.

## 3. Code Review
- [ ] Confirm tests cover failure scenarios, recovery behavior, and that assertions verify no orphaned temp files remain. Ensure tests are deterministic by using seeded random where applicable.

## 4. Run Automated Tests to Verify
- [ ] Run: npx vitest tests/integration/manifest-atomic.spec.ts --run and ensure all scenarios pass.

## 5. Update Documentation
- [ ] Extend docs/risks/manifest_serialization.md to describe retry and recovery behavior and link to the test scenarios for future reference.

## 6. Automated Verification
- [ ] CI job should execute the integration manifest tests and assert zero temp files remain and that package.json matches expected state after recovery.
