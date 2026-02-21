# Task: Implement Canvas Interaction Overlay & Hit-Testing (Sub-Epic: 65_DAG_Layering_Strategy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045-3]

## 1. Initial Test Written
- [ ] Create tests at `webview/src/components/DAGCanvas/__tests__/05_canvas_interaction.test.tsx`:
  - Mount `CanvasRenderer` with a known dataset and simulate pointer events on the overlay at coordinates matching a known node; assert the selection callback receives the correct node id.
  - Test keyboard navigation focus behavior: when node focus changes via keyboard, ensure overlay reports selection and an ARIA live region announces the change.

## 2. Task Implementation
- [ ] Implement the interaction overlay and hit-testing:
  - Add a transparent overlay `div` positioned over the `canvas` with `data-testid="dag-canvas-overlay"` that captures pointer events.
  - Maintain a spatial index (quadtree/rbush) in the renderer mapping node bounding boxes to node ids.
  - Implement `translatePoint(screenX, screenY)` -> canvasCoord that accounts for devicePixelRatio and current pan/zoom transforms.
  - Throttle continuous pointer/mousemove events and cache recent results during drag operations to avoid excessive main-thread work.
  - Implement keyboard focus management: a focus sentinel element exposes the currently focused node id and triggers ARIA live announcements for assistive tech.

## 3. Code Review
- [ ] Verify:
  - Hit-testing is accurate across transforms and zoom levels.
  - Overlay does not interfere with other UI controls and is accessible.
  - Throttling/caching logic is correct and documented.

## 4. Run Automated Tests to Verify
- [ ] Run interaction tests and a Puppeteer-based script that clicks coordinates via the overlay and asserts selection events.

## 5. Update Documentation
- [ ] Document overlay coordinate transforms, hit-testing strategy, and ARIA interactions in `docs/ui/dag_layering.md`.

## 6. Automated Verification
- [ ] Add `scripts/verify-canvas-interaction.js` using Puppeteer to click rendered nodes via the overlay and assert the selection events in an end-to-end harness.
