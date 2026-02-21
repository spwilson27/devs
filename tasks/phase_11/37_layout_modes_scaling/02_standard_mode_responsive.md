# Task: Implement Standard Mode (25/75) Responsive Layout with Accessible Splitter (Sub-Epic: 37_Layout_Modes_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062-2]

## 1. Initial Test Written
- [ ] Add unit and integration tests under `packages/ui/src/__tests__/LayoutContainer.spec.tsx` (testing-library + Vitest/Jest):
  - Unit: Mount `LayoutContainer` with mode = 'standard' and assert the container has an inline `style.gridTemplateColumns === '25% 75%'` or that computed CSS variables `--pane-left-percent` and `--pane-right-percent` equal `25` and `75` respectively.
  - Integration: Simulate pointer events to drag the vertical splitter from the 25% position to 35% and assert the Zustand `layout` slice `leftPercent` updates, and the inline `gridTemplateColumns` updates to `'35% 65%'`.
  - Accessibility: Assert the splitter element has `role="separator"`, `aria-orientation="vertical"`, `aria-valuenow` between `0` and `100`, and keyboard ArrowLeft/ArrowRight adjusts the value by 1% increments.
  - Persistence: After adjusting splitter, assert persisted value is stored in `localStorage` key `devs:layout:standard` and restored on provider re-mount.

## 2. Task Implementation
- [ ] Implement `LayoutContainer` at `packages/ui/src/layout/LayoutContainer.tsx`:
  - Render two panes and a vertical splitter control between them.
  - Compute `gridTemplateColumns` by reading `getLayoutConfiguration('standard')` and applying an inline style: `style={{ gridTemplateColumns: columns }}` where columns = `${leftPercent}% ${rightPercent}%`.
  - Implement a performant drag handler:
    - Use pointer events with `pointerdown`, `pointermove`, `pointerup` and throttle updates with `requestAnimationFrame`.
    - Respect `MIN_LEFT_PERCENT = 12` and `MAX_LEFT_PERCENT = 50` to avoid unusable sizes.
    - Use CSS variables `--pane-left-percent` and `--pane-right-percent` for child components to consume without forcing reflows.
  - Expose keyboard controls on the splitter and ensure focus management and accessible labels (aria-labelledby).
  - Persist the user-adjusted ratio to the `layout` Zustand slice and `localStorage`; when inside webview call `vscode.setState` (guarded).
  - Add tests and Storybook/Storyshots for visual verification.

## 3. Code Review
- [ ] During review ensure:
  - Drag logic uses `requestAnimationFrame` and does not call setState inside tight loops without guards.
  - Splitter is fully keyboard-accessible and has correct ARIA attributes.
  - Minimum/maximum constraints exist and documented.
  - No direct manipulation of DOM styles except via React refs and inline style derived from state.

## 4. Run Automated Tests to Verify
- [ ] Run unit and integration tests: `pnpm -w --filter @devs/ui test` or `npm test` in the UI package.
  - Confirm pointer-drag simulation tests pass and persistence tests succeed.

## 5. Update Documentation
- [ ] Update `docs/ui/layout-modes.md` with a code example showing `LayoutContainer` usage, notes on MIN/MAX percentages, accessibility checklist, and instructions on persisting user preferences.

## 6. Automated Verification
- [ ] Add Playwright visual test `tests/e2e/standard_mode_spec.ts` which mounts the component in the harness, measures `getBoundingClientRect()` for left and right panes, and asserts left/total ≈ 25% ±1% for default load and that persisted drag values survive reload.