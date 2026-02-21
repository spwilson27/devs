# Task: Integration tests for TDD Execution Engine (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Create an end-to-end integration test that exercises the full Red->Green->Refactor cycle using the implemented nodes and controller.
  - Test path: tests/integration/test_tdd_engine_e2e.(py|spec.ts)
  - Behavior expected:
    1. Controller.run returns a report with status 'success' for a trivial problem (e.g., implement a single-line fix that makes a test pass).
    2. The integration test must create an isolated temporary git-less workspace, seed a small buggy module and an intended test, and then run the controller.

Example Jest skeleton (tests/integration/test_tdd_engine_e2e.spec.ts):
```ts
import { TDDLoopController } from '../../src/tdd_engine';

test('e2e: controller completes simple fix', async () => {
  // seed sandbox files
  const ctrl = new TDDLoopController({ workspaceRoot: 'tmp/sandbox', maxIterations: 5 });
  const report = await ctrl.run({ target: 'src/buggy.js', spec: 'fix returns true' });
  expect(report.status).toBe('success');
});
```

pytest example (tests/integration/test_tdd_engine_e2e.py):
```py
from tdd_engine import TDDLoopController


def test_e2e_simple_fix(tmp_path):
    # seed files
    ctrl = TDDLoopController({'workspace_root': str(tmp_path), 'max_iterations':5})
    report = ctrl.run({'target':'src/buggy.py', 'spec':'fix returns True'})
    assert report['status'] == 'success'
```

## 2. Task Implementation
- [ ] Implement the integration test harness utilities under tests/helpers/e2e_harness.(py|ts) to seed sandbox projects and to execute the controller in-process.
- [ ] Keep the seed minimal: a single source file with a one-line bug and a corresponding test that fails until fixed.
- [ ] The integration test must clean up the sandbox after run.

## 3. Code Review
- [ ] Confirm the integration test is hermetic (no network, no external services), fast (< 30s ideally), and deterministic.

## 4. Run Automated Tests to Verify
- [ ] Run the integration test via the repository test command and ensure pass/fail behavior is correct:
  - Node: npm test -- --runTestsByPath tests/integration/test_tdd_engine_e2e.spec.ts
  - Python: pytest -q tests/integration/test_tdd_engine_e2e.py
- [ ] Save output to tests/results/tdd_engine_e2e_results.txt

## 5. Update Documentation
- [ ] Add docs/TAS-052-e2e.md with a step-by-step description of the integration test, the seeded sandbox layout, and the expected final report.

## 6. Automated Verification
- [ ] Provide scripts/verify_tdd_engine_e2e.sh which runs the integration test and asserts the final report status is 'success' for the seeded case.
