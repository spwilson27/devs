# Task: High Contrast Typography Enhancements (Weight Step-up) (Sub-Epic: 25_Variable_Scaling_Rem)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-039-2]

## 1. Initial Test Written
- [ ] Create a React unit test for an H2 and H3 component that verifies their `computedStyle.fontWeight` is increased (e.g., from 600 to 700) when a `.vscode-high-contrast` class is added to the document body.
- [ ] Create a Vitest test for a CSS/Tailwind-based High Contrast utility that verifies its `fontWeight` is correctly incremented in this state.
- [ ] Add an integration test in the Webview that simulates a theme change to `high-contrast` and verifies that headers become heavier visually (computed style check).

## 2. Task Implementation
- [ ] **Global CSS**: In `index.css` (or the typography stylesheet), implement a global selector: `.vscode-high-contrast h2, .vscode-high-contrast h3 { font-weight: 700 !important; }` (adjust weights as needed based on defaults).
- [ ] **Tailwind Config**: If H2 and H3 are defined via Tailwind classes, add a custom `hc-weight` utility or modify the `h2` and `h3` component layer to include `@apply font-bold` when the parent `.vscode-high-contrast` is present.
- [ ] **Component Audit**: Audit all H2 and H3 usages in the Sidebar, Dashboard, and Roadmap views. Ensure they do not have hardcoded `font-normal` or `font-semibold` that would override the global high-contrast rule.
- [ ] **Weight Step Logic**: If H2 is normally `font-semibold` (600), make it `font-bold` (700) in High Contrast. If H3 is normally `font-medium` (500), make it `font-semibold` (600).
- [ ] **System-wide Applicability**: Ensure this applies to all headers in the Task Card, Epic Card, and Reasoning Logs.

## 3. Code Review
- [ ] Verify that the weight increase is subtle but effective for readability.
- [ ] Ensure that `700` (bold) is not so heavy that it causes layout shifts or character overlapping on the background.
- [ ] Confirm that the rule ONLY applies when the `.vscode-high-contrast` class is present (as added by VSCode to the Webview body).

## 4. Run Automated Tests to Verify
- [ ] Run the High Contrast React unit tests to confirm `fontWeight` increments as expected.
- [ ] Manually verify in the VSCode Extension Host by switching to a "High Contrast" theme and inspecting the headers.

## 5. Update Documentation
- [ ] Document the High Contrast typography overrides in `docs/ui-accessibility.md`.
- [ ] Add a section on "Readability for High Contrast Themes" in the UI style guide.

## 6. Automated Verification
- [ ] Execute an automated snapshot test that compares H2/H3 elements in standard vs. high-contrast mode, specifically checking for `fontWeight` property values.
