# Task: Create viewport acceptance test suite (Sub-Epic: 35_Viewport_Constraints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-1], [7_UI_UX_DESIGN-REQ-UI-DES-049-2]

## 1. Initial Test Written
- [ ] Create a Playwright acceptance test at tests/viewport/viewport.spec.ts:
  - Build and serve the webview bundle (example: npm run build:webview && npx serve ./packages/webview/dist).
  - For viewports: 1280x800 (standard), 1920x1080 (ultrawide breakpoint), 2560x1440 (ultrawide-xl) perform:
    - Verify root element layout class (layout-standard / layout-ultrawide / layout-ultrawide-xl).
    - Verify main viewport max-width is 1200px and is centered on widths >1920px.
    - Verify sidebar is in ghost-rail mode on ultrawide and can be toggled.
    - Verify pane resizing respects min/max and snapping behavior.
    - Verify console minimizes automatically when height < 600px.
  - Save screenshots to test-artifacts/viewport/<viewport>/ for visual inspection.

## 2. Task Implementation
- [ ] Add Playwright config tests/playwright.config.ts with projects for the three viewports and headless mode.
- [ ] Add a helper script tests/viewport/utils.ts to start a local static server and return the URL used by Playwright.
- [ ] Add CI job (optional separate PR) .github/workflows/viewport-tests.yml that builds the webview and runs Playwright tests, exporting artifacts.

## 3. Code Review
- [ ] Ensure tests use stable selectors (data-testid) for root, sidebar, panes, and console to avoid brittle selectors.
- [ ] Verify screenshot diffs are disabled by default but can be enabled for visual regression.
- [ ] Confirm timeouts and retries configured for CI stability.

## 4. Run Automated Tests to Verify
- [ ] Locally run: npm run build:webview && npx playwright test tests/viewport/viewport.spec.ts --project=all
- [ ] Confirm all assertions pass and screenshots are produced to test-artifacts/viewport/.

## 5. Update Documentation
- [ ] Add tests/viewport/README.md describing how to run the suite locally, how to add new viewport entries, and where artifacts are stored.

## 6. Automated Verification
- [ ] Provide scripts/verify-viewport-ci.sh used by CI to build, run Playwright for all viewport projects, and fail the job on assertion errors; upload test-artifacts to CI for review.
