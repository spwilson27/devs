# Task: Border Emphasis — Upgrade 1px Borders to 2px with contrastBorder in HC Mode (Sub-Epic: 86_High_Contrast_Overrides)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-025], [7_UI_UX_DESIGN-REQ-UI-DES-025-2]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/borderEmphasis.test.tsx`, write tests using `@testing-library/react` and `jsdom`:
  - **Test 1 (CSS variable — HC active):** Within a HC-active DOM tree, assert that the CSS custom property `--devs-border-width` resolves to `2px`.
  - **Test 2 (CSS variable — HC inactive):** In a non-HC DOM tree, assert that `--devs-border-width` resolves to `1px`.
  - **Test 3 (CSS variable — border color):** In a HC-active tree, assert `--devs-border-color` resolves to `var(--vscode-contrastBorder)`.
  - **Test 4 (Component — Card):** Render a `<Card>` component in a HC context; assert the computed `border-width` of its root element is `2px`.
  - **Test 5 (Component — DAG Node):** Render a DAG node in a HC context; assert `border-width` is `2px` and `border-color` uses `var(--vscode-contrastBorder)`.
  - **Test 6 (Regression):** Render both components in non-HC; assert `border-width` is `1px`.

## 2. Task Implementation
- [ ] **Audit phase:** Run `grep -rn "border.*1px\|border-width.*1px\|border:.*1px" packages/vscode/src/webview/` to enumerate every `1px` border declaration. Record results.
- [ ] In `packages/vscode/src/webview/styles/base-tokens.css`, introduce two semantic tokens:
  ```css
  --devs-border-width: 1px;
  --devs-border-color: var(--vscode-panel-border, var(--vscode-editorWidget-border));
  ```
- [ ] Refactor all component CSS/Tailwind classes to use `--devs-border-width` and `--devs-border-color` rather than hardcoded `1px` and color values. Target files include at minimum:
  - `packages/vscode/src/webview/components/Card.tsx` (and its CSS module / Tailwind class)
  - `packages/vscode/src/webview/components/dag/DagNode.tsx`
  - `packages/vscode/src/webview/components/ThoughtStreamer.tsx`
  - `packages/vscode/src/webview/views/ConsoleView.tsx`
  - Any other component surfacing a visible border.
- [ ] In `packages/vscode/src/webview/styles/hc-overrides.css`, within `@layer devs.hc-overrides` and the `.vscode-high-contrast` scope, add:
  ```css
  /* REQ-UI-DES-025-2: Border emphasis in HC mode */
  .vscode-high-contrast {
    --devs-border-width: 2px;
    --devs-border-color: var(--vscode-contrastBorder);
  }
  ```
- [ ] Where Tailwind utility classes set borders directly (e.g., `border border-[var(--devs-border)]`), ensure the Tailwind config maps the `devs-border` key to the `--devs-border-color` variable and that border-width utilities resolve through `--devs-border-width`. Alternatively, add a global CSS rule in `hc-overrides.css`:
  ```css
  .vscode-high-contrast * {
    border-width: var(--devs-border-width) !important;
  }
  ```
  — use `!important` only if the Tailwind token-based approach is not feasible; document the decision.

## 3. Code Review
- [ ] Confirm no hardcoded `border: 1px solid <color>` strings remain in component source files — all borders must reference `--devs-border-width` and `--devs-border-color`.
- [ ] Confirm `var(--vscode-contrastBorder)` is used exclusively for border color in HC mode — no other HC-mode border color tokens.
- [ ] Confirm the HC override is strictly scoped to `.vscode-high-contrast` and does not bleed into standard or dark themes.
- [ ] Confirm that the `2px` border does not break any layout that has a `box-sizing: border-box` constraint (i.e., verify DAG node dimensions remain 180×64px as per REQ-UI-DES-046-1 — the border increase is absorbed within padding, not added to outer dimensions).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="borderEmphasis"` and confirm all 6 tests pass.
- [ ] Run the full test suite `pnpm --filter @devs/vscode test` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/vscode/ARCHITECTURE.md` under `## High-Contrast Mode`: add subsection `### Border Emphasis` documenting the `--devs-border-width` / `--devs-border-color` token strategy and the HC upgrade to `2px` / `var(--vscode-contrastBorder)`.
- [ ] Add to `docs/agent-memory/ui-tokens.md`: "In HC mode, `--devs-border-width` becomes `2px` and `--devs-border-color` becomes `var(--vscode-contrastBorder)`. Never hardcode border widths in components."

## 6. Automated Verification
- [ ] Run the shell audit and confirm output is empty:
  ```sh
  grep -rn "border.*1px\|border-width: 1px" packages/vscode/src/webview/components/ packages/vscode/src/webview/views/
  ```
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="borderEmphasis"` and confirm ≥ 90% statement coverage.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm zero errors.
