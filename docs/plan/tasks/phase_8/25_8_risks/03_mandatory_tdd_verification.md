# Task: Implement Mandatory TDD Verification Gate (Sub-Epic: 25_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-060]

## 1. Initial Test Written
- [ ] Add tests at tests/test_tdd_verification_gate.py using pytest to assert that the commit flow refuses to create an atomic commit when tests fail:
  - test_commit_blocked_when_tests_fail: create a sandbox repo, add a change that causes a failing unit test, run the CommitGate.verify_and_commit(...) method and assert it returns a non-zero/raises and no git commit is created.
  - test_commit_succeeds_after_tests_pass: create a sandbox repo where tests pass and assert CommitGate commits atomically and updates the commit metadata (Task ID, timestamp).
  - test_commit_runs_in_sandbox: ensure tests are run in an isolated temporary workspace and do not affect the developer working tree.

Use exact import path: devs.tdd.commit_gate.CommitGate.

## 2. Task Implementation
- [ ] Implement the verification gate at src/devs/tdd/commit_gate.py with:
  - Class CommitGate(sandbox_manager: SandboxManager, test_runner: TestRunner)
  - Method: def verify_and_commit(self, task_id: str, changes: List[str]) -> CommitResult
    - Steps: create sandbox copy, apply changes, run the project's test suite with the configured test runner (pytest) in the sandbox, collect results, only on green create an atomic git commit in the real repo (use git worktree or git index operations to ensure atomicity), attach Task ID and requirement mappings to commit metadata (see origin traceability task).
  - Ensure the implementation returns structured results (success/failure, test report, commit_sha if success) and writes minimal ephemeral artifacts to /tmp or in-memory stores.

## 3. Code Review
- [ ] Verify that tests are executed in isolated sandbox, commits are atomic, no ephemeral data leaks to production workspace, clear structured return values, and strong error handling on test runner failures.

## 4. Run Automated Tests to Verify
- [ ] Run pytest -q tests/test_tdd_verification_gate.py and a local integration that attempts a forced failing test to ensure the gate blocks commits. Integrate this into CI as a gating check for all DeveloperAgent commits.

## 5. Update Documentation
- [ ] Update docs/tdd/commit_gate.md describing the verification flow, sandboxing strategy, and how to interpret commit results and failure reports.

## 6. Automated Verification
- [ ] Add scripts/verify_commit_gate.sh that runs the blocking and non-blocking scenarios against a temporary git repo and verifies behavior. CI should call this script after unit tests for additional assurance.
