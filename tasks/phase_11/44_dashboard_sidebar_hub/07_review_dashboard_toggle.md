# Task: Review Dashboard Toggle & Side-by-side Preview (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [4_USER_FEATURES-REQ-029], [1_PRD-REQ-INT-007]

## 1. Initial Test Written
- [ ] Add an integration test at packages/webview/src/__tests__/ReviewToggle.integration.test.tsx that mounts the DashboardSidebarApp, simulates entering "Phase 2" context, clicks the `Review` toggle, and asserts that the DOM shows two panels side-by-side: left panel contains the Brief, right panel contains the Specs rendered as markdown.
- [ ] Add a unit test for DocumentPreview component to ensure markdown is sanitized and images/resources are resolved through webview.asWebviewUri where applicable.

## 2. Task Implementation
- [ ] Implement ReviewToggle component at packages/webview/src/components/ReviewToggle.tsx which:
  - Displays a toggle button in the sidebar header labeled `Review` that is only visible when context.phase === 2 or when user explicitly opens review mode.
  - When active, replace the main compact dashboard area with a responsive side-by-side layout: left column `Brief` (summary) and right column `Specs` (rendered markdown with code blocks highlighted).
  - Implement DocumentPreview.tsx that safely renders markdown using react-markdown + rehype-sanitize and maps resource URIs via a provided resolver that calls webview.asWebviewUri for local resources.

## 3. Code Review
- [ ] Confirm that markdown rendering is sanitized and no arbitrary HTML/script is allowed to execute inside the webview.
- [ ] Confirm that side-by-side layout is responsive within the sidebar (collapse into vertical stack when width below threshold) and that scroll sync is optional.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- packages/webview/src/__tests__/ReviewToggle.integration.test.tsx` and ensure tests pass.

## 5. Update Documentation
- [ ] Document the Review mode behavior in docs/ui.md and include screenshot or mermaid diagram of the side-by-side layout.

## 6. Automated Verification
- [ ] CI should run the integration test and also execute a small Puppeteer/Playwright headless check that loads the webview HTML and verifies both panels exist in the DOM for the review mode case.
