# Task: Implement Reviewer Agent Sandbox Runner (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-016]

## 1. Initial Test Written
- [ ] Create unit tests in `src/reviewer/__tests__/sandbox.test.ts`:
  - Test that `ReviewerSandboxManager.createSandbox()` returns an isolated workspace path with an initialized Git repo cloned from a clean temporary copy of the project.
  - Test file-locking: when a sandbox is active, `FileLockManager.acquire(path)` prevents concurrent writes from other sandboxes.
  - Test that network calls are disabled or stubbed inside the sandbox (mock environment variables or network stubbing).
- [ ] Create an integration test `src/reviewer/__tests__/sandbox.integration.test.ts` that runs a sample test suite inside the sandbox and returns captured test output and exit code.

## 2. Task Implementation
- [ ] Implement `src/reviewer/sandbox.manager.ts` exporting `ReviewerSandboxManager` with methods:
  - `async createSandbox(): Promise<{ workspacePath, cleanup }>` which creates a temp directory, sets up a clean Git clone (or copy), enforces file locks, and returns a cleanup function.
  - `async runTests(workspacePath, options?): Promise<{ exitCode, stdout, stderr }>` which runs the project's test runner inside the sandbox with environment overrides (e.g., OFFLINE=true).
- [ ] Integrate `FileLockManager` to avoid concurrent write collisions; implement simple lock files under `.devs/locks/<resource>.lock`.
- [ ] Ensure sandbox creation disables outgoing network access (use environment variables or a test harness flag) and mounts a read-only node_modules if necessary.

## 3. Code Review
- [ ] Confirm sandbox is fully isolated: no writes to real workspace, no modifications to main `.git` unless explicitly merged.
- [ ] Verify file locks are robust and cleaned up in exceptional exit paths (use `finally` blocks and OS-level file locks where available).
- [ ] Ensure the sandbox runner returns raw test outputs and structured results (exitCode + JSON parseable metadata) for downstream verification.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="reviewer.*sandbox"` and ensure all tests pass.
- [ ] Execute a sample reviewer run in CI using the sandbox and ensure it completes with exit code `0` for a passing test suite.

## 5. Update Documentation
- [ ] Add `docs/reviewer/SANDBOX.md` describing the sandbox lifecycle, how to run tests locally in sandbox, and lock semantics.
- [ ] Document configuration switches for offline mode and resource limits for sandboxes.

## 6. Automated Verification
- [ ] CI job that creates two sandboxes concurrently to assert file locks prevent simultaneous writes and that both sandboxes can run tests independently.
- [ ] Add a test that intentionally causes a sandbox test failure and asserts the sandbox runner returns the failing exit code and captured stdout/stderr.
