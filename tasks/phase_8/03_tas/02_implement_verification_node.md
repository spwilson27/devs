# Task: Implement VerificationNode (Green Phase) to run tests and report pass/fail (Sub-Epic: 03_TAS)

## Covered Requirements
- [TAS-004]

## 1. Initial Test Written
- [ ] Create tests/tdd/verificationnode.green.spec.ts using Vitest (or the repository's runner). Write tests first (they must fail before implementation):
  - Test A: "returns pass when sandbox tests pass"
    - Arrange: sandbox.runTests() => { failingTests: [], passed: 5 }
    - Act: call VerificationNode.runTests(sandbox)
    - Assert: expect { status: 'passed', failing: [] }
  - Test B: "returns failure payload when tests fail"
    - Arrange: sandbox.runTests() => { failingTests: ['should X'] }
    - Act: call VerificationNode.runTests(sandbox)
    - Assert: expect { status: 'failed', failing: ['should X'], report: <raw> }

## 2. Task Implementation
- [ ] Implement src/tdd/VerificationNode.ts (TypeScript)
  - Export class VerificationNode with method runTests(sandbox: ISandbox): Promise<VerificationResult>
  - VerificationResult: { status: 'passed' | 'failed' | 'error'; failing: string[]; rawReport?: any }
  - Behavior:
    1. Invoke sandbox.runTests() with JSON/structured output enabled.
    2. Parse the test runner output deterministically (prefer JSON reporter or exit codes).
    3. Return { status: 'passed', failing: [] } on zero failing tests, otherwise return failing list and raw report.
    4. Attach REQ:[TAS-004] tag to emitted metrics/traces.
    5. Ensure the method is idempotent and side-effect free (does not modify workspace files).

## 3. Code Review
- [ ] Confirm the node uses deterministic parsing, validates reporter format, handles timeouts and unexpected runner failures, and exposes typed result objects for other nodes to consume.
- [ ] Ensure unit tests cover JSON parsing path and the fallback exit-code-only path.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest --run --reporter=json` and verify verificationnode.green.spec.ts initially fails and then passes after implementation.

## 5. Update Documentation
- [ ] Add a short entry in docs/tas/tdd.md describing VerificationNode: responsibilities, return schema, and integration points. Tag the doc with [TAS-004].

## 6. Automated Verification
- [ ] Use the test runner's JSON reporter: `pnpm vitest --run --reporter=json > tmp/verification-report.json` and run a small Node script that asserts the expected verification test cases passed and that VerificationResult.status === 'passed' in any integration fixture outputs.
