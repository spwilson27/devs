# Task: Implement Mandatory User Approval Gate for Requirement Acceptance (Sub-Epic: 09_Risk_Mitigation_and_Monitoring)

## Covered Requirements
- [8_RISKS-REQ-103]

## 1. Initial Test Written
- [ ] Write integration tests for a new `requirement_approval` component which enforces an approval gate before requirements are accepted into the roadmap.
  - Test that a requirement package with `validation_report.valid == true` moves to `pending_user_approval` status and a notification/record is created.
  - Test that the approval endpoint rejects requests when the approver is unauthorized and accepts when authorized.
  - Test that approval toggles requirement status to `approved` and triggers downstream steps (e.g., RTI recalculation) via mocked event handlers.
  - Use fixtures and mocked user identities in `tests/fixtures/phase_7/approval/`.

## 2. Task Implementation
- [ ] Implement a new service `src/workflows/requirement_approval.py` (or corresponding language) with:
  - An API endpoint `POST /api/v1/requirements/{batch_id}/approve` that accepts approver identity and approval decision.
  - A state transition machine for requirement batches with states: `extracted -> pending_user_approval -> approved | rejected`.
  - Persistent audit records (who approved, timestamp, justification) stored in the existing database (add migration if needed for `requirement_approvals` table with columns: id, batch_id, approver_id, decision, justification, created_at).
  - Hook the endpoint to emit an event `requirements.approved` that other services (RTI monitor, roadmap planner) can consume (use an internal event bus or message queue abstraction).
  - Ensure the endpoint enforces RBAC (only users with `maker` or `project_admin` role can approve).

## 3. Code Review
- [ ] Confirm approval logic uses secure authentication and RBAC checks.
- [ ] Confirm the state machine is deterministic and fully covered by unit/integration tests.
- [ ] Verify audit records are immutable and accessible for compliance queries.

## 4. Run Automated Tests to Verify
- [ ] Run integration tests for the approval flow, e.g., `pytest tests/test_requirement_approval.py` and ensure the event emission is mocked and assertions for state transitions pass.

## 5. Update Documentation
- [ ] Update `docs/process/approval.md` describing the approval gate workflow, roles allowed to approve, and how to rollback a mistaken approval.
- [ ] Document the `requirements.approved` event payload in `docs/integration/events.md`.

## 6. Automated Verification
- [ ] Add an automated CI check that validates the approval DB migration has been applied and that the `requirements.approved` event schema matches `tests/schemas/requirements_approved_event.json`.
