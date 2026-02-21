# Task: Implement Resizable Main Layout Zones (Sub-Epic: 30_Layout_Grid_Z_Index)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-041]

## 1. Initial Test Written
- [ ] Create an E2E test (using Playwright or Cypress) to verify that the main UI zones (Sidebar, Main View, Console) are present on initialization.
- [ ] Verify that the zones are resizable by simulating a mouse drag on the resize handles.
- [ ] Check that the width/height of the zones is persistent within the session (e.g., survives a component re-mount or a simple state refresh).
- [ ] Verify that the zones maintain their position as "anchors" (cognitive anchoring).

## 2. Task Implementation
- [ ] Implement the primary `AppLayout` component in the VSCode Webview using React.
- [ ] Use a resizable pane library (e.g., `react-resizable-panels` or equivalent) that supports VSCode-like split-pane interaction.
- [ ] Define and implement the persistent zones:
    - `Sidebar`: Reserved for "Context & Navigation" (Epic Roadmap).
    - `MainViewport`: Transitions between Dashboard, Research, Spec, and Roadmap views.
    - `Console`: Bottom panel for "Agent Reasoning & Logs".
    - `TopBar`: System status and navigation breadcrumbs.
- [ ] Ensure the default layout ratios are applied (e.g., 25/75 for Standard Mode).
- [ ] Add resizability handles between zones with a minimal interactive target (24px) for mouse/trackpad precision.
- [ ] Use `vscode-resource` URI scheme for any layout assets (if needed).

## 3. Code Review
- [ ] Verify that the zones are persistent and do not "pop" or "jump" during view transitions (Anti-magic rule).
- [ ] Check that the layout uses CSS `flex` or `grid` for consistent behavior across different Webview sizes.
- [ ] Ensure that the theme-aware variables (`--vscode-*`) are used for borders and handles.

## 4. Run Automated Tests to Verify
- [ ] Execute the E2E layout tests: `npm test -- --grep "layout-resizability"`.
- [ ] Verify that the resizing logic does not cause performance degradation (60FPS target).

## 5. Update Documentation
- [ ] Update the UI architecture documentation in `docs/` or the agent "memory" to reflect the layout zone hierarchy.
- [ ] Update the `.agent.md` for the `AppLayout` component to explain the zone structure.

## 6. Automated Verification
- [ ] Run a script that renders the layout and verifies the presence of data-testid or aria-labels for each zone: `sidebar`, `main-viewport`, `console`, `top-bar`.
- [ ] Validate that resizing events are correctly captured in the state store (Zustand).
