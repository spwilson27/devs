# Task: WCAG 2.1 Contrast Ratio Automated Validation Suite (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-141], [4_USER_FEATURES-REQ-047], [7_UI_UX_DESIGN-REQ-UI-RISK-003]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/webview/__tests__/contrastCompliance.test.ts` as a dedicated WCAG contrast ratio validation suite:
  - Import or implement a `getContrastRatio(hex1: string, hex2: string): number` utility based on WCAG relative luminance formula (sRGB linearization + 0.2126R + 0.7152G + 0.0722B).
  - Write parameterized tests for every `--devs-*` color token pair (foreground/background) defined in the design system token file, asserting ratio ≥ 4.5 for normal text and ≥ 3.0 for large text (WCAG AA).
  - Write separate parameterized tests for HC mode token pairs asserting ratio ≥ 7.0 (WCAG AAA), as required by `7_UI_UX_DESIGN-REQ-UI-DES-141`.
  - Test the Mermaid HC palette produced by `buildMermaidThemeVars(true, true)` and `buildMermaidThemeVars(true, false)` to assert all `primaryTextColor`/`primaryColor` pairs meet ≥ 4.5:1.
  - Test that monospace fallback mode does not degrade contrast (text color/background pair must still pass 4.5:1 in fallback mode).
- [ ] In `packages/vscode/src/webview/__tests__/focusRing.test.tsx`, write tests that confirm focus ring styles are visible in HC mode:
  - Render a focusable component, apply HC data attribute, and assert `outline` is not `none` and has `--vscode-focusBorder` color applied.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/utils/contrastRatio.ts`:
  - Export `toLinear(channel: number): number` — sRGB to linear conversion.
  - Export `relativeLuminance(r: number, g: number, b: number): number`.
  - Export `getContrastRatio(fg: string, bg: string): number` — accepts CSS hex colors or `rgb()` strings; parses and computes WCAG contrast ratio.
  - Export `meetsAA(ratio: number, isLargeText: boolean): boolean` and `meetsAAA(ratio: number): boolean` helpers.
- [ ] Create `packages/vscode/src/webview/utils/tokenAudit.ts`:
  - Export `TOKEN_PAIRS: Array<{ name: string; fg: string; bg: string; isLargeText: boolean }>` — static list of all `--devs-*` foreground/background pairs for normal and HC modes.
  - This file serves as the single source of truth for the contrast audit.
- [ ] Integrate the contrast audit into the CI pipeline by adding a test script in `packages/vscode/package.json`:
  - Add `"test:a11y": "jest --testPathPattern=contrastCompliance"` script.
- [ ] Update `packages/vscode/src/webview/styles/high-contrast-overrides.css` as needed based on any failures discovered during the audit (e.g., if any HC token pair does not meet 7:1, correct the token value).

## 3. Code Review
- [ ] Verify `getContrastRatio` matches the WCAG 2.1 specification formula exactly (no approximations).
- [ ] Confirm `TOKEN_PAIRS` covers: thought block text/bg, agent card header text/bg (all three agent types), navigation text/bg, status badge text/bg (all five states), and DAG node label text/fill.
- [ ] Confirm all HC mode pairs use the AAA (7:1) threshold, not AA (4.5:1).
- [ ] Verify the CI script is added to the root `turbo.json` pipeline under a `test:a11y` task.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test:a11y` and confirm all contrast ratio assertions pass with no failures.
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="focusRing"` and confirm all focus ring tests pass.

## 5. Update Documentation
- [ ] Add a `WCAG Compliance` section to `packages/vscode/ARCHITECTURE.md` describing the `TOKEN_PAIRS` audit approach, the `contrastRatio` utility, and the CI integration.
- [ ] Add a `docs/accessibility/contrast-audit.md` file (create if absent) documenting: how to add new token pairs to the audit, the AA vs AAA thresholds used, and how to run the audit locally.
- [ ] Update agent memory: "All new `--devs-*` color token pairs MUST be added to `tokenAudit.ts` TOKEN_PAIRS before merging; CI will fail otherwise."

## 6. Automated Verification
- [ ] Add `pnpm --filter @devs/vscode test:a11y` to the CI workflow (`.github/workflows/ci.yml` or equivalent) so it runs on every PR targeting `main`.
- [ ] Confirm the CI pipeline fails if any contrast ratio drops below the required threshold by deliberately introducing a failing token pair in a test-only branch and verifying CI red.
- [ ] Run `pnpm --filter @devs/vscode build` with zero TypeScript errors after all changes.
