# Task: Implement ToolRegistry (Sub-Epic: 13_2_TAS)

## Covered Requirements
- [2_TAS-REQ-022]

## 1. Initial Test Written
- [ ] Create a unit test that asserts the ToolRegistry API exists and enforces role-based tool access.
  - Test path: tests/unit/test_tool_registry.(py|spec.ts)
  - Behavior:
    1. Detect project language (package.json -> Node/Jest, pyproject.toml -> Python/pytest).
    2. Assert presence of `ToolRegistry` with APIs: `register_tool(name, metadata)`, `grant_role_tool(role, tool_name)`, `get_tools_for_role(role)`, `is_tool_allowed(role, tool_name)`.
    3. The test MUST verify that a role without an explicit grant cannot access a tool (i.e., `is_tool_allowed` returns false) and fail initially if no implementation exists.

Example Jest skeleton (tests/unit/test_tool_registry.spec.ts):
```ts
import { ToolRegistry } from '../../src/agents/tool_registry';

test('ToolRegistry enforces RBAC', () => {
  const tr = new ToolRegistry();
  tr.registerTool('surgical_edit', {description:'edit files'});
  tr.grantRoleTool('developer','surgical_edit');
  expect(tr.isToolAllowed('developer','surgical_edit')).toBeTruthy();
  expect(tr.isToolAllowed('researcher','surgical_edit')).toBeFalsy();
});
```

Example pytest skeleton (tests/unit/test_tool_registry.py):
```py
import importlib

def test_tool_registry_api_surface():
    mod = importlib.import_module('agents.tool_registry')
    assert hasattr(mod, 'ToolRegistry')
    tr = mod.ToolRegistry()
    tr.register_tool('surgical_edit', {'description':'edit files'})
    tr.grant_role_tool('developer','surgical_edit')
    assert tr.is_tool_allowed('developer','surgical_edit')
    assert not tr.is_tool_allowed('researcher','surgical_edit')
```

## 2. Task Implementation
- [ ] Implement ToolRegistry that provides a secure mapping of tools to roles and supports restricted access.
  - File: src/agents/tool_registry.(py|ts)
  - Implement:
    - `register_tool(name, metadata)` -> registers a tool and metadata (no side-effects).
    - `grant_role_tool(role, tool_name)` -> grants a role access to a tool.
    - `get_tools_for_role(role)` -> returns allowed tool names/metadata.
    - `is_tool_allowed(role, tool_name)` -> returns boolean.
  - Enforce immutability of core tool metadata once registered to prevent live override in this PR.
  - Commit message: "tas: add ToolRegistry RBAC mapping (2_TAS-REQ-022)"

Implementation notes:
- Use simple in-memory dicts for this PR with a plan to persist in MCP-tool manifest later.
- Provide clear error messages for unknown tools/roles to aid debugging.

## 3. Code Review
- [ ] Verify:
  - RBAC behavior is explicit and documented.
  - Tool metadata is not mutable by default (must be re-registered with a migration path).
  - No dynamic code execution based on tool metadata.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test command (language-detected):
  - Node: npm test -- --runTestsByPath tests/unit/test_tool_registry.spec.ts
  - Python: pytest -q tests/unit/test_tool_registry.py
- [ ] Confirm tests pass and record output in tests/artifacts/2_tas_req_022_test_output.txt.

## 5. Update Documentation
- [ ] Add docs/2_tas_req_022_tool_registry.md describing:
  - The RBAC model for tools.
  - How to register tools and grant roles in code.
- [ ] Add changelog entry.

## 6. Automated Verification
- [ ] Provide scripts/verify_2_tas_req_022.sh that:
  1. Runs the tool registry unit tests.
  2. Attempts to use a tool without grant and expects is_tool_allowed to return false.
- [ ] Script must be suitable for CI.
