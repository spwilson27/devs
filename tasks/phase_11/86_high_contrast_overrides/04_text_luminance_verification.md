# Task: Text Luminance Verification — Enforce 7:1 Contrast Ratio for Semantic Text in HC Mode (Sub-Epic: 86_High_Contrast_Overrides)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-025], [7_UI_UX_DESIGN-REQ-UI-DES-025-3]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/textLuminance.test.ts`, write pure unit tests for a utility module `packages/vscode/src/webview/utils/contrastRatio.ts`:
  - **Test 1:** `getRelativeLuminance('#FFFFFF')` returns `1`.
  - **Test 2:** `getRelativeLuminance('#000000')` returns `0`.
  - **Test 3:** `getContrastRatio('#FFFFFF', '#000000')` returns `21`.
  - **Test 4:** `getContrastRatio('#767676', '#FFFFFF')` returns a value ≥ `4.5` (AA threshold).
  - **Test 5:** `meetsWCAGAAA('#FFFFFF', '#000000')` returns `true`.
  - **Test 6:** `meetsWCAGAAA('#767676', '#FFFFFF')` returns `false` (ratio ~4.54, below 7:1 AAA).
- [ ] In `packages/vscode/src/webview/__tests__/hcTextColors.test.ts`, write integration tests:
  - **Test 7:** Import `HC_TEXT_COLOR_PAIRS` (an exported array of `{ token: string; bgToken: string }` pairs from a new file `packages/vscode/src/webview/styles/hcTextColorPairs.ts`). For each pair, assert that the resolved real color values (use a fixture map of VSCode HC token values) pass `meetsWCAGAAA()`.
  - **Test 8:** Assert that the HC text token `--devs-text-primary` resolves to `var(--vscode-foreground)` in HC mode (not a tinted or alpha-blended value).
  - **Test 9:** Assert that `--devs-text-muted` in HC mode resolves to `var(--vscode-descriptionForeground)` and that the fixture color for this token still achieves ≥ 7:1 against `var(--vscode-editor-background)`.
  - **Test 10 (Regression):** Assert that in non-HC mode, `--devs-text-primary` resolves to its standard (non-HC) value and `meetsWCAGAAA()` is NOT enforced as a test assertion (the non-HC theme is AA-only, not AAA).

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/utils/contrastRatio.ts`:
  - Implement `getRelativeLuminance(hexColor: string): number` using the WCAG 2.1 algorithm (linearize sRGB channels, apply 0.2126R + 0.7152G + 0.0722B formula).
  - Implement `getContrastRatio(fg: string, bg: string): number` returning `(L1 + 0.05) / (L2 + 0.05)` where L1 is the lighter luminance.
  - Implement `meetsWCAGAAA(fg: string, bg: string): boolean` returning `getContrastRatio(fg, bg) >= 7`.
  - Implement `meetsWCAGAA(fg: string, bg: string): boolean` returning `getContrastRatio(fg, bg) >= 4.5`.
  - Export all four functions.
- [ ] Create `packages/vscode/src/webview/styles/hcTextColorPairs.ts`:
  - Export `HC_TEXT_COLOR_PAIRS: Array<{ label: string; fgToken: string; bgToken: string }>` listing every semantic text / background token pair in use across the Webview. Minimum pairs to include:
    - `{ label: 'primary-text', fgToken: '--vscode-foreground', bgToken: '--vscode-editor-background' }`
    - `{ label: 'muted-text', fgToken: '--vscode-descriptionForeground', bgToken: '--vscode-editor-background' }`
    - `{ label: 'agent-thought-text', fgToken: '--vscode-foreground', bgToken: '--vscode-editor-background' }`
    - `{ label: 'error-text', fgToken: '--vscode-errorForeground', bgToken: '--vscode-editor-background' }`
    - `{ label: 'link-text', fgToken: '--vscode-textLink-foreground', bgToken: '--vscode-editor-background' }`
    - Add any additional pairs identified via component audit.
- [ ] In `packages/vscode/src/webview/styles/base-tokens.css`, ensure all semantic text color tokens (`--devs-text-primary`, `--devs-text-muted`, `--devs-text-link`, etc.) are defined and reference `var(--vscode-*)` tokens, not hardcoded colors.
- [ ] In `packages/vscode/src/webview/styles/hc-overrides.css`, within `.vscode-high-contrast` and `@layer devs.hc-overrides`, add text color overrides:
  ```css
  /* REQ-UI-DES-025-3: Text luminance enforcement in HC mode (WCAG AAA 7:1) */
  .vscode-high-contrast {
    --devs-text-primary: var(--vscode-foreground);
    --devs-text-muted: var(--vscode-descriptionForeground);
    --devs-text-link: var(--vscode-textLink-foreground);
    --devs-text-error: var(--vscode-errorForeground);
    --devs-text-warning: var(--vscode-editorWarning-foreground);
    /* Ensure no alpha-blended or color-mixed text colors exist in HC mode */
  }
  ```
- [ ] Add a build-time or CI script `scripts/check-hc-contrast.ts` that:
  1. Imports `HC_TEXT_COLOR_PAIRS` and `meetsWCAGAAA`.
  2. Uses a hardcoded fixture map of Microsoft's published Windows HC theme token values (e.g., HC Black: `--vscode-foreground: #FFFFFF`, `--vscode-editor-background: #000000`) as representative worst-case values.
  3. Iterates over all pairs and asserts each passes `meetsWCAGAAA()`.
  4. Exits with code `1` and prints failing pairs if any fail; exits `0` if all pass.
