# Task: Epic Clustering — Bounding Box Grouping Visualization on DAG Canvas (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-093-1]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/dag/__tests__/EpicBoundingBox.test.tsx`, write unit tests:
  - Given an epic with 3 child task node positions, `computeEpicBoundingBox(positions, taskIds, padding)` returns a rect `{ x, y, width, height }` that fully contains all child node rects with the specified padding.
  - When padding is 20px, the returned `x` equals `min(childX) - 20` and `y` equals `min(childY) - 20`.
  - Renders an `<EpicBoundingBox>` component with `data-testid="epic-box-{epicId}"` in the DOM.
  - The component renders the epic name as a label at the top-left corner of the box.
  - When `useDagStore.epics` is empty, no bounding boxes are rendered.
- [ ] In `packages/webview-ui/src/components/dag/__tests__/EpicBoundingBoxLayer.test.tsx`:
  - Renders one `<EpicBoundingBox>` per epic in `useDagStore.epics`.
  - Each bounding box has correct `data-testid`.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/components/dag/epicBoundingBox.ts` exporting:
  ```typescript
  export interface NodeRect { x: number; y: number; width: number; height: number; }
  export function computeEpicBoundingBox(
    positions: Record<string, NodeRect>,
    taskIds: string[],
    padding?: number  // default 24px
  ): NodeRect;
  ```
  - Filters positions to only include IDs in `taskIds`.
  - Returns the union bounding rect (min x/y, max x+width / y+height) expanded by `padding`.
  - Returns `{ x: 0, y: 0, width: 0, height: 0 }` if `taskIds` is empty or no matching positions.
- [ ] Create `packages/webview-ui/src/components/dag/EpicBoundingBox.tsx` — a React component rendered as an absolutely-positioned `<div>` (or SVG `<rect>` overlaid on the ReactFlow canvas) that:
  - Receives props: `epic: UIEpic`, `rect: NodeRect`.
  - Renders a `<div>` with:
    - `position: absolute`, `left: rect.x`, `top: rect.y`, `width: rect.width`, `height: rect.height`.
    - Background: `rgba(128,128,128,0.07)` (light grey, theme-agnostic semi-transparent).
    - Border: `1px solid var(--vscode-editorGroup-border)` with `border-radius: 8px`.
    - A top-left label `<span>` rendering `epic.name` in `var(--vscode-descriptionForeground)` at `11px` font-size, uppercase, letter-spacing `0.08em`.
    - `pointer-events: none` so it does not interfere with node click events.
  - `data-testid={`epic-box-${epic.id}`}`.
- [ ] Create `packages/webview-ui/src/components/dag/EpicBoundingBoxLayer.tsx` — a component that:
  - Reads `epics` from `useDagStore`.
  - Reads the layout node positions from `useDagLayout` (via a shared context or prop from `DAGCanvas`).
  - Maps each epic to `computeEpicBoundingBox(positions, epic.taskIds)`.
  - Renders one `<EpicBoundingBox>` per epic, skipping epics with zero-area rects.
- [ ] Integrate `<EpicBoundingBoxLayer>` into `DAGCanvas.tsx` as a sibling overlay rendered inside the ReactFlow container, positioned relative to the ReactFlow viewport transform. Use ReactFlow's `useReactFlow().getNode` and `useNodes` to extract rendered node positions for bounding box calculation.

## 3. Code Review

- [ ] Verify `EpicBoundingBox.tsx` uses `pointer-events: none` — clicking through the box onto underlying task nodes must work correctly.
- [ ] Confirm the light-grey background uses a semi-transparent rgba or a CSS variable that adapts to both light and dark VSCode themes; no hardcoded light-mode-only colors.
- [ ] Verify `computeEpicBoundingBox` is a pure function with no side effects, suitable for unit testing in isolation.
- [ ] Confirm `EpicBoundingBoxLayer` re-computes only when `epics` or node positions change (not on every render), leveraging `useMemo` for bounding box calculations.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="EpicBoundingBox"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` with zero errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/dag/EpicBoundingBox.agent.md` documenting: rendering approach (CSS absolute positioning over ReactFlow canvas), the `pointer-events: none` constraint, and how `computeEpicBoundingBox` is called with ReactFlow's viewport-transformed positions.
- [ ] Update `packages/webview-ui/src/components/dag/DAGCanvas.agent.md` to note the `EpicBoundingBoxLayer` overlay integration pattern.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="EpicBoundingBox|epicBoundingBox"` and confirm ≥ 90% coverage on `epicBoundingBox.ts`.
- [ ] Load the Extension Development Host with a project having at least 2 epics. Visually confirm each epic group is surrounded by a light-grey rounded bounding box with the epic name label at the top-left.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code 0.
