# Task: Integration Tests for Full TDD Cycle (Red -> Green -> Commit -> Verify) (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-002], [1_PRD-REQ-IMP-005], [1_PRD-REQ-IMP-004], [1_PRD-REQ-IMP-008], [1_PRD-REQ-IMP-003]

## 1. Initial Test Written
- [ ] Create an end-to-end integration test (E2E) that executes the full TDD loop for a sample task_id:
  - Steps: create sandbox -> TestNode.create_red_test -> VerificationNode.run_tests (expect fail) -> VerificationNode.apply_green_impl -> VerificationNode.run_tests (expect pass) -> CommitNode.commit_changes (with Task-ID) -> DecisionLogger.persist_decision linking commit -> simulate repeated identical failure stream to trigger EntropyDetector+BackoffManager.
  - Assertions:
    - The initial run returns failure, the second run passes.
    - Commit is created in sandbox and commits.sqlite has Task-ID trailer and DB row.
    - MemoryStore contains decision rows linking the implementation and commit_hash.
    - On simulated repeated failures, BackoffManager returns a pause action and a persisted counter.

## 2. Task Implementation
- [ ] Implement an integration harness test under tests/e2e/test_tdd_cycle.(js|py) that orchestrates the above flow in a temporary sandbox and makes assertions on each stage's outputs and side-effects.
  - Use mocked network/external calls and real process invocations for test runner and git inside sandbox.
  - Ensure teardown removes sandbox and does not alter main repo.

## 3. Code Review
- [ ] Verify sandbox isolation, deterministic timeouts, proper linking between CommitNode and MemoryStore, and that EntropyDetector thresholds are configurable for tests.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E test locally and in CI; assert all stages complete and the script exits 0 only if all assertions pass.

## 5. Update Documentation
- [ ] Update docs/tdd.md and docs/entropy.md with the E2E flow diagram and a short runbook for interpreting failures in the E2E test.

## 6. Automated Verification
- [ ] Provide scripts/run_e2e_tdd_cycle.(sh|py) that CI can call; script must return a non-zero exit code on any mismatch or failure and produce an artifacts tarball containing logs, the sandbox git repo, and sqlite DBs for post-mortem.
