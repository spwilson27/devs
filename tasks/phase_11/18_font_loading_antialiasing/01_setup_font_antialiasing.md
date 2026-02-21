# Task: Global Font Smoothing and Antialiasing Configuration (Sub-Epic: 18_Font_Loading_Antialiasing)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-036-1]

## 1. Initial Test Written
- [ ] Create a Vitest/Playwright test to verify that the root Webview CSS contains the `-webkit-font-smoothing: antialiased` property.
- [ ] Test should also check for `moz-osx-font-smoothing: grayscale` for cross-platform consistency (macOS/Linux).
- [ ] Verify that these properties are applied to the `body` or a global wrapper component.

## 2. Task Implementation
- [ ] Add `-webkit-font-smoothing: antialiased` to the global CSS file (e.g., `index.css` or `globals.css`) for the Webview.
- [ ] Add `-moz-osx-font-smoothing: grayscale` to the same global styles.
- [ ] If using Tailwind CSS (per [TAS-029]), ensure these are applied via the `antialiased` utility class on the root `<html>` or `<body>` element or via a custom base layer in `tailwind.config.js`.
- [ ] Ensure the smoothing is applied consistently across both light and dark themes to maintain crisp text legibility.

## 3. Code Review
- [ ] Verify that the smoothing properties are applied at the highest possible level (e.g., `body`) to ensure all child components inherit them.
- [ ] Ensure no local component styles inadvertently override these global smoothing settings.

## 4. Run Automated Tests to Verify
- [ ] Run the CSS verification tests: `npm run test:ui` (or equivalent).
- [ ] Confirm that the computed styles in a headless browser (if applicable) show the antialiasing properties.

## 5. Update Documentation
- [ ] Update the UI Design system documentation (`docs/ui_ux_design.md` or similar) to reflect the mandatory use of antialiasing for text legibility.
- [ ] Note the decision to use subpixel rendering for crisp text on dark backgrounds.

## 6. Automated Verification
- [ ] Run a grep/search script to confirm that the string `-webkit-font-smoothing: antialiased` exists in the compiled CSS or the main source CSS file.
- [ ] Example: `grep -r "antialiased" src/`
