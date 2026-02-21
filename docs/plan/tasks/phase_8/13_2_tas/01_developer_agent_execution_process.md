# Task: Implement DeveloperAgent Execution Process (Sub-Epic: 13_2_TAS)

## Covered Requirements
- [2_TAS-REQ-004]

## 1. Initial Test Written
- [ ] Create a unit test that asserts the public API surface for the DeveloperAgent exists and defines the expected execution-to-commit method before implementing behavior.
  - Test path: tests/unit/test_developer_agent_execution.(py|spec.ts)
  - Behavior:
    1. Detect project language (package.json -> Node/Jest, pyproject.toml or requirements.txt -> Python/pytest).
    2. Assert that importing the DeveloperAgent module succeeds and that the class exposes a method named `transform_task_to_commit` (or `transformTaskToCommit`).
    3. The test MUST start failing initially (i.e., before implementation) by asserting presence of the API surface that does not yet exist.

Example Jest skeleton (tests/unit/test_developer_agent_execution.spec.ts):
```ts
// language: typescript
import { DeveloperAgent } from '../../src/agents/developer_agent';

test('DeveloperAgent exposes transformTaskToCommit API', () => {
  expect(typeof DeveloperAgent).toBe('function');
  const proto = DeveloperAgent.prototype;
  expect(typeof proto.transformTaskToCommit).toBe('function');
});
```

Example pytest skeleton (tests/unit/test_developer_agent_execution.py):
```py
import importlib

def test_developer_agent_api_surface():
    mod = importlib.import_module('agents.developer_agent')
    assert hasattr(mod, 'DeveloperAgent')
    cls = getattr(mod, 'DeveloperAgent')
    assert hasattr(cls, 'transform_task_to_commit') or hasattr(cls, 'transformTaskToCommit')
```

## 2. Task Implementation
- [ ] Implement the minimal DeveloperAgent API surface so the test above passes (Red -> Green). Keep logic intentionally minimal (a stub) so subsequent tasks can implement behavior.
  - File: src/agents/developer_agent.(py|ts)
  - Implement:
    - Class DeveloperAgent with initializer accepting (prompt_manager, tool_registry, agent_factory) as optional dependencies (use dependency injection placeholders).
    - Public method `transform_task_to_commit(task)` (snake_case or camelCase depending on language) that exists and returns a small dict/object describing the planned commit: {task_id: task.id, commit_message: string, patch: []}.
    - Do not implement real file edits or Git calls in this PR; return a structured plan object and document the expected CommitNode integration point in comments.
  - Add a minimal CommitNode stub under src/agents/commit_node.(py|ts) exposing `commit_atomic(task_id, message, files)` which raises NotImplementedError / throws when executed (this keeps side-effects out of the red->green step).
  - Commit message: "tas: add DeveloperAgent API surface and commit plan stub (2_TAS-REQ-004)"

Implementation notes:
- Prefer explicit dependency injection (constructor args) rather than global imports to make unit testing and mocking straightforward.
- Keep the method idempotent and synchronous for the stub.

## 3. Code Review
- [ ] Verify:
  - Method names match the tests exactly (transform_task_to_commit / transformTaskToCommit).
  - Constructor accepts injectable dependencies (prompt manager, tool registry, commit node) and does not perform side effects.
  - Public surface has docstrings/JSDoc describing expected inputs (task object schema) and outputs (commit plan shape).
  - No real Git or file system writes are implemented in this PR; all heavy behavior deferred to CommitNode.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test command (language-detected):
  - Node: npm test -- --runTestsByPath tests/unit/test_developer_agent_execution.spec.ts
  - Python: pytest -q tests/unit/test_developer_agent_execution.py
- [ ] Confirm the test now passes (Green). Save the test run output to tests/artifacts/2_tas_req_004_test_output.txt.

## 5. Update Documentation
- [ ] Add docs/2_tas_req_004_developer_agent.md containing:
  - Short design summary: responsibility of DeveloperAgent, integration points (PromptManager, CommitNode), and commit plan schema.
  - Example usage snippet showing DeveloperAgent.transform_task_to_commit(sample_task) returning the commit plan.
- [ ] Add a changelog entry in docs/CHANGELOG.md referencing the task and requirement ID.

## 6. Automated Verification
- [ ] Provide scripts/verify_2_tas_req_004.sh that:
  1. Detects test runner (package.json / pyproject.toml).
  2. Runs the example test.
  3. Exits 0 only if the test passes.
- [ ] CI pattern: ensure the script is idempotent and usable in CI; the script should print the commit plan JSON sample returned by the stub when run against a small fixture task.
