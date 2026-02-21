# Task: Monospace-Only Accessibility Fallback Mode for Low-DPI Displays (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-003]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/useMonospaceFallback.test.ts`, write unit tests for a `useMonospaceFallback()` hook:
  - Test that it returns `false` (monospace fallback NOT active) when `window.devicePixelRatio >= 2`.
  - Test that it returns `false` when `devicePixelRatio` is between 1 and 2 AND the user has not explicitly enabled the setting.
  - Test that it returns `true` when the user preference `devs.accessibility.monospaceFallback` is `true` (read from Zustand preferences store).
  - Test that it returns `true` when `devicePixelRatio <= 1` AND the VSCode setting `devs.accessibility.autoMonospaceFallback` is enabled.
  - Test that changing the preference at runtime triggers a re-render.
- [ ] In `packages/vscode/src/webview/__tests__/monospaceFallback.css.test.ts`, write computed-style tests:
  - When `data-monospace-fallback="true"` is on the root element, confirm that `ThoughtStreamer` text renders with a monospace font family (not serif/italic).
  - Confirm the `font-style` is `normal` (not `italic`) in fallback mode.
  - Confirm `font-family` for `.devs-narrative` elements resolves to the system monospace stack when fallback is active.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/hooks/useMonospaceFallback.ts`:
  - Read `devs.accessibility.monospaceFallback` preference from the Zustand UI preferences slice.
  - Read `devs.accessibility.autoMonospaceFallback` from the same slice.
  - If auto mode: detect `window.devicePixelRatio` and return `true` if it is `<= 1`.
  - If manual mode: return `true` if the user preference is explicitly `true`.
  - Return `{ isMonospaceFallback: boolean }`.
- [ ] Update `packages/vscode/src/webview/providers/HighContrastProvider.tsx` (or create a sibling `AccessibilityProvider.tsx`) to also expose `isMonospaceFallback` via context and set `data-monospace-fallback` attribute on the root element.
- [ ] Create `packages/vscode/src/webview/styles/monospace-fallback-overrides.css`:
  - Scope all rules under `[data-monospace-fallback="true"]`.
  - Override `--devs-font-narrative` to `var(--vscode-editor-font-family, 'Menlo', 'Consolas', monospace)`.
  - Override `--devs-font-serif` to the same monospace stack.
  - Set `.devs-thought-block, .devs-narrative` to `font-style: normal` (removing italic).
  - Set `.devs-thought-block, .devs-narrative` to `font-family: var(--devs-font-narrative)`.
- [ ] Add the user-facing setting `devs.accessibility.monospaceFallback` (boolean, default `false`) and `devs.accessibility.autoMonospaceFallback` (boolean, default `true`) to the VSCode extension's `package.json` `contributes.configuration` section.
- [ ] In the Settings UI (`packages/vscode/src/webview/views/SettingsView.tsx`), add a toggle for "Monospace-only mode (improves legibility on low-DPI displays)" under an "Accessibility" section.

## 3. Code Review
- [ ] Verify `devicePixelRatio` is read at mount time AND re-evaluated on the `resize` event (DPI can change when moving windows between monitors).
- [ ] Confirm the CSS override file is imported after the narrative typography stylesheet so specificity is correctly inherited.
- [ ] Verify the toggle in `SettingsView` is keyboard-accessible (label + checkbox, not a custom div).
- [ ] Confirm that setting the preference persists via the Tier 3 Zustand persistent slice and survives Webview reload.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="useMonospaceFallback|monospaceFallback"` and confirm all tests pass.
- [ ] Manually verify on a 1x DPI screen (or by setting `window.devicePixelRatio = 1` in DevTools) that `ThoughtStreamer` switches to monospace with no italic style.

## 5. Update Documentation
- [ ] Add to `packages/vscode/ARCHITECTURE.md` under "Theme & Accessibility": document the Monospace Fallback Mode, when it activates, and the CSS variable override convention.
- [ ] Add a user-facing entry to `docs/user-guide/accessibility.md` (create if absent) explaining the "Monospace-only mode" setting and when users might want to enable it.
- [ ] Record in agent memory: "`--devs-font-narrative` and `--devs-font-serif` are overridden to monospace stack when `data-monospace-fallback='true'` is set on root."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test --coverage -- --testPathPattern="useMonospaceFallback"` and assert ≥ 90% branch coverage.
- [ ] Run `pnpm --filter @devs/vscode build` (including `package.json` schema validation for the new settings) with zero errors.
- [ ] Confirm the new `contributes.configuration` entries appear in the VSCode extension manifest by running `pnpm --filter @devs/vscode package --dry-run` and grepping output for `monospaceFallback`.
