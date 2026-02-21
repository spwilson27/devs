# Task: Implement Keyboard Focus & Activation on DAG Canvas Roadmap Nodes (Sub-Epic: 89_Focus_Keyboard_Control)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-100]

## 1. Initial Test Written

- [ ] In `packages/vscode/src/webview/components/__tests__/DAGCanvas.test.tsx`, write the following tests using React Testing Library + `@testing-library/user-event`:
  - **Node focusability**: Render `<DAGCanvas nodes={mockNodes} edges={mockEdges} />` and assert that every rendered node element (`getByTestId('dag-node-<id>')`) has `tabIndex={0}` or `tabIndex` managed by a roving-tabindex hook.
  - **Arrow key roving focus**: Tab into the DAG canvas container, then simulate `{ArrowRight}` / `{ArrowDown}` and assert that focus moves to the next adjacent node in the graph. Simulate `{ArrowLeft}` / `{ArrowUp}` to move focus backwards.
  - **Enter key activation**: Focus a node via `userEvent.tab()`, simulate `{Enter}`, and assert the `onNodeSelect` callback is called with the correct node ID.
  - **Space key activation**: Same as above but with `{Space}`.
  - **Escape key**: When a node is focused inside the canvas, pressing `{Escape}` should return focus to the canvas container element (`role="region"` or `role="application"`).
  - **aria-activedescendant**: When a node is focused, assert the canvas container's `aria-activedescendant` attribute equals the focused node's DOM id.

## 2. Task Implementation

- [ ] Open `packages/vscode/src/webview/components/DAGCanvas.tsx`.
- [ ] Wrap the SVG/canvas element in a focusable container: `<div role="application" aria-label="Task Roadmap" tabIndex={0} ref={containerRef}>`.
- [ ] Implement a **roving tabindex** pattern for nodes:
  - All nodes start with `tabIndex={-1}` except the initially focused node which gets `tabIndex={0}`.
  - Maintain a `focusedNodeId` state value.
  - On `{ArrowRight}` / `{ArrowDown}`: advance `focusedNodeId` to the next node (using the edge list to determine adjacency, falling back to DOM order). Set the previous node's `tabIndex` to `-1`, new node's to `0`, and call `.focus()` on its DOM ref.
  - On `{ArrowLeft}` / `{ArrowUp}`: same pattern in reverse.
  - On `{Home}`: jump to the first node (source node with no incoming edges).
  - On `{End}`: jump to the last node (sink node with no outgoing edges).
- [ ] Each SVG `<g>` node element (or equivalent React wrapper) MUST have:
  - `role="button"`
  - `tabIndex={nodeId === focusedNodeId ? 0 : -1}`
  - `aria-label={`Task: ${node.title}, Status: ${node.status}`}`
  - `onKeyDown` handling `Enter` / `Space` → calls `onNodeSelect(node.id)`.
  - A `ref` so programmatic `.focus()` can be called during roving tabindex transitions.
- [ ] Update `aria-activedescendant` on the container div to track `focusedNodeId`.
- [ ] Implement the `Escape` key handler on the container to blur the active node and refocus the container itself.

## 3. Code Review

- [ ] Verify the roving tabindex never leaves ALL nodes at `tabIndex={-1}` — exactly one node must have `tabIndex={0}` at all times (or the container itself if no node is focused).
- [ ] Verify SVG `<g>` elements with `role="button"` do not duplicate focus handling from an outer `<foreignObject>` element.
- [ ] Verify `aria-activedescendant` is cleared when the user tabs away from the canvas entirely.
- [ ] Verify `onNodeSelect` is not invoked on `{Enter}` for nodes in `LOCKED` state. The node should still be focusable with a descriptive `aria-label` explaining it is locked.
- [ ] Confirm Web Worker offloading of D3-force layout does not interfere with DOM refs used for programmatic focus.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern=DAGCanvas` from the monorepo root.
- [ ] All new tests MUST pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode test` and confirm no regressions across the entire webview test suite.

## 5. Update Documentation

- [ ] Update the JSDoc on `DAGCanvas.tsx`: document the roving tabindex strategy, the `onNodeSelect` signature, and the supported keyboard shortcuts (Arrow keys, Enter, Space, Escape, Home, End).
- [ ] Add an entry to `docs/accessibility.md` under "Keyboard Navigation": "DAGCanvas uses a roving tabindex pattern. Arrow keys navigate between nodes. Enter/Space activates a node. Per [6_UI_UX_ARCH-REQ-100]."

## 6. Automated Verification

- [ ] CI pipeline step: `pnpm --filter @devs/vscode test --ci --coverage` must report DAGCanvas keyboard-interaction branch coverage ≥ 90%.
- [ ] Run `pnpm --filter @devs/vscode lint` and confirm zero `jsx-a11y` violations on DAGCanvas.
- [ ] Run Playwright E2E test: open the ROADMAP view, tab into the DAG canvas, press `{ArrowRight}` three times, press `{Enter}`, and assert the selected node's detail panel appears.
