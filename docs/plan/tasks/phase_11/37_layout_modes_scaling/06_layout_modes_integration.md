# Task: Integration Tests: Layout Mode Switching, Density Scaling, and Scrollbar Metrics (Sub-Epic: 37_Layout_Modes_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-062-2], [7_UI_UX_DESIGN-REQ-UI-DES-062-3], [7_UI_UX_DESIGN-REQ-UI-DES-049-3], [7_UI_UX_DESIGN-REQ-UI-DES-049-4]

## 1. Initial Test Written
- [ ] Implement Playwright E2E tests `tests/e2e/layout_modes.spec.ts` with the following scenarios:
  - Default load asserts `standard` mode: left pane width ≈ 25% and `.scrollbar-slim` applied to main scroll container.
  - Switch to `wide` mode and assert tri-pane exists; center pane width >= 50% by measurement and both splitters keyboard-operable.
  - Populate DAG with 150 tasks and assert density mode toggles to `high`, DAGCanvas selects `CanvasRenderer` (spy on window.__TEST_HELPERS__), and DOM node count < 300.
  - Confirm scrollbar width measurement on Chromium ≈ 8px ±1px; on overlay-scrollbar platforms assert fallback overlay present.
  - Persisted splitter positions and collapsed side panels survive reloads (simulate webview state restore).

## 2. Task Implementation
- [ ] Build a minimal test harness in `packages/ui/test-harness/layout-harness.html` and a small Node static server script `scripts/start_test_harness.js`:
  - Harness must mount `LayoutProvider`, expose `window.__TEST_HELPERS__` with helpers to toggle modes, inject mock tasks (param count), read internal layout slice, and report `renderer` selection.
  - Playwright tests start the static server, load the harness, call helpers to inject 150 tasks, and measure DOM/Canvas behaviour and scrollbar metrics.
  - Ensure harness stubs worker messages for deterministic layout timing or use a controllable mock worker during tests.

## 3. Code Review
- [ ] Ensure tests use stable selectors (data-test-id) and await proper conditions (networkidle, DOM stability). Verify no tests rely on visual pixels that are brittle; tolerate ±1% where necessary and rely on numeric assertions.

## 4. Run Automated Tests to Verify
- [ ] Run Playwright tests (`npx playwright test tests/e2e/layout_modes.spec.ts`) in CI using Chromium. Ensure tests produce artifacts on failure (screenshots, measured JSON) and that they pass consistently on CI.

## 5. Update Documentation
- [ ] Add `docs/ui/testing/layout-modes-e2e.md` documenting how to run the harness and Playwright tests locally and in CI, plus how to interpret the JSON artifacts produced by the CI job.

## 6. Automated Verification
- [ ] CI job `e2e-layout-modes` runs the Playwright suite and emits `tests/results/layout_modes.json` containing measured left/center/right percentages, density mode activation boolean, renderer type, and scrollbar width measurements; CI fails if any assertion in the spec fails.