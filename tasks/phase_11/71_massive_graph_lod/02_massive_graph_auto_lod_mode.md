# Task: Implement Automatic LOD Mode Activation for Massive Graphs (>300 Tasks) in DAGCanvas (Sub-Epic: 71_Massive_Graph_LOD)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-025]

## 1. Initial Test Written
- [ ] In `packages/ui/src/components/__tests__/DAGCanvas.lod.test.tsx`, write the following tests using React Testing Library and a mock Zustand store:
  - Test: When rendered with `activeRenderMode === "FULL"` (taskCount ≤ 300), all node `<text>` label elements are present in the SVG.
  - Test: When rendered with `activeRenderMode === "LOD_FORCED"` (taskCount > 300), all node `<text>` label elements have CSS class `lod-label--hidden` (or are not rendered at all — document the chosen approach).
  - Test: A `<LodModeBanner>` element with `data-testid="lod-mode-banner"` is visible when `activeRenderMode === "LOD_FORCED"` and is absent otherwise.
  - Test: Zooming in (simulating `currentZoom > 0.4` via the mock store) while in `LOD_FORCED` mode re-renders labels as visible.
  - Test: The zoom-in reveal threshold is exactly `0.4` — at `zoom === 0.4` labels are hidden; at `zoom === 0.401` labels are visible.
  - Integration test: Render `DAGCanvas` with a mock dataset of 301 `TaskNode` entries; assert the `lod-mode-banner` is present without timing out (render must complete in < 2000ms using `jest.setTimeout`).

## 2. Task Implementation
- [ ] In `packages/ui/src/components/DAGCanvas/DAGCanvas.tsx`, read `activeRenderMode` and `currentZoom` from the Zustand store via `useDagLodStore(s => ({ activeRenderMode: s.activeRenderMode, currentZoom: s.currentZoom }))`.
- [ ] Define a derived boolean `labelsVisible = activeRenderMode !== "LOD_FORCED" || currentZoom > 0.4` and pass it down to the node rendering sub-components as a prop.
- [ ] In the SVG node renderer (`packages/ui/src/components/DAGCanvas/DagNode.tsx`), conditionally render the `<text>` label element only when `labelsVisible === true`. When hidden, render only the status indicator circle to maintain node clickability (minimum 24px interactive target per REQ-UI-DES-048-1).
- [ ] Create `packages/ui/src/components/DAGCanvas/LodModeBanner.tsx`:
  ```tsx
  // Renders a dismissible info bar above the DAGCanvas informing the user
  // that LOD mode is active because the graph exceeds 300 tasks.
  // Text: "Simplified view active: zoom in to reveal task labels (>300 tasks detected)."
  // Uses VSCode token: --vscode-editorInfo-foreground for text, --vscode-badge-background for background.
  ```
- [ ] Render `<LodModeBanner>` in `DAGCanvas.tsx` above the SVG element when `activeRenderMode === "LOD_FORCED"`.
- [ ] Ensure the `currentZoom` value in the Zustand store is updated by the existing `react-zoom-pan-pinch` `onTransform` callback (wire up if not already done).

## 3. Code Review
- [ ] Confirm `labelsVisible` derivation is a pure computed value — no `useEffect` or `setState` required.
- [ ] Verify `DagNode.tsx` does not import or reference any raw color values; all styling uses `--vscode-*` CSS variables or Tailwind classes mapped to those tokens.
- [ ] Confirm `LodModeBanner` uses `role="status"` and `aria-live="polite"` for accessibility.
- [ ] Verify the 24px minimum interactive target is preserved on nodes even when labels are hidden (check node `<rect>` or `<circle>` dimensions).
- [ ] Check that `DAGCanvas` does not re-render all nodes on every zoom tick — confirm the `labelsVisible` prop only changes at the 0.4 threshold, not continuously.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=DAGCanvas.lod` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/ui test -- --testPathPattern=LodModeBanner` and confirm banner render and aria tests pass.

## 5. Update Documentation
- [ ] Add a `### Massive Graph LOD Mode` subsection to `packages/ui/docs/dag-canvas.md` documenting: the 300-task threshold, the `LOD_FORCED` render mode, the 0.4 zoom reveal threshold, and the `LodModeBanner` component.
- [ ] Update `docs/agent-memory/phase_11_decisions.md` with: "DAGCanvas label-reveal zoom threshold in LOD_FORCED mode: `currentZoom > 0.4`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/ui test:ci` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/ui build` and confirm zero TypeScript errors.
- [ ] Run `grep -n "LOD_FORCED" packages/ui/src/components/DAGCanvas/DAGCanvas.tsx` to confirm the guard is implemented.
- [ ] Run `grep -n "lod-mode-banner" packages/ui/src/components/DAGCanvas/LodModeBanner.tsx` to confirm `data-testid` attribute is present.
