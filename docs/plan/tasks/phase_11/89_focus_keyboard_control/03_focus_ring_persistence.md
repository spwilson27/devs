# Task: Implement Focus Ring Persistence with VSCode Tokens and HC Mode Offset (Sub-Epic: 89_Focus_Keyboard_Control)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-084-2]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/styles/focus-ring.test.ts` (or a CSS-in-JS test file), write tests that verify:
  - A utility function or CSS class `applyFocusRing()` produces a style object or class name containing `outline: 2px solid var(--vscode-focusBorder)` and `outline-offset: 0px` for standard mode.
  - The same utility, when passed `isHighContrast: true`, produces `outline: 2px solid var(--vscode-focusBorder)` with `outline-offset: 2px`.
- [ ] In `packages/vscode/src/webview/components/DAGCanvas/DAGNode.test.tsx`, add a test that:
  - Renders a `DAGNode` in a simulated HC theme context.
  - Focuses the node element.
  - Asserts that the focused element has a CSS class or inline style corresponding to the HC focus ring (2px offset).
- [ ] In `packages/vscode/src/webview/components/TaskCard/TaskCard.test.tsx`, add a test that:
  - Renders a `TaskCard` and focuses it.
  - Asserts the element has the correct focus ring CSS class applied.
  - Renders a `TaskCard` with an `isHighContrast` context and asserts the offset-2px variant class is applied.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/styles/focus-ring.ts` with the following exports:
  ```ts
  /** Standard focus ring: 2px solid var(--vscode-focusBorder), offset 0 */
  export const FOCUS_RING_CLASS = 'devs-focus-ring';
  /** High-contrast focus ring: 2px solid var(--vscode-focusBorder), offset 2px */
  export const FOCUS_RING_HC_CLASS = 'devs-focus-ring-hc';
  ```
- [ ] In `packages/vscode/src/webview/styles/global.css` (or the Tailwind base layer file), add:
  ```css
  /* Reset browser default outline; provide VSCode-token-based focus ring */
  .devs-focus-ring:focus-visible {
    outline: 2px solid var(--vscode-focusBorder);
    outline-offset: 0px;
  }

  /* High-contrast mode: offset the ring so it is not clipped by the component border */
  .devs-focus-ring-hc:focus-visible {
    outline: 2px solid var(--vscode-focusBorder);
    outline-offset: 2px;
  }
  ```
  - Ensure `outline: none` is NOT applied globally without replacement; only override with the token-based ring.
- [ ] Create or update `packages/vscode/src/webview/hooks/useTheme.ts` to expose `isHighContrast: boolean` derived from the VSCode theme kind (subscribe to `window.__vscode_theme_kind` or the `body` attribute `data-vscode-theme-kind` which equals `"hc-black"` or `"hc-light"`).
- [ ] In `packages/vscode/src/webview/components/DAGCanvas/DAGNode.tsx`:
  - Import `FOCUS_RING_CLASS`, `FOCUS_RING_HC_CLASS`, and `useTheme`.
  - Apply `className={isHighContrast ? FOCUS_RING_HC_CLASS : FOCUS_RING_CLASS}` (merged with any existing classes via `clsx` or `cn`).
- [ ] In `packages/vscode/src/webview/components/TaskCard/TaskCard.tsx`:
  - Apply the same `FOCUS_RING_CLASS` / `FOCUS_RING_HC_CLASS` pattern using `useTheme`.
- [ ] Audit all other keyboard-navigable elements in the webview (e.g., `DirectiveWhisperer` input, nav buttons in `ViewRouter`, `MermaidHost` action buttons) and apply the same focus ring classes.
- [ ] Do NOT use `outline: none` or `box-shadow` as the sole focus indicator; the CSS `outline` property with `--vscode-focusBorder` is mandatory.

## 3. Code Review
- [ ] Verify `global.css` does NOT contain a blanket `* { outline: none; }` or `button { outline: none; }` rule that would suppress the focus ring.
- [ ] Verify `devs-focus-ring` uses `:focus-visible` (not `:focus`) to avoid showing the ring on mouse click while still showing it on keyboard navigation.
- [ ] Verify `devs-focus-ring-hc` uses `outline-offset: 2px` specifically in HC mode.
- [ ] Confirm `useTheme` correctly detects all HC variants: `hc-black` and `hc-light` (`data-vscode-theme-kind` values).
- [ ] Confirm the `FOCUS_RING_CLASS` and `FOCUS_RING_HC_CLASS` constants are used in all keyboard-navigable components (grep for `tabIndex={0}` and confirm each element also has one of the focus ring classes).
- [ ] Verify no hardcoded color values are used in focus ring styles; only `var(--vscode-focusBorder)` is permitted.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="focus-ring|DAGNode|TaskCard"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode test` to confirm no regressions across the webview.
- [ ] Run `pnpm --filter @devs/vscode build` to confirm no TypeScript or CSS compilation errors.

## 5. Update Documentation
- [ ] Create `packages/vscode/src/webview/styles/focus-ring.agent.md` documenting:
  - The two CSS classes (`devs-focus-ring`, `devs-focus-ring-hc`) and when to use each.
  - The `useTheme` hook and how `isHighContrast` is derived.
  - The rule that any `tabIndex={0}` element MUST also carry one of the focus ring classes.
  - The reasoning: WCAG 2.1 AA requires visible focus indicators; HC mode offset prevents the ring from being obscured by the component border.
- [ ] Update `packages/vscode/src/webview/components/DAGCanvas/DAGCanvas.agent.md` to reference the focus ring implementation.
- [ ] Update `packages/vscode/src/webview/components/TaskCard/TaskCard.agent.md` to reference the focus ring implementation.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="focus-ring"` and confirm coverage for `focus-ring.ts` is 100%.
- [ ] Run a grep check to ensure no regressions: `grep -r "outline: none" packages/vscode/src/webview` should return zero results (or only results that are immediately followed by a `devs-focus-ring` replacement).
- [ ] Run `pnpm --filter @devs/vscode build` and confirm bundle size does not regress by more than 1KB (the CSS additions are minimal).
- [ ] Optionally run Playwright/Puppeteer E2E test: focus a DAGNode via Tab key, take a screenshot, and assert the outline ring is visible using pixel comparison or `getComputedStyle(el).outline`.
