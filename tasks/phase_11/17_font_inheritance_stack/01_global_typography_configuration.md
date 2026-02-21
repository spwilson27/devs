# Task: Global Typography Configuration and Anti-Aliasing (Sub-Epic: 17_Font_Inheritance_Stack)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-076], [7_UI_UX_DESIGN-REQ-UI-DES-036]

## 1. Initial Test Written
- [ ] Create a Vitest/Playwright test that verifies the presence of specific CSS variables on the root element of the Webview (`--devs-font-ui`, `--devs-font-narrative`, `--devs-font-mono`).
- [ ] Add a test to verify that `-webkit-font-smoothing: antialiased` is applied to the `body` or the main container.
- [ ] Create a computed style check to ensure that the `sans`, `serif`, and `mono` font-family definitions in Tailwind (if used) or standard CSS map to the correct stacks:
    - UI: System-native sans-serif (e.g., `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`).
    - Narrative: `Georgia`, `serif`.
    - Technical: `var(--vscode-editor-font-family)`, `monospace`.

## 2. Task Implementation
- [ ] Update `tailwind.config.js` to include the three-tier font stack:
    - `fontFamily: { devs-ui: [...], devs-narrative: ['Georgia', 'serif'], devs-mono: ['var(--vscode-editor-font-family)', 'monospace'] }`.
- [ ] Update the global CSS file (e.g., `src/index.css`) to define the CSS variables and apply the subpixel rendering requirement:
    ```css
    :root {
      --devs-font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --devs-font-narrative: Georgia, serif;
      --devs-font-mono: var(--vscode-editor-font-family, monospace);
    }
    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    ```
- [ ] Ensure that the `vscode-resource` URI scheme is considered if any local fonts were to be loaded, although current requirements favor system/editor fonts.

## 3. Code Review
- [ ] Verify that no hardcoded font families are used outside of the global configuration.
- [ ] Ensure the font stack fallbacks are robust and follow the "Webfont strategy" (favoring system serif over heavy downloads).
- [ ] Confirm that the typography scale follows the 4px grid alignment where applicable.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test` or the specific Vitest suite to confirm the CSS variables and anti-aliasing are correctly applied.

## 5. Update Documentation
- [ ] Update the internal UI component documentation (or `.agent.md`) to reflect the available font family utility classes and the hierarchy logic.

## 6. Automated Verification
- [ ] Run a script that inspects the generated CSS bundle to ensure `antialiased` and the expected font stacks are present.
