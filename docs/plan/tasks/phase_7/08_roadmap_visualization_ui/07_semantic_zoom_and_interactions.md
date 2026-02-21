# Task: Implement Semantic Zoom & User Interactions (Sub-Epic: 08_Roadmap_Visualization_UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-033], [1_PRD-REQ-UI-006]

## 1. Initial Test Written
- [ ] Create UI tests at tests/ui/roadmap/zoom_interactions.test.(ts|js) that verify:
  - At low zoom levels the renderer hides task labels and shows only epic boundaries.
  - At medium zoom levels tooltips for nodes appear on hover and clicking a node opens the detail panel.
  - Keyboard zoom in/out shortcuts change the detail level and the DOM reflects the expected toggles.

## 2. Task Implementation
- [ ] Implement semantic zoom controls in DagCanvas and GanttView:
  - Provide three zoom levels (overview, mid, detail) with deterministic breakpoints and an API setZoom(level).
  - Implement hover tooltips with accessible roles and a debounced hover handler.
  - Implement click-to-focus to open the right-side detail panel and ensure the focus is moved into the panel for screen reader users.

## 3. Code Review
- [ ] Verify that zooming is implemented via transforms (GPU-accelerated) and that DOM changes are minimized; confirm accessibility and that keyboard controls are discoverable via a help overlay.

## 4. Run Automated Tests to Verify
- [ ] Run UI interaction tests headlessly: `npm run test -- tests/ui/roadmap/zoom_interactions.test` and confirm tooltips, zoom-level DOM toggles, and click-to-open behavior function as expected.

## 5. Update Documentation
- [ ] Add user-facing docs in docs/roadmap_interactions.md describing the zoom levels, keyboard shortcuts, and tips for large roadmaps.

## 6. Automated Verification
- [ ] Add an automated E2E script `scripts/verify_zoom.sh` that uses Puppeteer/Playwright to load the RoadmapViewer, perform zoom operations, and assert the number of rendered labels at each level matches the expected counts in tests/fixtures/zoom_counts.json.