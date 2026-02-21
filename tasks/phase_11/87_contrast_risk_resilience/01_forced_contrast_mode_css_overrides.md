# Task: Implement Forced Contrast Mode CSS Overrides for Thought Backgrounds (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-141], [4_USER_FEATURES-REQ-047]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/styles/__tests__/contrastMode.test.ts`, write unit tests using `@testing-library/react` that:
  - Mount a component using `--devs-bg-thought` CSS custom property and assert that in a simulated High Contrast environment the property resolves to a solid (non-alpha) color.
  - Assert that the `data-vscode-theme-kind` attribute value of `vscode-high-contrast` or `vscode-high-contrast-light` triggers the HC override class on the root element.
  - Assert that all elements using `color-mix()` or `rgba()` alpha-blended backgrounds (e.g., `.thought-block`, `.agent-panel`) receive a `border` with `--vscode-contrastBorder` when the HC class is active.
  - Assert that the resolved background color of `.thought-block` in HC mode is identical to `--vscode-editor-background` (no alpha).
- [ ] Write a Playwright E2E test in `e2e/contrast/forcedContrast.spec.ts` that:
  - Loads the Webview with `vscode-high-contrast` theme kind.
  - Captures computed styles for `.thought-block` and asserts `background-color` has no alpha channel (alpha === 1).
  - Asserts a visible `outline` or `border` is present on `.thought-block` in HC mode.

## 2. Task Implementation
- [ ] In `packages/vscode/src/webview/styles/tokens.css`, add the following CSS custom property definitions inside a `[data-vscode-theme-kind="vscode-high-contrast"], [data-vscode-theme-kind="vscode-high-contrast-light"]` selector block:
  ```css
  [data-vscode-theme-kind="vscode-high-contrast"],
  [data-vscode-theme-kind="vscode-high-contrast-light"] {
    --devs-bg-thought: var(--vscode-editor-background);
    --devs-bg-agent: var(--vscode-sideBar-background);
    --devs-border-emphasis: var(--vscode-contrastBorder);
  }
  ```
- [ ] In `packages/vscode/src/webview/styles/components.css`, update every rule that uses `color-mix()`, `rgba()`, or any other alpha-blending technique for background colors (search for `color-mix`, `rgba`, and `hsla`) so that they reference `--devs-bg-thought` or `--devs-bg-agent` rather than inline alpha values.
- [ ] In `packages/vscode/src/webview/styles/components.css`, add a rule inside the HC selector block to apply a 1px solid border using `--vscode-contrastBorder` to all elements with class `.thought-block`, `.agent-panel`, `.dag-node`, and `.card`:
  ```css
  [data-vscode-theme-kind="vscode-high-contrast"] .thought-block,
  [data-vscode-theme-kind="vscode-high-contrast"] .agent-panel,
  [data-vscode-theme-kind="vscode-high-contrast"] .dag-node,
  [data-vscode-theme-kind="vscode-high-contrast"] .card {
    border: 1px solid var(--vscode-contrastBorder) !important;
    background-color: var(--devs-bg-thought) !important;
  }
  ```
- [ ] In `packages/vscode/src/webview/App.tsx`, read `document.body.dataset.vscodeThemeKind` on mount and set it as a `data-vscode-theme-kind` attribute on the `<div id="root">` element. Subscribe to the `vscode.postMessage` event for `theme-changed` messages and update the attribute dynamically.
- [ ] In the VSCode extension host (`packages/vscode/src/extension.ts`), add a listener for `vscode.window.onDidChangeActiveColorTheme` that sends a `{ type: 'theme-changed', themeKind: theme.kind }` postMessage to the active Webview panel whenever the theme changes.

## 3. Code Review
- [ ] Verify no hardcoded hex or rgb color values remain in any CSS file in `packages/vscode/src/webview/styles/` — all colors must reference `--vscode-*` tokens or `--devs-*` aliases.
- [ ] Confirm the HC selector specificity does not break non-HC theme rendering by checking that the HC rules are strictly scoped under the `[data-vscode-theme-kind]` attribute selector.
- [ ] Confirm `!important` usage is limited exclusively to HC override rules and is documented with a comment explaining the override necessity.
- [ ] Ensure the `theme-changed` postMessage handler in `App.tsx` is registered once (no duplicate listeners) using `useEffect` with a cleanup return.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test` and confirm all unit tests in `contrastMode.test.ts` pass with zero failures.
- [ ] Run `pnpm --filter @devs/vscode test:e2e` and confirm the `forcedContrast.spec.ts` Playwright suite passes.
- [ ] Run `pnpm --filter @devs/vscode build` and confirm the Webview bundle builds without warnings related to CSS or TypeScript type errors.

## 5. Update Documentation
- [ ] In `packages/vscode/src/webview/styles/README.md` (create if absent), add a section "High Contrast Mode" documenting: the `data-vscode-theme-kind` attribute mechanism, the list of overridden CSS variables (`--devs-bg-thought`, `--devs-bg-agent`, `--devs-border-emphasis`), and instructions for adding new components that must respect HC mode.
- [ ] Update `docs/ui/theming.md` to reference the Forced Contrast Mode implementation and link to the CSS token definitions.
- [ ] Add an entry to the agent memory file `memory/phase_11_decisions.md`: "Forced Contrast Mode: alpha-blended `--devs-bg-thought` is replaced by `var(--vscode-editor-background)` when `data-vscode-theme-kind` is `vscode-high-contrast` or `vscode-high-contrast-light`. All affected components must carry a 1px `var(--vscode-contrastBorder)` border."

## 6. Automated Verification
- [ ] Run `node scripts/verify_no_hardcoded_colors.mjs packages/vscode/src/webview/styles/` to confirm zero hardcoded color violations (script must exit 0).
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage` and confirm the coverage report shows ≥ 90% line coverage for `styles/` related modules.
- [ ] Execute the CI pipeline step `pnpm ci:contrast` (defined in `package.json`) which runs unit + e2e tests sequentially and asserts exit code 0.
