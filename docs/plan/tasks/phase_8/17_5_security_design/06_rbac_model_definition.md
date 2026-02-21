# Task: Define Role-Based Access Control (RBAC) Model (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-012]

## 1. Initial Test Written
- [ ] Create tests at tests/test_rbac_model.py before implementation:
  - test_create_default_roles_and_permissions(): ensure roles 'researcher', 'developer', 'reviewer', 'orchestrator' exist with expected permission sets.
  - test_role_permission_evaluation(): assert policy_engine.is_allowed('tool:name', role) returns True/False according to policy file.
  - test_role_assignment_persistence(): assign a role to an agent and assert get_role(agent_id) returns assigned role.

## 2. Task Implementation
- [ ] Implement src/security/rbac.py and a policy file config/rbac.json with schema:
  - roles: {role_name: [permission1, permission2,...]}
  - permissions: canonical strings for actions (e.g., 'tool.exec.shell', 'tool.exec.surgical_edit', 'db.write.saop', 'sign.off').
  - policy engine must support: is_allowed(agent_id, action) by resolving agent role(s).
  - Provide CLI utilities: `devs rbac role create`, `devs rbac role assign <agent_id> <role>` and `devs rbac policy check <agent_id> <action>`.
  - Seed default roles and a migration script to update rbac.json in practice.

## 3. Code Review
- [ ] Verify:
  - Default-deny semantics: any action not explicitly allowed is denied.
  - RBAC checks are centralized and used by ToolRegistry and Orchestrator (no duplicate ad-hoc checks elsewhere).
  - Policy file changes require admin privileges and are auditable.

## 4. Run Automated Tests to Verify
- [ ] Run pytest tests/test_rbac_model.py and a small integration test that attempts a denied action to ensure 403-like error.

## 5. Update Documentation
- [ ] Add docs/security/rbac.md documenting roles, permissions, how to assign roles, and examples for common actions.

## 6. Automated Verification
- [ ] Add a CI gate script scripts/check_rbac_coverage.py to ensure all tool endpoints have an associated permission and that each permission is mapped to at least one role in rbac.json.
