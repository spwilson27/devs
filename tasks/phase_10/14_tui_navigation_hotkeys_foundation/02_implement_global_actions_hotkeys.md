# Task: Implement Global Action Hotkeys (P, R, H) (Sub-Epic: 14_TUI Navigation & Hotkeys Foundation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-1], [9_ROADMAP-REQ-UI-009]

## 1. Initial Test Written
- [ ] Write integration tests for the main `TUI` component.
- [ ] Simulate pressing 'p' and verify the orchestrator state transitions to `PAUSED`.
- [ ] Simulate pressing 'p' again and verify the state transitions back to `RUNNING`.
- [ ] Simulate pressing 'r' and verify that the "Rewind Menu" modal/view is displayed.
- [ ] Simulate pressing 'h' and verify that the "Help/Keymap" overlay is displayed.
- [ ] Ensure these actions work regardless of which zone is currently focused.

## 2. Task Implementation
- [ ] Register global hotkey handlers in the top-level `App` or `TUI` component using the `useHotkey` hook.
- [ ] Map `p` (case-insensitive) to a function that calls the `pause` or `resume` IPC method.
- [ ] Map `r` (case-insensitive) to a function that toggles the visibility of the `RewindMenu` component.
- [ ] Map `h` (case-insensitive) to a function that toggles the visibility of a `HelpOverlay` component.
- [ ] Implement the `HelpOverlay` component which lists all currently active hotkeys.
- [ ] Integrate with the `@devs/core` event bus to reflect state changes (e.g., updating a `StatusBadge` when paused).

## 3. Code Review
- [ ] Verify that global hotkeys do not interfere with text input in fields (like the Whisperer).
- [ ] Ensure the "Pause" action is responsive and provides immediate visual feedback.
- [ ] Check that the Help overlay follows the minimalist design and does not clutter the screen.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and ensure all integration tests for global actions pass.
- [ ] Verify that hotkeys work correctly on different terminal emulators (tested via CI).

## 5. Update Documentation
- [ ] Update the `README.md` or CLI help text to include these new TUI hotkeys.
- [ ] Ensure the AOD (`.agent.md`) reflects these global control mechanisms.

## 6. Automated Verification
- [ ] Use a script to verify that pressing 'p' triggers a `PAUSE` event in the SQLite `agent_logs` table.
