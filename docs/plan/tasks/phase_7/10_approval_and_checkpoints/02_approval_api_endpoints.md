# Task: Implement Approval API endpoints and service layer (Sub-Epic: 10_Approval_and_Checkpoints)

## Covered Requirements
- [1_PRD-REQ-HITL-003], [1_PRD-REQ-HITL-004]

## 1. Initial Test Written
- [ ] Create tests/phase_7/10_approval_and_checkpoints/test_approval_service.py. Write these tests before implementation:
  - Use pytest with an in-memory SQLite DB (use sqlite3.connect(':memory:') or tmp_path for file DB) and a fixture that seeds minimal data: two epics, 30 tasks (25+ for one epic), and sample requirement_task_map rows.
  - Write unit tests for service functions (no HTTP layer yet):
    - list_epics_for_review() returns the list of epics with metadata (id, title, task_count, percent_complete).
    - get_epic_review_payload(epic_id) returns epic metadata and a tasks snapshot (task_id, title, status, estimates).
    - submit_epic_approval(epic_id, approver_id, decision, notes) stores an approvals row and returns the new approval record.
    - modify_epic_tasks(epic_id, actions) supports add/remove operations and returns a new epic_review_snapshot row; test both add and remove actions.
  - Tests must assert proper audit trail entries are created (e.g., an epic_review_snapshots row exists after modify operation).

## 2. Task Implementation
- [ ] Implement the service layer at src/approvals/service.py with functions: list_epics_for_review, get_epic_review_payload, submit_epic_approval, modify_epic_tasks. Keep business logic separated from transport (HTTP/CLI).
- [ ] Implement a thin HTTP REST adapter at src/approvals/api.py exposing the following endpoints (use existing web framework or add a minimal FastAPI/Flask app if none exists):
  - GET /api/epics -> calls list_epics_for_review
  - GET /api/epics/{epic_id}/review -> calls get_epic_review_payload
  - POST /api/epics/{epic_id}/approve -> calls submit_epic_approval; accepts JSON {approver_id, decision, notes}
  - POST /api/epics/{epic_id}/tasks -> calls modify_epic_tasks; accepts JSON {actions:[{op:'add'|'remove', task:{...}}]}
- [ ] Ensure the API layer performs input validation and returns JSON: 200 on success, 4xx on validation error.

## 3. Code Review
- [ ] Verify:
  - Business logic is fully tested and separated from framework-specific code.
  - Endpoints enforce access controls (even a placeholder check) and validate input strictly.
  - Approvals are written atomically and audit logs (epic_review_snapshots) are created for every change.
  - Error handling returns helpful error payloads with stable schema.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest -q tests/phase_7/10_approval_and_checkpoints/test_approval_service.py
- [ ] Start local app (if using FastAPI): uvicorn src.approvals.api:app --reload and run basic smoke tests against the endpoints (curl or requests).

## 5. Update Documentation
- [ ] Add docs/api/approvals.md with endpoint list, request/response JSON schemas, example curl commands, and recommended pagination/limits for GET /api/epics.
- [ ] Add docs/phase_7/10_approval_and_checkpoints/approval_flow.md describing end-to-end flow from epic generation -> review -> approval -> epic start.

## 6. Automated Verification
- [ ] Implement scripts/approval_api_smoke_test.py that:
  - Boots the app in test mode (or imports the app and uses TestClient)
  - Seeds fixtures and asserts that GET /api/epics returns expected count and POST /api/epics/:id/approve writes an approvals row.
- [ ] Wire this smoke test into CI for the approval-check job (see CI task in this Sub-Epic).
