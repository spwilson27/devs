# Task: VSCode Settings Synchronization for Root Scaling (Sub-Epic: 25_Variable_Scaling_Rem)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-039], [7_UI_UX_DESIGN-REQ-UI-DES-039-1]

## 1. Initial Test Written
- [ ] Create a unit test for the Extension Host configuration listener that verifies it correctly reads `editor.fontSize` from `vscode.workspace.getConfiguration()`.
- [ ] Create a Vitest/React Testing Library test for a new `useWebviewScaling` hook that verifies it correctly updates the root `document.documentElement.style.fontSize` when a `SET_FONT_SIZE` message is received from the extension host.
- [ ] Add an integration test in the extension host that mocks `postMessage` and ensures the font size is sent to the Webview on initialization and on configuration change.

## 2. Task Implementation
- [ ] **Extension Host**: In `@devs/vscode`, implement a configuration watcher using `vscode.workspace.onDidChangeConfiguration`.
- [ ] **Extension Host**: Specifically watch for changes in `editor.fontSize`.
- [ ] **Extension Host**: Implement a `getWebviewFontSize()` function that retrieves the current `editor.fontSize` (defaulting to a sensible value like 13px or 14px if not set).
- [ ] **Extension Host**: Send the initial font size to the Webview during initialization via `initialState` or an immediate `postMessage`.
- [ ] **Extension Host**: Send an updated font size message to the Webview whenever the configuration changes.
- [ ] **Webview (React)**: Implement a global effect (or a hook used in the root component) that listens for the `SET_FONT_SIZE` message from the extension host.
- [ ] **Webview (React)**: Apply the received font size to the root element: `document.documentElement.style.fontSize = `\${fontSize}px``.
- [ ] **Webview (React)**: Ensure the typography system (Tailwind and global CSS) uses `rem` for font sizes so they scale proportionally with this root change.

## 3. Code Review
- [ ] Verify that the font size synchronization is efficient and doesn't cause unnecessary re-renders.
- [ ] Ensure that the default font size in the extension host aligns with VSCode's standard defaults for the current platform.
- [ ] Confirm that `window.zoomLevel` is not being manually handled if VSCode already scales the Webview content (avoid double-scaling).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or `pnpm test` in `@devs/vscode` to verify configuration listener tests pass.
- [ ] Run `npm test` or `pnpm test` in the UI package to verify the scaling hook works as intended.

## 5. Update Documentation
- [ ] Update `docs/ui-architecture.md` to document the root font scaling mechanism and how it integrates with VSCode settings.
- [ ] Update the internal developer guide to mention that all typography MUST be defined in `rem`.

## 6. Automated Verification
- [ ] Execute a verification script that launches the extension in a development host and programmatically checks if the Webview's `html` element's `computedStyle.fontSize` matches the mocked `editor.fontSize` setting.
