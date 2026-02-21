# Task: CSS Glass-Box Utility with `color-mix()` (Sub-Epic: 15_Glass_Box_Effects)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-011], [7_UI_UX_DESIGN-REQ-UI-DES-012]

## 1. Initial Test Written
- [ ] Create a Vitest unit test in `src/vscode-extension/webview/utils/glass-box-styles.test.ts` to verify the generation of `color-mix()` CSS values.
- [ ] Test should ensure that the utility correctly blends a base agent color (e.g., Developer Blue) with the VSCode theme background variable (`--vscode-editor-background`).
- [ ] Create a Playwright E2E test in `tests/e2e/webview/glass-box-visuals.spec.ts` to verify that agentic content blocks have a `background-color` computed using `color-mix()`.
- [ ] Verify that the computed background color has a transparency/alpha value consistent with a "glass-box" effect (e.g., 10-20% opacity of the agent color).

## 2. Task Implementation
- [ ] Define a set of agent-specific base colors in `src/vscode-extension/webview/styles/theme-tokens.css` (Developer: Blue, Reviewer: Orange, Architect: Green).
- [ ] Implement a Tailwind CSS plugin or a set of global CSS classes in `src/vscode-extension/webview/styles/glass-box.css` that use `color-mix(in srgb, var(--agent-color), var(--vscode-editor-background) 85%)`.
- [ ] Ensure the utility handles both Light and Dark themes by using the standard VSCode CSS variables (e.g., `--vscode-editor-background`, `--vscode-panel-background`).
- [ ] Apply these glass-box classes to the `ThoughtStreamer` and `TaskCard` components to ensure agentic content is visually distinguished.
- [ ] Update `tailwind.config.ts` to include these custom `color-mix` based utilities if using Tailwind.

## 3. Code Review
- [ ] Verify that `color-mix()` is used correctly and is supported by the target VSCode Webview engine (Chromium based).
- [ ] Ensure that no hardcoded hex/rgb values are used for backgrounds, only VSCode theme variables and the `color-mix` function.
- [ ] Confirm that the "semantic intent" (e.g., "Developer Blue") is preserved across different theme backgrounds (High Contrast, Light, Dark).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:webview` to execute the unit tests for style generation.
- [ ] Run `npm run test:e2e` (or specific Playwright command) to verify the visual rendering in the webview.

## 5. Update Documentation
- [ ] Update the UI/UX architecture document (`docs/6_ui_ux_architecture.md`) to document the `color-mix()` glass-box implementation.
- [ ] Update the `AOD` in `.agent/vscode-webview.md` to reflect the new styling utilities for future agent turns.

## 6. Automated Verification
- [ ] Run a script `scripts/verify-css-variables.js` that scans the generated CSS bundle for the presence of `color-mix()` and verifies it references `--vscode-editor-background`.
