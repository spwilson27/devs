# Task: Port layout: Unit tests for centered port spacing algorithm (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-4]

## 1. Initial Test Written
- [ ] Create unit tests for a pure function computePortPositions(nodeWidth, portCount, portSize, sidePadding=0) located at src/components/dag/portLayout.ts (or similar). Tests must assert that: (a) for portCount=1 the single port X position equals nodeWidth/2 (center); (b) for portCount=2 positions are symmetric about center (e.g., center +/- spacing/2); (c) for odd/even counts the set of positions is centered (mean position equals nodeWidth/2) and spacing between adjacent ports is uniform; (d) when total ports length (portCount*portSize) plus 2*sidePadding > nodeWidth the algorithm clamps spacing to a minimum (document acceptable behavior) and returns positions that do not overflow by more than 1px; (e) numeric comparisons use a tolerance <= 0.5px.

## 2. Task Implementation
- [ ] Implement tests in src/components/dag/__tests__/portLayout.test.ts and use table-driven tests for multiple widths/portCounts (1..10). Use strict numeric assertions with toBeCloseTo(..., 1). Include edge cases with zero padding, large portSize, and extremely narrow widths.

## 3. Code Review
- [ ] Ensure tests are deterministic, do not depend on DOM, and that the test names explain the expected centered property (mean == center). Validate tests include both even and odd port counts and a failing test for overflow behavior to drive implementation.

## 4. Run Automated Tests to Verify
- [ ] Run npx jest src/components/dag/__tests__/portLayout.test.ts and confirm all cases pass. If new code is introduced, run full test suite to ensure no regressions.

## 5. Update Documentation
- [ ] Add a short section in docs/ui/dag.md named "Port layout algorithm" explaining computePortPositions signature, centered spacing behavior, and the expected constraints when ports exceed available width.

## 6. Automated Verification
- [ ] Add a CI unit test step that executes the portLayout test file and fails the build on regressions; include a small script that verifies the mean of returned positions equals nodeWidth/2 within 0.5px for a canonical set of inputs.
