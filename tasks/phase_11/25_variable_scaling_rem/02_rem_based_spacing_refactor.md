# Task: Implement Global rem-based Spacing System (Sub-Epic: 25_Variable_Scaling_Rem)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-UNK-004]

## 1. Initial Test Written
- [ ] Create a unit test for `tailwind.config.js` to verify that the `spacing` and `fontSize` configurations correctly use `rem` units (e.g., `spacing: { 'md': '1rem' }`).
- [ ] Write a script (or use a linter rule) to scan the codebase for hardcoded `px` values in `padding`, `margin`, `gap`, and `font-size` styles within `.tsx` and `.css` files.
- [ ] Build a React test component that renders several nested elements using various spacing classes (e.g., `p-4`, `m-2`, `gap-8`) and uses `getComputedStyle` to verify that their pixel values change when the `html` element's `font-size` is modified (demonstrating `rem` scaling).

## 2. Task Implementation
- [ ] **Tailwind Config**: In `@devs/vscode-ui` (or the React package), audit `tailwind.config.js` to ensure the default spacing scale and font sizes are not overridden with `px` values.
- [ ] **Global CSS**: Audit `index.css` and other global stylesheets to convert any layout-related `px` values (margins, paddings, gaps, font sizes) into `rem` (e.g., `16px` -> `1rem` if the base is 16px).
- [ ] **Component Audit**: Perform a pass through core UI components (Dashboard, Sidebar, Task Card, DAG Node) and replace any remaining hardcoded inline `px` styles or custom CSS with Tailwind spacing utility classes or `rem` variables.
- [ ] **Spacing Variable Implementation**: If custom spacing is needed beyond Tailwind defaults, define them in `rem` within the Tailwind config or as CSS variables (e.g., `--spacing-md: 1rem`).
- [ ] **Base Unit Alignment**: Ensure all spacing relates to a base unit (e.g., 4px steps) expressed in `rem`.

## 3. Code Review
- [ ] Verify that 100% of the spacing system in the React UI is now relative to the root font size.
- [ ] Ensure that only `border-width` and extremely small 1px adjustments are kept in `px` (as these should NOT scale with font size).
- [ ] Check that the layout remains stable and visual balance is maintained after the conversion.

## 4. Run Automated Tests to Verify
- [ ] Run the spacing verification script to ensure no new `px` layout values have been introduced.
- [ ] Run the React component tests to confirm that changing the root `font-size` proportionally scales the entire UI.

## 5. Update Documentation
- [ ] Update the UI design system documentation to strictly mandate the use of `rem` for all spacing and typography.
- [ ] Note any exceptions (e.g., borders) that should remain in `px`.

## 6. Automated Verification
- [ ] Execute an automated visual regression test that compares the UI at `16px` root font size vs. `12px` and `20px`, ensuring that the relative spacing (margins/paddings) scales as expected.
