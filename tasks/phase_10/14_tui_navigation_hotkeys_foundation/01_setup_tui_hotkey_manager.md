# Task: Setup TUI Hotkey Manager Infrastructure (Sub-Epic: 14_TUI Navigation & Hotkeys Foundation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066]

## 1. Initial Test Written
- [ ] Create a unit test for `HotkeyManager` using `ink-testing-library`.
- [ ] Mock the `useInput` hook from `ink` to simulate key presses.
- [ ] Verify that a registered handler is called when its associated key is pressed.
- [ ] Verify that handlers can be scoped (e.g., global vs. zone-specific) to prevent conflicts.
- [ ] Test that special keys (like `TAB`, `ESC`, `Enter`) are correctly identified and handled.

## 2. Task Implementation
- [ ] Implement a `HotkeyProvider` and `useHotkey` hook in `@devs/cli/tui/hooks`.
- [ ] Use Ink's `useInput` hook to listen for terminal input.
- [ ] Create a registry of hotkeys that allows components to register/unregister handlers.
- [ ] Ensure that key events are not propagated to parent handlers if they are consumed by a child/scoped handler.
- [ ] Handle character-based keys (e.g., 'p', 'r') and control keys (e.g., `tab`, `escape`).
- [ ] Implement a "priority" system for hotkeys so global actions (like Pause) take precedence unless a modal is active.

## 3. Code Review
- [ ] Verify that the implementation avoids "prop drilling" by using React Context for the hotkey registry.
- [ ] Ensure that `useInput` is only active when the TUI is running and is cleaned up properly.
- [ ] Check for potential race conditions when multiple components register the same key.
- [ ] Ensure the code follows the "Minimalist Authority" TUI philosophy.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the specific test command for `@devs/cli`.
- [ ] Ensure all `HotkeyManager` tests pass with 100% coverage.

## 5. Update Documentation
- [ ] Add a section to `docs/tui_architecture.md` (or equivalent) describing how to add new hotkeys.
- [ ] Document the global hotkey map for developer reference.

## 6. Automated Verification
- [ ] Run a specialized CLI verification script that spawns the TUI and pipes a sequence of keys to `stdin`, then checks a log file or state snapshot to verify the handlers were triggered.
