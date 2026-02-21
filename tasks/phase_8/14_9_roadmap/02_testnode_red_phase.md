# Task: Implement TestNode (Red Phase) to establish failing tests in sandbox (Sub-Epic: 14_9_ROADMAP)

## Covered Requirements
- [9_ROADMAP-TAS-601]

## 1. Initial Test Written
- [ ] Create tests/tdd/test_testnode.py using pytest with the following tests:
  - test_runs_failing_test: create a temporary directory, write a test file tests/sample_test.py with content "def test_fail(): assert False", call TestNode.run_test(test_file_path) and assert returned dict['status'] == 'failed', and that keys 'stdout','stderr','exit_code','hash' exist.
  - test_timeout_and_isolation: create a test that sleeps longer than the configured timeout and assert TestNode enforces timeout and returns a timeout status or raises a TimeoutError handled by the returned dict.

Be explicit about file paths and commands so an agent can create tests/tdd/test_testnode.py and run pytest.

## 2. Task Implementation
- [ ] Implement tdd/testnode.py with class TestNode:
  - def run_test(self, test_file_path: str, timeout: int = 30) -> dict:
    - Copy the provided test file into an isolated tempfile.TemporaryDirectory sandbox.
    - Execute the sandboxed test using subprocess.run([sys.executable, '-m', 'pytest', 'sample_test.py', '-q', '--maxfail=1'], capture_output=True, timeout=timeout) without shell=True.
    - Capture stdout/stderr, exit_code, compute sha256 of stdout+stderr and return {'status': 'failed' if exit_code != 0 else 'passed', 'exit_code': exit_code, 'stdout': stdout.decode(), 'stderr': stderr.decode(), 'hash': sha256_hex}.
    - Ensure cleanup of the sandbox unless a DEBUG env var is set.
  - Implement robust error handling for timeouts and subprocess failures; kill process groups to avoid zombies.

## 3. Code Review
- [ ] Verify subprocess is invoked safely (no shell injection), ensure files are sandboxed (tempdir), timeouts enforced, and that hash computation uses hashlib.sha256 on combined bytes of stdout+stderr.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/tdd/test_testnode.py and confirm tests pass.

## 5. Update Documentation
- [ ] Add docs/architecture/testnode.md describing TestNode.run_test contract, returned dict schema, example outputs, and how the sandbox is created/cleaned.

## 6. Automated Verification
- [ ] CI step: run pytest for the TestNode tests and include a script tests/tdd/ci_run_testnode.sh that writes a failing test file, invokes TestNode.run_test and validates the returned 'hash' matches a local sha256(stdout+stderr) computation.