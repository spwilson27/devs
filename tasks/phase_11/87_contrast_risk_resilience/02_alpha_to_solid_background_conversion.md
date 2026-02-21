# Task: Alpha-to-Solid Background Conversion for High Contrast Mode (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-141], [4_USER_FEATURES-REQ-047]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/highContrastOverrides.css.test.ts`, write CSS-in-JS / computed-style tests (using `@testing-library/react` + jsdom):
  - For the `ThoughtStreamer` component: confirm that when `data-high-contrast="true"` is present on a parent element, the component's background resolves to a fully opaque solid value (no `rgba()` with alpha < 1, no `color-mix()` with transparency).
  - For the agent backdrop cards (`DevAgentCard`, `ReviewerAgentCard`, `ArchitectAgentCard`): confirm solid background colors are applied under HC.
  - Confirm that a 1px solid border using `--vscode-contrastBorder` (or `--vscode-contrastActiveBorder`) is present on every affected component in HC mode.
  - Confirm that in non-HC mode (no attribute), the original `--devs-bg-thought` alpha-blended value is used.
- [ ] Write snapshot tests for `ThoughtStreamer` rendered under HC vs non-HC to detect regressions.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/styles/high-contrast-overrides.css`:
  - Scope all rules under `[data-high-contrast="true"]` attribute selector.
  - Override `--devs-bg-thought` to `var(--vscode-editor-background)` (fully opaque).
  - Override `--devs-bg-agent-dev`, `--devs-bg-agent-review`, `--devs-bg-agent-arch` to their respective solid VSCode token equivalents (e.g., `var(--vscode-sideBar-background)`).
  - Override `--devs-bg-glass` and any `color-mix()` derived variables to solid opaque equivalents.
  - Add `border: 1px solid var(--vscode-contrastBorder)` to `.devs-card`, `.devs-thought-block`, `.devs-agent-backdrop`, `.devs-panel` via attribute-scoped rules.
  - Ensure `box-shadow` is removed (`box-shadow: none`) in HC mode (shadows are invisible and wasteful in HC).
- [ ] Import `high-contrast-overrides.css` in the Webview entry point (`packages/vscode/src/webview/index.tsx`) after the base Tailwind stylesheet so specificity is correct.
- [ ] Audit all component files in `packages/vscode/src/webview/components/` for inline `style={{ background: 'rgba(...)' }}` or `color-mix()` usages and replace them with CSS custom property references that the override sheet can intercept.

## 3. Code Review
- [ ] Verify zero hardcoded `rgba()` or `hsla()` values remain in component JSX `style` props for background colors—all must be CSS variable references.
- [ ] Confirm the override stylesheet is scoped exclusively to `[data-high-contrast="true"]` and does not bleed into non-HC rendering.
- [ ] Verify that `--vscode-contrastBorder` fallback is defined (e.g., `transparent`) so non-HC themes don't show unexpected borders.
- [ ] Confirm `box-shadow: none` is applied in HC to not produce invisible but performance-impacting layers.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="highContrastOverrides|ThoughtStreamer|AgentCard"` and confirm all tests pass.
- [ ] Manually (or via Playwright) snapshot the Webview with a simulated `vscode-high-contrast` body class and verify backgrounds are opaque and borders are visible.

## 5. Update Documentation
- [ ] Document the CSS variable override convention in `packages/vscode/src/webview/styles/README.md`: describe the HC override sheet structure, the `[data-high-contrast]` scoping pattern, and list which `--devs-*` variables are replaced.
- [ ] Update `specs/7_ui_ux_design.md` memory notes to record: "All `--devs-bg-*` alpha-blended tokens revert to solid VSCode editor tokens in HC mode; borders added via `--vscode-contrastBorder`."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode build` with no TypeScript errors.
- [ ] Run `pnpm --filter @devs/vscode test --coverage` and confirm the override-related files have ≥ 85% coverage.
- [ ] Run a CSS linter (`stylelint`) on `high-contrast-overrides.css` with `no-color-literals` rule enabled to assert no hardcoded colors are present.
