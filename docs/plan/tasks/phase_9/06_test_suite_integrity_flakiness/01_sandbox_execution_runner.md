# Task: Implement Sandbox Execution Runner (Sub-Epic: 06_Test Suite Integrity & Flakiness)

## Covered Requirements
- [1_PRD-REQ-MET-005]

## 1. Initial Test Written
- [ ] Create `tests/test_sandbox_runner.py`. Write a unit test `test_sandbox_isolation` that creates a mock project directory, executes a python script that attempts to access an environment variable outside the sandbox or write outside its working directory, and asserts the `SandboxRunner` prevents this or fails.
- [ ] Write a test `test_sandbox_clean_state` that verifies the `SandboxRunner` initializes a completely clean, isolated directory (using `tempfile.TemporaryDirectory` or similar) before executing any command.

## 2. Task Implementation
- [ ] Create `devs/core/sandbox_runner.py`. Implement the `SandboxRunner` class with an `execute(command: str, project_dir: str)` method.
- [ ] The `execute` method must copy the relevant contents of `project_dir` into a newly generated temporary directory.
- [ ] Use `subprocess.run` with a restricted `env` dictionary (stripping sensitive or local user environment variables) to ensure the test suite is run in an isolated environment.
- [ ] Capture and return the `stdout`, `stderr`, and `exit_code` from the executed command.
- [ ] Ensure the temporary directory is aggressively cleaned up after execution, using a `finally` block.

## 3. Code Review
- [ ] Verify that no file descriptors or temporary directories leak in the event of an exception.
- [ ] Check that the environment variable stripping logic correctly retains variables necessary for execution (e.g., `PATH`) but removes user-specific states.
- [ ] Ensure the code follows strict typing and contains comprehensive docstrings.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/test_sandbox_runner.py` and ensure a 100% pass rate.
- [ ] Run the project's linter `flake8 devs/core/sandbox_runner.py` to ensure clean code.

## 5. Update Documentation
- [ ] Update `docs/architecture/sandbox_isolation.md` to detail the `SandboxRunner` implementation and its role in enforcing a 100% test pass rate in a clean state.
- [ ] Update the agent memory context to include the usage of `SandboxRunner` for all test executions.

## 6. Automated Verification
- [ ] Run a test coverage script `pytest --cov=devs.core.sandbox_runner tests/test_sandbox_runner.py` and assert the coverage metric is 100%.