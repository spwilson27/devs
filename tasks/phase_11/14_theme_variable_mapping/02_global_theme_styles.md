# Task: Global Theme Styles and Glass-Box Implementation (Sub-Epic: 14_Theme_Variable_Mapping)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-004], [7_UI_UX_DESIGN-REQ-UI-DES-010]

## 1. Initial Test Written
- [ ] Create a Playwright/Vitest-DOM test `GlobalStyles.test.tsx` that renders a dummy component and verifies that the computed styles for a "Glass-Box" container utilize the `color-mix()` CSS function with VSCode variables.
- [ ] Verify that the base `body` style inherits the VSCode editor background and foreground tokens.

## 2. Task Implementation
- [ ] Implement a `GlobalStyles.css` (or `index.css`) that sets up the base styles for the Webview using the mapped tokens.
- [ ] Implement utility classes for the "Glass-Box" effect (e.g., `.glass-surface`) using `color-mix(in srgb, var(--vscode-sideBar-background), transparent 20%)` and `backdrop-filter: blur(8px)`.
- [ ] Ensure Shadow DOM isolation is respected if the Webview uses it; provide a `ThemeContext` or CSS partials that can be injected into the shadow root.
- [ ] Map the agent-specific colors (Blue for Developer, Orange for Reviewer, Green for Architect) to VSCode's ANSI or Badge colors to maintain theme harmony.

## 3. Code Review
- [ ] Check for usage of `color-mix()` and ensure it has appropriate fallbacks for older environments if necessary (though VSCode's Chromium is modern).
- [ ] Verify that the `backdrop-filter` usage doesn't significantly impact 60FPS performance targets.
- [ ] Ensure all transparency effects are anchored to the theme's background color to avoid "muddy" overlapping.

## 4. Run Automated Tests to Verify
- [ ] Run the visual regression or DOM style tests to ensure variables are applied to the `body` and core layout containers.
- [ ] Inspect the Webview in VSCode using the "Developer: Open Webview Developer Tools" and verify the active CSS variables.

## 5. Update Documentation
- [ ] Document the "Glass-Box" CSS utility usage in the `UI_UX_Architecture.md` document.

## 6. Automated Verification
- [ ] Run a script to validate that the generated bundle's CSS contains `color-mix` and references `--vscode-` tokens for surface transparency.
