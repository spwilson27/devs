# Task: Implement overlay positioning logic (Sub-Epic: 34_Adaptive_Breakpoints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-081-4]

## 1. Initial Test Written
- [ ] Write unit tests for the overlay positioning util at src/ui/overlay/__tests__/position.test.ts:
  - Implement deterministic tests that call computeOverlayPosition(targetRect, overlaySize, viewportSize) with mocked rectangles and sizes and assert the returned { top, left, placement } keeps the overlay fully visible within viewport bounds with 8px padding.
  - Test cases to include:
    - Target near right edge -> overlay should place to the left or adjust left coordinate to avoid overflow.
    - Target near bottom edge -> overlay should appear above or adjust top coordinate.
    - Target centered -> overlay prefers below placement.
- [ ] Add an integration test for the Popover/Tooltip component at src/ui/overlay/__tests__/Popover.integration.test.tsx that mounts a simple component, triggers the overlay, and asserts the overlay element's style.top and style.left values are within the viewport and that no scrollbars are introduced.

## 2. Task Implementation
- [ ] Create util src/ui/overlay/position.ts with exported function:
  - computeOverlayPosition(targetRect: DOMRect, overlaySize: {width:number,height:number}, viewport: {width:number,height:number}, options?: {padding?:number, preferredPlacement?: 'top'|'bottom'|'left'|'right'}) -> { top:number, left:number, placement:'top'|'bottom'|'left'|'right' }
  - Implement collision detection and fallback placements; prefer bottom if space, otherwise top; prefer right if horizontal space; clamp values so overlay stays within [padding, viewportSize - overlaySize - padding].
  - Keep algorithm pure and side-effect free to allow simple unit testing.
- [ ] Update Popover/Tooltip components to use computeOverlayPosition at mount and on window resize; debounce repositioning by 50ms.
- [ ] Ensure overlays include role attributes (role="dialog"/"tooltip") and focus-trap where needed; ensure overlays render in a portal root that sits as a sibling to the main app container to avoid clipping.

## 3. Code Review
- [ ] Confirm algorithm correctness, small complexity (O(1)), and that the util is pure.
- [ ] Confirm overlay logic does not cause layout thrash (use read-only measurements once per reposition and apply transforms vs. top/left where appropriate).
- [ ] Confirm accessibility: overlays are reachable by keyboard, appropriate aria attributes exist, and focus is returned after close.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests for position util: npx jest src/ui/overlay/__tests__/position.test.ts
- [ ] Run integration tests for Popover: npx jest src/ui/overlay/__tests__/Popover.integration.test.tsx or run vitest equivalent.

## 5. Update Documentation
- [ ] Add docs/ui/overlay.md describing the overlay positioning algorithm, default padding, preferred placements, and guidelines for components that must opt-out (full-bleed modals).

## 6. Automated Verification
- [ ] Add CI unit tests for computeOverlayPosition with the deterministic mocked rect cases to ensure future regressions are caught.
- [ ] Optionally add a visual regression that captures overlay placement for a few canonical target positions.
