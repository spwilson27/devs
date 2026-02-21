# Task: Webview Skeleton & React Mount for Dashboard Sidebar (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [1_PRD-REQ-INT-007], [7_UI_UX_DESIGN-REQ-UI-DES-090]

## 1. Initial Test Written
- [ ] Add a component snapshot test at packages/webview/src/__tests__/DashboardApp.test.tsx (or tests/webview/DashboardApp.test.tsx) that mounts <DashboardSidebarApp /> and asserts it contains a DOM node with text /Active Epic/i and that the root has an id of `devs-dashboard-root`.
- [ ] Add a unit test that imports the HTML generator getDashboardHtml() and asserts the returned string contains the CSP nonce meta tag and a script tag pointing to the expected bundle filename.

## 2. Task Implementation
- [ ] Create a React entry at packages/webview/src/dashboard/index.tsx that exports function mountDashboard(rootEl: HTMLElement, initialState?: any) which calls ReactDOM.createRoot(rootEl).render(<DashboardSidebarApp initialState={initialState} />).
- [ ] Implement DashboardSidebarApp component at packages/webview/src/dashboard/DashboardSidebarApp.tsx that renders a responsive container with placeholders for: Active Epic title, overall progress bar, and a compact task list placeholder.
- [ ] Implement the webview HTML generator (used by the provider) at packages/webview/src/html/getDashboardHtml.ts which:
  - Accepts webview and extensionUri, computes scriptUri and styleUri via webview.asWebviewUri, injects <meta http-equiv="Content-Security-Policy" content="..." nonce="${nonce}">, and mounts a div#devs-dashboard-root.
  - Loads the compiled webview bundle script with the nonce attribute.
- [ ] Ensure the webview root element uses Shadow DOM isolation if in use (attachShadow) or a scoped root class to prevent VSCode style leakage.

## 3. Code Review
- [ ] Verify React 18 API usage (createRoot), no use of legacy ReactDOM.render.
- [ ] Verify that no app logic runs before webview scripts are loaded; ensure initialization is idempotent and tolerant to hydration differences.
- [ ] Verify Tailwind integration is scoped to webview root and that CSS is loaded from compiled assets via webview.asWebviewUri.

## 4. Run Automated Tests to Verify
- [ ] Build the webview bundle: `npm run build:webview` (or the repository's equivalent) and run jest snapshot tests: `npm test -- packages/webview/src/__tests__/DashboardApp.test.tsx`.

## 5. Update Documentation
- [ ] Add docs/webview.md describing the mount API mountDashboard(rootEl, initialState) and the expected initialState shape: { activeEpic: {id,title,progress}, tasks: [...], agents: [...] }.

## 6. Automated Verification
- [ ] CI step runs `npm run build:webview && npm test -- packages/webview/src/__tests__/DashboardApp.test.tsx` and fails on non-zero exit; add a smoke headless test that loads the generated HTML and verifies the root node exists.
