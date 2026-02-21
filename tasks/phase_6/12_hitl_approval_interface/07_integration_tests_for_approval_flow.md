# Task: Add end-to-end integration tests for the approval flow (Sub-Epic: 12_HITL Approval Interface)

## Covered Requirements
- [1_PRD-REQ-HITL-002], [1_PRD-REQ-UI-017]

## 1. Initial Test Written
- [ ] Create `tests/e2e/test_approval_flow.py` (pytest or the project's e2e framework) with a single deterministic scenario:
  - `test_full_approval_flow`: Steps:
    1. POST `/api/generate` (or use the project's generator) to produce a PRD/TAS; assert generation returns `doc_id` and content is stored.
    2. POST `/api/approvals` using the generated document creating an ApprovalRequest; assert response includes `approval_token`.
    3. Attempt to invoke Distiller endpoint/command for that doc and assert it is blocked (`WaitForApprovalError` / HTTP 403).
    4. Approve the document via `POST /api/approvals/{token}/approve` with `{approver: 'test-user', method: 'cli'}` and assert service returns success.
    5. Re-run the Distiller invocation and assert it now proceeds to the mock generation step (assert generator called or output exists).
  - Tests must run in a disposable test environment and use deterministic fixtures.

## 2. Task Implementation
- [ ] Implement the e2e test harness (`tests/e2e/test_approval_flow.py`) with helper fixtures:
  - `test_server` fixture that boots the minimal service stack (API + DB) in-process.
  - `mock_generator` fixture that replaces actual codegen with a deterministic stub that writes an `artifact` file to `tmpdir`.
- [ ] Where necessary, add small test-only hooks in the codebase to enable dependency injection of mock components (e.g., generator function).

## 3. Code Review
- [ ] Ensure the e2e test is deterministic, cleans up artifacts, and does not rely on external network calls; use recorded responses or mock adapters for the ArchitectAgent and generator.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest -q tests/e2e/test_approval_flow.py` and ensure the full flow succeeds in the happy path and fails when approval is omitted.

## 5. Update Documentation
- [ ] Add `docs/e2e_approval_flow.md` documenting the test scenario, the fixtures used, and how to run it locally and in CI.

## 6. Automated Verification
- [ ] Add CI e2e job `scripts/ci_run_approval_e2e.sh` that runs the e2e tests in a clean environment; fail CI if Distiller proceeds without approval or if approval does not unblock Distiller.
