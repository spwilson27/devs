# Task: Implement ApprovalToken API endpoints and verification service (Sub-Epic: 11_Blueprint Gate Logic)

## Covered Requirements
- [9_ROADMAP-TAS-404], [9_ROADMAP-REQ-002]

## 1. Initial Test Written
- [ ] Write integration tests at tests/integration/test_approval_api.py using the project's integration test harness. Tests to write first:
  - test_create_approval_request: POST /api/v1/approvals with payload {document_path, phase, created_by} should return 201 and JSON {token, status:'pending', checksum} and persist to DB.
  - test_get_approval_status: GET /api/v1/approvals/{token} returns current status and metadata.
  - test_approve_token_endpoint: POST /api/v1/approvals/{token}/approve with approver identity and HMAC signature should return 200 and update status to 'approved'.
  - test_reject_token_endpoint: POST /api/v1/approvals/{token}/reject returns 200 and sets status 'rejected'.
  - test_idempotency_create: repeated create requests with same document_path+phase should return same token or return 409 per design; assert behavior matches spec.

## 2. Task Implementation
- [ ] Implement API routes in src/api/blueprint_gate.py (or integrate into existing API router):
  - POST /api/v1/approvals
    - Validate payload (document_path resolved inside repo, phase present)
    - compute checksum using DocumentChecksum utility (or call ApprovalToken.compute_and_store_checksum)
    - create ApprovalToken via model method and return {token, status, checksum, expires_at}
  - GET /api/v1/approvals/{token}
    - fetch token by token string and return full status and metadata
  - POST /api/v1/approvals/{token}/approve
    - require authentication for approver (use existing auth middleware), accept optional signed_approval parameter when used by automated gate
    - call ApprovalToken.mark_approved(approver) and persist approved_at
    - emit an internal event (e.g., via pubsub or in-memory event bus) so LangGraph waiter can resume
  - POST /api/v1/approvals/{token}/reject
    - mark token as rejected and notify subscribed systems
- Implement server-side hooks to publish approval events to a channel (Redis pub/sub or internal event dispatcher) with payload {token, approved_by, approved_at}.
- Ensure endpoints validate that document_path is within repo root and sanitize inputs to prevent path traversal.

## 3. Code Review
- [ ] Verify the following in review:
  - Endpoints are idempotent where required and return proper HTTP status codes
  - Input validation and authorization checks are present
  - No secrets or keys are returned in API responses; only token identifier
  - Publish/subscribe uses existing infra or a local in-memory fallback for tests
  - Rate limiting or throttling is considered for approval API if public

## 4. Run Automated Tests to Verify
- [ ] Run integration tests: pytest -q tests/integration/test_approval_api.py against a test server (use the project's test server fixture). Confirm endpoints behave as specified and approval events are emitted.

## 5. Update Documentation
- [ ] Add docs/blueprint-gate/api.md documenting the endpoints, expected payloads, response schemas, error codes, and examples (curl and Python requests). Document the event payload for approval events so consumer agents can subscribe.

## 6. Automated Verification
- [ ] Provide an end-to-end smoke script tests/e2e/e2e_approval_api.sh that:
  - starts the app (or uses test server fixture)
  - creates an approval request
  - queries status
  - posts an approval
  - verifies the emitted event was received (or that subscribers were notified)
  - returns non-zero on failure. CI should run this in the phase-6 gating CI job.
