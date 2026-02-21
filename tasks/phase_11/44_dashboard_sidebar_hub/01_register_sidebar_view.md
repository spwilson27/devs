# Task: Register VSCode Sidebar View & Command (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [1_PRD-REQ-INT-007]

## 1. Initial Test Written
- [ ] Add a unit test at tests/extension/register-sidebar.test.ts that loads package.json and asserts the following exact facts:
  - contributes.viewsContainers.activitybar contains an object with id === "devs" and a valid title.
  - contributes.views.devs contains an object with id === "devs.dashboardSidebar" and name === "Dashboard".
  - contributes.commands includes a command with command === "devs.openDashboard" and a non-empty title.

  Test details: use Jest; test file should import package.json (const pkg = require('../../package.json')) and assert contains required keys; name the test `registers devs sidebar view in package.json`.

## 2. Task Implementation
- [ ] Edit package.json to register the Sidebar view and a command:
  - Add `contributes.viewsContainers.activitybar` entry: { "id": "devs", "title": "devs", "icon": "resources/devs.svg" }.
  - Add `contributes.views.devs` array with an object: { "id": "devs.dashboardSidebar", "name": "Dashboard" }.
  - Add `contributes.commands` entry for `devs.openDashboard` and activationEvents for `onCommand:devs.openDashboard`.
- [ ] Implement a WebviewViewProvider at src/extension/dashboardSidebarProvider.ts:
  - Export class DashboardSidebarProvider implements vscode.WebviewViewProvider with resolveWebviewView(webviewView) that sets webview.options = { enableScripts: true, localResourceRoots: [extensionUri] } and sets webview.html = getDashboardHtml(webview, extensionUri).
  - Provide a small helper getDashboardHtml(webview, extensionUri, nonce) that injects the built webview bundle using webview.asWebviewUri(...) and includes a strict CSP meta tag (no inline scripts/styles except with nonce).
- [ ] Register the provider in src/extension/extension.ts inside activate():
  - context.subscriptions.push(vscode.window.registerWebviewViewProvider('devs.dashboardSidebar', new DashboardSidebarProvider(context.extensionUri)));
  - Register command `devs.openDashboard` which reveals the view or focuses the container (use `vscode.commands.executeCommand('workbench.view.extension.devs')` or reveal the view if available).

## 3. Code Review
- [ ] Verify package.json keys are consistent and IDs are unique across the repo.
- [ ] Verify webview uses webview.asWebviewUri for all local resources, uses a CSP with nonces, and avoids inline scripts/styles.
- [ ] Verify activationEvents are minimal and command registration does not eagerly load heavy modules.

## 4. Run Automated Tests to Verify
- [ ] Run the unit test: `npm test -- tests/extension/register-sidebar.test.ts` (or `npx jest tests/extension/register-sidebar.test.ts`) and confirm it exits 0.

## 5. Update Documentation
- [ ] Update docs/extension.md (or README) to document the new view id `devs.dashboardSidebar`, the command `devs.openDashboard`, and the file that implements the provider.

## 6. Automated Verification
- [ ] CI: the job should run `node -e "require('./package.json')"` and the Jest test above; add a short Node script scripts/verify-sidebar-registration.js that exits nonzero if the keys are missing and include `npm run verify:sidebar` that runs it.
