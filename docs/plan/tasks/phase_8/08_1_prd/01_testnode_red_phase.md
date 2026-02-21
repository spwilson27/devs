# Task: Establish Red Phase Test Harness (TestNode) (Sub-Epic: 08_1_PRD)

## Covered Requirements
- [1_PRD-REQ-IMP-002]

## 1. Initial Test Written
- [ ] Create a deterministic unit/integration test that verifies the TestNode produces a failing test in an isolated sandbox for a given task_id.
  - Detect the repository test framework at runtime (priority: package.json -> jest/mocha; pyproject/requirements -> pytest). The test must handle both JS/TS and Python projects.
  - Test must create a temporary sandbox directory (e.g., ./sandbox/<task_id>/) and call TestNode.create_red_test(task_descriptor).
  - Assert that the returned object contains: {task_id, test_path, expected_failure_message, runner_command}.
  - Execute the generated test file using the returned runner_command in the sandbox and assert the process exits with non-zero status and stdout/stderr contains expected_failure_message.
  - Ensure test runs without modifying the main repository (use subprocess with cwd set to sandbox and/or use git init in sandbox).

## 2. Task Implementation
- [ ] Implement TestNode.create_red_test(task_descriptor) with the following behavior:
  - Validate task_descriptor has id, title, and a one-line acceptance criterion.
  - Produce a test file in sandbox/<task_id>/tests named test_<task_id>.(test.js|py) that intentionally fails (e.g., expect(false).toBe(true) or assert False) against the acceptance criterion.
  - Return a structured object: {task_id, test_path, expected_failure_message, runner_command, sandbox_dir}.
  - Use dependency injection for filesystem and process runner to allow mocking in tests.
  - Do NOT modify or commit any files in the outer working tree.

## 3. Code Review
- [ ] Verify the implementation:
  - Strict separation: TestNode only generates tests and metadata; it must not implement production code or perform commits.
  - Use DI for filesystem/process to enable deterministic unit tests.
  - Proper error handling for IO and permission errors.
  - Type annotations and docstrings/comments for public API.

## 4. Run Automated Tests to Verify
- [ ] Run the new test in CI by invoking the project test runner against the sandboxed test file only (e.g., npm test -- tests/test_<task_id>.test.js OR pytest sandbox/<task_id>/tests/test_<task_id>.py) and assert it fails (exit code != 0) and error text matches expected_failure_message.

## 5. Update Documentation
- [ ] Add a short section to docs/tdd.md describing TestNode API, sandbox conventions, and an example payload and returned metadata; include a small example of the failing test generated.

## 6. Automated Verification
- [ ] Add scripts/verify_red_test.(sh|py) which programmatically calls TestNode.create_red_test, runs the returned runner_command, captures exit code and stdout/stderr, and exits 0 only if the test fails and contains expected_failure_message.
