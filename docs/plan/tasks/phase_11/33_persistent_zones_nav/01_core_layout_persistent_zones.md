# Task: Core Layout with Resizable Persistent Zones (Sub-Epic: 33_Persistent_Zones_Nav)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-042]

## 1. Initial Test Written
- [ ] Create a Vitest suite for `MainLayout.test.tsx` using `react-testing-library`.
- [ ] Verify that the layout renders four distinct regions: Left Sidebar, Main Viewport, Right Sidebar, and Bottom Console.
- [ ] Mock a resizable panel library (e.g., `react-resizable-panels`) and verify that it correctly passes initial sizes to its children.
- [ ] Write a test to ensure that the layout state (pane sizes) is persisted and retrieved via `vscode.getState()` and `vscode.setState()`.

## 2. Task Implementation
- [ ] Install `react-resizable-panels` or a similar lightweight React library for handling pane splitting.
- [ ] Implement a `MainLayout` component in `@devs/vscode` (specifically in the webview source) that uses `PanelGroup`, `Panel`, and `PanelResizeHandle`.
- [ ] Configure the default metrics as per `7_UI_UX_DESIGN-REQ-UI-DES-045`:
  - Left Sidebar: `280px` (Resizable)
  - Right Sidebar: `320px` (Collapsible/Resizable)
  - Bottom Console: `240px` (Resizable)
  - Main Viewport: Flexible (`flex-grow: 1`)
- [ ] Integrate Tailwind CSS classes for styling, ensuring borders use `var(--vscode-panel-border)` (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-016`).
- [ ] Implement a `useLayoutPersistence` hook that listens for panel resize events and saves the new sizes to `vscode.getState()`.

## 3. Code Review
- [ ] Verify that the layout follows the "No-Drawer" policy for core state; zones should be resizable but persistent by default.
- [ ] Ensure the use of VSCode design tokens for all borders and backgrounds.
- [ ] Confirm that the `PanelResizeHandle` is accessible and has a visible focus state.
- [ ] Check that the layout is responsive to window resize events.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the project-specific test command to execute the Vitest suite for `MainLayout`.
- [ ] Ensure all layout rendering and persistence tests pass.

## 5. Update Documentation
- [ ] Update the `UI_UX_DESIGN.agent.md` or equivalent AOD to document the layout structure and the persistence mechanism.
- [ ] Reflect the use of `react-resizable-panels` in the technology landscape section of the project memory.

## 6. Automated Verification
- [ ] Run a Playwright or E2E script (if available) that simulates dragging a resize handle and verifies that the `vscode.setState` call was triggered with the updated dimensions.
- [ ] Validate that the DOM structure matches the specified four-zone architecture.