- [ ] Add the contrast check script to `package.json` in `packages/vscode` under `"scripts"`: `"check:hc-contrast": "ts-node scripts/check-hc-contrast.ts"`.

## 3. Code Review
- [ ] Confirm `contrastRatio.ts` uses the exact WCAG 2.1 linearization formula (not a simplified approximation). Verify against published WCAG examples.
- [ ] Confirm `HC_TEXT_COLOR_PAIRS` includes every text color that appears in components — cross-reference against `grep -rn "color.*var(--devs-text" packages/vscode/src/webview/`.
- [ ] Confirm the HC overrides in `hc-overrides.css` contain zero `color-mix()` or `rgba()` alpha-blended text colors.
- [ ] Confirm `check-hc-contrast.ts` uses the HC Black theme fixture (darkest background, highest contrast demand) as the baseline — this is the most stringent test.
- [ ] Confirm no component uses inline `style={{ color: '#...' }}` in HC mode; all colors must flow through CSS tokens.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="textLuminance|hcTextColors"` and confirm all 10 tests pass.
- [ ] Run `pnpm --filter @devs/vscode run check:hc-contrast` and confirm exit code `0` (all pairs achieve ≥ 7:1).
- [ ] Run the full test suite `pnpm --filter @devs/vscode test` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/vscode/ARCHITECTURE.md` under `## High-Contrast Mode`: add subsection `### Text Luminance (WCAG AAA)` documenting the `contrastRatio.ts` utility, the `HC_TEXT_COLOR_PAIRS` registry, the `check:hc-contrast` script, and a reference to REQ-UI-DES-025-3.
- [ ] Add to `docs/agent-memory/ui-tokens.md`: "In HC mode, all text token colors must achieve ≥ 7:1 contrast ratio (WCAG AAA). Run `pnpm check:hc-contrast` to validate. Never add a new text color token without adding it to `HC_TEXT_COLOR_PAIRS`."
- [ ] Add to `docs/agent-memory/accessibility.md` (create if absent): "REQ-UI-DES-025-3 mandates 7:1 text contrast in HC mode. The `meetsWCAGAAA()` utility in `utils/contrastRatio.ts` is the canonical implementation."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode run check:hc-contrast` in CI (add to the relevant GitHub Actions workflow step). Confirm exit code is `0`.
- [ ] Run `pnpm --filter @devs/vscode test -- --coverage --testPathPattern="textLuminance|hcTextColors"` and confirm `contrastRatio.ts` has ≥ 95% statement coverage.
- [ ] Run the following and confirm output is empty (no hardcoded hex colors in HC-relevant token overrides):
  ```sh
  grep -n "#[0-9a-fA-F]\{3,6\}\|rgba\|rgb(" packages/vscode/src/webview/styles/hc-overrides.css
  ```
