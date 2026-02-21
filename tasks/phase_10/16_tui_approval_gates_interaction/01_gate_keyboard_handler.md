# Task: Implement TUI Phase Gate Keyboard Handlers (Sub-Epic: 16_TUI Approval Gates & Interaction)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-2], [9_ROADMAP-REQ-INT-002]

## 1. Initial Test Written
- [ ] Create a unit test in `@devs/cli/tests/tui/hooks/usePhaseGate.test.ts` that mocks Ink's `useInput` hook.
- [ ] The test should verify that pressing `Enter` triggers an `onApprove` callback.
- [ ] The test should verify that pressing `Esc` triggers an `onReject` callback.
- [ ] Ensure the hook only responds to these keys when an `isActive` flag is true.

## 2. Task Implementation
- [ ] Implement a custom hook `usePhaseGate` in `@devs/cli/src/tui/hooks/usePhaseGate.ts`.
- [ ] Use `useInput` from `ink` to listen for keyboard events.
- [ ] Define the logic to identify `return` (Enter) and `escape` keys.
- [ ] Ensure that the event propagation is managed to prevent other global hotkeys from firing while a gate is active.

## 3. Code Review
- [ ] Verify that the hook is decoupled from the UI components for better testability.
- [ ] Ensure the keyboard mapping strictly adheres to `7_UI_UX_DESIGN-REQ-UI-DES-066-2`.
- [ ] Check for proper cleanup of input listeners if applicable.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm test -- @devs/cli/tests/tui/hooks/usePhaseGate.test.ts` and confirm all cases pass.

## 5. Update Documentation
- [ ] Update `@devs/cli/README.md` or internal AOD in `.agent/cli-tui.md` to document the phase gate interaction patterns.

## 6. Automated Verification
- [ ] Run a small script `scripts/verify-tui-input.ts` that uses `ink-testing-library` to simulate keyboard input and verify state changes.
