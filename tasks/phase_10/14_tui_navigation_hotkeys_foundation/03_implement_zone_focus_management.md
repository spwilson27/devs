# Task: Implement Zone Focus and Navigation (Sub-Epic: 14_TUI Navigation & Hotkeys Foundation)

## Covered Requirements
- [9_ROADMAP-REQ-UI-012], [4_USER_FEATURES-REQ-046], [7_UI_UX_DESIGN-REQ-UI-UNK-003]

## 1. Initial Test Written
- [ ] Write a test to verify the `FocusManager` state.
- [ ] Simulate pressing `TAB` and verify that focus cycles between "Epic Roadmap" (Sidebar) and "Implementation Console" (Main).
- [ ] Verify that the "active" zone receives a visual indicator (Double-line Border).
- [ ] Verify that mouse-click events are ignored or do not trigger focus changes (enforcing keyboard-only interaction).
- [ ] Test that certain keys (like arrows) are only captured by the focused zone.

## 2. Task Implementation
- [ ] Create a `FocusContext` to track which TUI zone is currently active.
- [ ] Implement a `useFocusZone` hook that components use to determine if they are focused.
- [ ] Register a global `TAB` handler to cycle through available zones: `['ROADMAP_SIDEBAR', 'MAIN_CONSOLE']`.
- [ ] Update the `Box` components for Sidebar and Main view to change their `borderStyle` to `double` when focused.
- [ ] Use `ink-box` or a custom primitive to render the double-line borders.
- [ ] Ensure that components inside a non-focused zone do not respond to navigation keys (e.g., Up/Down arrows in Roadmap should only work when Roadmap is focused).
- [ ] Explicitly disable or omit any mouse-based interaction logic to follow the "No Mouse" recommendation.

## 3. Code Review
- [ ] Verify the use of `7_UI_UX_DESIGN-REQ-UI-DES-067` (Double-line borders for focus).
- [ ] Ensure the focus cycling is intuitive and follows the logical layout (Top-to-Bottom, Left-to-Right).
- [ ] Check that the visual transition between focused and unfocused states is immediate and high-contrast.

## 4. Run Automated Tests to Verify
- [ ] Run the TUI integration suite.
- [ ] Confirm that `TAB` successfully moves focus and updates the border styles.

## 5. Update Documentation
- [ ] Document the focus management architecture in `@devs/cli/tui/README.md`.
- [ ] Explain why mouse interaction is omitted (Keyboard-First philosophy).

## 6. Automated Verification
- [ ] Run a visual regression test (if possible) or a state-snapshot test that verifies the `borderStyle` property of the focused zone matches `double`.
