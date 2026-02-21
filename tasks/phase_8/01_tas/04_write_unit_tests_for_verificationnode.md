# Task: Write unit tests for VerificationNode (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Create unit tests that define expected behavior of VerificationNode: accepting a test id (from TestNode), running verification (green phase), and returning a deterministic structured result.
  - Test path: tests/unit/test_verificationnode.(py|spec.ts)
  - Required assertions:
    1. VerificationNode accepts a test id and returns { id, passed: boolean, details: { failures: [...], duration_ms: int } }.
    2. When given a deliberately failing test, pass=false and failures includes a readable message and stack trace.
    3. When given a deliberately passing test, pass=true and failures is an empty list.

Jest example (tests/unit/test_verificationnode.spec.ts):
```ts
import { VerificationNode } from '../../src/tdd_engine';

test('VerificationNode returns pass/fail details', async () => {
  const node = new VerificationNode({ workspaceRoot: 'tmp/sandbox' });
  const failing = await node.verify('failing-test-id');
  expect(failing).toHaveProperty('passed');
  expect(Array.isArray(failing.details.failures)).toBe(true);
});
```

pytest example (tests/unit/test_verificationnode.py):
```py
from tdd_engine import VerificationNode


def test_verificationnode_detects_failure(tmp_path):
    node = VerificationNode({'workspace_root': str(tmp_path)})
    res = node.verify('failing-test-id')
    assert 'passed' in res
    assert isinstance(res['details']['failures'], list)
```

## 2. Task Implementation
- [ ] Implement VerificationNode in src/tdd_engine/verification_node.(py|ts) with a public verify(test_id: str) method that:
  - Locates the test file created by TestNode
  - Runs the sandboxed test runner and collects output
  - Parses output into the deterministic structured result described above
- [ ] Reuse TestNode.test_runner to execute tests so behavior is consistent.

## 3. Code Review
- [ ] Verify that output parsing is robust to common test runner output formats and that the result shape is stable across runs.
- [ ] Confirm that error messages are captured and included in details.failures.

## 4. Run Automated Tests to Verify
- [ ] Run tests for VerificationNode and confirm the expected pass/fail behavior is observed.
- [ ] Store results in tests/results/verificationnode_results.txt

## 5. Update Documentation
- [ ] Update docs/TAS-052-verificationnode.md describing how verification maps runner output to the structured result.

## 6. Automated Verification
- [ ] Implement scripts/verify_verificationnode.sh that:
  1. Creates a passing and failing test via TestNode
  2. Calls VerificationNode.verify for both ids
  3. Asserts pass flag and failures array semantics
  4. Exits 0 on success
