# Task: Implement Global Typography Styles for Body, Mono, and Metadata (Sub-Epic: 23_Type_Scale_Body_Mono)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-033-4], [7_UI_UX_DESIGN-REQ-UI-DES-033-5], [7_UI_UX_DESIGN-REQ-UI-DES-033-6]

## 1. Initial Test Written
- [ ] Create Playwright E2E tests in `packages/webview/e2e/typography.spec.ts` to verify the computed font sizes on basic UI elements.
- [ ] The test should check that elements with the `devs-body` class have a computed `font-size` of `13px`.
- [ ] The test should check that elements with the `devs-mono` class have a computed `font-size` of `12px`.
- [ ] The test should check that elements with the `devs-metadata` class have a computed `font-size` of `11px`.

## 2. Task Implementation
- [ ] Update `packages/webview/src/styles/globals.css` to set the default body typography:
    ```css
    body {
      @apply text-devs-body leading-devs-navigation;
    }
    ```
- [ ] Create a typography utility file or update an existing one to export standard text components or classes for `Body`, `Mono`, and `Metadata`.
- [ ] Apply `text-devs-body` to the main application container.
- [ ] Apply `text-devs-mono` to technical placeholders or base mono components.
- [ ] Apply `text-devs-metadata` to secondary labels or status indicators.

## 3. Code Review
- [ ] Verify that the global CSS correctly applies the 13px body size by default.
- [ ] Ensure that the `devs-mono` class is applied to elements that represent "Environmental Fact" or "Technical Blocks" as per REQ-UI-DES-002-3.
- [ ] Check for any font-size inheritance issues that might cause 13px to be overridden unexpectedly.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm exec playwright test e2e/typography.spec.ts` and ensure all assertions pass.

## 5. Update Documentation
- [ ] Update the `AOD` in `packages/webview/.agent.md` to reflect the global application of the 13px/12px/11px scale.

## 6. Automated Verification
- [ ] Use `grep` to verify that `@apply text-devs-body` exists in the `globals.css` file.
