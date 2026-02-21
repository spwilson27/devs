# Task: Implement Global Action Hotkeys (P, R, H) (Sub-Epic: 15_TUI Specific Hotkeys & Focus)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-1]

## 1. Initial Test Written
- [ ] Write integration tests for the `TUI` root component using `ink-testing-library`.
- [ ] Mock the `@devs/core` orchestrator to track calls to `pause()`, `resume()`, and `rewind()`.
- [ ] Simulate pressing 'p' (and 'P') and verify the orchestrator's `pause` or `resume` methods are called.
- [ ] Simulate pressing 'r' (and 'R') and verify that the `RewindMenu` component is rendered (or its visibility state is toggled in the store).
- [ ] Simulate pressing 'h' (and 'H') and verify that the `HelpOverlay` or `Keymap` component is rendered.
- [ ] Ensure these hotkeys are active globally, even when sub-components are focused (unless a text input has focus).

## 2. Task Implementation
- [ ] Implement a global hotkey listener in the `MainView` or `App` component using the `useHotkey` hook (established in Sub-Epic 14).
- [ ] Map the 'p' key to toggle the system's execution state via the Zustand store.
- [ ] Map the 'r' key to toggle the `isRewindMenuOpen` state in the TUI store.
- [ ] Map the 'h' key to toggle the `isHelpVisible` state in the TUI store.
- [ ] Create a minimalist `HelpOverlay` component that displays the current keymap (P: Pause, R: Rewind, H: Help, /: Whisper).
- [ ] Integrate with the `@devs/core` event bus to ensure visual feedback (e.g., a "PAUSED" badge) appears immediately when 'p' is pressed.

## 3. Code Review
- [ ] Verify that hotkeys are case-insensitive (handle both 'p' and 'P').
- [ ] Ensure that global hotkey handlers check if a text input (like the Whisperer) is currently focused to avoid hijacking typing.
- [ ] Check that the `HelpOverlay` follows the "Minimalist Authority" design (clean Unicode borders, high-contrast text).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and ensure all integration tests for global actions pass.
- [ ] Verify that the TUI remains responsive while processing these hotkeys.

## 5. Update Documentation
- [ ] Update the TUI keymap documentation in `docs/tui_usage.md`.
- [ ] Ensure the AOD reflects these control mechanisms for future agent turns.

## 6. Automated Verification
- [ ] Run a specialized test script that simulates the sequence `p` -> `h` -> `p` and verifies the system's state history in the SQLite `agent_logs` table.
