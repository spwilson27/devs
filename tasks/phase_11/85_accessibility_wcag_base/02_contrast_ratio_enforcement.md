# Task: Contrast Ratio Enforcement (4.5:1 / 7:1 in HC) (Sub-Epic: 85_Accessibility_WCAG_Base)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-084-1], [7_UI_UX_DESIGN-REQ-UI-DES-084], [4_USER_FEATURES-REQ-044]

## 1. Initial Test Written
- [ ] In `packages/vscode/webview-ui/src/__tests__/accessibility/contrast.test.ts`, write unit tests for a utility function `getContrastRatio(foreground: string, background: string): number` (to be created at `src/utils/color/contrast.ts`):
  - Test that `getContrastRatio('#ffffff', '#000000')` returns `21`.
  - Test that `getContrastRatio('#767676', '#ffffff')` returns a value ≥ 4.5 (WCAG AA body text threshold).
  - Test that `getContrastRatio('#949494', '#ffffff')` returns a value < 4.5 (a known AA failure).
  - Test that `getContrastRatio('#000000', '#ffffff')` returns a value ≥ 7 (WCAG AAA / HC threshold).
- [ ] Write a test in the same file for a utility `meetsWcagAA(fg: string, bg: string): boolean` that returns `true` only when ratio ≥ 4.5.
- [ ] Write a test for `meetsWcagHC(fg: string, bg: string): boolean` that returns `true` only when ratio ≥ 7.0.
- [ ] Write a snapshot/integration test using `jest-axe` that renders the `<ThoughtStreamer />` component inside a container with CSS variables mocked to pass AA contrast (≥ 4.5:1), then runs `axe()` and expects zero contrast violations (`color-contrast` rule enabled explicitly).
- [ ] Write a second snapshot test that renders `<ThoughtStreamer />` in a HC container (set `data-vscode-theme="hc-black"` on the root, apply HC CSS overrides) and asserts `axe()` reports zero `color-contrast` violations.

## 2. Task Implementation
- [ ] Create `packages/vscode/webview-ui/src/utils/color/contrast.ts`:
  ```ts
  /** Converts 8-bit channel to linearized sRGB value */
  function linearize(c: number): number {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  /** Computes relative luminance (WCAG 2.x formula) */
  export function relativeLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
  }

  /** Returns contrast ratio between two hex colors (1–21) */
  export function getContrastRatio(fg: string, bg: string): number {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  export const meetsWcagAA = (fg: string, bg: string) => getContrastRatio(fg, bg) >= 4.5;
  export const meetsWcagHC = (fg: string, bg: string) => getContrastRatio(fg, bg) >= 7.0;
  ```
- [ ] In `packages/vscode/webview-ui/src/styles/tokens.css`, ensure all text-color and background-color custom properties use VSCode design tokens exclusively (e.g., `--vscode-editor-foreground`, `--vscode-editor-background`). **Do NOT hardcode any hex or RGB values** for text or backgrounds in this file.
- [ ] Create `packages/vscode/webview-ui/src/styles/hc-overrides.css` with:
  - A `[data-vscode-theme="hc-black"]` and `[data-vscode-theme="hc-light"]` selector block.
  - Set `--text-primary: var(--vscode-editor-foreground)` and `--bg-primary: var(--vscode-editor-background)` to ensure VSCode HC tokens flow through.
  - Add `--text-action: var(--vscode-button-foreground)` mapped from VSCode HC theme tokens (which guarantee ≥ 7:1 in HC themes by VSCode's own standards).
  - Annotate each token with a comment referencing the `meetsWcagHC` requirement: `/* [7_UI_UX_DESIGN-REQ-UI-DES-084-1] HC ≥ 7:1 */`.
- [ ] Import `hc-overrides.css` in the root `index.tsx` (or the Shadow DOM host) after `tokens.css` to ensure HC overrides take effect when VSCode injects `data-vscode-theme` on the `<body>` or webview root element.
- [ ] In each component that uses hardcoded color values (search via `grep -r 'color:\s*#\|background:\s*#' src/components`), replace with the corresponding `var(--text-*)` / `var(--bg-*)` token.

## 3. Code Review
- [ ] Verify that `grep -r "color:\s*#\|background-color:\s*#" packages/vscode/webview-ui/src/` returns zero results (no hardcoded color hex values in component files or stylesheets).
- [ ] Verify `contrast.ts` has 100% statement coverage as reported by Jest.
- [ ] Confirm `hc-overrides.css` only uses `var(--vscode-*)` tokens as values — never literals — to stay within VSCode's theme contract.
- [ ] Confirm every new CSS file is imported within the Shadow DOM host boundary, not at the global document level, to respect Shadow DOM isolation ([6_UI_UX_ARCH-REQ-070]).
- [ ] Ensure no `!important` declarations are used in `hc-overrides.css` unless strictly required by VSCode theming cascades (document any exceptions with justification comments).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=contrast` from `packages/vscode/webview-ui` and confirm all contrast utility tests pass.
- [ ] Run `npm run test:a11y` and confirm axe-core reports zero `color-contrast` violations for both standard and HC theme renders.
- [ ] Run the E2E Playwright WCAG audit (from Task 01) against the updated build and confirm no contrast violations are reported.

## 5. Update Documentation
- [ ] Add a `### Contrast Enforcement` sub-section to `packages/vscode/webview-ui/README.md` documenting:
  - The `getContrastRatio` / `meetsWcagAA` / `meetsWcagHC` utilities and where they live.
  - The token cascade: `tokens.css` → `hc-overrides.css` → component styles.
  - The VSCode HC theme attribute: `data-vscode-theme="hc-black"` / `"hc-light"`.
- [ ] Update `packages/vscode/webview-ui/webview-ui.agent.md` with a memory entry:
  ```
  Contrast enforcement: ALL colors via var(--vscode-*) tokens. No hex literals in components/styles.
  Utility: src/utils/color/contrast.ts — getContrastRatio, meetsWcagAA (≥4.5:1), meetsWcagHC (≥7:1).
  HC overrides: src/styles/hc-overrides.css targets [data-vscode-theme="hc-black|hc-light"].
  ```

## 6. Automated Verification
- [ ] Execute `grep -rn "color:\s*#\|background-color:\s*#" packages/vscode/webview-ui/src/` and assert the command returns no output (exit code 1 = no matches = pass).
- [ ] Execute `npx jest --coverage --testPathPattern=contrast --coverageThreshold='{"global":{"statements":100}}'` and assert exit code 0.
- [ ] Run `npx playwright test e2e/accessibility/wcag-audit.spec.ts` and assert the JSON report (if configured) contains `"violations": []`.
