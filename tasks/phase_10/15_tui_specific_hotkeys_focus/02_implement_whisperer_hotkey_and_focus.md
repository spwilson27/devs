# Task: Implement "The Whisperer" Hotkey and Focus (Sub-Epic: 15_TUI Specific Hotkeys & Focus)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-3]

## 1. Initial Test Written
- [ ] Write integration tests for the `Whisperer` component using `ink-testing-library`.
- [ ] Mock the global focus state and verify that pressing `/` or `W` (when not in a text field) immediately focuses the `Whisperer` input.
- [ ] Simulate pressing `/` (and 'w') and verify that the `Whisperer` is rendered with focus.
- [ ] Simulate pressing `ESC` while the `Whisperer` is focused and verify it loses focus or is hidden.
- [ ] Test that while the `Whisperer` is focused, other global hotkeys (like 'P' or 'R') are NOT triggered by typing into the field.

## 2. Task Implementation
- [ ] Implement a hotkey listener for `/` and 'w' in the top-level `TUI` or `Footer` component.
- [ ] Use the `focusManager` (from Sub-Epic 14) to set the active zone to `WHISPERER`.
- [ ] Update the `Whisperer` component to auto-focus its `TextInput` when the `WHISPERER` zone becomes active.
- [ ] Implement the logic to "consume" key events while the `Whisperer` input has focus, preventing accidental global hotkey triggers.
- [ ] Add the `/` and `W` mappings to the global help/keymap.

## 3. Code Review
- [ ] Verify that pressing `/` is intuitive and the transition to the focused Whisperer state is immediate.
- [ ] Ensure that focus is returned to the previous zone (e.g., Roadmap or Console) when the Whisperer is closed or submitted.
- [ ] Check for conflict between the 'w' hotkey and typing the letter 'w' in another input (if any exist).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and ensure all focus-related tests pass for the `Whisperer`.
- [ ] Verify that `/` works as expected across different terminal environments.

## 5. Update Documentation
- [ ] Document the `/` and `W` hotkeys in the user-facing TUI guide.
- [ ] Ensure the AOD reflects how to trigger the Whisperer via keyboard.

## 6. Automated Verification
- [ ] Run a script that simulates pressing `/`, then types "hello", then presses `ESC`, and verifies the focus state history.
