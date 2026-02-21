# Task: Theming, Tailwind & High-Density CSS (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-090], [7_UI_UX_DESIGN-REQ-UI-DES-094]

## 1. Initial Test Written
- [ ] Add tests at packages/webview/src/__tests__/theming.test.ts that:
  - Render DashboardSidebarApp with a mock VSCode theme and assert CSS variables like `--vscode-editor-foreground` are used and present on the root element.
  - Render `dense` mode and assert reduced spacing CSS variables are applied (e.g., `--devs-spacing-sm` is smaller).

## 2. Task Implementation
- [ ] Configure Tailwind with a `dense` variant and a set of CSS variables consumed by components. Changes include:
  - tailwind.config.js: add custom utilities for density and a `dense` variant class.
  - At webview boot, read a user preference or command to toggle `dense` mode and add class `devs--dense` to root.
  - Use VSCode tokens via `--vscode-` variables for colors, and expose role color variables (`--devs-agent-developer`, etc.) mapped from theme tokens at runtime.
- [ ] Ensure CSS is isolated using a root class or Shadow DOM to prevent VSCode style leakage, and create a `dense` CSS toggle that reduces paddings/margins to meet High-Density Hub requirements.

## 3. Code Review
- [ ] Verify there are no hard-coded colors; all colors are mapped from CSS variables.
- [ ] Verify density classes are purely presentational and do not alter semantic HTML structure.
- [ ] Verify CSS size for webview bundle remains reasonable; lazy-load heavy styles if necessary.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/__tests__/theming.test.ts` and then `npm run build:webview` to verify styles included.

## 5. Update Documentation
- [ ] Document theming and density toggle in docs/theming.md, include examples of CSS variables and the recommended mapping from VSCode theme tokens.

## 6. Automated Verification
- [ ] CI job should run the theming tests and then a small script that checks the built CSS for presence of the expected CSS variable names (grep or PostCSS AST analysis) and fail if missing.
