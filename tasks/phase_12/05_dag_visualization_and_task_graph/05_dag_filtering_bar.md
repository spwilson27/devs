# Task: DAG Filtering Bar — Search by Task ID, Title, and Requirement ID (Sub-Epic: 05_DAG Visualization and Task Graph)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-093-3]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGFilterBar.test.tsx`, write React Testing Library tests:
  - Renders an `<input>` with `data-testid="dag-filter-input"` and `placeholder="Filter by Task ID, Title, or Requirement ID…"`.
  - Typing into the input calls `useDagStore.setFilterQuery` with the current input value (debounced).
  - Renders a clear button (`data-testid="dag-filter-clear"`) that is only visible when the input is non-empty.
  - Clicking the clear button resets the input value to `""` and calls `useDagStore.setFilterQuery("")`.
  - The match count label (`data-testid="dag-filter-match-count"`) shows `"{n} tasks matched"` when `filterQuery` is non-empty, and is hidden when `filterQuery` is empty.
- [ ] In `packages/webview-ui/src/stores/__tests__/dagStore.filterSelector.test.ts`:
  - When `filterQuery = "REQ-UI-006"`, `getFilteredNodes()` returns only nodes whose `requirementIds` includes a string containing `"REQ-UI-006"`.
  - When `filterQuery = "task-42"`, returns only nodes whose `id` contains `"task-42"`.
  - When `filterQuery = "implement auth"`, returns only nodes whose `title` contains `"implement auth"` (case-insensitive).
  - When `filterQuery = ""`, returns all nodes unchanged.
  - Filtering is case-insensitive for all three fields.
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGCanvas.filter.test.tsx`:
  - When `getFilteredNodes()` returns a subset, only matching task nodes are rendered in the canvas (non-matching nodes are dimmed or hidden).
  - Dimmed nodes have CSS class `dag-node--dimmed` and opacity `0.25`.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/components/dag/DAGFilterBar.tsx`:
  - State: `localQuery` (controlled `<input>` value) via `useState`.
  - On change: update `localQuery` immediately for responsive UI; debounce `useDagStore.setFilterQuery` by 200ms using `useDebounce` from `usehooks-ts` (or a small inline implementation).
  - Clear button: `<button data-testid="dag-filter-clear" aria-label="Clear filter" onClick={...}>✕</button>`, shown only when `localQuery !== ""`.
  - Match count: reads `getFilteredNodes().length` and `nodes.length` from `useDagStore`; renders `"{matched} of {total} tasks"` in `var(--vscode-descriptionForeground)`.
  - Keyboard: pressing `Escape` while the input is focused clears the filter.
  - Styled as a compact search bar using Tailwind classes; input uses VSCode's `var(--vscode-input-background)`, `var(--vscode-input-foreground)`, `var(--vscode-input-border)`.
  - Renders `data-testid="dag-filter-bar"` on the root `<div>`.
- [ ] Update `getFilteredNodes` selector in `dagStore.ts` (from task 01) to filter across all three fields:
  ```typescript
  getFilteredNodes: () => {
    const { nodes, filterQuery } = get();
    if (!filterQuery) return nodes;
    const q = filterQuery.toLowerCase();
    return nodes.filter(n =>
      n.id.toLowerCase().includes(q) ||
      n.title.toLowerCase().includes(q) ||
      n.requirementIds.some(r => r.toLowerCase().includes(q))
    );
  }
  ```
- [ ] Update `DAGCanvas.tsx` to use `getFilteredNodes()` instead of the raw `nodes` array when building React Flow nodes. For non-matching nodes when a filter is active:
  - Compute `matchingIds = new Set(getFilteredNodes().map(n => n.id))`.
  - All nodes are still rendered (to preserve layout geometry), but nodes NOT in `matchingIds` receive `className: 'dag-node--dimmed'` and `style: { opacity: 0.25, pointerEvents: 'none' }`.
  - This approach preserves bounding box positions while visually de-emphasizing non-matches.
- [ ] Place `<DAGFilterBar>` in the DAG toolbar area above `<DAGCanvas>` in `DAGView.tsx`.

## 3. Code Review

- [ ] Verify the 200ms debounce prevents `setFilterQuery` from being called on every keystroke, reducing unnecessary Zustand re-renders and React Flow layout recalculations.
- [ ] Confirm non-matching nodes are dimmed (not removed from the layout) to prevent layout thrashing during incremental typing.
- [ ] Verify `Escape` key handling uses `onKeyDown` and calls `event.stopPropagation()` to prevent VSCode's command palette from opening.
- [ ] Confirm the clear button has a correct `aria-label` for screen-reader accessibility.
- [ ] Confirm `getFilteredNodes` in the store is the single authoritative filter implementation — no duplicate filtering logic in the component.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="DAGFilterBar|dagStore.filterSelector|DAGCanvas.filter"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui tsc --noEmit` with zero errors.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/components/dag/DAGFilterBar.agent.md` documenting: debounce strategy, the three-field search contract (id, title, requirementIds), the dimming-not-hiding approach for layout stability, and keyboard shortcuts (Escape to clear).
- [ ] Update `packages/webview-ui/src/stores/dagStore.agent.md` to document the `filterQuery` field and `getFilteredNodes` selector in detail, including case-insensitivity and multi-field matching.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test --coverage --testPathPattern="DAGFilterBar"` and confirm ≥ 90% branch coverage on `DAGFilterBar.tsx`.
- [ ] Load the Extension Development Host. Type a requirement ID (e.g., `PRD-REQ-UI`) into the filter bar. Verify only matching task nodes remain fully visible. Clear the filter and verify all nodes return to full opacity.
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm exit code 0.
