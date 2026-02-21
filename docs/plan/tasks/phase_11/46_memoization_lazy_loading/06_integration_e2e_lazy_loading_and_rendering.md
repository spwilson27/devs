# Task: Integration E2E tests validating lazy-loading and render isolation (Sub-Epic: 46_Memoization_Lazy_Loading)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-068], [7_UI_UX_DESIGN-REQ-UI-DES-068-1], [6_UI_UX_ARCH-REQ-007], [6_UI_UX_ARCH-REQ-078]

## 1. Initial Test Written
- [ ] Add Playwright (or Puppeteer) E2E tests under packages/webview/e2e/tests/lazy_loading_and_rendering.spec.ts that perform two verifications:
  1) Lazy-load verification: build the webview and run a preview server, navigate to the root (Dashboard) and assert that no network requests are issued for heavy chunks (any URL paths containing 'mermaid' or 'd3' or named vendor-heavy) until the user navigates to Roadmap or Spec views.
  2) Render-isolation verification: run the app in preview mode with a test harness that can inject character-by-character streams; while streaming 100 characters, assert via an instrumentation API (window.__DEVS_RENDER_COUNTS__) that only LogTerminal render count increases and ThoughtStreamer render count remains stable (or increases only once per chunk flush).
- [ ] Tests must be deterministic: use a small port and stable preview mode (vite preview) and run with --timeout extended for CI.

## 2. Task Implementation
- [ ] Add lightweight, test-only instrumentation behind a dev flag that exposes a test harness on window in the webview preview build (e.g., window.__DEVS_TEST_HARNESS__):
  - Provide methods: injectCharStream(streamId:string, chars:string, delayMs:number), getRenderCounts(): Record<string, number>, resetRenderCounts().
  - In each component to be measured (LogTerminal, ThoughtStreamer), increment window.__DEVS_RENDER_COUNTS__["ComponentName"] inside a useEffect that runs on render only when instrumentation is enabled.
  - Guard instrumentation behind process.env.DEVS_E2E_INSTRUMENTATION to ensure it is NOT present in production builds.
- [ ] Implement Playwright test steps:
  - Start preview server: npx vite preview --port 5173 --strictPort
  - Launch Playwright browser, navigate to http://localhost:5173
  - Attach request listener: page.on('request', req => capture URLs)
  - Assert that initial navigation produces no requests with chunk filenames containing 'mermaid' or 'd3'.
  - Click navigation to Roadmap, wait for network requests and assert heavy chunk(s) were fetched.
  - Use page.evaluate(() => window.__DEVS_TEST_HARNESS__.injectCharStream(...)) to stream chars; wait for completion and then call getRenderCounts() and assert counts.
- [ ] Add necessary e2e helper scripts to packages/webview/package.json: "e2e": "playwright test --config e2e/playwright.config.ts" and a convenience script to run build+preview+e2e locally.

## 3. Code Review
- [ ] Verify instrumentation is strictly gated by dev/test env and removed from production bundles.
- [ ] Ensure E2E assertions do not rely on implementation internals; prefer network and public test harness APIs.
- [ ] Check tests are stable and do not flake (use retries or waitFor rather than fixed sleeps).

## 4. Run Automated Tests to Verify
- [ ] Locally run: (from repo root) cd packages/webview && npm run build && npm run preview &  # start preview
  - Then in separate terminal: npm run e2e --workspace packages/webview
- [ ] CI should run: npm --workspace packages/webview run build && npm --workspace packages/webview run preview:start && npm --workspace packages/webview run e2e

## 5. Update Documentation
- [ ] Document the E2E harness in packages/webview/e2e/README.md with instructions to run tests locally, debug failures, and remove instrumentation when necessary.

## 6. Automated Verification
- [ ] Add the Playwright job to CI that runs after the webview build and bundle-size check; it must fail the PR if:
  - Heavy chunks are fetched on initial navigation, OR
  - Render-count assertions show siblings re-rendering during char-level streaming.
- [ ] Record E2E artifacts (playwright trace / screenshots) to help debugging when the check fails.