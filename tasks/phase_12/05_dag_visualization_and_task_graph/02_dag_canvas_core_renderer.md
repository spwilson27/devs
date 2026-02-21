# Task: DAGCanvas Core Renderer — React Flow Integration, Node/Edge Rendering, and Pan/Zoom (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [1_PRD-REQ-UI-006]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGCanvas.test.tsx`, write React Testing Library unit tests:
  - Renders without error when passed an empty `nodes` and `edges` array.
  - Renders the correct number of node elements when given a list of `UITaskNode` objects (verify via `data-testid="dag-node-{id}"`).
  - Renders edge connector elements between nodes (verify via `data-testid="dag-edge-{id}"`).
  - When a node is clicked, `useDagStore.selectNode` is called with the correct node ID.
  - Pan and zoom controls are present in the DOM (ReactFlow default controls or custom ones with `data-testid="dag-zoom-in"`, `data-testid="dag-zoom-out"`, `data-testid="dag-fit-view"`).
- [ ] Write a Vitest test in `packages/webview-ui/src/components/dag/__tests__/dagLayout.test.ts` for the `computeDagLayout(nodes, edges, epics)` Web Worker helper:
  - Given 3 nodes forming a linear chain (A→B→C), positions are assigned such that `node_A.x < node_B.x < node_C.x` (or y-axis equivalent for a top-down layout).
  - Given an empty input, returns an empty positions map without throwing.
  - Given a single isolated node, returns a single position entry.

## 2. Task Implementation

- [ ] Install `reactflow` (version pinned to `^11.x`) as a dependency in `packages/webview-ui/package.json` via `pnpm add reactflow`.
- [ ] Create `packages/webview-ui/src/components/dag/dagLayout.worker.ts` as a Web Worker (Vite worker import syntax) that:
  - Accepts a `{ nodes: UITaskNode[], edges: UITaskEdge[], epics: UIEpic[] }` message.
  - Runs a Dagre (`dagre` npm package) layout algorithm to compute `{ id, x, y }` positions for each node.
  - Posts back `{ positions: Record<string, { x: number, y: number }> }`.
  - Uses `dagre.graphlib.Graph` with `rankdir: 'LR'` (left-to-right) and `nodesep: 80`, `ranksep: 120`.
- [ ] Create `packages/webview-ui/src/components/dag/useDagLayout.ts` — a custom React hook that:
  - Instantiates the `dagLayout.worker.ts` web worker via `useMemo`.
  - Subscribes to `useDagStore` for `nodes`, `edges`, `epics`.
  - Sends a layout computation message to the worker whenever inputs change.
  - Returns `{ layoutNodes: Node[], layoutEdges: Edge[] }` in React Flow's format, merging computed positions.
  - Terminates the worker on unmount.
- [ ] Create `packages/webview-ui/src/components/dag/DAGCanvas.tsx`:
  - Uses `<ReactFlow>` with `nodes` and `edges` from `useDagLayout`.
  - Passes `onNodeClick={(_, node) => useDagStore.getState().selectNode(node.id)}`.
  - Renders `<Background variant="dots">`, `<Controls>`, and `<MiniMap>` sub-components from ReactFlow.
  - Wraps `<ReactFlow>` in a `<ReactFlowProvider>` at this component boundary.
  - Applies `data-testid="dag-canvas"` to the root `<div>`.
  - Node elements render a custom `DAGTaskNode` sub-component (see task 03 for Epic clustering styling).
  - Edge elements render with `type="smoothstep"` and default grey stroke (`var(--vscode-editorWidget-border)`).
- [ ] Create `packages/webview-ui/src/components/dag/DAGTaskNode.tsx` — a minimal custom React Flow node:
  - Displays `node.data.title` and a status badge using `node.data.status` (colored dot: pending=grey, in_progress=blue, done=green, blocked=orange, failed=red using VSCode CSS variables).
  - Sets `data-testid={`dag-node-${node.id}`}` on root element.
  - Dimensions: `min-width: 180px`, `padding: 8px 12px`, styled with Tailwind classes under the Shadow DOM prefix.

## 3. Code Review

- [ ] Confirm `dagLayout.worker.ts` is imported using the Vite `?worker` suffix pattern (`import DagLayoutWorker from './dagLayout.worker?worker'`), avoiding main-thread blocking for 200+ node graphs.
- [ ] Verify `useDagLayout` terminates the worker in a `useEffect` cleanup function to prevent memory leaks.
- [ ] Ensure `DAGCanvas.tsx` does NOT maintain its own local node/edge state — all state reads must go through `useDagStore` to keep a single source of truth.
- [ ] Confirm `DAGTaskNode.tsx` uses only `var(--vscode-*)` CSS variables for colors, not hardcoded hex values.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DAGCanvas|dagLayout"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` with zero type errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/dag/DAGCanvas.agent.md` documenting: component contract (props, store dependencies), layout algorithm choice (Dagre LR), and Web Worker offloading rationale.
- [ ] Create `packages/webview-ui/src/components/dag/dagLayout.worker.agent.md` documenting: message interface (input/output shape), algorithm parameters, and how to adjust `nodesep`/`ranksep` for visual tuning.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="DAGCanvas|dagLayout"` and confirm ≥ 85% coverage on `DAGCanvas.tsx`, `DAGTaskNode.tsx`, and `useDagLayout.ts`.
- [ ] Run `pnpm --filter @devs/webview-ui build` and verify the output bundle contains the worker chunk (`dagLayout.worker-*.js`) in the `dist/` directory via `ls dist/ | grep -i worker`.
- [ ] Launch the webview in VSCode Extension Development Host and verify the DAG canvas renders, pans, and zooms without console errors.
