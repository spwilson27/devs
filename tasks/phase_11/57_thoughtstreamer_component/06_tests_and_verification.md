# Task: End-to-end and CI verification for ThoughtStreamer (Sub-Epic: 57_ThoughtStreamer_Component)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-018]

## 1. Initial Test Written
- [ ] Create an e2e test at tests/e2e/thoughtstreamer.spec.ts that loads a served webview harness, simulates the extension posting 1,000 messages, and asserts:
  - The virtualization window prevents rendering > 200 DOM nodes.
  - The last message is visible and contains the expected text.
  - Total test runtime stays within an expected threshold (e.g., < 5s locally).

## 2. Task Implementation
- [ ] Implement the e2e harness and CI integration:
  - Add a static webview harness (dev/harness/thoughtstreamer.html) that emulates vscode.postMessage and hosts the built webview bundle.
  - Add Playwright test at tests/e2e/thoughtstreamer.spec.ts that opens the harness, triggers the message stream, and performs assertions on DOM node counts and visibility.
  - Add npm script: "test:e2e": "playwright test --project=chromium tests/e2e/thoughtstreamer.spec.ts" and wire into CI.

## 3. Code Review
- [ ] Ensure e2e is deterministic (use fixed timestamps), does not depend on external services, and has clear retry/timeouts; verify test is stable in CI and doesn't flake due to animations (disable animations in harness).

## 4. Run Automated Tests to Verify
- [ ] Run npm run build:webview && npm run test:e2e locally and verify Playwright assertions pass.

## 5. Update Documentation
- [ ] Document how to run e2e locally and in CI, expected resource usage, and where artifacts (screenshots/traces) are stored in CI.

## 6. Automated Verification
- [ ] Add a CI gating step that runs unit tests, accessibility checks, and e2e; fail the pipeline if virtualization node-count thresholds or any tests fail.
