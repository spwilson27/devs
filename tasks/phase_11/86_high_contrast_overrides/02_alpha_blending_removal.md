# Task: Alpha-Blending Removal — Replace color-mix() Backgrounds in HC Mode (Sub-Epic: 86_High_Contrast_Overrides)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-025], [7_UI_UX_DESIGN-REQ-UI-DES-025-1]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/alphaBlendingRemoval.test.tsx`, write unit and integration tests using `@testing-library/react` and `jsdom`:
  - **Test 1 (Unit — CSS variable resolution):** Assert that within a DOM tree that has the `vscode-high-contrast` class on `<body>` and `data-hc="true"` on the provider root, every element that previously used `color-mix()` for a background now resolves to `var(--vscode-editor-background)`. Use inline style injection to set up `--devs-agent-bg-raw: color-mix(...)` and confirm the HC override replaces it.
  - **Test 2 (Component — ThoughtStreamer):** Render `<ThoughtStreamer>` inside a HC-active context; assert the container's `background` computed style is NOT a `color-mix()` result (cannot contain `color-mix` in its value string).
  - **Test 3 (Component — DAGCanvas node):** Render a single DAG node inside a HC-active context; assert its background resolves to `var(--vscode-editor-background)`, not a semi-transparent tint.
  - **Test 4 (Regression — Non-HC):** Render the same components in a non-HC context and assert `color-mix()` backgrounds remain intact (i.e., the CSS variable `--devs-agent-bg` equals its non-HC value).

## 2. Task Implementation
- [ ] **Audit phase:** Run `grep -r "color-mix" packages/vscode/src/webview/styles/` to enumerate every CSS declaration using `color-mix()`. Document each usage in a comment block at the top of `packages/vscode/src/webview/styles/hc-overrides.css`.
- [ ] In `packages/vscode/src/webview/styles/base-tokens.css`, ensure every `color-mix()` background is assigned to a semantic CSS custom property (e.g., `--devs-agent-bg`, `--devs-card-bg`, `--devs-sidebar-bg`). Do not use `color-mix()` directly in component selectors—only in token definitions.
- [ ] In `packages/vscode/src/webview/styles/hc-overrides.css`, within the `.vscode-high-contrast` scope and `@layer devs.hc-overrides`, add overrides for every token identified in the audit:
  ```css
  /* REQ-UI-DES-025-1: Alpha-blending removal in HC mode */
  .vscode-high-contrast {
    --devs-agent-bg: var(--vscode-editor-background);
    --devs-card-bg: var(--vscode-editor-background);
    --devs-sidebar-bg: var(--vscode-editor-background);
    --devs-panel-bg: var(--vscode-editor-background);
    /* ... add all enumerated tokens */
  }
  ```
- [ ] Confirm that the `ThoughtStreamer` component (`packages/vscode/src/webview/components/ThoughtStreamer.tsx`) uses `--devs-agent-bg` (not a raw `color-mix()` call) for its background Tailwind class or inline style.
- [ ] Confirm that DAG node components (`packages/vscode/src/webview/components/dag/DagNode.tsx`) use semantic token variables for all background declarations.
- [ ] Add a `/* HC-SAFE */` comment to every CSS declaration that has been verified safe for HC mode.

## 3. Code Review
- [ ] Run `grep -rn "color-mix" packages/vscode/src/webview/` and confirm zero occurrences exist outside of `base-tokens.css` token definitions (i.e., no inline component `color-mix()` calls).
- [ ] Confirm every `color-mix()` token in `base-tokens.css` has a corresponding override in `hc-overrides.css`.
- [ ] Verify no hardcoded hex, `rgb()`, or `rgba()` colors are introduced in the override layer — only `var(--vscode-*)` references.
- [ ] Confirm the HC override CSS does not affect the non-HC theme by checking that all overrides are scoped inside `.vscode-high-contrast { }`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="alphaBlendingRemoval"` and confirm all 4 tests pass.
- [ ] Run `pnpm --filter @devs/vscode test` (full suite) to confirm no regressions in other component tests.

## 5. Update Documentation
- [ ] Update `packages/vscode/ARCHITECTURE.md` under the `## High-Contrast Mode` section: add a subsection `### Alpha-Blending Removal` documenting the token-based approach, the list of overridden tokens, and a reference to REQ-UI-DES-025-1.
- [ ] Add to `docs/agent-memory/ui-tokens.md`: "All `color-mix()` backgrounds are defined as CSS custom properties in `base-tokens.css`. HC overrides replace them with `var(--vscode-editor-background)` in `hc-overrides.css`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="alphaBlendingRemoval"` and confirm ≥ 90% branch coverage for the HC-conditional CSS path.
- [ ] Run the following shell audit and confirm output is empty (no rogue `color-mix` in component files):
  ```sh
  grep -rn "color-mix" packages/vscode/src/webview/components/ packages/vscode/src/webview/views/
  ```
- [ ] Run `pnpm --filter @devs/vscode build` and confirm zero build warnings or errors.
