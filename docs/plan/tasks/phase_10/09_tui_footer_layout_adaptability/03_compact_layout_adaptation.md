# Task: TUI Compact Layout Adaptation (Sub-Epic: 09_TUI Footer & Layout Adaptability)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062-1]

## 1. Initial Test Written
- [ ] Create an integration test for `MainLayout` in `packages/cli/src/tui/layouts/__tests__/MainLayout.responsive.test.tsx`.
- [ ] Render `MainLayout` with `isCompact: false` and verify that the `Sidebar` (Roadmap) is visible.
- [ ] Render `MainLayout` with `isCompact: true` and verify that:
    - [ ] The `Sidebar` component is not rendered.
    - [ ] The `Main` zone (Implementation Console) takes up the full width.
    - [ ] The `Header` component displays the `[Current Task ID]` breadcrumb (e.g., `TASK-123 > Implementation`).
    - [ ] The layout uses a vertical stack configuration (`flexDirection: column`).

## 2. Task Implementation
- [ ] Modify `packages/cli/src/tui/layouts/MainLayout.tsx` to subscribe to the `isCompact` state from the TuiStore.
- [ ] Update the Flexbox structure of `MainLayout`:
    - [ ] If `isCompact` is true, change `flexDirection` to `column` and hide the `Sidebar`.
- [ ] Update the `Header` component in `packages/cli/src/tui/components/Header.tsx` to accept an `isCompact` prop.
- [ ] Implement the "Compact Breadcrumb" logic in `Header`:
    - [ ] In compact mode, replace the full system health/status with a simplified breadcrumb showing the active `Task ID` and `Epic`.
- [ ] Ensure that the `LogTerminal` (main console) correctly resizes to fill the available space in both modes.

## 3. Code Review
- [ ] Verify that the transition between Standard and Compact modes is smooth and doesn't cause flickering or Ink layout crashes.
- [ ] Ensure that no critical information is lost in compact mode (only the Roadmap should be hidden as per requirements).
- [ ] Check that the breadcrumb implementation follows the styling guidelines for "Minimalist Authority".

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/layouts/__tests__/MainLayout.responsive.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the `UI_UX_DESIGN.md` spec or agent memory to reflect the finalized compact mode layout behavior.
- [ ] Add screenshots or ASCII art representations of the two layout modes to the documentation.

## 6. Automated Verification
- [ ] Execute a smoke test script that renders the TUI at various widths (using a virtual terminal or `ink-testing-library`'s `lastFrame`) and verifies the layout structure programmatically.
