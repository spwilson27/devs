# Task: Mermaid Diagram Accessible Color Palette & Visual Cues (Sub-Epic: 87_Contrast_Risk_Resilience)

## Covered Requirements
- [4_USER_FEATURES-REQ-047], [7_UI_UX_DESIGN-REQ-UI-DES-141]

## 1. Initial Test Written
- [ ] In `packages/vscode/src/webview/__tests__/MermaidHost.test.tsx`, write unit and integration tests for the `<MermaidHost>` component:
  - Test that when `isHighContrast` is `true` (from `useHighContrastContext()`), the Mermaid `initialize()` call is invoked with a theme config that does NOT use `'default'` or `'dark'` theme—it must use `'base'` with an explicit `themeVariables` override or the `'neutral'` theme.
  - Test that the accessible palette variables (`primaryColor`, `edgeColor`, `labelBackground`, `primaryTextColor`, `lineColor`) contain no low-contrast color values in HC mode (assert they are not medium-grey or similar).
  - Test that diagram nodes include a `stroke` property set to a high-contrast value in HC mode.
  - Test that in non-HC mode, the standard VSCode-synced Mermaid theme is applied (not overridden to the HC palette).
- [ ] In `packages/vscode/src/webview/__tests__/mermaidPalette.test.ts`, write unit tests for a `buildMermaidThemeVars(isHighContrast: boolean, isDark: boolean)` utility:
  - Assert that `isHighContrast=true` always returns a palette with all color values having WCAG 4.5:1 contrast ratio against white or black (verify by computing relative luminance).
  - Assert that all edge/line colors are distinct from all fill colors in HC mode (pattern/texture differentiation).

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/utils/mermaidTheme.ts`:
  - Export `buildMermaidThemeVars(isHighContrast: boolean, isDark: boolean): MermaidThemeVariables`.
  - In HC mode, return a `themeVariables` object using only the VSCode HC CSS variables read via `getComputedStyle(document.documentElement)`:
    - `primaryColor`: `var(--vscode-button-background)` resolved value.
    - `primaryTextColor`: `var(--vscode-button-foreground)` resolved value.
    - `edgeColor` / `lineColor`: `var(--vscode-contrastBorder)` or `#ffffff` / `#000000` depending on dark/light HC.
    - `labelBackground`: `var(--vscode-editor-background)` resolved value.
    - `background`: `var(--vscode-editor-background)` resolved value.
  - In non-HC mode, delegate to existing VSCode theme synchronization logic.
  - Add dashed stroke style (`strokeDasharray: '5,5'`) to secondary edge types in HC to provide pattern-based (non-color-only) differentiation for color-blind users.
- [ ] Update `packages/vscode/src/webview/components/MermaidHost.tsx`:
  - Import `buildMermaidThemeVars` and `useHighContrastContext`.
  - On each render/update, call `mermaid.initialize({ theme: 'base', themeVariables: buildMermaidThemeVars(isHighContrast, isDark) })` before calling `mermaid.render()`.
  - Add a `useEffect` that re-initializes and re-renders the Mermaid diagram whenever `isHighContrast` changes.

## 3. Code Review
- [ ] Confirm that `mermaid.initialize()` is always called before `mermaid.render()` to prevent stale theme state.
- [ ] Verify that no color value is specified only by hue (must always have sufficient luminance contrast for the background).
- [ ] Confirm that dashed stroke differentiation is applied to at least dependency and data-flow edge types so color-blind users can distinguish edge semantics.
- [ ] Verify that the `useEffect` dependency array for re-initialization includes `isHighContrast` and `isDark`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="MermaidHost|mermaidPalette|mermaidTheme"` and confirm all tests pass.
- [ ] Visually verify (via Storybook or manual Webview run) that diagrams are legible under VSCode's built-in "High Contrast" and "High Contrast Light" themes.

## 5. Update Documentation
- [ ] Add a `packages/vscode/src/webview/utils/README.md` entry (or update existing) describing `buildMermaidThemeVars`, its two modes, and the VSCode CSS variables it reads.
- [ ] Update the `MermaidHost` component JSDoc header to note: "In HC mode, theme is rebuilt from VSCode contrast tokens; diagrams use pattern-based edge differentiation for color-blindness support."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test --coverage -- --testPathPattern="mermaidTheme"` and assert ≥ 90% coverage on `mermaidTheme.ts`.
- [ ] Run `pnpm --filter @devs/vscode build` with no TypeScript compilation errors.
- [ ] Execute the contrast-ratio utility assertions in the test suite and confirm all WCAG 4.5:1 assertions pass without skips.
