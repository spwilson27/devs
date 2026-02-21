# Task: Develop the Webview Panel Manager (Sub-Epic: 01_VSCode_Extension_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-001], [1_PRD-REQ-INT-002]

## 1. Initial Test Written
- [ ] Write a test for the `WebviewPanelManager` to ensure that it only creates one instance of the panel at a time (singleton pattern).
- [ ] Implement a test that verifies the `dispose` method is called when the panel is closed.
- [ ] Create a test for the `asWebviewUri` conversion logic to ensure that local assets are correctly mapped to Webview URIs.

## 2. Task Implementation
- [ ] Implement a `WebviewPanelManager` class that handles the creation and management of a `vscode.WebviewPanel`.
- [ ] Set up the Webview options to allow scripts, enable retain-context-when-hidden, and restrict resource access to specific local directories.
- [ ] Implement the `resolveWebviewView` or `createOrShow` logic to handle the panel's visibility and focus.
- [ ] Create the HTML shell template that loads the React bundle and applies the necessary CSP (Content Security Policy) headers.
- [ ] Implement state restoration using `vscode.getState` to ensure the Webview state is preserved across VSCode reloads.

## 3. Code Review
- [ ] Verify that the `6_UI_UX_ARCH-REQ-001` requirement for the primary interface is met.
- [ ] Ensure that the CSP is strict and follows security best practices for Webviews.
- [ ] Confirm that resource URIs use the correct `vscode-resource` scheme.

## 4. Run Automated Tests to Verify
- [ ] Execute the unit tests for the `WebviewPanelManager`.
- [ ] Manually verify that opening the `devs` dashboard correctly displays the Webview panel.

## 5. Update Documentation
- [ ] Document the Webview management logic and security configuration in the `@devs/vscode` architecture documentation.
- [ ] Update the `extension-webview-bridge.md` AOD with details on URI mapping and CSP.

## 6. Automated Verification
- [ ] Run a shell script that verifies the presence of strict CSP headers in the HTML template.
- [ ] Check for the `enableScripts: true` setting in the Webview options.
