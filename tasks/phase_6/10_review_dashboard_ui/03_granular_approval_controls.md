# Task: Add Granular Approval Controls for Requirement Blocks (Sub-Epic: 10_Review Dashboard UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-009]

## 1. Initial Test Written
- [ ] Write unit tests at tests/components/ApprovalControl.test.tsx and an integration test in tests/components/SpecViewer.approvals.test.tsx that:
  - Render ApprovalControl and assert presence of accept and reject buttons and proper ARIA labels.
  - Simulate clicks to verify the onChange callback is invoked with {id, status: 'accepted'|'rejected'} and that state updates in SpecViewer.
  - Integration test: render SpecViewer with multiple requirement blocks (mock data) and assert each block renders an ApprovalControl and state persists during component lifecycle.

## 2. Task Implementation
- [ ] Implement src/components/ApprovalControl/index.tsx:
  - Expose a controlled component with props { id:string, status?: 'accepted'|'rejected'|'pending', onChange:(id,status)=>void }.
  - Render accessible accept/reject toggle buttons and keyboard support; reflect current status visually.
  - Implement optimistic UI updates and call onChange; provide a way to revert on API failure.
- [ ] Integrate ApprovalControl into SpecViewer so each requirement block shows an ApprovalControl; wire SpecViewer to maintain per-block status and expose an API to collect all decisions.
- [ ] Persist decisions locally (localStorage key: review:approvals:{projectId}) and implement a small service src/services/approvalStore.ts to abstract persistence for tests and future server sync.

## 3. Code Review
- [ ] Verify ApprovalControl is decoupled from storage, has clear prop typings, is keyboard-accessible, and handles optimistic updates and errors gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run npm test -- -t "ApprovalControl" and integration tests for SpecViewer approvals; ensure tests pass.

## 5. Update Documentation
- [ ] Document ApprovalControl props, expected integration pattern in docs/ui/review_dashboard.md and add examples of reading persisted approval decisions programmatically.

## 6. Automated Verification
- [ ] Run the approval integration tests and a small script test that writes to localStorage review:approvals:{projectId} and verifies SpecViewer initializes from persisted state.