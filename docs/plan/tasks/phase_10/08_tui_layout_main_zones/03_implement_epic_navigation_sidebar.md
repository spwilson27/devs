# Task: Implement TUI Sidebar (Epic Navigation Zone) (Sub-Epic: 08_TUI Layout & Main Zones)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-061-2]

## 1. Initial Test Written
- [ ] Create `packages/cli/src/tui/components/Sidebar.test.tsx`.
- [ ] Test that the `Sidebar` component correctly displays a list of Epics provided via a mock `RoadmapStore`.
- [ ] Verify that the currently active Epic is highlighted with a different background color or ANSI attribute (e.g., Bold).
- [ ] Test that the Sidebar correctly renders progress percentages for each Epic.

## 2. Task Implementation
- [ ] Implement `Sidebar.tsx` in `packages/cli/src/tui/components/`.
- [ ] Subscribe to the `RoadmapStore` or `ProjectStore` using Zustand to get the current project state.
- [ ] Map the list of Epics to a vertical list using Ink's `<Box>` and `<Text>`.
- [ ] Use `StepProgress` primitive (if available) to show a horizontal or vertical bar indicating completion for each Epic.
- [ ] Ensure the Sidebar is fixed in width (e.g., 20% of terminal width or min 25 chars) and uses `borderStyle="single"` on the right.

## 3. Code Review
- [ ] Verify that the list of Epics is scrollable if it exceeds the terminal height.
- [ ] Ensure the component correctly handles "Epic Navigation" logic without introducing excessive re-renders.
- [ ] Check for proper focus indicators if the Sidebar is intended to be navigable via keyboard.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/Sidebar.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the `Sidebar` specification in the project's UI/UX design document.

## 6. Automated Verification
- [ ] Run the TUI and verify that the Sidebar renders the correct number of Epics as specified in the mock data.
