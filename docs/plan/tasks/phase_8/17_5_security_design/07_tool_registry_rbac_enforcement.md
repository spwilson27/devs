# Task: Integrate RBAC Enforcement into Tool Registry (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-012]

## 1. Initial Test Written
- [ ] Create tests at tests/test_tool_registry_rbac.py first:
  - test_tool_exec_denied_for_unprivileged_role(): register a mock tool 'privileged.tool' requiring permission 'tool.exec.privileged' and assert a Researcher role agent is denied.
  - test_tool_exec_allowed_for_privileged_role(): assign Reviewer role to agent and assert execution allowed when permission present.
  - test_tool_exec_logs_audit_event(): on every tool exec attempt (success or failure), ensure an audit entry is written.

## 2. Task Implementation
- [ ] Modify src/tools/registry.py (or equivalent) to:
  - Add required_permission metadata to tool definitions.
  - On execute(tool_name, args, agent_id): resolve agent role via RBAC, call policy engine is_allowed(agent_id, permission). If denied, return ACCESS_DENIED and write audit_event.
  - Ensure tool metadata is loaded from config/tools.json and includes required_permission fields; update tool registration docs.

## 3. Code Review
- [ ] Verify:
  - All tool execute paths perform RBAC checks before performing side-effects.
  - Audit entries include agent_id, tool_name, args metadata (redacted), outcome, and timestamp.
  - Tool metadata includes description and required_permission for every registered tool.

## 4. Run Automated Tests to Verify
- [ ] Run tests/test_tool_registry_rbac.py and an integration test simulating multiple roles.

## 5. Update Documentation
- [ ] Update docs/security/tool_registry.md with guidance for tool authors to add required_permission and to design least-privilege interfaces.

## 6. Automated Verification
- [ ] Implement scripts/verify_tool_permissions.py that enumerates registered tools and ensures each has a required_permission and that RBAC policy covers that permission.
