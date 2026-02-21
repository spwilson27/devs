# Task: Implement Semantic Zoom Thresholds for DAG Node Detail Suppression (Sub-Epic: 71_Massive_Graph_LOD)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-056-2], [7_UI_UX_DESIGN-REQ-UI-DES-083-1-3]

## 1. Initial Test Written
- [ ] In `packages/ui/src/hooks/__tests__/useSemanticZoom.test.ts`, write unit tests for a `useSemanticZoom(zoom: number)` hook:
  - Test: `zoom = 1.0` → returns `{ lodLevel: "LOD_3", showLabels: true, showReqBadges: false, showEpicBoxesOnly: false }`.
  - Test: `zoom = 0.4` → returns `{ lodLevel: "LOD_2", showLabels: false, showReqBadges: true, showEpicBoxesOnly: false }`.
  - Test: `zoom = 0.39` → returns `{ lodLevel: "LOD_2", showLabels: false, showReqBadges: true, showEpicBoxesOnly: false }`.
  - Test: `zoom = 0.1` → returns `{ lodLevel: "LOD_2", showLabels: false, showReqBadges: true, showEpicBoxesOnly: false }` (boundary — at exactly 0.1 individual tasks are still shown).
  - Test: `zoom = 0.09` → returns `{ lodLevel: "LOD_1", showLabels: false, showReqBadges: false, showEpicBoxesOnly: true }`.
  - Test: `zoom = 0.0` → returns `{ lodLevel: "LOD_1", showLabels: false, showReqBadges: false, showEpicBoxesOnly: true }`.
- [ ] In `packages/ui/src/components/__tests__/DagNode.semanticZoom.test.tsx`:
  - Test: When `showLabels: false` and `showReqBadges: true`, the node renders REQ-ID badge `<span data-testid="req-badge">` instead of the task title.
  - Test: When `showEpicBoxesOnly: true`, `DagNode` renders `null` (individual task nodes are not rendered at all).
  - Test: When `showLabels: true`, the task title `<text>` element is present and the REQ-ID badge is absent.

## 2. Task Implementation
- [ ] Create `packages/ui/src/hooks/useSemanticZoom.ts`:
  ```ts
  // Thresholds (from REQ-UI-DES-056-2):
  //   zoom >= 0.4 → LOD_3 (full labels)
  //   zoom >= 0.1 && zoom < 0.4 → LOD_2 (REQ-ID badges, no titles)
  //   zoom < 0.1 → LOD_1 (Epic bounding boxes only)
  const LOD_2_THRESHOLD = 0.4;
  const LOD_1_THRESHOLD = 0.1;

  export function useSemanticZoom(zoom: number): SemanticZoomResult { ... }
  ```
- [ ] Export the `SemanticZoomResult` type from `packages/ui/src/types/dag.ts`:
  ```ts
  interface SemanticZoomResult {
    lodLevel: 'LOD_1' | 'LOD_2' | 'LOD_3';
    showLabels: boolean;
    showReqBadges: boolean;
    showEpicBoxesOnly: boolean;
  }
  ```
- [ ] Export threshold constants `LOD_2_THRESHOLD = 0.4` and `LOD_1_THRESHOLD = 0.1` from `packages/ui/src/constants/dag.ts` so they can be referenced in tests and components without magic numbers.
- [ ] In `packages/ui/src/components/DAGCanvas/DagNode.tsx`, accept `semanticZoom: SemanticZoomResult` as a prop:
  - If `semanticZoom.showEpicBoxesOnly === true`, return `null`.
  - If `semanticZoom.showReqBadges === true`, render a compact REQ-ID badge (`<span className="req-badge" data-testid="req-badge">{node.primaryReqId}</span>`) in place of the full title text.
  - If `semanticZoom.showLabels === true`, render the full task title as a `<text>` SVG element.
- [ ] In `packages/ui/src/components/DAGCanvas/DAGCanvas.tsx`:
  - Call `useSemanticZoom(currentZoom)` to get `semanticZoomResult`.
  - Pass `semanticZoom={semanticZoomResult}` to each `<DagNode>` instance during the render loop.

## 3. Code Review
- [ ] Confirm threshold constants are defined in `packages/ui/src/constants/dag.ts` and imported — no magic numbers (`0.4`, `0.1`) appear in component files.
- [ ] Verify `useSemanticZoom` is a pure function (no hooks internally, just computation from the `zoom` argument) — its only input is the current zoom scalar.
- [ ] Confirm `DagNode` does not subscribe to the Zustand store directly; it receives `semanticZoom` purely via props (unidirectional data flow).
- [ ] Check that the REQ-ID badge uses `--vscode-badge-foreground` and `--vscode-badge-background` tokens, not hardcoded colors.
- [ ] Verify no existing tests for `DagNode` are broken by the new `semanticZoom` prop (add a default value or update snapshots as needed).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=useSemanticZoom` and confirm all 6 hook tests pass.
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=DagNode.semanticZoom` and confirm all 3 component tests pass.
- [ ] Run the full UI test suite `pnpm --filter @devs/ui test` and confirm no pre-existing tests regress.

## 5. Update Documentation
- [ ] Add a `### Semantic Zoom Thresholds` section to `packages/ui/docs/dag-canvas.md`:
  - Document `LOD_3` (zoom ≥ 0.4): full labels.
  - Document `LOD_2` (0.1 ≤ zoom < 0.4): REQ-ID badges replace titles.
  - Document `LOD_1` (zoom < 0.1): individual task nodes hidden, Epic bounding boxes only.
- [ ] Update `docs/agent-memory/phase_11_decisions.md` with: "Semantic zoom thresholds: LOD_2 at zoom < 0.4 (REQ-ID badges); LOD_1 at zoom < 0.1 (Epic boxes only). Constants in `packages/ui/src/constants/dag.ts`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui test:ci` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/ui build` and confirm zero TypeScript errors.
- [ ] Run `grep -n "LOD_2_THRESHOLD\|LOD_1_THRESHOLD" packages/ui/src/constants/dag.ts` to confirm constants are defined.
- [ ] Run `grep -rn "0\.4\|0\.1" packages/ui/src/components/DAGCanvas/DagNode.tsx` and assert no matches (magic numbers must not appear in the component file).
