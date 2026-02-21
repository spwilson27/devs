# Task: Implement d3 Zoom-to-Center Transition (Sub-Epic: 53_Interaction_Highlighting)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055-2]

## 1. Initial Test Written
- [ ] Create an integration test at src/components/DAG/__tests__/DAGCanvas.zoom.test.tsx:
  - Mount DAGCanvas with an svgRef and mock d3-zoom (jest.mock('d3-zoom')).
  - Simulate selecting a node (via setSelectedNode or fireEvent.click).
  - Assert that svg.transition().duration was called with 500 and that the zoom.transform call was invoked with a transform that recenters the selected node in the viewport (allow numeric tolerance for floats).

## 2. Task Implementation
- [ ] Add helper src/components/DAG/zoomHelpers.ts (or .js):
  - export const CENTER_TRANSITION_MS = 500;
  - export function centerNode(svgElement: SVGElement, nodePoint: {x:number,y:number}, duration = CENTER_TRANSITION_MS) { /* compute viewport center, compute translate/scale, call d3.zoomIdentity.translate(tx,ty).scale(s) and svg.transition().duration(duration).call(zoom.transform, transform); */ }
- [ ] In DAGCanvas, subscribe to selectedNodeId changes and call centerNode(svgRef.current, nodePosition, CENTER_TRANSITION_MS).
- [ ] Respect reduced-motion: if prefers-reduced-motion is set, set transform immediately without transition.
- [ ] Add unit helper functions for computing target translate/scale so they can be tested in isolation.

## 3. Code Review
- [ ] Verify centering math across different viewport sizes and scales.
- [ ] Confirm transition duration is the exported constant and set to 500ms.
- [ ] Ensure no forced synchronous layout reads are done in tight loops; cache measurements where possible.

## 4. Run Automated Tests to Verify
- [ ] Run the integration/unit test: npm test -- --testPathPattern=DAGCanvas.zoom.test.tsx and ensure green.

## 5. Update Documentation
- [ ] Document the centerNode API and include example usage in docs/ui/interaction_highlighting.md and reference the CENTER_TRANSITION_MS constant.

## 6. Automated Verification
- [ ] Run jest with d3 mocked and assert the mocked zoom.transform was called with expected arguments (use numeric tolerance checks).

Commit notes: open PR with zoomHelpers, DAGCanvas subscription wiring, tests, and documentation; include Co-authored-by trailer.
