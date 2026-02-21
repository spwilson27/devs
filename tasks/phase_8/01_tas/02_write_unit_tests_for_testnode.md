# Task: Write unit tests for TestNode (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Create unit tests that define the expected behavior of TestNode's responsibilities: creating a failing test, annotating test metadata (test id, targeted file, failure message), and exposing a runTest() helper that returns a structured failure result.
  - Test path: tests/unit/test_testnode.(py|spec.ts)
  - Required assertions:
    1. Creating a TestNode instance with minimal parameters returns an object with methods: create_failing_test (or createFailingTest), run_test (or runTest).
    2. create_failing_test accepts arguments: target_path (string), test_code (string), metadata (dict/object) and returns an object { test_path, id }.
    3. run_test executes the test command in a sandbox environment and returns a structured result: { id, passed: boolean, stdout: string, stderr: string, exit_code: int }.
  - Tests must be written to fail initially (Red). Provide both Jest and pytest skeletons.

Jest example (tests/unit/test_testnode.spec.ts):
```ts
import { TestNode } from '../../src/tdd_engine';

test('TestNode creates failing test and runs it to produce structured failure', async () => {
  const node = new TestNode({ workspaceRoot: 'tmp/sandbox' });
  const created = await node.createFailingTest('src/example.js', 'test code', { reason: 'spec' });
  expect(created).toHaveProperty('test_path');
  const res = await node.runTest(created.id);
  expect(res).toHaveProperty('passed');
  expect(typeof res.exit_code).toBe('number');
});
```

pytest example (tests/unit/test_testnode.py):
```py
from tdd_engine import TestNode


def test_testnode_creates_and_runs_failure(tmp_path):
    node = TestNode({'workspace_root': str(tmp_path)})
    created = node.create_failing_test('src/example.py', 'assert False', {'reason':'spec'})
    assert 'test_path' in created
    res = node.run_test(created['id'])
    assert 'passed' in res
    assert isinstance(res['exit_code'], int)
```

## 2. Task Implementation
- [ ] Implement test code scaffolding and helpers used by TestNode tests (this includes a lightweight sandbox runner that can execute the project's test command against a single test file). Keep this minimal and isolated in src/tdd_engine/test_runner.py or src/tdd_engine/test_runner.ts.
- [ ] Implement mockable interfaces for file writes so that tests can run without complex environment setup; provide a helper to write test files into an ephemeral workspace (tmpdir).
- [ ] Do not implement full TestNode logic yet — only what's necessary to make tests compile and run (i.e., define class with method signatures that return placeholder results), so the initial Red->Green cycle can proceed across tasks.

## 3. Code Review
- [ ] Ensure tests are isolated and use tmp directories.
- [ ] Ensure TestNode API is deterministic and side-effect free outside sandbox directory.
- [ ] Ensure proper cleanup of temp files in tests.

## 4. Run Automated Tests to Verify
- [ ] Run the specific test file with the repository test command:
  - Node: npm test -- --runTestsByPath tests/unit/test_testnode.spec.ts
  - Python: pytest -q tests/unit/test_testnode.py
- [ ] Confirm tests fail for expected reasons (e.g., functions not implemented or returning placeholder values), and capture the failing output to tests/failures/testnode_red.txt.

## 5. Update Documentation
- [ ] Update docs/TAS-052-testnode.md describing TestNode API methods, parameters and return shapes.

## 6. Automated Verification
- [ ] Implement a small CI-friendly script scripts/check_testnode_contract.sh that:
  1. Detects language and runs the test
  2. Verifies that the test returns a failure (Red) - i.e., exit code != 0
  3. Prints a small JSON object with test id and expected failure
- [ ] The script must be idempotent and suitable to be run in CI.
