# Task: Implement Dependency Flow Highlighting (Sub-Epic: 53_Interaction_Highlighting)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055-3]

## 1. Initial Test Written
- [ ] Create an integration test at src/components/DAG/__tests__/DAGCanvas.flow.test.tsx:
  - Render DAGCanvas with a small graph (nodes and edges) and provide stable ids for edge elements (data-edge-id).
  - Simulate selecting a node.
  - Assert upstream and downstream nodes receive a highlight class (e.g., 'node--highlight').
  - Assert connecting edges receive 'edge--highlight' and that their computed style.stroke matches the resolved CSS variable value for var(--devs-primary).
  - Assert highlighted edges have an animation class (e.g., 'edge--flow') that references the 'dashflow' keyframes.

## 2. Task Implementation
- [ ] In DAGCanvas (src/components/DAG/DAGCanvas.tsx or similar):
  - On selection change, call graphUtils.getUpstream/getDownstream to compute affected node and edge sets.
  - For matching SVG edge elements (use data-edge-id or stable selection), toggle a CSS class 'edge--highlight' and set data-flow-direction attribute to 'in' or 'out'.
  - Add CSS (src/components/DAG/edge.css or module):
    .edge--highlight { stroke: var(--devs-primary); stroke-width: 2.5px; stroke-dasharray: 6 6; animation: dashflow 1200ms linear infinite; }
    @keyframes dashflow { from { stroke-dashoffset: 18; } to { stroke-dashoffset: 0; } }
  - For directional flow toward the selected node, toggle animation-direction or apply a negative dashoffset start to simulate flow direction.
  - Ensure classes are removed from previously highlighted edges when selection changes.
  - Respect prefers-reduced-motion media query: disable animation and keep static color when reduced-motion is enabled.

## 3. Code Review
- [ ] Ensure highlighting uses class toggles and batched DOM updates (requestAnimationFrame) rather than per-frame style mutations.
- [ ] Confirm animations are CSS-only for best performance, and that the number of DOM writes is minimized.
- [ ] Verify visual contrast and that stroke color uses var(--devs-primary).

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- --testPathPattern=DAGCanvas.flow.test.tsx and ensure tests pass.

## 5. Update Documentation
- [ ] Update docs/ui/interaction_highlighting.md with the CSS rules, an explanation of the dashflow animation, and notes on reduced-motion handling.

## 6. Automated Verification
- [ ] Run jest followed by an optional headless Chromium script scripts/verify-edge-flow.js that loads the DAGCanvas and asserts that edge elements contain the 'edge--highlight' class and that getComputedStyle(edge).stroke yields the resolved primary color.

Commit notes: open PR implementing edge highlighting, animations, tests, and documentation; include Co-authored-by trailer.
