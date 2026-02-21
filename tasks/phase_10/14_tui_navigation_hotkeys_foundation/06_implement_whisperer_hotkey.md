# Task: Implement Directive Whisperer Focus (Sub-Epic: 14_TUI Navigation & Hotkeys Foundation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-3]

## 1. Initial Test Written
- [ ] Write a test for the `DirectiveWhisperer` component.
- [ ] Simulate pressing `/` (slash) and verify that the input field becomes focused.
- [ ] Simulate pressing `W` and verify that the input field becomes focused.
- [ ] Verify that once focused, alphanumeric keys are captured by the input field and not by the hotkey manager.
- [ ] Verify that pressing `Enter` while focused sends the directive.
- [ ] Verify that pressing `ESC` while focused blurs the input field.

## 2. Task Implementation
- [ ] Implement the `DirectiveWhisperer` component using `ink-text-input`.
- [ ] Register global hotkey handlers for `/` and `w` (case-insensitive) to set a `isWhispererFocused` state to `true`.
- [ ] When `isWhispererFocused` is `true`, render the `TextInput` component with `focus={true}`.
- [ ] Implement an `onSubmit` handler for the `TextInput` to send the directive via IPC to the orchestrator.
- [ ] Implement an `onBlur` or `escape` handler to return focus to the previous zone.
- [ ] Use a distinctive border color (e.g., `magenta` per `7_UI_UX_DESIGN-REQ-UI-DES-024-3`) when the Whisperer is active.

## 3. Code Review
- [ ] Ensure that focusing the Whisperer correctly pauses other hotkey capture to prevent accidental global actions while typing.
- [ ] Verify that the `/` key itself is not included in the input field when it is used to trigger focus (or handle it gracefully).
- [ ] Check that the Whisperer follows the "Level 1: Human Authority" styling (high contrast).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for `DirectiveWhisperer`.
- [ ] Manually verify that typing directives works correctly in the terminal.

## 5. Update Documentation
- [ ] Update the `HelpOverlay` to include the Whisperer hotkeys.
- [ ] Document the "Directive Whispering" feature in the user-facing documentation.

## 6. Automated Verification
- [ ] Run a script that simulates `/`, types "test directive", and presses `Enter`, then verifies that the directive is received by the orchestrator mock.
