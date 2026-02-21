# Task: Define Technical Typography Tokens and VSCode Editor Inheritance (Sub-Epic: 20_Technical_Font_Intent)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-016], [7_UI_UX_DESIGN-REQ-UI-DES-031-3]

## 1. Initial Test Written
- [ ] Create a Vitest or similar component test (e.g., in `src/webview/components/__tests__/Typography.test.tsx`) that verifies a "Technical" styled element correctly inherits the `--vscode-editor-font-family` and `--vscode-editor-font-weight` CSS variables.
- [ ] Add a test case to verify the existence of a `--devs-bg-technical` CSS variable that uses the `color-mix()` function for the "Glass-Box" background effect.

## 2. Task Implementation
- [ ] Update the global CSS (e.g., `src/webview/styles/globals.css`) to define the following CSS variables for technical intent:
  - `--devs-font-technical`: Set to `var(--vscode-editor-font-family, monospace)`.
  - `--devs-font-weight-technical`: Set to `var(--vscode-editor-font-weight, normal)`.
- [ ] Implement the semantic "Technical" intent background token:
  - `--devs-bg-technical`: Use `color-mix(in srgb, var(--vscode-editor-background), transparent 80%)` (or similar value to achieve the "Glass-Box" effect).
- [ ] Ensure that ligatures are supported for the technical font by setting `font-variant-ligatures: normal` (or as per VSCode settings if available).

## 3. Code Review
- [ ] Verify that the CSS variable names follow the project's design token naming convention (e.g., `--devs-font-*`, `--devs-bg-*`).
- [ ] Ensure the font inheritance uses the correct VSCode environment variables (`--vscode-editor-font-family` and `--vscode-editor-font-weight`).
- [ ] Check that the `color-mix()` implementation provides an adaptive background that responds to both light and dark VSCode themes.

## 4. Run Automated Tests to Verify
- [ ] Execute the test suite using `pnpm test src/webview/components/__tests__/Typography.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the UI/UX documentation (e.g., `docs/ui/typography.md` if it exists) to reflect the technical font intent and its inheritance from VSCode editor settings.
- [ ] Record the implementation of the "Technical" design tokens in the project's memory or `.agent.md` file.

## 6. Automated Verification
- [ ] Run a script that scans the built CSS for the presence of the new `--devs-font-technical` and `--devs-bg-technical` variables.
- [ ] Use a visual regression or snapshot test to confirm the technical intent background rendering in both light and dark modes.
