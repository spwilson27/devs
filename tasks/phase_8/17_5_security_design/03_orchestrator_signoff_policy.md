# Task: Implement Orchestrator Sign-off Policy Enforcement (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-001]

## 1. Initial Test Written
- [ ] Add tests at tests/test_orchestrator_signoff.py before implementation:
  - test_orchestrator_rejects_self_signoff(): create a fake commit authored by agent A, attempt signoff by agent A, expect Orchestrator.signoff(commit_hash, signer_agent_id) to raise PermissionError or return ACCESS_DENIED.
  - test_orchestrator_allows_reviewer_signoff(): create commit by agent A and signoff by agent B with Reviewer role, expect success and signature recorded.
  - test_orchestrator_records_audit_event(): ensure that every signoff (accept or reject) is logged to audit table with timestamp, actor_id, target_commit, result.

## 2. Task Implementation
- [ ] Implement or extend src/orchestrator/approvals.py with:
  - signoff(commit_hash, signer_agent_id, role_check=True): verifies signer_agent_id != author_agent_id for that commit, verifies signer has Reviewer role using RBAC, performs signature via AgentIdentity.sign, records audit entry and SAOP signoff trace.
  - store audit events in sqlite atomic transaction with commit operation.
  - expose a CLI or API endpoint orchestrator.signoff that other agents call (use MCP call pattern) and ensure it enforces identity via KeyStore-backed signatures.

## 3. Code Review
- [ ] Verify:
  - Access checks cannot be bypassed (no unchecked code paths that perform signoff without authorization).
  - Audit entries contain agent_id, role, commit_hash, outcome and are append-only.
  - All exceptions leak no key material and are logged at appropriate levels.

## 4. Run Automated Tests to Verify
- [ ] Run tests/test_orchestrator_signoff.py and confirm they fail before implementation and pass after.
- [ ] Perform an integration scenario: create two agents, create commit as A, call signoff as B, verify persisted signature and audit entry.

## 5. Update Documentation
- [ ] Update docs/security/signoff_policy.md with the signoff flow, denial rules (no self-signoff), and how to review audit logs.

## 6. Automated Verification
- [ ] Add an automated integration check scripts/ci_check_signoff.sh which runs the signoff flow in a clean repo and asserts the audit table has the expected entries and that a self-sign attempt is rejected.
