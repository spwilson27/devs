# Task: Implement Typography Philosophy and Scale (Sub-Epic: 16_Typography_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-030]

## 1. Initial Test Written
- [ ] Create an integration test `packages/vscode/webview/tests/type-scale.test.ts` to verify the application of the standardized type scale and line heights.
- [ ] Render a mock component with classes `text-h1`, `text-h2`, `text-body-ui`, and `text-caption`.
- [ ] Assert that the computed `font-size`, `font-weight`, and `line-height` match the specifications in the UI/UX Design Spec:
  - H1: 22px / 600 / line-height: 1.2
  - H2: 18px / 600 / line-height: 1.2
  - Body UI: 13px / 400 / line-height: 1.2
  - Caption: 11px / 400 / line-height: 1.2 (for metadata)

## 2. Task Implementation
- [ ] Implement the typography philosophy in `packages/vscode/webview/styles/globals.css` by adding global defaults:
  - `-webkit-font-smoothing: antialiased;`
  - `-moz-osx-font-smoothing: grayscale;`
- [ ] Update `packages/vscode/webview/tailwind.config.js` to define the standardized type scale in the `fontSize` section:
  - `h1`: `['22px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }]`
  - `h2`: `['18px', { lineHeight: '1.2', letterSpacing: '-0.005em', fontWeight: '600' }]`
  - `h3`: `['14px', { lineHeight: '1.2', letterSpacing: '0.02em', fontWeight: '700' }]`
  - `body-ui`: `['13px', { lineHeight: '1.2', fontWeight: '400' }]`
  - `caption`: `['11px', { lineHeight: '1.2', letterSpacing: '0.01em', fontWeight: '400' }]`
- [ ] Create specialized utility classes for agency signaling:
  - `.thought-text`: `font-serif italic` with `line-height: 1.6` (Narrative Blocks)
  - `.directive-text`: `font-sans font-bold text-devs-primary` (Human Directives)
  - `.action-text`: `font-mono font-bold` (Tool Invocations)

## 3. Code Review
- [ ] Ensure that the typography scale follows the 4px grid alignment where possible.
- [ ] Verify that `line-height` values are specifically mapped to content types (Narrative: 1.6, Technical: 1.4, UI: 1.2).
- [ ] Confirm that the typography system respects the `prefers-reduced-motion` and High Contrast mode overrides (AA/AAA compliance).

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest packages/vscode/webview/tests/type-scale.test.ts` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Document the typography utility classes and how they map to the "Glass-Box" philosophy in the agent documentation (`.agent/ui/typography.md`).

## 6. Automated Verification
- [ ] Run a stylelint script to ensure no inline `font-size` or `line-height` declarations are present in React components, enforcing the use of the standardized scale.
