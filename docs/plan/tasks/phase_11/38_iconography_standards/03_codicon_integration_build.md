# Task: Add Codicon Assets and Bundler Integration for Webview (Sub-Epic: 38_Iconography_Standards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-005-2], [6_UI_UX_ARCH-REQ-073]

## 1. Initial Test Written
- [ ] Create an integration test at `tests/integration/codicon-build.test.js` that fails initially. The test should:
  - Programmatically invoke the webview build command (example: `child_process.execSync('npm run build:webview')`).
  - Inspect the build output directory (e.g., `dist/webview/`) and assert presence of codicon assets: `codicon.css`, and font files like `codicon.woff2`.
  - Assert that the generated `index.html` or `webview.html` includes a `<link rel="stylesheet" href="codicon.css">` reference or inlined CSS that defines the `.codicon` classes.

## 2. Task Implementation
- [ ] Implementation steps:
  - Add Codicons dependency (recommend `@vscode/codicons` or official package) to `package.json` and pin a stable version.
  - Update webview bundler config (vite/webpack/rollup) to:
    - Import the codicon CSS into the webview entry (e.g., `import 'codicon/dist/codicon.css'`).
    - Ensure font files referenced by the CSS are copied to the webview output directory and served via `vscode-resource://` scheme at runtime (use `vscode.Uri.joinPath(extensionUri, 'dist', '...')` when generating webview HTML).
    - Add an asset copy or file-loader rule for codicon font files so they are present in `dist/webview/static/`.
  - Update webview HTML template generation to reference the bundled codicon CSS using `webview.asWebviewUri` at runtime.
  - Add a small runtime check in the Icon component to prefer the codicon class when available.

## 3. Code Review
- [ ] Review items:
  - Bundler changes only affect webview build; no external CDNs are introduced.
  - Fonts are copied into the extension's dist and referenced with `vscode-resource` URIs or `webview.asWebviewUri`.
  - CSP remains strict; only allow styles/fonts from the `vscode-resource` scheme.
  - Dependency is pinned and added to lockfile.

## 4. Run Automated Tests to Verify
- [ ] Execute: `npm run build:webview` then `node tests/integration/codicon-build.test.js` and verify assertions pass.

## 5. Update Documentation
- [ ] Add a section to `docs/build.md` documenting how codicon assets are bundled, how to reference them in webview HTML, and how to troubleshoot missing icons.

## 6. Automated Verification
- [ ] CI should run the integration test as a post-build verification step; failing tests should block releases that omit codicon assets.
