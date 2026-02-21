# Task: Implement Responsive Scaling for Ultra-Wide and High-Density Views (Sub-Epic: 32_Zone_Anchoring_Rules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-3]
- [7_UI_UX_DESIGN-REQ-UI-DES-081-5]
- [7_UI_UX_DESIGN-REQ-UI-DES-083]
- [7_UI_UX_DESIGN-REQ-UI-DES-083-1]

## 1. Initial Test Written
- [ ] Create a Playwright test in `tests/e2e/layout/ultra-wide-scaling.spec.ts` that sets the viewport width to `2560px`.
- [ ] Verify that the "Main Viewport" content (PRD/TAS text) is centered and maintains a `max-width: 1200px` (approximately 80 characters per line).
- [ ] Create a Vitest unit test in `packages/vscode/webview/src/components/DAG/scaling.test.ts` to verify that when the task count exceeds 100, the calculated node spacing reduces from `$spacing-md` to `$spacing-sm`.

## 2. Task Implementation
- [ ] Implement a `ResponsiveContainer` in `packages/vscode/webview/src/layout/` with a centered layout for viewports > 1920px:
  - Add a `max-width: 1200px` and `margin: 0 auto` to the Main Viewport's content area for PRD/TAS and speculative documents.
  - Allow the `DAGCanvas` to expand and fill the background while centering the active graph area.
- [ ] Update the `DAGCanvas` component to dynamically adjust node spacing:
  - Implement a `useDensityScaling` hook that counts the tasks in the current epic.
  - Apply `$spacing-sm` (`8px`) if task count > 100; otherwise use `$spacing-md` (`16px`).
- [ ] Implement the `LOD-1 (Far)` logic where individual tasks are hidden if the zoom level is < 0.1, showing only epic bounding boxes with progress radials.

## 3. Code Review
- [ ] Verify that line-length legibility is maintained for documentation on large screens.
- [ ] Ensure that density scaling does not cause node overlapping in the DAG view.
- [ ] Check that the transition between LOD (Level of Detail) levels is smooth and non-jarring.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:e2e` at various viewport widths (1280px, 1920px, 2560px) to verify centering and max-width logic.
- [ ] Run `npm run test:webview` to confirm the density scaling unit tests pass.

## 5. Update Documentation
- [ ] Update `docs/ui/responsive_strategy.md` with the new ultra-wide and density scaling rules.
- [ ] Record the scaling thresholds in the agent's medium-term memory for DAG-related tasks.

## 6. Automated Verification
- [ ] Execute `scripts/validate_max_width.sh` to check for `max-width: 1200px` in the Main Viewport's CSS when the screen width is > 1920px.
