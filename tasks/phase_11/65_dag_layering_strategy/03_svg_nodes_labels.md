# Task: Implement Node & Label Rendering Strategy in nodes and labels layers (Sub-Epic: 65_DAG_Layering_Strategy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045-2]

## 1. Initial Test Written
- [ ] Create tests at `webview/src/components/DAGCanvas/__tests__/03_nodes_labels.test.tsx`:
  - Assert `NodeLayer` creates node DOM elements (group + rect) inside `data-layer="nodes"` and `LabelLayer` creates `<text>` elements inside `data-layer="labels"`.
  - Verify that clicking a node element triggers the selection callback with the correct node id.
  - Verify that updating node state does not force a full re-render of labels (measure mutation counts or use spies).

## 2. Task Implementation
- [ ] Implement `NodeLayer.tsx` and `LabelLayer.tsx`:
  - Node elements should be lightweight (`<g data-node-id=...><rect/></g>`), and labels should live in a separate `labels` layer.
  - For labels implement a virtualization strategy:
    - If `nodeCount < LABEL_VIRTUALIZE_THRESHOLD` (configurable, default e.g., 200), render labels as SVG `<text>`.
    - If `nodeCount >= LABEL_VIRTUALIZE_THRESHOLD`, render a reduced set of labels (focused/filtered) as DOM and the remainder as simplified markers or merged canvas/text rendering to reduce DOM cost.
  - Keep pointer event targets on the `nodes` layer; set `pointer-events: none` on labels to avoid duplicate events and route interactions through nodes.
  - Expose selection and focus APIs as props and ensure keyboard navigation hooks integrate with accessible semantics.

## 3. Code Review
- [ ] Verify:
  - Node and Label layers are decoupled and updates to labels do not cause node re-renders.
  - Virtualization threshold is configurable and documented.
  - Interactions remain accessible (aria attributes, keyboard focus) despite virtualization.

## 4. Run Automated Tests to Verify
- [ ] Run tests and run a local render with 1000 nodes to manually verify responsiveness and selection fidelity.

## 5. Update Documentation
- [ ] Update `docs/ui/dag_layering.md` with Node/Label layering rules, virtualization strategy, and configuration.

## 6. Automated Verification
- [ ] Add `scripts/verify-nodes-labels.js` to simulate selection and label virtualization behavior in a headless environment and assert correctness.
