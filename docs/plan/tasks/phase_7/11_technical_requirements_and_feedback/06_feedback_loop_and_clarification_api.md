# Task: Implement Clarification Request Workflow & Feedback API (Sub-Epic: 11_Technical_Requirements_and_Feedback)

## Covered Requirements
- [4_USER_FEATURES-REQ-081], [9_ROADMAP-TAS-013]

## 1. Initial Test Written
- [ ] Create tests in `tests/feedback/test_clarification_workflow.py` BEFORE implementation. Tests to write first:
  - test_clarification_ticket_created(): simulate contradiction detection returning a contradiction dict and assert `create_clarification_request(contradiction)` returns a persistent `clarification_id` and stores fields: `req_ids`, `evidence`, `status` ("open").
  - test_user_response_updates_ticket(): simulate a user response payload (clarification answer) and assert `apply_clarification_response(clarification_id, response)` updates the ticket status to "resolved" and attaches `resolution_notes`.
  - test_api_endpoints_auth(): if an HTTP API is implemented, assert unauthenticated calls receive 401; for CLI-only implementation, assert only local file writes occur and are permission-checked.

## 2. Task Implementation
- [ ] Implement `src/feedback/clarification.py` and a lightweight HTTP endpoint `src/feedback/api.py` (optional) or CLI `scripts/clarify_requirement.py` that provides:
  - `create_clarification_request(contradiction: Dict) -> str` which persists a ticket in `.devs/clarifications.sqlite` or `data/clarifications.json` with fields: `id`, `created_at`, `contradiction`, `req_ids`, `status`.
  - `list_open_clarifications() -> List[Dict]`
  - `apply_clarification_response(clarification_id: str, response: Dict) -> None` which transitions status and optionally updates the requirement metadata (e.g., mark `requires_human_review=False`).
  - If implementing HTTP endpoints, provide a minimal Flask/FastAPI app with two endpoints: `POST /clarifications` and `POST /clarifications/{id}/response`. Keep the dependency optional and mockable in tests.

## 3. Code Review
- [ ] Verify persistence is idempotent (re-running create with same evidence should not create duplicates), ensure clear audit trail, and check for proper input validation and escaping. If HTTP API is added, verify auth stub, rate-limiting considerations, and no sensitive info in logs.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/feedback/test_clarification_workflow.py` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `docs/phase_7/11_technical_requirements_and_feedback/clarification_workflow.md` with the ticket schema, API/CLI examples, and guidance for human reviewers on resolving contradictions.

## 6. Automated Verification
- [ ] Add `scripts/verify_clarification_workflow.sh` that runs the feedback workflow tests and then runs the create/list/resolve sequence against an in-memory store to ensure end-to-end operation.
