# Task: Implement LOD-1 (Far) Epic Bounding Box Renderer with Progress Percentages (Sub-Epic: 71_Massive_Graph_LOD)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083-1-3], [7_UI_UX_DESIGN-REQ-UI-DES-056-2], [6_UI_UX_ARCH-REQ-048]

## 1. Initial Test Written
- [ ] In `packages/ui/src/components/__tests__/EpicBoundingBox.test.tsx`, write tests for the new `<EpicBoundingBox>` SVG component:
  - Test: Renders an SVG `<rect>` with correct `x`, `y`, `width`, `height` props derived from the bounding box of member task nodes.
  - Test: Renders an `<text>` label with the epic title inside the bounding box.
  - Test: Renders a `<text>` progress label in the format `"42%"` using the `progressPercent` prop (rounded to integer for display).
  - Test: Renders a circular progress radial using an SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset` computed from `progressPercent` (circumference = 2π × r where r = 20).
  - Test: When `progressPercent === 0`, stroke-dashoffset equals the full circumference (no fill).
  - Test: When `progressPercent === 100`, stroke-dashoffset equals 0 (full fill).
  - Test: The bounding box `<rect>` has `fill="none"` and uses `--vscode-editorGroup-border` for its `stroke` color.
  - Test: The component is not rendered when `showEpicBoxesOnly` is `false` (controlled by parent).
- [ ] In `packages/ui/src/components/__tests__/DAGCanvas.lod1.test.tsx`:
  - Integration test: Given `currentZoom < 0.1` and `epicSummaryDag` with 3 epics, assert that 3 `<EpicBoundingBox>` components are rendered and 0 `<DagNode>` components are rendered.
  - Integration test: After zooming to `currentZoom = 0.15`, assert that `<DagNode>` components reappear and `<EpicBoundingBox>` components disappear.

## 2. Task Implementation
- [ ] Create `packages/ui/src/components/DAGCanvas/EpicBoundingBox.tsx`:
  ```tsx
  interface EpicBoundingBoxProps {
    epic: EpicSummaryNode;
    bounds: { x: number; y: number; width: number; height: number };
  }
  // Renders:
  // 1. A <rect> for the bounding box outline (no fill, dashed stroke using --vscode-editorGroup-border)
  // 2. An epic title <text> (top-left of box, 14px, --vscode-foreground)
  // 3. A circular progress radial SVG (<circle> with stroke-dasharray trick) centered in the box
  // 4. A progress percentage <text> centered inside the radial circle
  // Radial: r=20, stroke-width=4, background circle uses --vscode-progressBar-background at 0.2 opacity,
  //         progress arc uses --vscode-charts-green (or --vscode-progressBar-background at full opacity)
  ```
- [ ] Implement the `computeEpicBounds(epicId: string, taskNodes: TaskNode[]): { x, y, width, height }` utility in `packages/ui/src/utils/dagLayout.ts`. It:
  - Filters `taskNodes` by `epicId`.
  - Finds `minX`, `minY`, `maxX`, `maxY` from node positions.
  - Returns bounds with 16px padding on all sides.
  - Returns `null` if no task nodes belong to the epic.
- [ ] In `packages/ui/src/components/DAGCanvas/DAGCanvas.tsx`, in the main render:
  - If `semanticZoomResult.showEpicBoxesOnly === true`, render `epicSummaryDag.map(epic => <EpicBoundingBox epic={epic} bounds={computeEpicBounds(epic.epicId, positionedNodes)} />)` instead of individual `<DagNode>` components.
  - Guard: skip rendering `EpicBoundingBox` entries where `computeEpicBounds` returns `null`.
- [ ] Ensure `positionedNodes` (the d3-force simulation output with x/y positions) is available in scope when `showEpicBoxesOnly` is evaluated — it must be computed regardless of LOD level so bounds can be derived.

## 3. Code Review
- [ ] Verify `EpicBoundingBox` uses only `--vscode-*` CSS variable references for all colors; no hardcoded hex values.
- [ ] Confirm the circular progress radial is implemented using the `stroke-dasharray` / `stroke-dashoffset` SVG technique (not a third-party chart library).
- [ ] Verify `computeEpicBounds` handles the edge case of a single task in the epic (bounds collapse to the node's width/height + 16px padding).
- [ ] Confirm the d3-force simulation still runs in a Web Worker even in LOD-1 mode (positions are needed for bounding box computation).
- [ ] Confirm `EpicBoundingBox` has `role="img"` and `aria-label={`Epic: ${epic.epicTitle}, ${epic.progressPercent}% complete`}` for screen reader accessibility.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=EpicBoundingBox` and confirm all 8 unit tests pass.
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=DAGCanvas.lod1` and confirm both integration tests pass.
- [ ] Run `pnpm --filter @devs/ui test` (full suite) and confirm no regressions.

## 5. Update Documentation
- [ ] Add a `### EpicBoundingBox Component` section to `packages/ui/docs/dag-canvas.md` documenting: props interface, circular progress radial implementation details, and the `computeEpicBounds` utility contract (including the 16px padding rule and null-guard).
- [ ] Update `docs/agent-memory/phase_11_decisions.md` with: "LOD-1 renders `EpicBoundingBox` SVG components with `stroke-dasharray` progress radials. Bounding box padding = 16px. d3 simulation runs regardless of LOD level."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui test:ci` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/ui build` and confirm zero TypeScript errors.
- [ ] Run `grep -n "stroke-dasharray\|stroke-dashoffset" packages/ui/src/components/DAGCanvas/EpicBoundingBox.tsx` and confirm both attributes are used.
- [ ] Run `grep -n "computeEpicBounds" packages/ui/src/utils/dagLayout.ts` to confirm the utility is implemented there.
- [ ] Run `grep -rn "aria-label" packages/ui/src/components/DAGCanvas/EpicBoundingBox.tsx` to confirm accessibility label is present.
