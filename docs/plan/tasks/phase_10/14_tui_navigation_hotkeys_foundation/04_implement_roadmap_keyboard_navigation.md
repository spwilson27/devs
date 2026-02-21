# Task: Implement Roadmap Task Navigation (Sub-Epic: 14_TUI Navigation & Hotkeys Foundation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-066-4]

## 1. Initial Test Written
- [ ] Write a test for the `EpicRoadmap` component.
- [ ] Focus the Roadmap zone.
- [ ] Simulate pressing the `Down` arrow and verify the "Selected Task" index increases.
- [ ] Simulate pressing the `Up` arrow and verify the "Selected Task" index decreases.
- [ ] Verify that selection wraps around or stops at the boundaries of the list.
- [ ] Verify that selecting a task updates the "Main Console" to show details for that specific task (if applicable in this view).

## 2. Task Implementation
- [ ] Within the `EpicRoadmap` component, use the `useHotkey` hook to register `upArrow` and `downArrow` handlers.
- [ ] Ensure these handlers only execute when the Roadmap zone is focused (using the `useFocusZone` hook).
- [ ] Maintain a `selectedIndex` state for the tasks currently displayed in the sidebar.
- [ ] Highlight the selected task with a different background color or a prefix (e.g., `> [REQ-ID]`).
- [ ] Ensure the list scrolls automatically if the selected task is outside the visible area (using `ink-scroll-view` or similar).
- [ ] Emit a `UI_TASK_FOCUS_CHANGED` event when the selection changes to allow other components to react.

## 3. Code Review
- [ ] Verify that navigation is smooth and does not cause jittering in the TUI.
- [ ] Ensure the selected state is visually distinct but remains minimalist.
- [ ] Check that the keyboard navigation feels responsive (low latency).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for `EpicRoadmap` keyboard interactions.
- [ ] Perform a manual smoke test in the terminal to ensure arrow keys work as expected.

## 5. Update Documentation
- [ ] Update the `HelpOverlay` to include Up/Down arrow keys for the Roadmap.

## 6. Automated Verification
- [ ] Run a script that simulates `Down, Down, Up` and checks if the `selectedIndex` in the component's internal state (accessible via a test hook or debug port) is correct.
