# Task: Resizable pane constraints (min/max sizes & snapping) (Sub-Epic: 35_Viewport_Constraints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-081-5], [4_USER_FEATURES-REQ-048]

## 1. Initial Test Written
- [ ] Create unit & integration tests at packages/webview/src/components/PaneResizer/__tests__/pane-resizer.spec.tsx:
  - Mount two-pane layout with PaneResizer between them.
  - Simulate pointerdown/move/up sequences to change pane width; assert the final width clips to minWidthPx (default 320) and maxWidthPercent (default 75%).
  - Test snap behavior: when release is within snapThresholdPx (default 8) of min or max, it snaps.
  - Add Playwright E2E that performs a drag in a headless Chromium at multiple viewports and verifies sizes.

## 2. Task Implementation
- [ ] Implement PaneResizer (src/components/PaneResizer/PaneResizer.tsx):
  - Pointer-event based dragging with pointer capture and release.
  - Configurable props: minWidthPx (320), maxWidthPercent (75), snapThresholdPx (8).
  - Use requestAnimationFrame for DOM writes and debounce persistence (250ms) to Zustand store keyed by layout mode.
  - Expose keyboard resize via arrow keys + modifiers and add role="separator" aria-orientation="vertical" and aria-valuenow-like attributes.

## 3. Code Review
- [ ] Confirm pointer event handling uses pointer capture, removes listeners on release, and is tested for edge cases (very fast drags, window blur).
- [ ] Ensure snap thresholds and min/max constants are documented and configurable from a single source.
- [ ] Verify accessibility semantics and keyboard interactions are implemented.

## 4. Run Automated Tests to Verify
- [ ] Run unit and E2E tests: npx vitest run packages/webview/src/components/PaneResizer/__tests__/pane-resizer.spec.tsx && npx playwright test tests/e2e/pane-resizer.spec.ts

## 5. Update Documentation
- [ ] Add component README describing props, default values, example usage in Layout, and guidance for tuning for large or narrow viewports.

## 6. Automated Verification
- [ ] Provide scripts/verify-resize.js (Playwright) that runs drags at viewports [1280,1920,2560] and asserts snapping and constraints; expose `verify:resize` npm script.
