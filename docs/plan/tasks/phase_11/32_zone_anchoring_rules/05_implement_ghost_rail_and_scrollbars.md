# Task: Implement Sidebar Ghost Rail and Slim Scrollbar Metrics (Sub-Epic: 32_Zone_Anchoring_Rules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-2]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-4]
- [7_UI_UX_DESIGN-REQ-UI-DES-081-1]

## 1. Initial Test Written
- [ ] Create a Playwright test in `tests/e2e/layout/sidebar-ghost-rail.spec.ts` that resizes the "Left Sidebar" width to below `80px`.
- [ ] Verify that the sidebar transforms into a "Ghost Rail" showing only Epic icons and requirement fulfillment badges.
- [ ] Add an assertion to check that the text labels are hidden or truncated with an ellipsis.
- [ ] Add a visual check to confirm the "Main Viewport" scrolls with a slim 8px scrollbar.

## 2. Task Implementation
- [ ] Update the `Sidebar` component in `packages/vscode/webview/src/layout/` to handle the "Ghost Rail" state:
  - Add a resize listener or CSS `container-queries` to detect width < 80px.
  - Render a `GhostRail` variant with `EpicIcons` and `Badge` indicators.
- [ ] Add global CSS in `packages/vscode/webview/src/styles/globals.css` to define the slim scrollbar metrics:
  - `width: 8px` and `radius: 4px`.
  - Use VSCode variables: `--vscode-scrollbarSlider-background` for the thumb.
- [ ] Implement the `Narrow` breakpoint (`< 480px`) where all sidebars are hidden and the `Main Viewport` becomes a vertical stack.

## 3. Code Review
- [ ] Verify that the "Ghost Rail" preserves the context of the project without taking up excessive screen space.
- [ ] Ensure that the slim scrollbars do not cause accessibility issues for mouse users.
- [ ] Check that the `Narrow` breakpoint correctly handles the "Single Column" linear stack.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:e2e` to confirm the "Ghost Rail" transformation and scrollbar metrics.
- [ ] Perform a manual check of the sidebar collapse on small viewports to ensure it feels smooth.

## 5. Update Documentation
- [ ] Add the "Ghost Rail" and "Slim Scrollbar" rules to the `packages/vscode/webview/docs/UI_CONVENTIONS.md` document.
- [ ] Record the implementation of the sidebar collapse and scrollbar styling in the agent's memory for future UI task consistency.

## 6. Automated Verification
- [ ] Execute `scripts/validate_scrollbars.sh` to search for `8px` and `scrollbarSlider` variables in the CSS.
