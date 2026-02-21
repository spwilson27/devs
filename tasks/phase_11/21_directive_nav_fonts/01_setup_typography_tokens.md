# Task: Setup Typography Tokens for Directive and Navigation (Sub-Epic: 21_Directive_Nav_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-017], [7_UI_UX_DESIGN-REQ-UI-DES-018], [7_UI_UX_DESIGN-REQ-UI-DES-035-3]

## 1. Initial Test Written
- [ ] Create a CSS/Style verification test (using Vitest and JSDOM or Playwright if available) that checks for the existence of typography tokens.
- [ ] The test should verify that a `font-directive` class or equivalent CSS variable exists and is set to a bold system font stack.
- [ ] The test should verify that a `font-nav` class or equivalent CSS variable exists and has a `line-height` of `1.2`.

## 2. Task Implementation
- [ ] Define Tailwind CSS configuration extensions or CSS variables in the global stylesheet (e.g., `tailwind.config.js` or `index.css`).
- [ ] Define `font-directive`: Set font family to a bold system font stack (e.g., `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`) and set `font-weight` to `bold` (700).
- [ ] Define `font-nav`: Set `line-height` to `1.2`.
- [ ] Ensure these tokens are available for use in the React components of the VSCode Webview.

## 3. Code Review
- [ ] Verify that the font stacks used for "Directive" align with the "Human Authority" visual hierarchy (Level 1).
- [ ] Ensure `line-height: 1.2` is applied specifically to navigation tokens and does not accidentally affect narrative blocks (which require 1.6).
- [ ] Check that the tokens use VSCode theme variables where appropriate for color, but specific font/line-height for intent.

## 4. Run Automated Tests to Verify
- [ ] Run the style verification tests: `npm test` or the specific test file command.

## 5. Update Documentation
- [ ] Update the UI Design System documentation or `.agent.md` file in `@devs/vscode` to reflect the new typography tokens for Directives and Navigation.

## 6. Automated Verification
- [ ] Run a script that scans the built CSS or the Tailwind config to ensure `7_UI_UX_DESIGN-REQ-UI-DES-035-3` (line-height: 1.2) is present and correctly assigned to navigation-related classes.
