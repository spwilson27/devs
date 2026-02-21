# Task: Integrate Task DAG model and DagNode into DAGCanvas rendering pipeline (Sub-Epic: 68_DAG_Node_State_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-092], [6_UI_UX_ARCH-REQ-022]

## 1. Initial Test Written
- [ ] Create integration tests at `tests/ui/dag/dagcanvas.integration.spec.tsx` (Jest + React Testing Library). Write tests before implementation so they fail initially.
  - Provide a sample `TaskDagModel` fixture with 5 nodes in a small graph and edges connecting them; nodes should have mixed `state` values.
  - Tests should mount `DAGCanvas` with the model and assert:
    1. Correct number of rendered `DagNode` components (count matches `nodes.length`).
    2. Each rendered node has `data-state` matching the model node state.
    3. Each `DagNode` has computed dimensions `180x64` and internal padding `8px` (use `getByTestId`).
    4. Snapshot of the rendered canvas DOM structure.

## 2. Task Implementation
- [ ] Implement `src/ui/dag/DAGCanvas.tsx` with these specifics:
  - Accept a typed prop `model: TaskDagModel` (from `src/ui/dag/model.ts`).
  - Map `model.nodes` to `DagNode` children; pass node props including `state` and `id`.
  - Use a simple deterministic layout for initial implementation (grid layout with stable spacing) so tests are deterministic; offload advanced force layout to a separate task.
  - Ensure `DAGCanvas` renders nodes into an appropriate container (SVG group or absolutely-positioned divs) and provides `data-testid` hooks for tests.
  - Ensure minimal re-render by memoizing node renders (React.memo) and using stable keys.

## 3. Code Review
- [ ] Verify:
  - Proper separation of concerns: layout vs rendering vs model parsing.
  - Typed props (no any), minimal re-renders and good key stability.
  - No direct DOM measurements in render loop; layout deterministic for tests.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test`/`yarn test` and confirm `dagcanvas.integration.spec.tsx` passes.

## 5. Update Documentation
- [ ] Add `docs/ui/dag_integration.md` describing `DAGCanvas` API, example usage with `TaskDagModel`, and the deterministic layout algorithm used for initial rendering.

## 6. Automated Verification
- [ ] Add a CI smoke test `scripts/verify_dag_render.js` that imports `DAGCanvas`, renders it in a headless environment, and asserts node count and `data-state` attributes; run this on PRs to prevent regressions.