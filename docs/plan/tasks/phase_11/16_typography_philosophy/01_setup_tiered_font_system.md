# Task: Setup Tiered Font System (Sub-Epic: 16_Typography_Philosophy)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-014], [7_UI_UX_DESIGN-REQ-UI-DES-031], [7_UI_UX_DESIGN-REQ-UI-DES-031-1]

## 1. Initial Test Written
- [ ] Create a Vitest test file `packages/vscode/webview/tests/typography.test.ts` to verify that the typography CSS variables are correctly defined and accessible.
- [ ] Assert that `--devs-font-system`, `--devs-font-serif`, and `--devs-font-mono` are present in a rendered test container.
- [ ] Verify that the font stacks match the specification:
  - System: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
  - Serif: `"Georgia", "Times New Roman", "Source Serif Pro", serif`
  - Mono: `var(--vscode-editor-font-family), "Fira Code", "JetBrains Mono", monospace`

## 2. Task Implementation
- [ ] Define the typography CSS variables in `packages/vscode/webview/styles/variables.css`.
- [ ] Use `color-mix` where applicable for theme-aware backgrounds if they intersect with typography blocks (e.g., `--devs-bg-thought`).
- [ ] Update `packages/vscode/webview/tailwind.config.js` to extend the `fontFamily` theme with:
  - `sans`: mapped to `var(--devs-font-system)`
  - `serif`: mapped to `var(--devs-font-serif)`
  - `mono`: mapped to `var(--devs-font-mono)`
- [ ] Ensure `var(--vscode-editor-font-family)` is prioritized in the mono stack to support editor font inheritance.

## 3. Code Review
- [ ] Verify that no hardcoded font names are used outside of the variable definitions.
- [ ] Ensure that the font stacks include appropriate fallbacks for macOS, Windows, and Linux.
- [ ] Confirm that `tailwind.config.js` correctly references the CSS variables to maintain a single source of truth.

## 4. Run Automated Tests to Verify
- [ ] Execute `npx vitest packages/vscode/webview/tests/typography.test.ts` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Update the UI/UX design system documentation in `docs/ui_ux/typography.md` (or equivalent) to reflect the implementation of the tiered font system.

## 6. Automated Verification
- [ ] Run a grep script to ensure all new UI components are using the Tailwind font classes (`font-sans`, `font-serif`, `font-mono`) instead of inline `font-family` styles.
