# Task: Integrate TUI Approval Gates with Orchestrator (Sub-Epic: 16_TUI Approval Gates & Interaction)

## Covered Requirements
- [9_ROADMAP-REQ-UI-005]

## 1. Initial Test Written
- [ ] Create an integration test in `@devs/cli/tests/tui/integration/OrchestratorApproval.test.ts`.
- [ ] Mock the orchestrator's state to emit a `PAUSED_FOR_INTERVENTION` event with an approval request payload.
- [ ] Verify that the TUI switches to the `ApprovalGate` view automatically.
- [ ] Verify that triggering an "Approve" action in the TUI sends the correct signal (e.g., updating a SQLite entry or an IPC call) to resume the orchestrator.

## 2. Task Implementation
- [ ] In `@devs/cli/src/tui/store/useTuiStore.ts`, add state and actions for managing active approval requests.
- [ ] Implement a listener that monitors the project's `state.sqlite` or the RTES (Real-time Trace & Event Streaming) for approval requirements.
- [ ] Connect the `ApprovalGate` component to these store actions.
- [ ] Ensure that once an approval is submitted, the TUI returns to its normal "Monitoring" or "Executing" layout.

## 3. Code Review
- [ ] Ensure the "Wait-for-Approval" HITL logic is robust and handles reconnections if the TUI is restarted.
- [ ] Verify that the `human_approval_signature` is correctly recorded in the database or logs as per security requirements.
- [ ] Check for race conditions where multiple approval requests might occur (unlikely but should be handled).

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- @devs/cli/tests/tui/integration/OrchestratorApproval.test.ts`.

## 5. Update Documentation
- [ ] Document the flow of "HITL via TUI" in the project's technical architecture notes.

## 6. Automated Verification
- [ ] Run a full end-to-end simulation script that initializes a mock project, triggers a fake approval gate, and verifies the orchestrator successfully transitions past it.
