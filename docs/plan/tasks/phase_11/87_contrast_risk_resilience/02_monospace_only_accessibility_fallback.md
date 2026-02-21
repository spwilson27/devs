# Task: Implement Monospace-Only Accessibility Fallback for Low-DPI Displays (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-003]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/hooks/__tests__/useMonospaceMode.test.ts`, write unit tests using Vitest and `@testing-library/react` that:
  - Assert that `useMonospaceMode()` returns `false` by default when `window.devicePixelRatio >= 2`.
  - Assert that `useMonospaceMode()` returns `true` when `window.devicePixelRatio` is set to `1` AND a canvas-based subpixel rendering probe returns a failure signal (mock the canvas context `getImageData` to return uniform alpha values indicating no subpixel rendering).
  - Assert that the hook reads the persisted value from `vscode.getState()` on initialization, so that user preference survives Webview reloads.
  - Assert that calling `setMonospaceMode(true)` calls `vscode.setState({ monospaceOnly: true })` and updates the state returned by the hook.
  - Assert that when `monospaceOnly` is `true`, the CSS class `devs-monospace-only` is added to `document.documentElement`.
  - Assert that when `monospaceOnly` is `false`, the class `devs-monospace-only` is NOT present on `document.documentElement`.
- [ ] In `packages/vscode/src/webview/settings/__tests__/MonospaceSetting.test.tsx`, write a React component test that:
  - Renders the `MonospaceSetting` toggle component.
  - Simulates a user click on the toggle and asserts the callback `onToggle` is invoked with the new boolean value.
  - Asserts the toggle renders with correct ARIA attributes (`role="switch"`, `aria-checked`).

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/hooks/useMonospaceMode.ts` implementing the following logic:
  - On mount, probe subpixel rendering by drawing a 1px white-on-black text character to an off-screen `<canvas>` at a size of `3x3` px, then reading `getImageData`. If all non-black pixels have identical RGB values (no color fringing), subpixel rendering is unavailable. Set `subpixelFailed = true`.
  - Check `window.devicePixelRatio`. If `< 1.5`, set `lowDpi = true`.
  - Read `vscode.getState()?.monospaceOnly` as the persisted user preference.
  - Return `{ monospaceOnly: boolean, setMonospaceMode: (v: boolean) => void }`.
  - `setMonospaceMode` must: update local state, call `vscode.setState({ ...currentState, monospaceOnly: v })`, and toggle the class `devs-monospace-only` on `document.documentElement`.
  - Expose a `autoDetected: boolean` field indicating whether the mode was auto-enabled due to low DPI or subpixel failure (for display in settings UI).
- [ ] In `packages/vscode/src/webview/styles/typography.css`, add the following rule:
  ```css
  .devs-monospace-only {
    --devs-font-narrative: var(--vscode-editor-font-family), 'Courier New', monospace;
    --devs-font-technical: var(--vscode-editor-font-family), monospace;
    --devs-font-directive: var(--vscode-editor-font-family), monospace;
  }
  ```
  This ensures all font-family custom properties collapse to monospace when the class is active.
- [ ] In `packages/vscode/src/webview/styles/typography.css`, ensure all `font-family` declarations in the file reference `var(--devs-font-narrative)`, `var(--devs-font-technical)`, or `var(--devs-font-directive)` rather than hardcoded serif/sans-serif values.
- [ ] Create `packages/vscode/src/webview/settings/MonospaceSetting.tsx` — a React component rendering a labeled toggle (`<button role="switch">`) with:
  - Label: "Monospace-Only Mode"
  - Sub-label: "Enable if serif fonts appear blurry on your display." (pulled from i18n key `settings.monospaceOnly.description`).
  - Shows an info badge "Auto-detected" when `autoDetected === true`.
  - Calls `setMonospaceMode(!monospaceOnly)` on click.
- [ ] Register `MonospaceSetting` in the `SETTINGS` view (`packages/vscode/src/webview/views/SettingsView.tsx`) under the "Accessibility" section.
- [ ] In `packages/vscode/src/webview/App.tsx`, invoke `useMonospaceMode()` at the root level so that auto-detection and DOM class management happens on every Webview load.

## 3. Code Review
- [ ] Verify the canvas subpixel probe runs only once on mount (not on every render) by confirming it is inside a `useEffect` with an empty dependency array.
- [ ] Confirm `vscode.getState()` and `vscode.setState()` calls are wrapped in a try-catch to handle environments where the VSCode API is unavailable (e.g., test environment), with a no-op fallback.
- [ ] Verify `MonospaceSetting` component is fully keyboard-accessible: spacebar and enter keys must toggle the switch; focus ring must be visible.
- [ ] Confirm no serif font-family values appear outside of `--devs-font-*` variable definitions in `typography.css`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- hooks/useMonospaceMode` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode test -- settings/MonospaceSetting` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode build` and verify zero TypeScript compilation errors.
- [ ] Manually verify in a local VSCode instance: open the extension, navigate to Settings view, enable Monospace-Only Mode, confirm all text in the Webview switches to monospace fonts without a page reload.

## 5. Update Documentation
- [ ] In `docs/ui/typography.md`, add a section "Monospace-Only Accessibility Mode" describing: the auto-detection heuristic (DPI + canvas probe), the CSS class `devs-monospace-only`, the `--devs-font-*` variable override chain, and how to manually enable the setting.
- [ ] Add i18n entry `settings.monospaceOnly.description` to `packages/vscode/src/webview/i18n/en.json`.
- [ ] Append to `memory/phase_11_decisions.md`: "Monospace-Only Mode: auto-enabled when `devicePixelRatio < 1.5` or canvas subpixel probe fails. Persisted via `vscode.setState`. Applies `devs-monospace-only` class to `document.documentElement`, which overrides all `--devs-font-*` variables to monospace equivalents."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage` and confirm `hooks/useMonospaceMode.ts` has ≥ 90% branch coverage as reported in the coverage summary.
- [ ] Run `pnpm --filter @devs/vscode test:e2e -- --grep "monospace"` (add an E2E smoke test in `e2e/settings/monospaceMode.spec.ts` that enables the toggle and asserts `document.documentElement.classList.contains('devs-monospace-only')`) and confirm it passes.
- [ ] Run `node scripts/verify_font_vars.mjs packages/vscode/src/webview/styles/typography.css` to confirm no bare serif or cursive font-family values appear outside of `--devs-font-*` variable definitions (script exits 0 on pass).
