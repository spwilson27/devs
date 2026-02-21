# Task: Implement AgentFactory (Sub-Epic: 13_2_TAS)

## Covered Requirements
- [2_TAS-REQ-020]

## 1. Initial Test Written
- [ ] Create a unit test that asserts the AgentFactory public API exists and can instantiate at least one agent type by tier and role.
  - Test path: tests/unit/test_agent_factory.(py|spec.ts)
  - Behavior:
    1. Detect project language (package.json -> Node/Jest, pyproject.toml -> Python/pytest).
    2. Assert presence of `AgentFactory` and a `create_agent(tier, role, overrides?)` API.
    3. The test MUST assert that creating an agent with tier 'developer' and role 'implementer' returns an object whose prototype/class name matches `DeveloperAgent` (or at least exposes the expected `transform_task_to_commit` method).

Example Jest skeleton (tests/unit/test_agent_factory.spec.ts):
```ts
import { AgentFactory } from '../../src/agents/agent_factory';

test('AgentFactory.create_agent returns DeveloperAgent for developer tier', () => {
  const factory = new AgentFactory();
  const agent = factory.createAgent('developer','implementer', {systemPrompt: 'test'});
  expect(agent).toBeDefined();
  expect(typeof agent.transformTaskToCommit === 'function').toBeTruthy();
});
```

Example pytest skeleton (tests/unit/test_agent_factory.py):
```py
import importlib

def test_agent_factory_api_surface():
    mod = importlib.import_module('agents.agent_factory')
    assert hasattr(mod, 'AgentFactory')
    factory = mod.AgentFactory()
    agent = factory.create_agent('developer','implementer', {'system_prompt':'test'})
    assert hasattr(agent, 'transform_task_to_commit') or hasattr(agent, 'transformTaskToCommit')
```

## 2. Task Implementation
- [ ] Implement a minimal AgentFactory that maps tiers+roles to agent constructors and returns instances; keep logic minimal and test-focused.
  - File: src/agents/agent_factory.(py|ts)
  - Implement:
    - Class/Module AgentFactory with a `registry` mapping (e.g., { 'developer': { 'implementer': DeveloperAgent } }).
    - Method `create_agent(tier, role, options={})` that:
      1. Looks up constructor in registry.
      2. Injects dependencies (PromptManager, ToolRegistry) from options or default placeholders.
      3. Returns new agent instance.
    - Add a small registration helper `register_agent(tier, role, constructor)` used to populate the initial mapping.
  - Add lightweight DeveloperAgent stub import or local stub sufficient to satisfy the test.
  - Commit message: "tas: add AgentFactory registry and create_agent API (2_TAS-REQ-020)"

Implementation notes:
- Avoid reflection or dynamic eval; use an explicit mapping so behavior is auditable and testable.
- Keep the factory logic synchronous and deterministic for now.

## 3. Code Review
- [ ] Verify:
  - Registry mapping is explicit and documented.
  - Dependencies are injected via constructor/options and not pulled from globals.
  - Factory returns types conforming to a small Agent interface (documented in code comments).
  - No network or external side effects in this PR.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test command (language-detected):
  - Node: npm test -- --runTestsByPath tests/unit/test_agent_factory.spec.ts
  - Python: pytest -q tests/unit/test_agent_factory.py
- [ ] Confirm the test passes. Save output to tests/artifacts/2_tas_req_020_test_output.txt.

## 5. Update Documentation
- [ ] Add docs/2_tas_req_020_agent_factory.md describing:
  - The registry mapping and example registrations.
  - How to register new agent types safely.
- [ ] Add a brief entry in docs/CHANGELOG.md for this addition.

## 6. Automated Verification
- [ ] Provide scripts/verify_2_tas_req_020.sh that:
  1. Runs the agent factory unit test.
  2. Verifies that `create_agent('developer','implementer')` returns an object exposing the DeveloperAgent API surface.
- [ ] Ensure script returns exit code 0 only on success and is CI-friendly.
