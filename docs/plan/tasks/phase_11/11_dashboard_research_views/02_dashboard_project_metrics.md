# Task: Dashboard Project Progress & Epic Health Indicators (Sub-Epic: 11_Dashboard_Research_Views)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-054]

## 1. Initial Test Written
- [ ] Create a unit test for a new `ProjectMetricCard` component to verify it correctly displays progress percentages and status labels.
- [ ] Write a test for the `Sparkline` component to ensure it correctly renders SVG paths based on a provided array of data points (e.g., token usage or task completion rates).
- [ ] Implement an integration test for the `DashboardView` to verify it correctly summarizes the status of the current active Epic (name, completion percentage, active tasks count).

## 2. Task Implementation
- [ ] Create a `ProjectMetricCard` reusable component in `src/webview/components/Dashboard/ProjectMetricCard.tsx`.
- [ ] Create a `Sparkline` component in `src/webview/components/Common/Sparkline.tsx` utilizing SVG for lightweight visualization (7_UI_UX_DESIGN-REQ-UI-DES-004-1).
- [ ] Within the `DashboardView`, implement a "Health Zone" (7_UI_UX_DESIGN-REQ-UI-DES-044-1) that displays key project metrics (KPIs like TTFC, TAR, Token Usage).
- [ ] Implement a progress bar for the currently active Epic, derived from the `epics` table state.
- [ ] Apply `shimmer` effects to metric cards during data updates to satisfy `7_UI_UX_DESIGN-REQ-UI-DES-086-1`.
- [ ] Ensure that labels follow technical conciseness (7_UI_UX_DESIGN-REQ-UI-DES-004-2).

## 3. Code Review
- [ ] Verify that SVG rendering for sparklines is optimized and does not cause excessive layout shifts.
- [ ] Ensure that the component uses the standardized type scale from `7_UI_UX_DESIGN-REQ-UI-DES-033`.
- [ ] Check that `aria-label` and `role="status"` are used correctly for accessibility on the progress indicators.

## 4. Run Automated Tests to Verify
- [ ] Execute tests to confirm that progress calculations correctly handle 0% and 100% edge cases.
- [ ] Verify that the `Sparkline` component correctly handles empty data arrays without crashing.

## 5. Update Documentation
- [ ] Update the UI design system documentation to include the new `ProjectMetricCard` and `Sparkline` components.
- [ ] Log the metric definitions and their data sources (Zustand store paths).

## 6. Automated Verification
- [ ] Run a screenshot regression test (if available) to ensure the metric cards and sparklines align correctly within the Dashboard grid.
