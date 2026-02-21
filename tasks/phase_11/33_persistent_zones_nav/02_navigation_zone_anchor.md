# Task: Navigation Zone (Epic Roadmap Anchor) (Sub-Epic: 33_Persistent_Zones_Nav)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-044], [7_UI_UX_DESIGN-REQ-UI-DES-044-2]

## 1. Initial Test Written
- [ ] Create a Vitest suite `NavigationZone.test.tsx`.
- [ ] Verify that the `NavigationZone` component correctly renders the "Epic Roadmap" title and list.
- [ ] Write a test to ensure the component remains anchored (visible) regardless of the active view in the Main Viewport.
- [ ] Mock the global state (Zustand) and verify that the Navigation Zone correctly highlights the "Active Epic" based on the current project state.

## 2. Task Implementation
- [ ] Create a `NavigationZone` component to be placed within the Left Sidebar region of the `MainLayout`.
- [ ] Implement a `RoadmapSummary` list within the Navigation Zone that displays all project Epics and their high-level status (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-003-1`).
- [ ] Apply "Cognitive Anchoring" styling: ensure the sidebar uses a subtle contrast background and a fixed position relative to the main workspace.
- [ ] Implement "Ghost Rail" behavior (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-049-2`) for when the sidebar is collapsed (< 80px), showing only Epic icons and requirement fulfillment badges.
- [ ] Use `Codicons` for Epic status indicators (e.g., `circle-outline`, `check`, `sync`).

## 3. Code Review
- [ ] Verify that the Navigation Zone uses technical conciseness in its labels (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-004-2`).
- [ ] Ensure that the component does not use decorative animations; transitions should be fast and functional.
- [ ] Confirm that the sidebar maintains a `z-index: 100` (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-049-Z1`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` to execute the `NavigationZone` tests.
- [ ] Verify that the Epic list correctly reflects the mocked project state.

## 5. Update Documentation
- [ ] Document the `NavigationZone` component's role in the "Visual Glass-Box" architecture within the component's `.agent.md` file.
- [ ] Update the UI documentation to reflect the sidebar's dual-mode behavior (Expanded vs. Ghost Rail).

## 6. Automated Verification
- [ ] Run the UI validation script to ensure the `NavigationZone` is present in the DOM and has the correct `aria-label="Navigation Zone"`.
- [ ] Verify that the sidebar width matches the configured layout constraints after hydration.
