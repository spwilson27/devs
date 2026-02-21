# Task: Implement backend Approval API endpoints (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-HITL-002], [1_PRD-REQ-UI-002], [1_PRD-REQ-NEED-ARCH-02]

## 1. Initial Test Written
- [ ] Create `tests/integration/test_approvals_api.py` using the project's integration test runner (pytest suggested). Tests:
  - `test_create_approval_request_api`: POST `/api/approvals` with JSON `{doc_type, doc_id, content, blocks: [{block_id, req_id, title, description}]}` and assert `201` with body `{approval_token: "...", id: "..."}` and that DB row exists with `status=='pending'`.
  - `test_get_approval_by_token`: GET `/api/approvals/{token}` returns structured ApprovalRequest with `blocks` array and `status`.
  - `test_approve_request_via_api`: POST `/api/approvals/{token}/approve` with body `{approver: "test-user", method: "cli"}` and assert `200` and DB `status=='approved'`.
  - `test_approve_block_via_api`: POST `/api/approvals/{token}/blocks/{block_id}/approve` and assert only that block's status flips to `approved`.
  - `test_reject_flow`: POST `/api/approvals/{token}/reject` asserts `status=='rejected'` and event logged.

## 2. Task Implementation
- [ ] Implement routes in `src/api/approvals.py` or the project's API module using the project's chosen web framework:
  - `POST /api/approvals` - validate payload, compute checksum, create ApprovalRequest + ApprovalBlock rows, return `{approval_token, id}`; persist checksum.
  - `GET /api/approvals/{token}` - return ApprovalRequest with associated blocks and current statuses.
  - `POST /api/approvals/{token}/approve` - approve entire request; persist `approved_by`, `approved_at` and generate/validate `approval_token` semantics.
  - `POST /api/approvals/{token}/blocks/{block_id}/approve` - granular block approval.
  - `POST /api/approvals/{token}/reject` - mark as rejected and persist reason.
- [ ] Implement input validation, idempotency (repeated calls are safe), and return clear HTTP status codes (`201` create, `200` success, `409` conflict when checksum mismatch), and audit log event emission to `approval_events` table or the project's event bus.
- [ ] If the project exposes OpenAPI/Swagger, add operation descriptions and example payloads.

## 3. Code Review
- [ ] Ensure:
  - Endpoints authenticate sign-off actions when required (CLI confirm or VSCode button press) — at minimum include `approver` and `method` metadata and a test that simulates the CLI method.
  - Input validation and error handling are robust (400 on malformed input, 404 for unknown token, 409 for checksum mismatch).
  - No sensitive data is logged; approval tokens are treated as bearer-like non-secret identifiers, and token-reuse is carefully controlled.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/integration/test_approvals_api.py` and confirm all integration tests pass; tests should run against a test DB created per-run.

## 5. Update Documentation
- [ ] Add `docs/api/approvals.md` describing routes, payload examples, and expected responses; add OpenAPI annotations if applicable.

## 6. Automated Verification
- [ ] Add an integration CI job `scripts/ci_run_approvals_integration.sh` that:
  - Boots the minimal app (or test server),
  - Runs the integration tests, and
  - Fails CI if any endpoint behavior deviates (non-200/201/expected responses).
