# Task: E2E Tests for Diagram Pan/Zoom Controls and Momentum (Sub-Epic: 67_DAG_Pan_Zoom_Logic)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-023], [6_UI_UX_ARCH-REQ-024], [7_UI_UX_DESIGN-REQ-UI-DES-056-1], [7_UI_UX_DESIGN-REQ-UI-DES-110-2]

## 1. Initial Test Written
- [ ] Create Playwright (preferred) or Cypress E2E tests at `e2e/diagram/panzoom.spec.ts`:
  - Test 1: Wheel zoom centered at cursor: open a page with DAGCanvas and simulate wheel events at different cursor positions; assert the point under cursor remains stable after zoom by checking DOM node screen coordinates.
  - Test 2: Drag pan: simulate pointerdown/move/pointerup and assert the transform moved by expected vector.
  - Test 3: Momentum: simulate a fast drag release and assert the canvas continues moving (velocity > 0) for a short duration and eventually stops; assert final position within expected bounds.
  - Test 4: Focus via double-click or keyboard: double-click a node and assert canvas animates to center that node and that `ui.dag.focusedNode` updates.
  - Test 5: Accessibility/keyboard: send key events for zoom/pan and assert transforms change accordingly.

## 2. Task Implementation
- [ ] Add e2e test harness page under `e2e/fixtures/panzoom.html` that mounts a deterministic DAG (e.g., 20 nodes arranged on a grid) and exposes a small debug API on `window.__DEVS__` to read current transform and node screen coordinates.
- [ ] Implement Playwright tests that load the fixture, exercise interactions, and assert transform/positions through the debug API.

## 3. Code Review
- [ ] Ensure E2E tests are deterministic: fix seeds for random placements, prefer grid layouts to avoid flakiness, limit animation durations for tests by providing test-only config overrides (e.g., `momentum.maxDurationMs = 300`).
- [ ] Confirm tests include retries/backoff only where necessary and assert within reasonable timeouts to avoid CI flakiness.

## 4. Run Automated Tests to Verify
- [ ] Run Playwright: `npx playwright test e2e/diagram/panzoom.spec.ts` and verify all e2e scenarios pass in headless mode.

## 5. Update Documentation
- [ ] Add an `e2e/README.md` describing how to run the pan/zoom fixture locally and how to add new test scenarios; include test-only configuration variables and where to tune animation durations for CI.

## 6. Automated Verification
- [ ] Wire the Playwright suite into CI as a separate job to be run on PRs touching `src/ui/dag` or `src/ui/dag/panzoom` with a failure surface that prevents merging if pan/zoom regressions are detected.