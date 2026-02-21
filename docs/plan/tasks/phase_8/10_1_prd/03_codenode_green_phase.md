# Task: Implement CodeNode (Green Phase) specification and tests (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Add an integration test at tests/tdd/codenode.green.test.js (Jest) that verifies the CodeNode will make a previously failing test pass.
  - Test steps:
    1. Create a temporary sandbox workspace with a small buggy module (e.g., sandbox/src/math/add.js returning wrong value) and a failing test (sandbox/tests/add.test.js) created by the TestNode harness.
    2. Assert the test initially fails when running `npx jest --testPathPattern sandbox/tests`.
    3. Invoke CodeNode API (e.g., require('../src/agents/code_node').run(sandboxPath, { taskId })).
    4. After CodeNode runs, execute the test runner again and assert it now exits 0 (tests pass).
    5. Assert that CodeNode returns structured metadata: { status: 'tests_green', attempts: <n>, patch: '<unified-diff-or-patch>' }.

- [ ] Run the test to confirm it fails prior to implementation.

## 2. Task Implementation
- [ ] Implement src/agents/code_node.js (or .ts) with function `async run(sandboxPath, { taskId, attemptLimit = 5 })`.
  - Behavior requirements:
    - Inspect failing test output and attempt surgical edits to source files to make test pass.
    - Use a bounded attempt loop (default 5 attempts). After each attempt run the test runner and capture output.
    - Stop immediately on first all-green test run and return { status: 'tests_green', attempts, patch } where patch is the applied diff.
    - If attemptLimit is reached without success, return { status: 'failed_to_green', attempts, lastOutput }.
    - Ensure edits are small and recorded (store unified diff in sandbox/artifacts/<taskId>-<attempt>.diff).
    - Respect sandbox isolation and never alter files outside the sandbox path.
  - Implementation hints:
    - Use child_process.exec for invoking the test runner.
    - Use a safe patch application library or write minimal file-overwrite logic after computing diffs.
    - Normalize outputs before hashing for entropy detection (strip timestamps, normalize paths).

## 3. Code Review
- [ ] Verify CodeNode applies minimal diffs, stores diffs in artifacts, and returns structured metadata.
- [ ] Confirm attempt limit enforcement and no side-effects outside sandbox.
- [ ] Ensure logs and returned metadata are deterministic and machine-parseable.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/tdd/codenode.green.test.js --runInBand` and confirm the test passes.
- [ ] Verify that artifacts/<taskId>-*.diff exist and contain the applied changes.

## 5. Update Documentation
- [ ] Add docs/tas/codenode.md describing the run() contract, expected metadata schema, and artifact storage conventions. Link back to the PRD strict TDD fragment.

## 6. Automated Verification
- [ ] Create a CI step that runs the integration test in a clean environment, copies artifacts out for audit, and asserts that the patch recorded in artifacts indeed leads to green tests when applied to the original pre-change snapshot.