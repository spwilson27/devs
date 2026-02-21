# Task: Technical Log Font Inheritance and Validation (Sub-Epic: 17_Font_Inheritance_Stack)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-032], [6_UI_UX_ARCH-REQ-076], [7_UI_UX_DESIGN-REQ-UI-DES-036]

## 1. Initial Test Written
- [ ] Create an integration test that simulates the VSCode Webview environment where `--vscode-editor-font-family` is defined on the `:root`.
- [ ] Verify that the `LogTerminal` component (or its xterm.js/monospaced container) computes a `font-family` that starts with the value of that variable.
- [ ] Verify that the `line-height` for technical blocks is exactly `1.4` (as per REQ-UI-DES-035).
- [ ] Add a check for font ligatures: verify that `font-variant-ligatures: contextual` is applied if supported by the component.

## 2. Task Implementation
- [ ] Update `LogTerminal` and any code preview components to explicitly use the editor font variable:
    - `font-family: var(--vscode-editor-font-family, monospace)`.
- [ ] Set the `line-height` to `1.4` for these components.
- [ ] Configure `xterm.js` (if used) to use the inherited font family and weight.
- [ ] Implement `font-variant-ligatures: contextual` for code blocks to support user-configured ligatures.
- [ ] Ensure that code blocks use a slightly heavier weight (`450` or `500`) to improve legibility against dark terminal backgrounds (as per REQ-UI-DES-037).

## 3. Code Review
- [ ] Confirm that the technical font matches the host VSCode editor, fulfilling the "Platform-Native Ghost" integration goal.
- [ ] Verify that CJK characters in logs fall back to host OS defaults (REQ-UI-DES-038) by ensuring the font-family stack includes generic fallbacks like `monospace`.
- [ ] Ensure that the `LogTerminal` handles high-frequency updates without font-rendering flickers.

## 4. Run Automated Tests to Verify
- [ ] Execute the `LogTerminal` and typography integration tests: `npm run test LogTerminal`.

## 5. Update Documentation
- [ ] Document the font inheritance mechanism in the `@devs/vscode` package documentation, explaining how editor settings are passed to the Webview.

## 6. Automated Verification
- [ ] Use a Playwright E2E test to verify that changing the CSS variable `--vscode-editor-font-family` dynamically updates the rendered font in the terminal view.
