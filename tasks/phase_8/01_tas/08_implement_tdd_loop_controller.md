# Task: Implement TDD Loop Controller (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Create unit tests that validate the orchestration of the Red->Green->Refactor cycle driven by the TDDLoopController.
  - Test path: tests/unit/test_tdd_loop_controller.(py|spec.ts)
  - Required assertions:
    1. Given a Task specification (target file and desired behavior), the controller uses TestNode to create a failing test (Red), invokes CodeNode to apply a minimal change (Green), and uses VerificationNode to run verification; the controller must return a final structured report: { task_id, iterations: int, status: 'success'|'failed', details: [...] }.
    2. Controller must stop after a configurable max_iterations parameter and return status 'failed'.

Example Jest skeleton (tests/unit/test_tdd_loop_controller.spec.ts):
```ts
import { TDDLoopController } from '../../src/tdd_engine';

test('TDDLoopController orchestrates red->green->verify', async () => {
  const ctrl = new TDDLoopController({ workspaceRoot: 'tmp/sandbox', maxIterations: 3 });
  const report = await ctrl.run({ target: 'src/example.js', spec: 'example spec' });
  expect(report).toHaveProperty('status');
});
```

## 2. Task Implementation
- [ ] Implement TDDLoopController in src/tdd_engine/tdd_loop_controller.(py|ts) with method run(taskSpec) that:
  1. Calls TestNode.create_failing_test to produce the Red-phase failing test.
  2. Calls CodeNode.preview_patch and then CodeNode.apply_patch to attempt a minimal fix (Green).
  3. Calls VerificationNode.verify to check results.
  4. Logs each iteration into an in-memory report and persists summary to a task-specific JSON file in workspace (e.g., <workspace>/.tdd/task_<id>.json) on completion.
  5. Honors maxIterations config and returns status 'failed' if the loop does not succeed.
- [ ] Provide hooks for plugging in an entropy detector in future tasks (design the controller to accept optional callbacks), but DO NOT implement entropy detection in this Sub-Epic.

## 3. Code Review
- [ ] Verify that:
  - The controller coordinates nodes via well-defined interfaces and does not reach into node internals.
  - All I/O is contained within the workspace sandbox.
  - The controller produces reproducible reports across runs.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests and confirm they pass after implementation.
- [ ] Save results to tests/results/tdd_loop_results.txt

## 5. Update Documentation
- [ ] Update docs/TAS-052-loop-controller.md describing orchestration flow, configuration options (maxIterations), and report format.

## 6. Automated Verification
- [ ] Provide scripts/verify_tdd_loop.sh which runs a short self-contained task spec through the controller and verifies that the final report JSON exists and matches expected schema.
