# Task: Implement Node Hover Elevation Animation on DAGCanvas (Sub-Epic: 06_DAG Canvas Interactions)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-055], [7_UI_UX_DESIGN-REQ-UI-DES-055-1]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/dag/__tests__/TaskNode.hover.test.tsx`, write a unit test using `@testing-library/react` and `jest` that:
  - Renders a `<TaskNode>` component in its default state.
  - Uses `userEvent.hover()` to simulate a pointer entering the node.
  - Asserts that the node's root element gains the CSS class `dag-node--hovered` (or equivalent Tailwind utility class `scale-105 shadow-md`).
  - Uses `userEvent.unhover()` to simulate pointer leaving.
  - Asserts that the class is removed and the node returns to its default visual state.
- [ ] Write a Playwright E2E test in `e2e/dag-canvas/node-hover.spec.ts` that:
  - Navigates to the DAG Canvas view with a known task graph loaded.
  - Hovers over a task node (identified by `data-testid="dag-node-{taskId}"`).
  - Takes a visual screenshot and asserts against a stored snapshot to verify the scale and shadow change.
  - Asserts that a `transform: scale(1.05)` CSS property is applied to the hovered element via `page.locator(...).evaluate()`.

## 2. Task Implementation
- [ ] In `packages/webview-ui/src/components/dag/TaskNode.tsx`:
  - Add a `useState<boolean>(false)` hook for `isHovered`.
  - Bind `onMouseEnter={() => setIsHovered(true)}` and `onMouseLeave={() => setIsHovered(false)}` to the root `<div>` of the node.
  - Apply CSS classes conditionally: when `isHovered` is true, add `scale-105 shadow-md transition-transform duration-150 ease-out`; otherwise apply `scale-100 shadow-sm`.
  - Ensure `will-change: transform` is set via an inline style or a dedicated CSS class to allow the GPU to composite the transform cheaply, avoiding layout thrash.
  - Add `data-testid={`dag-node-${task.id}`}` to the root element.
- [ ] In `packages/webview-ui/src/styles/dag.css` (or the Tailwind config safelist), ensure `scale-105`, `shadow-md`, and `transition-transform` are included in the production build (add to safelist if using dynamic class names).

## 3. Code Review
- [ ] Verify the hover state is managed purely with local React state (`useState`) and does NOT dispatch a global state action (e.g., to Zustand/Redux). Hover ephemeral state must be component-local.
- [ ] Confirm `transition-transform duration-150` is applied to ensure the animation is smooth but snappy (<= 150ms), not the 400ms pan-inertia timer used elsewhere.
- [ ] Verify no layout thrash: the `scale()` transform must operate on the compositor thread. Confirm that neither `width`, `height`, nor any box-model property changes on hover—only `transform` and `box-shadow`.
- [ ] Confirm the `data-testid` attribute is present and follows the convention `dag-node-{taskId}`.
- [ ] Check that the component is accessible: ensure `role="button"` or `role="listitem"` is present so keyboard users receive focus styles equivalent to hover styles (covered in a separate a11y task, but confirm no regressions here).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `pnpm --filter @devs/webview-ui test -- --testPathPattern="TaskNode.hover"` and confirm all assertions pass with zero failures.
- [ ] Run E2E tests: `pnpm --filter @devs/e2e test -- --grep "node hover"` and confirm visual snapshots match and transform assertion passes.
- [ ] Run the full DAG component suite: `pnpm --filter @devs/webview-ui test -- --testPathPattern="dag/"` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/webview-ui/src/components/dag/TaskNode.agent.md`: Document the hover state behavior, the CSS classes applied, the performance rationale (compositor-only transform), and the `data-testid` naming convention.
- [ ] Update the Phase 12 agent memory file at `docs/agent-memory/phase_12.md`: Record that node hover elevation uses local React state and compositor-only CSS transforms, NOT global state, to preserve 60FPS budget.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --coverage -- --testPathPattern="dag/"` and confirm coverage for `TaskNode.tsx` is >= 80%.
- [ ] Run `pnpm --filter @devs/e2e test -- --grep "node hover"` in CI mode (`--reporter=junit`) and confirm the JUnit XML report contains zero `<failure>` elements.
- [ ] Execute `cat coverage/lcov.info | grep TaskNode.tsx` to verify the hover branch is covered by the test suite.
