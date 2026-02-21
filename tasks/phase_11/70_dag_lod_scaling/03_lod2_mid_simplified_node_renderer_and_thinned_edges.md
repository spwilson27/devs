# Task: Implement LOD-2 (Mid) Simplified DAG Node Renderer with Thinned Edges (Sub-Epic: 70_DAG_LOD_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083-1], [7_UI_UX_DESIGN-REQ-UI-DES-083-1-2]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/DagNodeLod2.test.tsx`, write unit tests using React Testing Library for a `DagNodeLod2` component:
  - Test that only the task `title` is rendered — no requirement tag badges should appear in the DOM.
  - Test that the status icon is rendered as a simple filled circle (`<circle>`) — not a Codicon `<span>` — with a `data-status` attribute matching the node's status value.
  - Test the status dot color class/attribute for each status: `PENDING`, `IN_PROGRESS`, `SUCCESS`, `FAILED`, `BLOCKED`.
  - Test that the root `<g>` element carries `data-lod="LOD2_MID"`.
  - Test that the node dimensions are `180px` wide and `64px` tall (same outer bounding box as LOD-3).
  - Test that `onSelect` is called with the correct `node.id` when the node is clicked.
  - Test that the component renders `null` for an undefined `node` prop.
- [ ] In `packages/vscode/src/webview/components/__tests__/DagEdgeLod2.test.tsx`, write unit tests for a `DagEdgeLod2` component:
  - Test that the rendered SVG `<line>` or `<path>` element has `strokeWidth` of `0.5` (the thinned edge requirement).
  - Test that the edge renders with `data-lod="LOD2_MID"` on its root element.
  - Test that it correctly connects `sourceX/Y` to `targetX/Y` coordinates passed as props.
