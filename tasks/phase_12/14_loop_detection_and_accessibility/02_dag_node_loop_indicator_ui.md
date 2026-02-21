# Task: DAG Node Loop Indicator UI – Color-Code Repeating Tasks Orange/Red (Sub-Epic: 14_Loop Detection and Accessibility)

## Covered Requirements
- [4_USER_FEATURES-REQ-063]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGNode.loop.test.tsx`, write React Testing Library (RTL) unit tests covering:
  - `<DAGNode>` renders with no loop-indicator class/style when `loopStatus` prop is `'ok'` or `undefined`.
  - `<DAGNode loopStatus="warn">` applies a CSS class `dag-node--loop-warn` (or equivalent) that sets the node border/background to the orange warning token (`--devs-color-loop-warn`).
  - `<DAGNode loopStatus="error">` applies CSS class `dag-node--loop-error` that sets the node border/background to the red error token (`--devs-color-loop-error`).
  - `<DAGNode loopStatus="warn">` renders a visible tooltip/title attribute containing the text `"Loop detected (3+ attempts)"`.
  - `<DAGNode loopStatus="error">` renders a visible tooltip/title attribute containing the text `"Loop critical (5+ attempts)"`.
  - Snapshot tests for all three states.
- [ ] In `packages/webview-ui/src/components/dag/__tests__/DAGCanvas.loop.test.tsx`, write an integration test:
  - Given a list of `tasks` where one task has `attemptCount: 3` and another has `attemptCount: 5`, the `<DAGCanvas>` renders the corresponding `<DAGNode>` components with `loopStatus="warn"` and `loopStatus="error"` respectively.
  - Tasks with `attemptCount < 3` render with no loop indicator class.

## 2. Task Implementation
- [ ] Add `loopStatus?: LoopStatus` to the `DAGNodeProps` type in `packages/webview-ui/src/components/dag/DAGNode.types.ts`. Import `LoopStatus` from `@devs/core`.
- [ ] In `packages/webview-ui/src/components/dag/DAGNode.tsx`:
  - Compute a CSS modifier class from `loopStatus`: `''` for `'ok'`/`undefined`, `'dag-node--loop-warn'` for `'warn'`, `'dag-node--loop-error'` for `'error'`.
  - Apply the modifier class to the root node element alongside existing classes.
  - Add a `title` attribute (tooltip) to the root node: `"Loop detected (3+ attempts)"` for `warn`, `"Loop critical (5+ attempts)"` for `error`, empty string otherwise.
- [ ] In `packages/webview-ui/src/components/dag/DAGNode.module.css` (or the project's existing styling mechanism):
  - Define `.dag-node--loop-warn { border-color: var(--devs-color-loop-warn, #E8A000); background-color: rgba(232, 160, 0, 0.08); }`.
  - Define `.dag-node--loop-error { border-color: var(--devs-color-loop-error, #D32F2F); background-color: rgba(211, 47, 47, 0.10); }`.
  - Ensure both classes also set `border-width: 2px` to provide visible emphasis without relying on color alone (accessibility).
- [ ] Add CSS custom property declarations `--devs-color-loop-warn` and `--devs-color-loop-error` to the global VSCode theme token mapping file (e.g., `packages/webview-ui/src/styles/theme-tokens.css`), mapping them to appropriate VSCode semantic color tokens as fallbacks.
- [ ] In `packages/webview-ui/src/components/dag/DAGCanvas.tsx`, compute `loopStatus` for each task node from the task's `attemptCount` field (using the shared threshold constants `LOOP_WARN_THRESHOLD = 3` and `LOOP_ERROR_THRESHOLD = 5` exported from `@devs/core`) and pass it as a prop to `<DAGNode>`.
- [ ] Export `LOOP_WARN_THRESHOLD` and `LOOP_ERROR_THRESHOLD` constants from `packages/core/src/orchestrator/loopDetector.ts`.

## 3. Code Review
- [ ] Confirm loop status differentiation is achieved through **both** color **and** border-width (not color alone), satisfying WCAG 1.4.1 (Use of Color).
- [ ] Verify tooltip text is present on the DOM element for users who cannot perceive color (`title` attribute as minimum; confirm screen-reader accessibility in task 03).
- [ ] Ensure `DAGNode` does not directly import `LoopDetector` class — it only receives `loopStatus` as a prop (presentation layer must not contain business logic).
- [ ] Confirm threshold constants are imported from `@devs/core` and not duplicated in the UI layer.
- [ ] Verify existing `DAGNode` tests still pass (no regressions).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=DAGNode.loop` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern=DAGCanvas.loop` and confirm all tests pass.
- [ ] Run the full webview-ui test suite: `pnpm --filter @devs/webview-ui test --ci` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/ui/dag-canvas.md` (create if absent) with a section `### Loop Indicators` documenting the `loopStatus` prop, visual behavior, threshold values, and the CSS custom properties used.
- [ ] Add a screenshot or Mermaid diagram illustrating the three node states (ok, warn, error) in the documentation.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview-ui test --ci --forceExit` and assert exit code `0`.
- [ ] Run `grep -r "dag-node--loop-warn\|dag-node--loop-error" packages/webview-ui/src/components/dag/` to confirm CSS classes are defined and applied in the component.
- [ ] Run `grep -r "LOOP_WARN_THRESHOLD\|LOOP_ERROR_THRESHOLD" packages/webview-ui/src/components/dag/DAGCanvas.tsx` to confirm the UI uses shared constants.
