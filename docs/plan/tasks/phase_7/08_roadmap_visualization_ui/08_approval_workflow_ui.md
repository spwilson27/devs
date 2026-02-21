# Task: Implement Roadmap & Task DAG Approval UI (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [1_PRD-REQ-UI-003]

## 1. Initial Test Written
- [ ] Write integration/UI tests at tests/ui/roadmap/approval.test.(ts|js) verifying:
  - The reviewer can open an approval modal for an epic and see a summarized diff of changes (new/removed tasks, changed estimates).
  - Approving an epic triggers POST /api/roadmap/approve and updates the epic state to `approved` and emits a store event.
  - Rejecting or requesting changes leaves the epic in `review_requested` and records comments.

## 2. Task Implementation
- [ ] Implement approval UI components at src/ui/roadmap/ApprovalModal.(tsx|jsx):
  - Show compact diff: list of added/removed tasks with traces to REQ-IDs.
  - Provide actions: Approve, Request Changes, and Add Comment. Actions call the backend POST /api/roadmap/approve with { epicId, decision, comments }.
  - Ensure modal includes reviewer identity and timestamp and writes an audit entry to the server-side approval log.

## 3. Code Review
- [ ] Verify audit trail is immutable (append-only), ensure approval API is idempotent and that UI shows clear state transitions (pending_review -> approved -> archived). Confirm tests cover edge cases around concurrent approvals.

## 4. Run Automated Tests to Verify
- [ ] Run the approval integration tests and an end-to-end scenario that: seeds a sample epic, opens approval modal, approves it, and asserts the server-side epic state changed to `approved`.

## 5. Update Documentation
- [ ] Add docs/ui_approval.md describing the approval flow, required approver roles, and how audit logs are stored and queried.

## 6. Automated Verification
- [ ] Add `scripts/verify_approval.sh` that simulates approval actions via the API and asserts the approval log contains a record with epicId and decision `approve` and that the UI reflects the approved state via GET /api/roadmap.