# Task: Compact DAG Visualization for Sidebar (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [4_USER_FEATURES-REQ-006], [7_UI_UX_DESIGN-REQ-UI-DES-094]

## 1. Initial Test Written
- [ ] Add unit tests at packages/webview/src/components/__tests__/MiniDag.test.tsx that mount the compact DAG component with a small graph and assert:
  - The component renders expected number of node SVG elements and edge paths.
  - Nodes render with correct dimensions (node width ~ 60-120 px in sidebar) and positions are deterministic given the input graph.
  - Interaction tests: clicking a node emits `onNodeSelect(nodeId)`; hovering a node highlights incident edges.

## 2. Task Implementation
- [ ] Implement MiniDag component at packages/webview/src/components/MiniDag.tsx using SVG for rendering:
  - Use a deterministic layout algorithm (simple topological layering or stable force layout with fixed seed) to compute node positions for the compact view.
  - Render nodes as small rounded rects with status color, and render edges as thin paths (1px) with simple arrowheads.
  - Provide two rendering modes: `compact` (for narrow sidebars) and `expanded` (for wider views). `compact` removes labels and shows only status dots.
  - Memoize render nodes and edges; if graph size > 150 nodes provide a canvas fallback that renders a static snapshot for performance.

## 3. Code Review
- [ ] Verify SVG uses separate layers (edges behind nodes) and nodes use <g> groups for hit areas.
- [ ] Verify avoid expensive DOM updates: use requestAnimationFrame for animations and debounce layout recalculations.
- [ ] Verify fallback to canvas is tested and quality degrades gracefully.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/components/__tests__/MiniDag.test.tsx` and confirm tests pass.

## 5. Update Documentation
- [ ] Document the MiniDag API in docs/components.md including shape of graph JSON: { nodes: [{id,title,status}], edges: [{from,to}] } and recommended node dimensions for sidebar.

## 6. Automated Verification
- [ ] Add a CI script that mounts MiniDag with a generated 300-node graph and verifies render finishes without throwing and reports a basic render time metric into CI logs.
