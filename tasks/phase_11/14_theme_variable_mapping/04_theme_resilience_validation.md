# Task: Theme Resilience Validation Suite (Sub-Epic: 14_Theme_Variable_Mapping)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-RISK-002], [6_UI_UX_ARCH-REQ-004]

## 1. Initial Test Written
- [ ] Create a static analysis script `test/themeResilience.test.ts` using `postcss` or a similar tool to parse the built Webview CSS.
- [ ] Define a "Forbidden Pattern" list: hardcoded hex codes, rgb/rgba without variables, and non-tokenized spacing if applicable.

## 2. Task Implementation
- [ ] Develop the script to iterate through all CSS files in the distribution folder.
- [ ] Implement a scanner that flags any color property (`color`, `background-color`, `border-color`, `fill`, `stroke`) that does not contain the `var()` function.
- [ ] Integrate this script into the CI/CD pipeline (or `npm test`) as a "Theme Integrity Gate".
- [ ] Add a "Theme Switching" integration test that programmatically updates the CSS variables on the root and checks if components re-render correctly within < 50ms (as per `7_UI_UX_DESIGN-REQ-UI-DES-026` in related requirements).

## 3. Code Review
- [ ] Ensure the script accounts for legitimate uses of hardcoded values (e.g., in a test mock or a specific vendor-required style).
- [ ] Review the performance of the theme-switching test to ensure it doesn't cause excessive flakiness.

## 4. Run Automated Tests to Verify
- [ ] Run the `themeResilience.test.ts` on the current implementation and fix any discovered hardcoded values.
- [ ] Verify that the test fails if a hardcoded color (e.g., `background: #ff0000`) is deliberately introduced.

## 5. Update Documentation
- [ ] Update `GEMINI.md` or the `CONTRIBUTING.md` to mention the Theme Integrity Gate and why hardcoded colors are prohibited.

## 6. Automated Verification
- [ ] Confirm that the `npm run build` process invokes this validation suite and returns a non-zero exit code on failure.
