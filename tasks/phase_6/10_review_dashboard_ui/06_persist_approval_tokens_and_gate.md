# Task: Persist Approval Tokens and Gate Autonomy (Sub-Epic: 10_Review Dashboard UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-009], [4_USER_FEATURES-REQ-029]

## 1. Initial Test Written
- [ ] Create integration tests at tests/services/approvalService.test.ts and tests/integration/GateAutonomy.test.ts that:
  - Verify approvalService.createToken(decisions) returns a signed token string (mock signing) and persisted to localStorage under key review:approvalToken:{projectId}.
  - Verify ApprovalService.isAuthorized() returns false when token absent and true when valid token present.
  - Verify AgentController (or equivalent) respects ApprovalService.isAuthorized() and blocks agent actions when authorization is missing.

## 2. Task Implementation
- [ ] Implement src/services/approvalService.ts:
  - Expose createToken(decisions:{[reqId:string]: 'accepted'|'rejected'}) -> Promise<string> which creates a JSON payload, signs it (in tests mock signing), stores it in localStorage review:approvalToken:{projectId}, and returns the token.
  - Expose getToken(projectId) and isAuthorized(projectId) which validates token structure and expiry.
  - Wire ReviewDashboard to call createToken when user finalizes approvals and to use isAuthorized to enable/disable agent-control UI elements.
  - Add an optional server sync endpoint integration point (POST /api/approvals) but keep localStorage as primary persistence for offline tests.

## 3. Code Review
- [ ] Verify token handling avoids storing raw secrets, tokens have expiry and a verification step, the persistence API is abstracted for server-side validation, and gating checks are centralized in ApprovalService for reuse.

## 4. Run Automated Tests to Verify
- [ ] Run npm test -- -t "approvalService" and the GateAutonomy integration tests; ensure tests pass and simulate token expiry cases.

## 5. Update Documentation
- [ ] Update docs/ui/review_dashboard.md with the approval token lifecycle, localStorage key format, expected token payload shape, and the contract for /api/approvals for future backend integration.

## 6. Automated Verification
- [ ] Run the gate integration tests and a simulated agent action attempt in the test harness that confirms actions are blocked without a valid approval token and succeed after a valid token is created.