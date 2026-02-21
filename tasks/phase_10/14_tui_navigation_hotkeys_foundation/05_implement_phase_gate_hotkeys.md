# Task: Implement Phase Gate Actions (Enter, ESC) (Sub-Epic: 14_TUI Navigation & Hotkeys Foundation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-2]

## 1. Initial Test Written
- [ ] Write integration tests for an `ApprovalGate` component.
- [ ] Simulate pressing `Enter` and verify that the `onApprove` callback is triggered.
- [ ] Simulate pressing `ESC` and verify that the `onReject` or `onBack` callback is triggered.
- [ ] Verify that these keys are only captured when an approval gate is active/focused.
- [ ] Test that pressing `Enter` when no gate is active does not trigger any accidental actions.

## 2. Task Implementation
- [ ] Implement an `ApprovalGate` overlay component in `@devs/cli/tui/components`.
- [ ] Use the `useHotkey` hook to register `return` (Enter) and `escape` (ESC) handlers within the component.
- [ ] Ensure these hotkeys have high priority to override global actions while the gate is open.
- [ ] Provide visual buttons (non-clickable) in the UI that show `[Enter] Approve` and `[Esc] Reject` to guide the user.
- [ ] Integrate with the orchestrator to send the approval/rejection signature back to the state machine.

## 3. Code Review
- [ ] Verify that the implementation follows `7_UI_UX_DESIGN-REQ-UI-DES-066-2`.
- [ ] Ensure that accidental double-presses of `Enter` are handled gracefully (e.g., debouncing or checking state).
- [ ] Check for clear visual feedback upon approval/rejection.

## 4. Run Automated Tests to Verify
- [ ] Run the `ApprovalGate` unit and integration tests.
- [ ] Verify that the state machine correctly proceeds or halts based on the simulated key presses.

## 5. Update Documentation
- [ ] Update the TUI user guide to explain how to interact with approval gates.

## 6. Automated Verification
- [ ] Use a test script to verify that `Enter` on an approval gate results in a `HUMAN_APPROVAL` entry in the SQLite `agent_logs` table.
