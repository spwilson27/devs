# Task: Implement centered port spacing algorithm (Sub-Epic: 69_DAG_Edge_Metrics)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-4]

## 1. Initial Test Written
- [ ] Ensure the unit tests from 04_port_layout_unit_tests.md are present and failing for the not-yet-implemented computePortPositions function. If not, add at least one failing test asserting a centered position for portCount=1.

## 2. Task Implementation
- [ ] Implement src/components/dag/portLayout.ts exporting computePortPositions(nodeWidth:number, portCount:number, portSize:number=8, sidePadding:number=8): number[] that returns X positions (in px) for ports placed along a single horizontal edge and centered within nodeWidth. Algorithm: (a) compute available = nodeWidth - 2*sidePadding; (b) totalPortsWidth = portCount * portSize; (c) if totalPortsWidth >= available then clamp inter-port spacing to 0 and center the block at nodeWidth/2; (d) else spacing = (available - totalPortsWidth) / (portCount + 1) and positions = sidePadding + spacing + portSize/2 + i*(portSize + spacing) for i=0..portCount-1; (e) return positions as numbers (px offsets from left edge). Export constants DEFAULT_PORT_SIZE and DEFAULT_SIDE_PADDING alongside the function.

## 3. Code Review
- [ ] Validate algorithm handles edge cases (portCount 0, 1), uses clear variable names, has inline unit tests for the helper math (separate small tests for spacing calculation), uses TypeScript types, has JSDoc comments, and is covered by the tests from step 1.

## 4. Run Automated Tests to Verify
- [ ] Run the new unit tests (npx jest src/components/dag/__tests__/portLayout.test.ts) and confirm computePortPositions passes all table-driven cases; run coverage and assert no uncovered branches in the function logic.

## 5. Update Documentation
- [ ] Update docs/ui/dag.md to include the precise algorithm, sample input/output pairs, and note the behavior when ports exceed available width (centering the block with no inter-port spacing).

## 6. Automated Verification
- [ ] Add an automated script scripts/verify-port-layout.js that executes a canonical set of inputs, computes the mean position and spacing uniformity, and returns non-zero exit code if mean is not centered within 0.5px or spacing variance > 0.5px.
