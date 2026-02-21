# Task: Implement RefactorNode (Refactor Phase) specification and tests (Sub-Epic: 10_1_PRD)

## Covered Requirements
- [1_PRD-REQ-PIL-003]

## 1. Initial Test Written
- [ ] Add tests at tests/tdd/refactor.refactor.test.js (Jest) that validate refactor operations preserve behavior and improve code quality.
  - Test steps:
    1. Create a temporary sandbox with code that already passes tests but fails style/lint rules.
    2. Run the test runner to confirm tests are green before refactor.
    3. Invoke RefactorNode API (e.g., require('../src/agents/refactor_node').run(sandboxPath, { taskId })).
    4. After RefactorNode completes, run the test runner again and assert tests remain green.
    5. Run the linter (e.g., `npx eslint sandbox/src --fix` equivalent) and assert that lint errors are reduced or fixed.
    6. Assert RefactorNode returns { status: 'refactor_complete', diffs: ['...'], lintDelta: <number> }.

- [ ] Run the test to confirm it fails before implementation.

## 2. Task Implementation
- [ ] Implement src/agents/refactor_node.js (or .ts) exposing `async run(sandboxPath, { taskId })`.
  - Behavior requirements:
    - Perform non-functional changes (formatting, renames that preserve API, dead code elimination only if tests cover behavior) and produce diffs stored in sandbox/artifacts.
    - Ensure all functional tests remain green after refactor; if not, rollback changes and return { status: 'refactor_failed', reason }.
    - Produce a lintDelta metric (number of lint issues reduced) and include it in returned metadata.
    - Use configured code formatters (prettier) and linters (eslint) present in project; if not present, document adding them.

## 3. Code Review
- [ ] Confirm refactor operations are reversible, have unit tests covering behavior-preserving claims, and include a safety rollback mechanism.
- [ ] Ensure RefactorNode does not include behavior changes and documents any heuristic used for dead-code removal.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest tests/tdd/refactor.refactor.test.js --runInBand` and lint steps; confirm tests remain green and lintDelta >= 0.

## 5. Update Documentation
- [ ] Add docs/tas/refactor_node.md describing expected guarantees, rollback mechanism, and lintDelta metric. Link to PRD strict TDD fragment.

## 6. Automated Verification
- [ ] CI verification should run the refactor test in an ephemeral sandbox and assert the node returns `status: 'refactor_complete'` with tests still green and diffs stored in artifacts for auditing.