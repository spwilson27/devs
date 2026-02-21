# Task: Integration & E2E Tests for Dashboard Sidebar (Sub-Epic: 44_Dashboard_Sidebar_Hub)

## Covered Requirements
- [1_PRD-REQ-INT-007], [4_USER_FEATURES-REQ-029], [4_USER_FEATURES-REQ-006]

## 1. Initial Test Written
- [ ] Create an E2E test at tests/e2e/dashboard.e2e.ts using Playwright or Puppeteer in conjunction with the VSCode extension host test runner. Test should:
  - Install and activate the extension in a test instance of VSCode (use `@vscode/test-electron`), open the `devs` activity bar container and assert the Dashboard sidebar view is present.
  - Simulate data being sent by the extension to the webview and assert the UI updates (active epic title, agent list population, task tree expansion).
  - Toggle Review mode and assert side-by-side preview appears.

## 2. Task Implementation
- [ ] Add tests/e2e/dashboard.e2e.ts and associated Playwright config. Implement helper utilities to programmatically load a test workspace with minimal project state and mock data sources.
- [ ] Create a CI job `test:e2e` that runs the e2e tests in headless mode with a reproducible environment.

## 3. Code Review
- [ ] Ensure the e2e tests are deterministic: use fixed seeds for any random/layout algorithms and provide timeouts and retries as necessary.
- [ ] Ensure test artifacts (screenshots, traces) are uploaded on failure for debugging.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:e2e` locally and on CI; tests should pass in a controlled environment. Provide instructions in docs/e2e.md for running locally.

## 5. Update Documentation
- [ ] Add docs/e2e.md describing how to run the E2E suite, how to add mocks, and how to interpret failure artifacts.

## 6. Automated Verification
- [ ] CI `test:e2e` job must run and produce an archived artifact containing test traces and screenshots; success indicates integration correctness.
