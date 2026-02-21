# Task: Implement SVG Layering Base Structure for DAGCanvas (Sub-Epic: 65_DAG_Layering_Strategy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-045-2]

## 1. Initial Test Written
- [ ] Create a unit test at webview/src/components/DAGCanvas/__tests__/01_svg_base_layers.test.tsx using React Testing Library + Vitest/Jest:
  - Mount the DAGCanvas with a deterministic mock DAG (5 nodes, 4 edges).
  - Assert presence and DOM order of these elements:
    - `<svg data-testid="dag-canvas">`
    - `<g data-layer="background">`
    - `<g data-layer="edges">`
    - `<g data-layer="nodes">`
    - `<g data-layer="labels">`
    - `<g data-layer="overlays">`
  - Check z-order: container.querySelectorAll('g[data-layer]') returns groups in the above order.
  - Verify separation: adding/removing a node should only mutate the nodes (or labels) layer DOM nodes, not the entire SVG tree (use MutationObserver or jest.spyOn to assert minimal DOM churn).

## 2. Task Implementation
- [ ] Implement the base layering system in DAGCanvas:
  - Create/modify `webview/src/components/DAGCanvas/DAGCanvas.tsx` to render a top-level `<svg data-testid="dag-canvas" role="img" aria-label="Task DAG">`.
  - Inside the SVG, create five `<g>` elements in the exact z-order with attributes `data-layer="background|edges|nodes|labels|overlays"` and `data-testid` hooks for tests.
  - Delegate rendering responsibilities: `EdgeLayer` renders into edges `<g>`; `NodeLayer` into nodes `<g>`; `LabelLayer` into labels `<g>`.
  - Expose an imperative ref or hook (e.g., `useDAGLayersRef`) that exposes targeted update methods `updateEdges(edges)`, `updateNodes(nodes)`, `updateLabels(labels)` to allow selective DOM updates without remounting the entire SVG.
  - Use `React.memo` for subcomponents and stable keys (`node.id` / `edge.id`).
  - Ensure no layout (d3-force) calculations occur synchronously during render; layer creation must be cheap.

## 3. Code Review
- [ ] During self-review verify:
  - Layer elements exist and are in the required order and have correct `data-layer` names.
  - Subcomponents are memoized and use stable props (avoid inline object/array props which cause re-renders).
  - No synchronous layout work executes in render functions.
  - Accessibility: SVG has role and appropriate `aria-label`; layers don't expose unnecessary interactive roles.

## 4. Run Automated Tests to Verify
- [ ] Run the repository test runner and execute the new test file directly to iterate quickly:
  - Example: `NODE_ENV=test pnpm test webview/src/components/DAGCanvas/__tests__/01_svg_base_layers.test.tsx` (or `npm test` / `yarn test` depending on repo).
  - Confirm test passes in a CI-like headless environment.

## 5. Update Documentation
- [ ] Add or update `docs/ui/dag_layering.md` describing:
  - Layer names and z-order.
  - The public hook/ref API (`useDAGLayersRef`).
  - Rationale: separating layers reduces DOM churn and enables selective rendering.

## 6. Automated Verification
- [ ] Add `scripts/verify-svg-layers.js`:
  - Node script using JSDOM to mount the compiled `DAGCanvas` component and assert layers presence and correct order.
  - Add a CI step to run `node scripts/verify-svg-layers.js` and fail CI if verification fails.
