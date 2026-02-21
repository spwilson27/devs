# Task: Define TDD Execution Engine API (Sub-Epic: 01_TAS)

## Covered Requirements
- [TAS-052]

## 1. Initial Test Written
- [ ] Create a single unit test that asserts the public API surface required by the TDD Execution Engine exists and has the expected shapes.
  - Test path: tests/unit/test_tdd_engine_api.(py|spec.ts)
  - Behavior: The test MUST detect the project's primary language and test runner before asserting. Detection algorithm (to implement inside the test file):
    1. If project root contains package.json -> use Node/Jest test skeleton.
    2. Else if project root contains pyproject.toml or requirements.txt -> use Python/pytest skeleton.
  - The test must assert existence of these exports/classes: TestNode, VerificationNode, CodeNode, CommitNode, TDDLoopController.
  - Provide an explicit failing assertion initially (e.g., assert module import raises or attribute missing) so the test fails before implementation (Red).

Example Jest skeleton (tests/unit/test_tdd_engine_api.spec.ts):
```ts
import * as tdd from '../../src/tdd_engine';

test('tdd engine exposes node classes', () => {
  expect(typeof tdd.TestNode).toBe('function');
  expect(typeof tdd.VerificationNode).toBe('function');
  expect(typeof tdd.CodeNode).toBe('function');
  expect(typeof tdd.CommitNode).toBe('function');
  expect(typeof tdd.TDDLoopController).toBe('function');
});
```

Example pytest skeleton (tests/unit/test_tdd_engine_api.py):
```py
import importlib


def test_tdd_engine_api_surface():
    tdd = importlib.import_module('tdd_engine')
    assert hasattr(tdd, 'TestNode')
    assert hasattr(tdd, 'VerificationNode')
    assert hasattr(tdd, 'CodeNode')
    assert hasattr(tdd, 'CommitNode')
    assert hasattr(tdd, 'TDDLoopController')
```

## 2. Task Implementation
- [ ] Create a new package/module at src/tdd_engine with the following files (language-specific):
  - Node-style: src/tdd_engine/index.ts and exported stub classes for TestNode, VerificationNode, CodeNode, CommitNode, TDDLoopController that throw an explicit "Not implemented" error when instantiated or called.
  - Python-style: src/tdd_engine/__init__.py with stub classes that raise NotImplementedError.
- [ ] Add minimal type hints and docstrings/comments describing the expected responsibilities of each class.
- [ ] Commit the stubs behind a single atomic commit titled: "tdd: add TDD engine API stubs (TAS-052)".

Implementation notes:
- Keep implementations intentionally minimal; the test written above must fail until these stubs are created (Red->Green). The stubs should not implement behavior beyond raising NotImplementedError/throwing.

## 3. Code Review
- [ ] Verify that:
  - The public API names match the test exactly.
  - All exported symbols have short docstrings or JSDoc comments.
  - Public surface uses clear types where applicable (TypeScript types or Python type hints).
  - No business logic is implemented in this task beyond stubs.

## 4. Run Automated Tests to Verify
- [ ] Run the repository's test command (prefer detection):
  - Node: npm test -- --runTestsByPath tests/unit/test_tdd_engine_api.spec.ts
  - Python: pytest -q tests/unit/test_tdd_engine_api.py
- [ ] Confirm the initial test fails (Red) before implementing behavior; record test output artifact (tests/failures/tdd_api_red.txt).

## 5. Update Documentation
- [ ] Add docs/TAS-052-api.md describing the chosen public API, expected responsibilities, and data shapes for each node class.
- [ ] Add a short entry in docs/CHANGELOG.md referencing this task and the initial failing test.

## 6. Automated Verification
- [ ] Provide a small shell script scripts/verify_tas_052_api.sh that:
  1. Detects language (package.json / pyproject.toml)
  2. Runs the example test
  3. Exits with code 0 only if the test run produced a failing test (i.e., the Red phase is confirmed)
- [ ] This script must be idempotent and suitable for CI use.
