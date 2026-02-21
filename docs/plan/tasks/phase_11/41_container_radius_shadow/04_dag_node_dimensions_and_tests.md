# Task: Implement DAG node dimensions, padding, and edge metrics (Sub-Epic: 41_Container_Radius_Shadow)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046]

## 1. Initial Test Written
- [ ] Create a unit test at tests/ui/dag-node.spec.tsx (React Testing Library) that:
  - Renders the DAG Node component (the visual node used in DAGCanvas) in isolation.
  - Asserts the node's bounding box measures roughly 180px width and 64px height (either via getBoundingClientRect in a headless browser or by asserting the style attributes/className that set width/height).
  - Asserts the internal content padding equals 8px (inspect style or computed style where possible).
  - Asserts the node's edge stroke/weight is represented by the correct class or inline style (1px for normal, 2.5px for heavy edges if applicable).

Write this test before implementing changes so it fails initially.

## 2. Task Implementation
- [ ] Update the DAG Node component source (e.g., src/ui/components/DAGNode.tsx or src/ui/dag/Node.tsx):
  - Enforce node size using token-driven CSS: width: 180px; height: 64px; padding: 8px (prefer class-based utilities or CSS variables defined earlier).
  - Ensure the node layout uses box-sizing: border-box to keep padding inside the specified dimensions.
  - Ensure edge rendering code uses a configurable strokeWidth property; default strokeWidth for standard edges should be 1px and for emphasized edges 2.5px.
- [ ] Add unit tests and small integration test that renders a minimal DAGCanvas with a single node and single edge to verify visual layout does not overflow and edge attaches at the expected port position.

## 3. Code Review
- [ ] Verify:
  - The node uses tokens / variables for size and padding (no magic numbers in components).
  - The layout accounts for DPI/scaling and does not break on zoom.
  - Edge drawing code is decoupled from node render logic and is testable in isolation.

## 4. Run Automated Tests to Verify
- [ ] Run the unit tests added in step 1: npm test tests/ui/dag-node.spec.tsx and ensure they pass.
- [ ] Run any small integration story (Storybook snapshot or headless browser test) that mounts a single-node DAG and verify layout programmatically using boundingClientRect assertions.

## 5. Update Documentation
- [ ] Update docs/ui/dag.md with:
  - The canonical node size and padding values and rationale.
  - Guidance for edge stroke choices and how to use strokeWidth prop.
  - Examples showing how to create LOD variants if needed.

## 6. Automated Verification
- [ ] Add a headless render script scripts/verify-node-metrics.js that mounts the node in a headless chromium (Playwright) and fails if measured boundingClientRect differs from the spec by more than a small tolerance (±2px).
