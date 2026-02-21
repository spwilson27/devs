# Task: Create Icon Preview Stories / Visual QA Page (Sub-Epic: 38_Iconography_Standards)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-005], [7_UI_UX_DESIGN-REQ-UI-DES-005-2]

## 1. Initial Test Written
- [ ] Add a Playwright visual-regression E2E test at `tests/e2e/icon-preview.spec.ts` that fails initially. The test should:
  - Start the local Storybook or a local dev webview preview (`npm run storybook` or `npm run dev:webview`).
  - Navigate to the Icon preview page URL and capture screenshots for three variants: default, dark, and high-contrast.
  - Compare screenshots with baseline images stored under `tests/e2e/baselines/icon-*` and assert pixel-diff < 2% (use Playwright's snapshot comparison or pixelmatch).
  - Also verify DOM presence of codicon classes or inline SVG nodes for a sample set of icons.

## 2. Task Implementation
- [ ] Implement Storybook stories at `.storybook/stories/Icon.stories.tsx` or a static preview page under `src/webview-preview/icons.html` that shows:
  - All semantic icon names rendered in each size (small/medium/large).
  - Ghost mode toggle demonstrating the ghost blend.
  - Theme switcher (light/dark/high-contrast) that flips CSS variables at the root.

## 3. Code Review
- [ ] Review to ensure:
  - Stories cover every semantic icon name from the codicon mapping.
  - Visual tests are deterministic (use fixed viewport, disable animations).
  - No external network resources are loaded during storybook rendering.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:e2e -- tests/e2e/icon-preview.spec.ts` or `npx playwright test tests/e2e/icon-preview.spec.ts` and confirm visual diffs pass.

## 5. Update Documentation
- [ ] Update `docs/iconography.md` with a link to the storybook preview and instructions for running visual regression tests locally.

## 6. Automated Verification
- [ ] Add a CI job that runs Playwright visual regression after storybook build; baseline images live in the repo under `tests/e2e/baselines/` and any regression must be reviewed before approving.
