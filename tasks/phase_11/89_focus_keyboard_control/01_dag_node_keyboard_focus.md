# Task: DAGCanvas Node Keyboard Focusability and Operability (Sub-Epic: 89_Focus_Keyboard_Control)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-100]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/components/DAGCanvas/DAGNode.test.tsx`, write unit tests using React Testing Library that verify:
  - Each rendered `<DAGNode>` SVG `<g>` element (or its wrapping `<foreignObject>` if applicable) has `tabIndex={0}` set.
  - The node receives keyboard focus when `Tab` is pressed in sequence through the canvas.
  - Pressing `Enter` on a focused node fires the `onSelect` callback (mock it) with the correct node ID.
  - Pressing `Space` on a focused node also fires the `onSelect` callback with the correct node ID.
  - Pressing `Escape` on a focused node blurs the element (calls `blur()`) and fires an optional `onDeselect` callback.
- [ ] In `packages/vscode/src/webview/components/DAGCanvas/DAGCanvas.test.tsx`, write an integration test that:
  - Renders a `DAGCanvas` with 3 mock nodes.
  - Verifies all 3 nodes are in the tab order (use `getAllByRole('button')` or `getAllByTabIndex(0)`).
  - Simulates pressing `Tab` 3 times and asserts focus moves to each node in order.
  - Simulates `Enter` keydown on the second node and asserts `onNodeSelect` was called with that node's ID.

## 2. Task Implementation
- [ ] In `packages/vscode/src/webview/components/DAGCanvas/DAGNode.tsx`:
  - Add `tabIndex={0}` to the root SVG `<g>` element (or wrapping element) of each node.
  - Add `role="button"` to the root element to expose it as an interactive element to assistive technology.
  - Add `aria-label` prop computed as `"Task node: {node.label}, status: {node.status}"` to provide a meaningful accessible name.
  - Add a `onKeyDown` handler: call `onSelect(node.id)` when `event.key === 'Enter'` or `event.key === ' '` (Space), and call `event.preventDefault()` for Space to prevent page scroll.
  - Add an `onKeyDown` handler for `Escape` that calls `(event.target as HTMLElement).blur()` and invokes `onDeselect?.(node.id)`.
  - Ensure the node's visual selected/focused state is driven by React state, not exclusively by CSS `:focus`, so programmatic focus works correctly.
- [ ] In `packages/vscode/src/webview/components/DAGCanvas/DAGCanvas.tsx`:
  - When rendering the list of nodes via D3/SVG, ensure each `<DAGNode>` receives the correct `onSelect` and `onDeselect` callback props wired to the Zustand store action (`useDevsStore.getState().selectNode`).
  - Ensure the DOM order of rendered nodes matches a logical reading order (e.g., topological sort by dependency depth) so Tab key navigation is predictable.
  - Add a `role="region"` and `aria-label="Roadmap task graph"` to the root SVG container.

## 3. Code Review
- [ ] Verify that `tabIndex={0}` is applied to each node element and not to non-interactive container elements.
- [ ] Verify that `role="button"` is present and `aria-label` is dynamically generated and non-empty for every node.
- [ ] Confirm that the `onKeyDown` handler explicitly prevents default browser behavior for `Space` to avoid accidental scrolling.
- [ ] Confirm no `tabIndex={-1}` is set on node children that would intercept focus unexpectedly.
- [ ] Check that the Zustand store action `selectNode` is correctly invoked and does not cause re-render loops (use `useCallback` for the handler).
- [ ] Verify the DOM order of nodes is topologically sorted and matches the visual layout intention.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="DAGNode|DAGCanvas"` from the repository root and confirm all new tests pass with zero failures.
- [ ] Run the full test suite for the webview package: `pnpm --filter @devs/vscode test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/vscode/src/webview/components/DAGCanvas/DAGCanvas.agent.md` (create it if it does not exist) to document:
  - The keyboard interaction model (Tab to focus nodes, Enter/Space to select, Escape to deselect).
  - The `tabIndex` and `role="button"` conventions used.
  - The topological ordering strategy for Tab order.
- [ ] Update the Phase 11 AOD file if one exists at `docs/phases/phase_11.agent.md` to note that DAGCanvas keyboard navigation is implemented.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="DAGNode|DAGCanvas"` and confirm coverage for `DAGNode.tsx` keyboard handler branches is ≥ 90%.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm the webview bundle compiles without TypeScript errors.
- [ ] Optionally run `axe-core` accessibility checks in the test environment: install `jest-axe`, add a test that renders `DAGCanvas` and runs `expect(await axe(container)).toHaveNoViolations()`.
