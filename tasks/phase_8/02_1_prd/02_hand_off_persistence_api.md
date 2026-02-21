# Task: Implement Hand-off Persistence and API (Sub-Epic: 02_1_PRD)

## Covered Requirements
- [1_PRD-REQ-HITL-005]

## 1. Initial Test Written
- [ ] Write integration tests at tests/hitl/test_hand_off_api.py::test_create_and_fetch_hand_off and tests/hitl/test_hand_off_api.py::test_resolve_hand_off:
  - Use the project's API test harness (TestClient or equivalent). If none exists, create a lightweight Flask/FastAPI TestClient wrapper in tests/conftest.py that mounts the app.
  - test_create_and_fetch_hand_off:
    - Arrange: ensure DB migrations applied in test setup.
    - Act: trigger HandOff creation via directly calling HandOffManager.create_hand_off(...) or via a simulated entropy event.
    - Assert: GET /api/handoffs/{hand_off_id} returns 200 and payload contains task_id, reason, diagnostics, status='pending'.
  - test_resolve_hand_off:
    - POST /api/handoffs/{hand_off_id}/resolve with JSON {"user_id": "u1", "notes": "fixed by applying patch"}.
    - Assert: response 200 and hand-off status updated to 'resolved' and resolved_by == 'u1'.

## 2. Task Implementation
- [ ] Implement API endpoints and persistence accessors.
  - Add route handlers (location: src/api/handoffs.py or integrated into existing API module):
    - GET /api/handoffs/{id}
    - GET /api/handoffs?status=pending
    - POST /api/handoffs/{id}/resolve
  - Implement controller functions that call HandOffManager.get_hand_off and HandOffManager.resolve_hand_off.
  - Ensure POST /resolve updates status atomically and creates an audit log entry in `hand_off_audit` table (fields: id, hand_off_id, action, user_id, notes, created_at).
  - Add migrations for hand_off_audit if necessary.

## 3. Code Review
- [ ] Verify:
  - HTTP handlers validate and sanitize inputs.
  - Authentication/authorization: only authorized users may resolve a hand-off (check existing auth layer; add unit tests for unauthorized access).
  - Audit entries are created for every resolve action.

## 4. Run Automated Tests to Verify
- [ ] Run: pytest tests/hitl/test_hand_off_api.py -q
  - Expected: tests fail before implementation and pass after.

## 5. Update Documentation
- [ ] Update docs/prd/hand_off_spec.md with API examples and sample curl commands:
  - curl -X GET http://localhost:8000/api/handoffs/{id}
  - curl -X POST -H 'Content-Type: application/json' -d '{"user_id":"u1","notes":"fixed"}' http://localhost:8000/api/handoffs/{id}/resolve

## 6. Automated Verification
- [ ] Add CI job or script scripts/verify_hand_off_api.sh that:
  - Starts app in test mode, seeds a hand-off, calls GET endpoint, calls resolve, asserts DB state transitions and audit row creation.
  - Return non-zero on mismatch.
