# Task: Implement LOD-3 (Close) Full-Detail DAG Node Renderer (Sub-Epic: 70_DAG_LOD_Scaling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083-1], [7_UI_UX_DESIGN-REQ-UI-DES-083-1-1]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/__tests__/DagNodeLod3.test.tsx`, write unit tests using React Testing Library for a `DagNodeLod3` component:
  - Test that the task title is rendered inside a `<text>` or `<div>` element with the correct selector.
  - Test that at least one requirement tag badge (e.g., `[REQ-001]`) is rendered when `requirementIds` prop is a non-empty array.
  - Test that zero requirement tag badges are rendered when `requirementIds` is an empty array.
  - Test that the agent status icon (Codicon class) is rendered for each of the node states: `PENDING`, `IN_PROGRESS`, `SUCCESS`, `FAILED`, `BLOCKED`.
  - Test that the node outer container renders with `data-lod="LOD3_CLOSE"` attribute for external testability.
  - Test that the node dimensions are exactly `180px` wide and `64px` tall (matching `7_UI_UX_DESIGN-REQ-UI-DES-046-1`).
  - Test that the component does NOT render when passed an undefined or null task prop (returns `null` gracefully).
- [ ] In `packages/vscode/src/webview/components/__tests__/DagNodeLod3.test.tsx`, add snapshot tests:
  - Snapshot for `PENDING` state with two requirement IDs.
  - Snapshot for `IN_PROGRESS` state with no requirement IDs.
  - Snapshot for `FAILED` state with one requirement ID.

## 2. Task Implementation
- [ ] Define the `DagTaskNode` data type in `packages/vscode/src/webview/types/dag.ts` (if not already present):
  ```typescript
  export type DagNodeStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'SKIPPED';

  export interface DagTaskNode {
    id: string;
    title: string;
    status: DagNodeStatus;
    requirementIds: string[];
    agentType?: 'developer' | 'reviewer' | 'architect';
  }
  ```
- [ ] Create `packages/vscode/src/webview/components/DagNodeLod3.tsx`:
  - Props: `{ node: DagTaskNode; x: number; y: number; onSelect: (id: string) => void }`.
  - Root element: `<g>` (SVG group) positioned via `transform={translate(${x}, ${y})}` for use inside an SVG DAGCanvas.
  - Render an SVG `<rect>` with `width={180}` `height={64}` `rx={4}` `ry={4}` styled using `var(--vscode-editor-background)` for fill and `var(--vscode-panel-border)` for stroke — no hardcoded hex colors.
  - Render the task `title` using an SVG `<text>` element at `x=8` `y=20` using the VSCode font variable `var(--vscode-font-family)` at `13px` (Body size per `7_UI_UX_DESIGN-REQ-UI-DES-033-4`).
  - Render requirement tag badges: for each `requirementId` in `node.requirementIds`, render a `<text>` element styled as `var(--vscode-descriptionForeground)` at `11px` (Metadata size per `7_UI_UX_DESIGN-REQ-UI-DES-033-6`), listed vertically below the title starting at `y=36`.
  - Render the agent status Codicon by mapping `DagNodeStatus` to a Codicon class:
    - `PENDING` → `codicon-clock`
    - `IN_PROGRESS` → `codicon-sync~spin`
    - `SUCCESS` → `codicon-check`
    - `FAILED` → `codicon-error`
    - `BLOCKED` → `codicon-circle-slash`
    - `SKIPPED` → `codicon-dash`
  - Render the status icon in the top-right of the node at `x=156` `y=12` using a `<foreignObject>` element hosting a `<span className={`codicon ${codiconClass}`}>` element.
  - Attach `data-lod="LOD3_CLOSE"` and `data-node-id={node.id}` to the root `<g>` element.
  - Wire `onClick` on the `<g>` element to call `onSelect(node.id)`.
- [ ] Create a status-to-color mapping helper in the same file (not exported separately) that maps `DagNodeStatus` to a VSCode semantic color variable for the status icon foreground:
  - `PENDING` → `var(--vscode-foreground)`
  - `IN_PROGRESS` → `var(--vscode-progressBar-background)`
  - `SUCCESS` → `var(--vscode-testing-iconPassed)`
  - `FAILED` → `var(--vscode-testing-iconFailed)`
  - `BLOCKED` → `var(--vscode-editorWarning-foreground)`
  - `SKIPPED` → `var(--vscode-disabledForeground)`
- [ ] Export `DagNodeLod3` from `packages/vscode/src/webview/components/index.ts`.

## 3. Code Review
- [ ] Verify that **zero** hardcoded hex color values (`#`, `rgb(`, `hsl(`) exist in `DagNodeLod3.tsx` — all colors must use `var(--vscode-*)` tokens.
- [ ] Verify the node `<rect>` uses `width={180}` and `height={64}` (matching `7_UI_UX_DESIGN-REQ-UI-DES-046-1`) and `rx={4}` (matching `7_UI_UX_DESIGN-REQ-UI-DES-047-1`).
- [ ] Verify the `onSelect` callback is wired to `onClick` and `onKeyDown` (Enter/Space) on the `<g>` element for keyboard accessibility (matching `6_UI_UX_ARCH-REQ-100`); the `<g>` must have `role="button"` and `tabIndex={0}`.
- [ ] Verify the requirement tag badges do not overflow the node boundary — if `requirementIds.length > 2`, truncate with ellipsis `…` rather than overflowing.
- [ ] Verify TypeScript strict mode compliance: no `any`, all props typed via the `DagTaskNode` interface.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DagNodeLod3"` and confirm all unit and snapshot tests pass.
- [ ] Run `pnpm --filter @devs/vscode tsc --noEmit` to confirm no TypeScript errors.

## 5. Update Documentation
- [ ] Add a `### DagNodeLod3 Component` section to `packages/vscode/src/webview/DAGCanvas.agent.md`:
  - Document the props interface.
  - Document the VSCode token mapping for each `DagNodeStatus`.
  - Document the Codicon class mapping for each `DagNodeStatus`.
  - Note the 180×64px fixed size constraint and the 4px border radius from design requirements.
- [ ] Update `packages/vscode/src/webview/components/DagNodeLod3.tsx` with a JSDoc block at the top referencing requirement IDs `7_UI_UX_DESIGN-REQ-UI-DES-083-1-1`, `7_UI_UX_DESIGN-REQ-UI-DES-046-1`, `7_UI_UX_DESIGN-REQ-UI-DES-047-1`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="DagNodeLod3"` and confirm line coverage for `DagNodeLod3.tsx` is **≥ 90%**.
- [ ] Run `grep -n "#\|rgb(\|hsl(" packages/vscode/src/webview/components/DagNodeLod3.tsx` and confirm the output is **empty** (zero hardcoded color values).
- [ ] Run `grep -n 'data-lod="LOD3_CLOSE"' packages/vscode/src/webview/components/DagNodeLod3.tsx` and confirm exactly **one** match exists on the root `<g>` element.
