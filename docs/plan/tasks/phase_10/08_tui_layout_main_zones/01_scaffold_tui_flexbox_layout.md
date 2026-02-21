# Task: Scaffold TUI Flexbox Layout Structure (Sub-Epic: 08_TUI Layout & Main Zones)

## Covered Requirements
- [9_ROADMAP-REQ-UI-003], [7_UI_UX_DESIGN-REQ-UI-DES-061]

## 1. Initial Test Written
- [ ] Create a test file `packages/cli/src/tui/components/MainLayout.test.tsx`.
- [ ] Use `ink-testing-library` to verify that the `MainLayout` component renders three distinct `<Box>` containers representing the Header, Sidebar, and Main zones.
- [ ] Verify that the Sidebar has a fixed width (e.g., 30 chars) and the Main area occupies the remaining space using `flexGrow: 1`.
- [ ] Verify that the Header is positioned at the top of the vertical stack.

## 2. Task Implementation
- [ ] Implement `MainLayout.tsx` in `packages/cli/src/tui/components/`.
- [ ] Use Ink's `<Box>` with `flexDirection="column"` for the root container.
- [ ] Define the top zone for the Header.
- [ ] Define a middle container with `flexDirection="row"` to hold the Sidebar and Main content area.
- [ ] Ensure the Sidebar uses a border (e.g., `single`) to separate it from the Main area as per UI/UX guidelines.
- [ ] Integrate placeholder components for `Header`, `Sidebar`, and `MainConsole` to verify the layout structure.

## 3. Code Review
- [ ] Verify that the layout uses Ink's Flexbox engine correctly for relative positioning.
- [ ] Ensure the component is exported and integrated into the TUI entry point.
- [ ] Check that no hardcoded magic numbers are used for spacing; instead, use variables or theme constants.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/MainLayout.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the internal `TUI_LAYOUT.md` documentation to reflect the new flexbox structure and zone definitions.

## 6. Automated Verification
- [ ] Execute a snapshot test to capture the ANSI output of the `MainLayout` and verify the structural integrity of the zones.
