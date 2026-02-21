# Task: Implement Roadmap Task Switching and Focus Toggling (Sub-Epic: 15_TUI Specific Hotkeys & Focus)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-4]

## 1. Initial Test Written
- [ ] Write unit tests for the `EpicRoadmap` sidebar component.
- [ ] Mock a list of epics and tasks and verify that `Up`/`Down` arrows navigate the list when the Roadmap is focused.
- [ ] Simulate pressing `TAB` and verify the focus state toggles between the `Roadmap` and the `Console`.
- [ ] Test that arrow keys are ignored when the `Console` (and its logs) is focused, or used for scrolling the logs instead of switching tasks.
- [ ] Verify that a `currentTaskId` or `focusedTaskId` is updated in the Zustand store as navigation occurs.

## 2. Task Implementation
- [ ] Implement a hotkey handler for `Up` and `Down` arrow keys in the `EpicRoadmap` component.
- [ ] Use the `focusManager` to check if the `ROADMAP` zone is currently focused.
- [ ] Map `TAB` to cycle between the `ROADMAP`, `CONSOLE`, and `WHISPERER` focus zones.
- [ ] Update the `Roadmap` state (in the Zustand store) to track which task is currently being hovered/navigated by the user.
- [ ] Ensure that selecting a task (e.g., with `Enter`) is handled as a separate action if needed, while `Up`/`Down` only navigate.
- [ ] Implement focus management within the `Roadmap` so it is a valid "Ink-Focus" target.

## 3. Code Review
- [ ] Verify that task switching feels responsive and works correctly even with large roadmaps.
- [ ] Ensure `TAB` focus cycling is logical and follows a predictable order.
- [ ] Check for edge cases when navigating the first or last task in the list.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and ensure all navigation tests for the `Roadmap` pass.
- [ ] Verify that arrow keys work correctly on different terminal emulators (tested via CI).

## 5. Update Documentation
- [ ] Update the TUI keymap guide to include `Up`/`Down` for navigation and `TAB` for switching focus.
- [ ] Ensure the AOD reflects these navigation mechanisms.

## 6. Automated Verification
- [ ] Run a specialized test script that simulates the sequence `TAB` -> `Down` -> `Down` -> `TAB` and verifies the resulting focus and task ID states.
