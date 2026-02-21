# Task: Integration & E2E tests for Spec Previewer and Cross-Doc Linking (Sub-Epic: 62_Blueprint_Spec_Views)

## Covered Requirements
- [4_USER_FEATURES-REQ-008], [6_UI_UX_ARCH-REQ-061]

## 1. Initial Test Written
- [ ] Create an integration/e2e test suite scaffold (`e2e/spec-view.spec.ts`) with Playwright or Cypress:
  - E2E flow to cover end-to-end behavior:
    1. Build the webview bundle (`npm run build:webview` or `pnpm build`).
    2. Start a minimal test server that serves the built webview bundle and a small mock API for `/api/docs/preview` and `/api/docs/get`.
    3. Load the SPEC view URL with query `?docId=seed-doc`.
    4. Assert the markdown content renders, mermaid diagram rendered, clicking a cross-doc link navigates to the target doc, and hover preview shows tooltip.
  - Basic run command (Playwright example):
    - `npx playwright test e2e/spec-view.spec.ts --reporter=json --output=e2e/results.json`

## 2. Task Implementation
- [ ] Implement E2E tests and necessary test scaffolding:
  - Add `e2e/spec-view.spec.ts` that exercises:
    - Spec load and render.
    - Cross-document navigation using link click.
    - Hover preview appearance and caching verification.
  - Provide a small test server script `scripts/e2e-server.js` that can serve static build output and mock preview/get endpoints.
  - Ensure tests are deterministic: use seeded fixtures and avoid flakiness by waiting for specific test ids (`data-testid`) and network requests to complete.

## 3. Code Review
- [ ] Verify E2E tests are stable:
  - Use `data-testid` hooks to avoid brittle selectors.
  - Limit external network dependencies by using local mocks.
  - Assert both UI DOM states and network activity (Playwright can intercept network calls).

## 4. Run Automated Tests to Verify
- [ ] Run the e2e suite:
  - `npm run build:webview && node scripts/e2e-server.js & npx playwright test e2e/spec-view.spec.ts --reporter=json --output=e2e/results.json`
  - Validate `e2e/results.json` for overall pass/fail.

## 5. Update Documentation
- [ ] Add `docs/testing/spec-view-e2e.md` with instructions to run the e2e server locally, how to seed fixtures, and how to interpret Playwright/Cypress output.

## 6. Automated Verification
- [ ] After running the e2e command, verify programmatically:
  - `node -e "const r=require('./e2e/results.json'); process.exit(r.status === 'passed' ? 0 : 1)"`
  - Fail CI if non-zero.