- [ ] In `packages/vscode/src/webview/components/__tests__/DagNodeLod2.test.tsx`, add snapshot tests:
  - Snapshot for `SUCCESS` state.
  - Snapshot for `IN_PROGRESS` state.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/components/DagNodeLod2.tsx`:
  - Props: `{ node: DagTaskNode; x: number; y: number; onSelect: (id: string) => void }` (reuse `DagTaskNode` from `types/dag.ts`).
  - Root element: `<g transform={translate(${x}, ${y})}` with `data-lod="LOD2_MID"` and `data-node-id={node.id}`.
  - Render the background `<rect>` with identical geometry to LOD-3 (`width={180}` `height={64}` `rx={4}`), using the same VSCode token variables (`var(--vscode-editor-background)` fill, `var(--vscode-panel-border)` stroke).
  - Render the task `title` only — a single `<text>` element at `x=8` `y=36` (vertically centered in 64px) using `var(--vscode-font-family)` at `13px`. Truncate text beyond 22 characters with an ellipsis using SVG `textLength` or a `title` tooltip attribute.
  - Render the status dot: a `<circle>` at `cx=164` `cy=32` `r=5` with `fill` set to a VSCode semantic token variable based on `node.status`:
    - `PENDING` → `var(--vscode-foreground)` (opacity 0.4)
    - `IN_PROGRESS` → `var(--vscode-progressBar-background)`
    - `SUCCESS` → `var(--vscode-testing-iconPassed)`
    - `FAILED` → `var(--vscode-testing-iconFailed)`
    - `BLOCKED` → `var(--vscode-editorWarning-foreground)`
    - `SKIPPED` → `var(--vscode-disabledForeground)`
  - Attach `data-status={node.status}` to the `<circle>` for test selectability.
  - Wire `onClick` and `onKeyDown` (Enter/Space) on the root `<g>` with `role="button"` and `tabIndex={0}` calling `onSelect(node.id)`.
  - Do NOT render `requirementIds` — this is the defining simplification of LOD-2.
- [ ] Create `packages/vscode/src/webview/components/DagEdgeLod2.tsx`:
  - Props: `{ id: string; sourceX: number; sourceY: number; targetX: number; targetY: number }`.
  - Render a single SVG `<line>` element:
    - `x1={sourceX}` `y1={sourceY}` `x2={targetX}` `y2={targetY}`
    - `strokeWidth={0.5}` — this is the key LOD-2 visual differentiator per `7_UI_UX_DESIGN-REQ-UI-DES-083-1-2`.
    - `stroke="var(--vscode-panel-border)"`.
    - `data-lod="LOD2_MID"` and `data-edge-id={id}`.
  - Keep the component minimal — no arrowhead markers or animation at this LOD level.
- [ ] Create a `useDagNodeRenderer` hook in `packages/vscode/src/webview/hooks/useDagNodeRenderer.ts` that, given the current `LodLevel` from the Zustand store, returns the correct node and edge component references:
  ```typescript
  import { LOD_LEVEL } from '../types/dag';
  import { DagNodeLod3 } from '../components/DagNodeLod3';
  import { DagNodeLod2 } from '../components/DagNodeLod2';
  // LOD1 will be added in a subsequent task

  export function useDagNodeRenderer(lodLevel: LodLevel) {
    return useMemo(() => ({
      NodeComponent: lodLevel === LOD_LEVEL.LOD3_CLOSE ? DagNodeLod3 : DagNodeLod2,
      edgeStrokeWidth: lodLevel === LOD_LEVEL.LOD3_CLOSE ? 1 : 0.5,
    }), [lodLevel]);
  }
  ```
  - Note: LOD-1 (Far) renderer selection will be wired in a subsequent task; use `DagNodeLod2` as fallback for now.
- [ ] Export `DagNodeLod2`, `DagEdgeLod2`, and `useDagNodeRenderer` from their respective barrel `index.ts` files.

## 3. Code Review
- [ ] Verify that `DagNodeLod2` contains **no** `requirementIds` rendering logic — requirement tags must be completely absent from the output.
- [ ] Verify `DagEdgeLod2` has `strokeWidth={0.5}` as a literal prop, not a variable — this is a fixed design specification.
- [ ] Verify **zero** hardcoded hex or RGB colors in both `DagNodeLod2.tsx` and `DagEdgeLod2.tsx`.
- [ ] Verify the `useDagNodeRenderer` hook is pure and memoized — it must not cause re-renders when `lodLevel` has not changed.
- [ ] Verify both components carry the `data-lod="LOD2_MID"` attribute on their root SVG elements.
- [ ] Verify TypeScript strict mode compliance: no `any`, all props use the shared `DagTaskNode` interface from `types/dag.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DagNodeLod2|DagEdgeLod2"` and confirm all unit and snapshot tests pass.
- [ ] Run `pnpm --filter @devs/vscode tsc --noEmit` to confirm no TypeScript errors.

## 5. Update Documentation
- [ ] Add a `### DagNodeLod2 Component` section and a `### DagEdgeLod2 Component` section to `packages/vscode/src/webview/DAGCanvas.agent.md`:
  - Document the simplification rationale: requirement tags are suppressed to reduce visual noise at mid-zoom.
  - Document the `strokeWidth={0.5}` edge thinning rule and its source requirement `7_UI_UX_DESIGN-REQ-UI-DES-083-1-2`.
  - Document the status dot color mapping using VSCode token variables.
  - Document the `useDagNodeRenderer` hook interface and how it selects between LOD-2 and LOD-3 renderers.
- [ ] Update `packages/vscode/src/webview/components/DagNodeLod2.tsx` and `DagEdgeLod2.tsx` with JSDoc blocks referencing `7_UI_UX_DESIGN-REQ-UI-DES-083-1-2` and `7_UI_UX_DESIGN-REQ-UI-DES-083-1`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="DagNodeLod2|DagEdgeLod2"` and confirm line coverage for both files is **≥ 90%**.
- [ ] Run `grep -n "requirementIds\|REQ-" packages/vscode/src/webview/components/DagNodeLod2.tsx` and confirm the output is **empty** (no requirement tag rendering at LOD-2).
- [ ] Run `grep -n "strokeWidth" packages/vscode/src/webview/components/DagEdgeLod2.tsx` and confirm the value `0.5` appears exactly once.
- [ ] Run `grep -n "#\|rgb(\|hsl(" packages/vscode/src/webview/components/DagNodeLod2.tsx packages/vscode/src/webview/components/DagEdgeLod2.tsx` and confirm the output is **empty**.
